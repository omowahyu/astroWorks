#!/bin/bash

# AstroKabinet FrankenPHP Deployment Script
# Deploy dengan FrankenPHP di Docker + MySQL local

set -e

echo "🚀 AstroKabinet FrankenPHP Deployment"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_header "Step 1: Pre-deployment checks"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first"
    exit 1
fi

# Check if user is in docker group
if ! groups $USER | grep -q docker; then
    print_error "User $USER is not in docker group. Please logout and login again"
    exit 1
fi

print_header "Step 2: Stop existing containers"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.frankenphp.yml down || true
docker-compose -f docker-compose.production.yml down || true

print_header "Step 3: Setup environment"

# Copy production environment file
print_status "Setting up production environment..."
if [ ! -f ".env" ]; then
    cp .env.production .env
    print_status "Environment file created from .env.production"
fi

print_header "Step 4: Build and deploy with FrankenPHP"

# Build and start FrankenPHP container
print_status "Building and starting FrankenPHP container..."
docker-compose -f docker-compose.frankenphp.yml up -d --build

# Wait for container to be ready
print_status "Waiting for container to be ready..."
sleep 15

print_header "Step 5: Setup Laravel"

# Run Laravel setup commands
print_status "Running Laravel setup commands..."

# Generate application key if not exists
print_status "Generating application key..."
docker-compose -f docker-compose.frankenphp.yml exec -T app php artisan key:generate --force

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.frankenphp.yml exec -T app php artisan migrate --force

# Create storage link
print_status "Creating storage link..."
docker-compose -f docker-compose.frankenphp.yml exec -T app php artisan storage:link

# Cache configuration
print_status "Caching configuration..."
docker-compose -f docker-compose.frankenphp.yml exec -T app php artisan config:cache
docker-compose -f docker-compose.frankenphp.yml exec -T app php artisan route:cache
docker-compose -f docker-compose.frankenphp.yml exec -T app php artisan view:cache

# Set proper permissions
print_status "Setting proper permissions..."
docker-compose -f docker-compose.frankenphp.yml exec -T app chown -R www-data:www-data /app/storage /app/bootstrap/cache

print_header "Step 6: Create admin user"

# Create admin user if not exists
print_status "Creating admin user..."
docker-compose -f docker-compose.frankenphp.yml exec -T app php artisan tinker --execute="
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

print_header "Step 7: Final checks"

# Test application
print_status "Testing application..."
sleep 5

if curl -f -s http://localhost > /dev/null; then
    print_status "✅ Deployment successful!"
    echo ""
    echo "🌐 Website: http://astrokabinet.id"
    echo "🔐 Admin: team@astrokabinet.id / Astrokabinet25!"
    echo ""
    echo "Container status:"
    docker-compose -f docker-compose.frankenphp.yml ps
else
    print_warning "Application might not be ready yet. Check manually:"
    echo "curl -I http://localhost"
    echo ""
    echo "Container logs:"
    docker-compose -f docker-compose.frankenphp.yml logs --tail=10
fi

print_status "✅ FrankenPHP deployment completed!"
echo ""
echo "Useful commands:"
echo "- View logs: docker-compose -f docker-compose.frankenphp.yml logs -f"
echo "- Restart: docker-compose -f docker-compose.frankenphp.yml restart"
echo "- Stop: docker-compose -f docker-compose.frankenphp.yml down"
echo "- Shell access: docker-compose -f docker-compose.frankenphp.yml exec app bash"
