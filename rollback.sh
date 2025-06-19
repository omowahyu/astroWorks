#!/bin/bash

# AstroKabinet Rollback Script
# Usage: ./rollback.sh [commit_hash] or ./rollback.sh last

set -e

echo "🔄 AstroKabinet Rollback Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.caddy.yml" ]; then
    echo "❌ Error: docker-compose.caddy.yml not found. Are you in the right directory?"
    exit 1
fi

# Function to rollback to previous commit
rollback_to_previous() {
    echo "📥 Rolling back to previous commit..."
    
    # Stop current containers
    echo "🛑 Stopping current containers..."
    docker-compose -f docker-compose.caddy.yml down || true
    
    # Rollback git to previous commit
    git reset --hard HEAD~1
    
    # Rebuild and restart
    echo "🔨 Rebuilding with previous code..."
    docker-compose -f docker-compose.caddy.yml build
    
    echo "🔄 Starting containers..."
    docker-compose -f docker-compose.caddy.yml up -d
    
    # Wait and health check
    echo "⏳ Waiting for containers to be ready..."
    sleep 30
    
    # Health check
    if docker-compose -f docker-compose.caddy.yml exec -T app php artisan --version > /dev/null 2>&1; then
        echo "✅ Rollback successful!"
        docker-compose -f docker-compose.caddy.yml ps
    else
        echo "❌ Rollback failed. Manual intervention required."
        exit 1
    fi
}

# Function to rollback to specific commit
rollback_to_commit() {
    local commit_hash=$1
    echo "📥 Rolling back to commit: $commit_hash"
    
    # Validate commit hash
    if ! git cat-file -e "$commit_hash^{commit}" 2>/dev/null; then
        echo "❌ Error: Invalid commit hash: $commit_hash"
        exit 1
    fi
    
    # Stop current containers
    echo "🛑 Stopping current containers..."
    docker-compose -f docker-compose.caddy.yml down || true
    
    # Rollback git to specific commit
    git reset --hard "$commit_hash"
    
    # Rebuild and restart
    echo "🔨 Rebuilding with commit $commit_hash..."
    docker-compose -f docker-compose.caddy.yml build
    
    echo "🔄 Starting containers..."
    docker-compose -f docker-compose.caddy.yml up -d
    
    # Wait and health check
    echo "⏳ Waiting for containers to be ready..."
    sleep 30
    
    # Health check
    if docker-compose -f docker-compose.caddy.yml exec -T app php artisan --version > /dev/null 2>&1; then
        echo "✅ Rollback to $commit_hash successful!"
        docker-compose -f docker-compose.caddy.yml ps
    else
        echo "❌ Rollback failed. Manual intervention required."
        exit 1
    fi
}

# Function to show recent commits
show_recent_commits() {
    echo "📋 Recent commits:"
    git log --oneline -10
    echo ""
}

# Function to show current status
show_status() {
    echo "📊 Current Status:"
    echo "Current commit: $(git rev-parse --short HEAD)"
    echo "Current branch: $(git branch --show-current)"
    echo ""
    echo "Docker containers:"
    docker-compose -f docker-compose.caddy.yml ps
    echo ""
}

# Main script logic
case "${1:-}" in
    "last"|"previous"|"")
        show_status
        echo "🔄 Rolling back to previous commit..."
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback_to_previous
        else
            echo "❌ Rollback cancelled."
        fi
        ;;
    "status")
        show_status
        ;;
    "commits")
        show_recent_commits
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  last, previous, (empty)  - Rollback to previous commit"
        echo "  <commit_hash>           - Rollback to specific commit"
        echo "  status                  - Show current status"
        echo "  commits                 - Show recent commits"
        echo "  help                    - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0                      # Rollback to previous commit"
        echo "  $0 last                 # Same as above"
        echo "  $0 abc1234              # Rollback to specific commit"
        echo "  $0 status               # Show current status"
        ;;
    *)
        # Assume it's a commit hash
        show_status
        show_recent_commits
        echo "🔄 Rolling back to commit: $1"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback_to_commit "$1"
        else
            echo "❌ Rollback cancelled."
        fi
        ;;
esac
