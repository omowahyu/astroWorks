#!/bin/bash

# Simple deployment script for AstroKabinet
# Usage: ./deploy.sh

set -e  # Exit on any error

DEPLOY_PATH="/home/deploy/astrokabinet"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"

echo "🚀 Starting AstroKabinet Deployment..."

# Function to check if we're on the server
check_server() {
    if [ ! -d "$DEPLOY_PATH" ]; then
        echo "❌ Error: Deploy path $DEPLOY_PATH not found!"
        echo "Make sure you're running this on the production server."
        exit 1
    fi
}

# Function to backup .env
backup_env() {
    if [ -f "$DEPLOY_PATH/.env" ]; then
        cp "$DEPLOY_PATH/.env" "/tmp/.env.backup"
        echo "✅ Backed up .env file"
    fi
}

# Function to restore .env
restore_env() {
    if [ -f "/tmp/.env.backup" ]; then
        cp "/tmp/.env.backup" "$DEPLOY_PATH/.env"
        echo "✅ Restored .env file"
    elif [ ! -f "$DEPLOY_PATH/.env" ]; then
        cp "$DEPLOY_PATH/.env.example" "$DEPLOY_PATH/.env"
        echo "✅ Created .env from example"
    fi
}

# Function to fix permissions
fix_permissions() {
    echo "🔧 Fixing permissions..."
    sudo chown -R deploy:deploy "$DEPLOY_PATH"
    sudo chmod -R 775 "$DEPLOY_PATH/storage" "$DEPLOY_PATH/bootstrap/cache"
}

# Function to pull latest code
pull_code() {
    echo "📥 Pulling latest code from Git..."
    cd "$DEPLOY_PATH"
    git pull origin main
}

# Function to install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    cd "$DEPLOY_PATH"
    
    # Install PHP dependencies
    composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
    
    # Install Node dependencies and build assets
    npm ci || npm install
    npm run build
}

# Function to manage Docker containers
docker_down() {
    echo "🛑 Stopping Docker containers..."
    cd "$DEPLOY_PATH"
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
}

docker_build() {
    echo "🔨 Building Docker containers..."
    cd "$DEPLOY_PATH"
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
}

docker_up() {
    echo "🚀 Starting Docker containers..."
    cd "$DEPLOY_PATH"
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
}

# Function to run Laravel optimizations
laravel_optimize() {
    echo "⚡ Running Laravel optimizations..."
    cd "$DEPLOY_PATH"
    
    # Wait for containers to be ready
    sleep 20
    
    # Run optimizations
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T app php artisan config:cache || true
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T app php artisan route:cache || true
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T app php artisan view:cache || true
}

# Function to check health
health_check() {
    echo "🏥 Running health check..."
    
    for i in {1..5}; do
        if curl -f http://localhost/up > /dev/null 2>&1; then
            echo "✅ Health check passed!"
            return 0
        fi
        echo "⏳ Health check attempt $i/5..."
        sleep 10
    done
    
    echo "⚠️ Health check failed, but deployment completed"
    return 1
}

# Function to show container status
show_status() {
    echo "📊 Container Status:"
    cd "$DEPLOY_PATH"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Function to cleanup
cleanup() {
    echo "🧹 Cleaning up..."
    docker image prune -f || true
    rm -f /tmp/.env.backup
}

# Main deployment function
deploy() {
    echo "=================================="
    echo "🚀 AstroKabinet Deployment Script"
    echo "=================================="
    
    check_server
    backup_env
    
    echo "📍 Step 1: Pull latest code"
    pull_code
    
    echo "📍 Step 2: Install dependencies"
    install_deps
    
    echo "📍 Step 3: Stop containers"
    docker_down
    
    echo "📍 Step 4: Restore environment"
    restore_env
    fix_permissions
    
    echo "📍 Step 5: Build containers"
    docker_build
    
    echo "📍 Step 6: Start containers"
    docker_up
    
    echo "📍 Step 7: Optimize Laravel"
    laravel_optimize
    
    echo "📍 Step 8: Health check"
    health_check
    
    echo "📍 Step 9: Show status"
    show_status
    
    echo "📍 Step 10: Cleanup"
    cleanup
    
    echo "=================================="
    echo "✅ Deployment completed!"
    echo "🌐 Website: https://astrokabinet.id"
    echo "=================================="
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "down")
        echo "🛑 Stopping all containers..."
        check_server
        docker_down
        echo "✅ All containers stopped"
        ;;
    "up")
        echo "🚀 Starting all containers..."
        check_server
        docker_up
        echo "✅ All containers started"
        ;;
    "build")
        echo "🔨 Building all containers..."
        check_server
        docker_build
        echo "✅ All containers built"
        ;;
    "restart")
        echo "🔄 Restarting all containers..."
        check_server
        docker_down
        docker_up
        echo "✅ All containers restarted"
        ;;
    "status")
        echo "📊 Checking container status..."
        check_server
        show_status
        ;;
    "logs")
        echo "📋 Showing container logs..."
        check_server
        cd "$DEPLOY_PATH"
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50
        ;;
    "health")
        echo "🏥 Running health check..."
        health_check
        ;;
    "clean")
        echo "🧹 Cleaning up Docker..."
        docker image prune -f
        docker system prune -f
        echo "✅ Cleanup completed"
        ;;
    *)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  down     - Stop all containers"
        echo "  up       - Start all containers"
        echo "  build    - Build all containers"
        echo "  restart  - Restart all containers"
        echo "  status   - Show container status"
        echo "  logs     - Show container logs"
        echo "  health   - Run health check"
        echo "  clean    - Clean up Docker images"
        echo ""
        echo "Examples:"
        echo "  $0           # Full deployment"
        echo "  $0 down      # Stop containers"
        echo "  $0 up        # Start containers"
        echo "  $0 status    # Check status"
        ;;
esac
