#!/bin/bash

# AstroKabinet Emergency Restore Script
# This script quickly restores the website to a working state

set -e

echo "🚨 AstroKabinet Emergency Restore"
echo "================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.caddy.yml" ]; then
    echo "❌ Error: docker-compose.caddy.yml not found. Are you in the right directory?"
    exit 1
fi

# Function to force restart containers
force_restart() {
    echo "🔄 Force restarting containers..."
    
    # Kill all containers forcefully
    docker-compose -f docker-compose.caddy.yml kill || true
    docker-compose -f docker-compose.caddy.yml down --remove-orphans || true
    
    # Remove any stuck containers
    docker container prune -f || true
    
    # Start fresh
    docker-compose -f docker-compose.caddy.yml up -d --force-recreate
    
    echo "⏳ Waiting for containers to start..."
    sleep 30
    
    # Health check
    if docker-compose -f docker-compose.caddy.yml exec -T app php artisan --version > /dev/null 2>&1; then
        echo "✅ Emergency restart successful!"
        docker-compose -f docker-compose.caddy.yml ps
        return 0
    else
        echo "❌ Emergency restart failed."
        return 1
    fi
}

# Function to restore from backup
restore_from_backup() {
    echo "💾 Attempting to restore from backup..."
    
    if [ -d "backup_current" ] && [ -f "backup_current/deployment_success.txt" ]; then
        echo "📦 Found successful backup, rolling back..."
        
        # Stop current containers
        docker-compose -f docker-compose.caddy.yml down || true
        
        # Reset to last known good state
        git reset --hard HEAD~1
        
        # Rebuild and restart
        docker-compose -f docker-compose.caddy.yml build
        docker-compose -f docker-compose.caddy.yml up -d
        
        echo "⏳ Waiting for restore to complete..."
        sleep 30
        
        if docker-compose -f docker-compose.caddy.yml exec -T app php artisan --version > /dev/null 2>&1; then
            echo "✅ Backup restore successful!"
            return 0
        else
            echo "❌ Backup restore failed."
            return 1
        fi
    else
        echo "⚠️ No backup found or backup is incomplete."
        return 1
    fi
}

# Function to rebuild from scratch
rebuild_from_scratch() {
    echo "🔨 Rebuilding from scratch..."
    
    # Stop and remove everything
    docker-compose -f docker-compose.caddy.yml down --volumes --remove-orphans || true
    docker system prune -f || true
    
    # Pull latest code
    git fetch origin main
    git reset --hard origin/main
    
    # Build fresh
    docker-compose -f docker-compose.caddy.yml build --no-cache
    docker-compose -f docker-compose.caddy.yml up -d
    
    echo "⏳ Waiting for fresh build to complete..."
    sleep 60
    
    # Run migrations
    docker-compose -f docker-compose.caddy.yml exec -T app php artisan migrate --force || true
    docker-compose -f docker-compose.caddy.yml exec -T app php artisan storage:link || true
    
    if docker-compose -f docker-compose.caddy.yml exec -T app php artisan --version > /dev/null 2>&1; then
        echo "✅ Fresh rebuild successful!"
        return 0
    else
        echo "❌ Fresh rebuild failed."
        return 1
    fi
}

# Function to show current status
show_status() {
    echo "📊 Current Status:"
    echo "Current commit: $(git rev-parse --short HEAD)"
    echo "Current branch: $(git branch --show-current)"
    echo ""
    
    echo "Docker containers:"
    docker-compose -f docker-compose.caddy.yml ps || echo "No containers running"
    echo ""
    
    echo "Docker images:"
    docker images | grep astrokabinet || echo "No astrokabinet images found"
    echo ""
    
    echo "Disk space:"
    df -h /var/www/astrokabinet.id || df -h .
    echo ""
}

# Function to check website accessibility
check_website() {
    echo "🌐 Checking website accessibility..."
    
    # Check local container
    if docker-compose -f docker-compose.caddy.yml exec -T app php artisan --version > /dev/null 2>&1; then
        echo "✅ Application container is responding"
    else
        echo "❌ Application container is not responding"
        return 1
    fi
    
    # Check HTTP access
    if curl -f -m 10 http://localhost > /dev/null 2>&1; then
        echo "✅ HTTP access working"
    else
        echo "❌ HTTP access failed"
    fi
    
    # Check external access
    if curl -f -m 10 http://astrokabinet.id > /dev/null 2>&1; then
        echo "✅ External access working"
    else
        echo "⚠️ External access failed (might be DNS/firewall)"
    fi
}

# Main emergency restore logic
echo "🔍 Diagnosing current state..."
show_status

echo ""
echo "🚨 Emergency Restore Options:"
echo "1. Force restart containers (fastest)"
echo "2. Restore from backup"
echo "3. Rebuild from scratch (slowest but most thorough)"
echo "4. Just check status"
echo "5. Exit"
echo ""

read -p "Choose option (1-5): " -n 1 -r
echo

case $REPLY in
    1)
        echo "🔄 Attempting force restart..."
        if force_restart; then
            check_website
        else
            echo "❌ Force restart failed. Try option 2 or 3."
        fi
        ;;
    2)
        echo "💾 Attempting backup restore..."
        if restore_from_backup; then
            check_website
        else
            echo "❌ Backup restore failed. Try option 3."
        fi
        ;;
    3)
        echo "🔨 Attempting full rebuild..."
        echo "⚠️ This will take several minutes..."
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if rebuild_from_scratch; then
                check_website
            else
                echo "❌ Full rebuild failed. Manual intervention required."
            fi
        else
            echo "❌ Rebuild cancelled."
        fi
        ;;
    4)
        show_status
        check_website
        ;;
    5)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Exiting..."
        exit 1
        ;;
esac

echo ""
echo "🏁 Emergency restore process completed."
echo "If the website is still not working, please check:"
echo "1. Server resources (disk space, memory)"
echo "2. Database connectivity"
echo "3. DNS settings"
echo "4. Firewall/security groups"
