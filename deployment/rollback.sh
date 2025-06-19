#!/bin/bash

# AstroKabinet Rollback Script
# Rollback deployment jika terjadi masalah

set -e

echo "🔄 AstroKabinet Rollback Script..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.production.yml"
BACKUP_DIR="/var/backups/astrokabinet"

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

print_warning "This will rollback the application to the previous state."
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Rollback cancelled."
    exit 0
fi

# Stop current containers
print_status "Stopping current containers..."
docker-compose -f $COMPOSE_FILE down

# Restore database backup if exists
if [ -f "$BACKUP_DIR/database_backup.sql" ]; then
    print_status "Restoring database backup..."
    mysql -u astro -p'QjytaT#YL6' astroworks < $BACKUP_DIR/database_backup.sql
else
    print_warning "No database backup found. Skipping database restore."
fi

# Restore storage files if exists
if [ -d "$BACKUP_DIR/storage" ]; then
    print_status "Restoring storage files..."
    cp -r $BACKUP_DIR/storage/* ./storage/
else
    print_warning "No storage backup found. Skipping storage restore."
fi

# Use previous Docker image if available
print_status "Checking for previous Docker images..."
PREVIOUS_IMAGE=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep astrokabinet | head -2 | tail -1)

if [ ! -z "$PREVIOUS_IMAGE" ]; then
    print_status "Found previous image: $PREVIOUS_IMAGE"
    # You would need to modify docker-compose to use specific image tag
    print_warning "Manual intervention required to use previous image tag"
else
    print_warning "No previous Docker image found"
fi

# Start containers with current configuration
print_status "Starting containers..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for containers to be ready
print_status "Waiting for containers to be ready..."
sleep 10

# Run basic Laravel commands
print_status "Running basic Laravel commands..."
docker-compose -f $COMPOSE_FILE exec -T app php artisan config:cache
docker-compose -f $COMPOSE_FILE exec -T app php artisan route:cache

# Test application
print_status "Testing application..."
if curl -f -s https://astrokabinet.id > /dev/null; then
    print_status "✅ Rollback completed successfully!"
else
    print_error "❌ Rollback may have failed. Please check manually."
fi

print_status "Rollback process completed."
echo "Please verify the application is working correctly at https://astrokabinet.id"
