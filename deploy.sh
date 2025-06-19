#!/bin/bash

# AstroKabinet Quick Deployment Script
# Usage: ./deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REMOTE_USER="astro"
REMOTE_HOST="103.117.56.159"
REMOTE_PATH="/var/www/astrokabinet.id"
COMPOSE_FILE="docker-compose.caddy.yml"

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "composer.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_header "🚀 AstroKabinet Deployment Started"

# Step 1: Run tests locally (optional)
if [ -f "vendor/bin/pest" ]; then
    print_header "Step 1: Running tests locally"
    if ./vendor/bin/pest; then
        print_status "✅ All tests passed"
    else
        print_error "❌ Tests failed. Deployment aborted."
        exit 1
    fi
else
    print_warning "No tests found, skipping test step"
fi

# Step 2: Push to repository
print_header "Step 2: Pushing to repository"
if git diff --quiet && git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    print_status "Committing and pushing changes..."
    git add .
    echo "Enter commit message (or press Enter for default):"
    read -r commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    git commit -m "$commit_message"
    git push origin main
    print_status "✅ Changes pushed to repository"
fi

# Step 3: Deploy to server
print_header "Step 3: Deploying to production server"
print_status "Connecting to $REMOTE_HOST..."

ssh $REMOTE_USER@$REMOTE_HOST << EOF
    set -e
    cd $REMOTE_PATH
    
    echo "📥 Pulling latest changes..."
    git pull origin main
    
    echo "🔄 Rebuilding and restarting containers..."
    docker-compose -f $COMPOSE_FILE up -d --build
    
    echo "⏳ Waiting for containers to be ready..."
    sleep 10
    
    echo "🧹 Cleaning up old Docker images..."
    docker image prune -f
    
    echo "✅ Deployment completed successfully!"
    
    echo "📊 Container status:"
    docker-compose -f $COMPOSE_FILE ps
EOF

# Step 4: Health check
print_header "Step 4: Health check"
print_status "Checking if website is accessible..."
sleep 5

if curl -f -s http://astrokabinet.id > /dev/null; then
    print_status "✅ Website is accessible!"
else
    print_warning "⚠️  Website might not be ready yet. Check manually: http://astrokabinet.id"
fi

print_header "🎉 Deployment completed!"
echo ""
echo "🌐 Website: http://astrokabinet.id"
echo "🔐 Admin: team@astrokabinet.id / Astrokabinet25!"
echo ""
echo "Useful commands:"
echo "- View logs: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose -f $COMPOSE_FILE logs -f'"
echo "- Restart: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose -f $COMPOSE_FILE restart'"
echo "- Shell access: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose -f $COMPOSE_FILE exec app bash'"
