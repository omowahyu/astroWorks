#!/bin/bash

# AstroKabinet Production Deployment Script
# Complete deployment process dengan Docker

set -e

echo "🚀 AstroKabinet Production Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="astrokabinet.id"
APP_DIR="/var/www/astrokabinet.id"
REPO_URL="https://github.com/your-username/astroworks.git" # Update this
BRANCH="main"

# Function to print colored output
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

# Check if running as correct user
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

print_header "Step 1: Pre-deployment checks"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please run deployment/docker-deploy.sh first"
    exit 1
fi

# Check if user is in docker group
if ! groups $USER | grep -q docker; then
    print_error "User $USER is not in docker group. Please logout and login again after running docker-deploy.sh"
    exit 1
fi

print_header "Step 2: Backup current deployment"

# Create backup if application exists
if [ -d "$APP_DIR" ]; then
    print_status "Creating backup of current deployment..."
    cd $APP_DIR
    chmod +x deployment/backup.sh
    ./deployment/backup.sh
else
    print_status "No existing deployment found. Skipping backup."
fi

print_header "Step 3: Deploy application code"

# Create or update application directory
print_status "Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
else
    print_status "Cloning repository..."
    if [ "$(ls -A $APP_DIR)" ]; then
        print_warning "Directory not empty. Backing up existing files..."
        mv $APP_DIR $APP_DIR.backup.$(date +%Y%m%d_%H%M%S)
        mkdir -p $APP_DIR
        sudo chown -R $USER:$USER $APP_DIR
    fi
    git clone -b $BRANCH $REPO_URL $APP_DIR
    cd $APP_DIR
fi

print_header "Step 4: Setup environment"

# Copy production environment file
print_status "Setting up production environment..."
if [ ! -f ".env" ]; then
    cp .env.production .env
    print_status "Environment file created from .env.production"
fi

# Make scripts executable
print_status "Making deployment scripts executable..."
chmod +x deployment/*.sh
chmod +x deploy-production.sh

print_header "Step 5: Deploy with Docker"

# Run application deployment
print_status "Deploying application with Docker..."
./deployment/app-deploy.sh

print_header "Step 6: Final checks"

# Test application
print_status "Testing application..."
sleep 5

if curl -f -s https://$DOMAIN > /dev/null; then
    print_status "✅ Application is running successfully!"
else
    print_warning "Application test failed. Checking container status..."
    docker-compose -f docker-compose.production.yml ps
    docker-compose -f docker-compose.production.yml logs --tail=10
fi

print_status "🎉 Deployment completed!"
echo ""
echo "Application URL: https://$DOMAIN"
echo "Admin Login: team@astrokabinet.id / Astrokabinet25!"
echo ""
echo "Useful commands:"
echo "- View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "- Restart: docker-compose -f docker-compose.production.yml restart"
echo "- Rollback: ./deployment/rollback.sh"
echo "- Backup: ./deployment/backup.sh"
echo ""
print_warning "Don't forget to:"
echo "1. Update DNS records to point to this server"
echo "2. Configure Cloudflare settings"
echo "3. Test all functionality"
