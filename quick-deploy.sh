#!/bin/bash

# AstroKabinet Quick Deployment Script
# Script sederhana untuk deployment cepat

set -e

echo "🚀 AstroKabinet Quick Deployment"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
APP_DIR="/var/www/astrokabinet.id"
REPO_URL="https://github.com/omowahyu/astroworks.git"

print_status "Starting deployment process..."

# Step 1: Setup directory
print_status "Setting up application directory..."
mkdir -p $APP_DIR || true
# Skip chown if we don't have sudo access
if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    sudo chown -R $USER:$USER $APP_DIR
else
    print_warning "No sudo access, skipping directory ownership change"
fi

# Step 2: Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/main
else
    print_status "Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Step 3: Make scripts executable
print_status "Making scripts executable..."
chmod +x deployment/*.sh
chmod +x deploy-production.sh

# Step 4: Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker not installed. Installing Docker..."
    ./deployment/docker-deploy.sh
    print_warning "Please logout and login again, then run this script again"
    exit 0
fi

# Step 5: Check if user is in docker group
if ! groups $USER | grep -q docker; then
    print_warning "User not in docker group. Please logout and login again"
    exit 0
fi

# Step 6: Setup environment
print_status "Setting up environment..."
if [ ! -f ".env" ]; then
    cp .env.production .env
fi

# Step 7: Deploy with Docker
print_status "Deploying with Docker..."

# Stop existing containers
docker-compose -f docker-compose.production.yml down || true

# Build and start containers
print_status "Building and starting containers..."
docker-compose -f docker-compose.production.yml up -d --build

# Wait for containers
print_status "Waiting for containers to be ready..."
sleep 15

# Run Laravel setup
print_status "Setting up Laravel..."
docker-compose -f docker-compose.production.yml exec -T app php artisan key:generate --force
docker-compose -f docker-compose.production.yml exec -T app php artisan migrate --force
docker-compose -f docker-compose.production.yml exec -T app php artisan storage:link
docker-compose -f docker-compose.production.yml exec -T app php artisan config:cache
docker-compose -f docker-compose.production.yml exec -T app php artisan route:cache
docker-compose -f docker-compose.production.yml exec -T app php artisan view:cache

# Set permissions
docker-compose -f docker-compose.production.yml exec -T app chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Create admin user
print_status "Creating admin user..."
docker-compose -f docker-compose.production.yml exec -T app php artisan tinker --execute="
if (!\App\Models\User::where('email', 'team@astrokabinet.id')->exists()) {
    \App\Models\User::create([
        'name' => 'Admin AstroKabinet',
        'email' => 'team@astrokabinet.id',
        'password' => bcrypt('Astrokabinet25!'),
        'email_verified_at' => now(),
    ]);
    echo 'Admin user created successfully';
} else {
    echo 'Admin user already exists';
}
"

# Test application
print_status "Testing application..."
sleep 5

if curl -f -s https://astrokabinet.id > /dev/null; then
    print_status "✅ Deployment successful!"
    echo ""
    echo "🌐 Website: https://astrokabinet.id"
    echo "🔐 Admin: team@astrokabinet.id / Astrokabinet25!"
    echo ""
    echo "Container status:"
    docker-compose -f docker-compose.production.yml ps
else
    print_warning "Application might not be ready yet. Check manually:"
    echo "curl -I https://astrokabinet.id"
    echo ""
    echo "Container logs:"
    docker-compose -f docker-compose.production.yml logs --tail=10
fi

print_status "Deployment completed!"
echo ""
echo "Useful commands:"
echo "- View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "- Restart: docker-compose -f docker-compose.production.yml restart"
echo "- Stop: docker-compose -f docker-compose.production.yml down"
