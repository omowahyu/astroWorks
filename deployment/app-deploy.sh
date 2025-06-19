#!/bin/bash

# AstroKabinet Application Deployment Script
# Deploy aplikasi ke Docker containers

set -e

echo "🚀 Deploying AstroKabinet application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="astrokabinet.id"
APP_DIR="/var/www/astrokabinet.id"
COMPOSE_FILE="docker-compose.production.yml"

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

# Check if we're in the right directory
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "docker-compose.production.yml not found. Please run from application root directory."
    exit 1
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down || true

# Build and start containers
print_status "Building and starting containers..."
docker-compose -f $COMPOSE_FILE up -d --build

# Wait for containers to be ready
print_status "Waiting for containers to be ready..."
sleep 10

# Check if containers are running
print_status "Checking container status..."
docker-compose -f $COMPOSE_FILE ps

# Run Laravel setup commands
print_status "Running Laravel setup commands..."

# Generate application key if not exists
print_status "Generating application key..."
docker-compose -f $COMPOSE_FILE exec -T app php artisan key:generate --force

# Run database migrations
print_status "Running database migrations..."
docker-compose -f $COMPOSE_FILE exec -T app php artisan migrate --force

# Create storage link
print_status "Creating storage link..."
docker-compose -f $COMPOSE_FILE exec -T app php artisan storage:link

# Cache configuration
print_status "Caching configuration..."
docker-compose -f $COMPOSE_FILE exec -T app php artisan config:cache
docker-compose -f $COMPOSE_FILE exec -T app php artisan route:cache
docker-compose -f $COMPOSE_FILE exec -T app php artisan view:cache

# Set proper permissions
print_status "Setting proper permissions..."
docker-compose -f $COMPOSE_FILE exec -T app chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Create admin user if not exists
print_status "Creating admin user..."
docker-compose -f $COMPOSE_FILE exec -T app php artisan tinker --execute="
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
if curl -f -s https://$DOMAIN > /dev/null; then
    print_status "✅ Application is running successfully!"
    echo "🌐 Visit: https://$DOMAIN"
    echo "🔐 Admin login: team@astrokabinet.id / Astrokabinet25!"
else
    print_warning "Application might not be fully ready yet. Please check manually."
fi

# Show container logs
print_status "Recent container logs:"
docker-compose -f $COMPOSE_FILE logs --tail=20

print_status "✅ Deployment completed!"
echo ""
echo "Useful commands:"
echo "- View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "- Restart: docker-compose -f $COMPOSE_FILE restart"
echo "- Stop: docker-compose -f $COMPOSE_FILE down"
echo "- Shell access: docker-compose -f $COMPOSE_FILE exec app bash"
