#!/bin/bash

# Zero Downtime Deployment Script untuk AstroKabinet
# Usage: ./zero-downtime-deploy.sh [blue|green]

set -e

# Configuration
DEPLOY_PATH="/home/deploy/astrokabinet"
COMPOSE_FILE="docker-compose.blue-green.yml"
NGINX_CONFIG_BLUE="docker/nginx/nginx-blue-green.conf"
NGINX_CONFIG_GREEN="docker/nginx/nginx-blue-green-switched.conf"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check current active deployment
check_current_deployment() {
    if docker ps --format "table {{.Names}}" | grep -q "astro-laravel-app-blue"; then
        if docker ps --format "table {{.Names}}" | grep -q "astro-laravel-app-green"; then
            echo "both"
        else
            echo "blue"
        fi
    elif docker ps --format "table {{.Names}}" | grep -q "astro-laravel-app-green"; then
        echo "green"
    else
        echo "none"
    fi
}

# Health check function
health_check() {
    local target=$1
    local max_attempts=30
    local attempt=1
    
    log_info "Running health check for $target..."
    
    while [ $attempt -le $max_attempts ]; do
        if [ "$target" = "blue" ]; then
            if curl -f http://localhost/test-blue > /dev/null 2>&1; then
                log_success "Health check passed for $target"
                return 0
            fi
        elif [ "$target" = "green" ]; then
            if curl -f http://localhost/test-green > /dev/null 2>&1; then
                log_success "Health check passed for $target"
                return 0
            fi
        fi
        
        log_info "Health check attempt $attempt/$max_attempts for $target..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed for $target after $max_attempts attempts"
    return 1
}

# Switch nginx configuration
switch_nginx_config() {
    local target=$1
    
    log_info "Switching nginx configuration to $target..."
    
    if [ "$target" = "green" ]; then
        # Create green config (switch to green)
        sed 's/server app-blue:9000 weight=100;/server app-blue:9000 weight=0;/' $NGINX_CONFIG_BLUE | \
        sed 's/# server app-green:9000 weight=0;/server app-green:9000 weight=100;/' > $NGINX_CONFIG_GREEN
        
        # Update nginx config
        docker cp $NGINX_CONFIG_GREEN astro-nginx:/etc/nginx/conf.d/default.conf
    else
        # Switch back to blue
        docker cp $NGINX_CONFIG_BLUE astro-nginx:/etc/nginx/conf.d/default.conf
    fi
    
    # Reload nginx
    docker exec astro-nginx nginx -s reload
    log_success "Nginx configuration switched to $target"
}

# Main deployment function
deploy() {
    local target_env=$1
    local current_env=$(check_current_deployment)
    
    log_info "Starting zero-downtime deployment..."
    log_info "Current deployment: $current_env"
    log_info "Target deployment: $target_env"
    
    # Ensure we're in the right directory
    cd $DEPLOY_PATH
    
    # If no containers running, start blue first
    if [ "$current_env" = "none" ]; then
        log_info "No containers running, starting blue environment..."
        docker-compose -f $COMPOSE_FILE up -d app-blue mysql redis nginx
        health_check "blue"
        log_success "Blue environment started successfully"
        return 0
    fi
    
    # Build new image for target environment
    log_info "Building new image for $target_env environment..."
    docker-compose -f $COMPOSE_FILE build app-$target_env
    
    # Start target environment
    log_info "Starting $target_env environment..."
    if [ "$target_env" = "green" ]; then
        docker-compose -f $COMPOSE_FILE --profile green up -d app-green
    else
        docker-compose -f $COMPOSE_FILE up -d app-blue
    fi
    
    # Wait for container to be ready
    sleep 30
    
    # Health check for new environment
    if health_check "$target_env"; then
        log_success "$target_env environment is healthy"
        
        # Switch traffic to new environment
        switch_nginx_config "$target_env"
        
        # Wait a bit for traffic to switch
        sleep 10
        
        # Final health check on main endpoint
        if curl -f http://localhost/up > /dev/null 2>&1; then
            log_success "Main endpoint health check passed"
            
            # Stop old environment
            if [ "$target_env" = "green" ] && [ "$current_env" != "none" ]; then
                log_info "Stopping blue environment..."
                docker-compose -f $COMPOSE_FILE stop app-blue
                docker-compose -f $COMPOSE_FILE rm -f app-blue
            elif [ "$target_env" = "blue" ] && [ "$current_env" != "none" ]; then
                log_info "Stopping green environment..."
                docker-compose -f $COMPOSE_FILE --profile green stop app-green
                docker-compose -f $COMPOSE_FILE --profile green rm -f app-green
            fi
            
            log_success "Deployment completed successfully!"
            log_success "Active environment: $target_env"
        else
            log_error "Main endpoint health check failed, rolling back..."
            rollback "$current_env"
        fi
    else
        log_error "$target_env environment health check failed, cleaning up..."
        docker-compose -f $COMPOSE_FILE stop app-$target_env
        docker-compose -f $COMPOSE_FILE rm -f app-$target_env
        exit 1
    fi
}

# Rollback function
rollback() {
    local rollback_env=$1
    
    log_warning "Rolling back to $rollback_env environment..."
    switch_nginx_config "$rollback_env"
    
    if health_check "$rollback_env"; then
        log_success "Rollback completed successfully"
    else
        log_error "Rollback failed! Manual intervention required."
        exit 1
    fi
}

# Status function
status() {
    local current_env=$(check_current_deployment)
    
    echo "=== AstroKabinet Deployment Status ==="
    echo "Current deployment: $current_env"
    echo ""
    echo "=== Container Status ==="
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo "=== Health Checks ==="
    
    if [ "$current_env" = "blue" ] || [ "$current_env" = "both" ]; then
        if curl -f http://localhost/test-blue > /dev/null 2>&1; then
            echo "Blue environment: ✅ Healthy"
        else
            echo "Blue environment: ❌ Unhealthy"
        fi
    fi
    
    if [ "$current_env" = "green" ] || [ "$current_env" = "both" ]; then
        if curl -f http://localhost/test-green > /dev/null 2>&1; then
            echo "Green environment: ✅ Healthy"
        else
            echo "Green environment: ❌ Unhealthy"
        fi
    fi
    
    if curl -f http://localhost/up > /dev/null 2>&1; then
        echo "Main endpoint: ✅ Healthy"
    else
        echo "Main endpoint: ❌ Unhealthy"
    fi
}

# Main script logic
case "$1" in
    "blue")
        deploy "blue"
        ;;
    "green")
        deploy "green"
        ;;
    "status")
        status
        ;;
    "rollback")
        current_env=$(check_current_deployment)
        if [ "$current_env" = "blue" ]; then
            rollback "green"
        elif [ "$current_env" = "green" ]; then
            rollback "blue"
        else
            log_error "Cannot determine rollback target"
            exit 1
        fi
        ;;
    *)
        echo "Usage: $0 {blue|green|status|rollback}"
        echo ""
        echo "Commands:"
        echo "  blue     - Deploy to blue environment"
        echo "  green    - Deploy to green environment"  
        echo "  status   - Show current deployment status"
        echo "  rollback - Rollback to previous environment"
        exit 1
        ;;
esac
