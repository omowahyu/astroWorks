#!/bin/bash

# Podman Pod Setup Script for AstroWorks
# This script creates a Podman pod with PostgreSQL and FrankenPHP

set -e

# Configuration
POD_NAME="astroworks-pod"
POSTGRES_CONTAINER="astroworks-postgres"
APP_CONTAINER="astroworks-app"
NETWORK_NAME="astroworks-network"

# Database configuration
DB_NAME="astroworks"
DB_USER="astroworks"
DB_PASSWORD="astroworks123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if podman is installed
if ! command_exists podman; then
    print_error "Podman is not installed. Please install Podman first."
    exit 1
fi

# Function to cleanup existing resources
cleanup() {
    print_status "Cleaning up existing resources..."
    
    # Stop and remove containers if they exist
    if podman container exists $APP_CONTAINER 2>/dev/null; then
        print_status "Stopping and removing $APP_CONTAINER container..."
        podman stop $APP_CONTAINER 2>/dev/null || true
        podman rm $APP_CONTAINER 2>/dev/null || true
    fi
    
    if podman container exists $POSTGRES_CONTAINER 2>/dev/null; then
        print_status "Stopping and removing $POSTGRES_CONTAINER container..."
        podman stop $POSTGRES_CONTAINER 2>/dev/null || true
        podman rm $POSTGRES_CONTAINER 2>/dev/null || true
    fi
    
    # Remove pod if it exists
    if podman pod exists $POD_NAME 2>/dev/null; then
        print_status "Removing existing pod $POD_NAME..."
        podman pod rm -f $POD_NAME 2>/dev/null || true
    fi
    
    # Remove network if it exists
    if podman network exists $NETWORK_NAME 2>/dev/null; then
        print_status "Removing existing network $NETWORK_NAME..."
        podman network rm $NETWORK_NAME 2>/dev/null || true
    fi
}

# Function to create network
create_network() {
    print_status "Creating network $NETWORK_NAME..."
    podman network create $NETWORK_NAME
}

# Function to create pod
create_pod() {
    print_status "Creating pod $POD_NAME..."
    podman pod create \
        --name $POD_NAME \
        --network $NETWORK_NAME \
        --publish 8000:8000 \
        --publish 5432:5432
}

# Function to create PostgreSQL container
create_postgres_container() {
    print_status "Creating PostgreSQL container..."
    podman run -d \
        --name $POSTGRES_CONTAINER \
        --pod $POD_NAME \
        -e POSTGRES_DB=$DB_NAME \
        -e POSTGRES_USER=$DB_USER \
        -e POSTGRES_PASSWORD=$DB_PASSWORD \
        -e PGDATA=/var/lib/postgresql/data/pgdata \
        -v astroworks_postgres_data:/var/lib/postgresql/data \
        postgres:16-alpine
    
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Wait for PostgreSQL to be ready
    for i in {1..30}; do
        if podman exec $POSTGRES_CONTAINER pg_isready -U $DB_USER -d $DB_NAME >/dev/null 2>&1; then
            print_status "PostgreSQL is ready!"
            break
        fi
        print_status "Waiting for PostgreSQL... ($i/30)"
        sleep 2
    done
}

# Function to build application image
build_app_image() {
    print_status "Building application image..."
    
    # Copy Caddyfile to the container location
    if [ ! -f "Caddyfile" ]; then
        print_error "Caddyfile not found. Please ensure Caddyfile exists."
        exit 1
    fi
    
    # Build the image
    podman build -t astroworks-app:latest .
}

# Function to create application container
create_app_container() {
    print_status "Creating application container..."
    
    # Ensure .env file exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_status "Copying .env.example to .env..."
            cp .env.example .env
        else
            print_error ".env.example file not found"
            exit 1
        fi
    fi
    
    # Create application container
    podman run -d \
        --name $APP_CONTAINER \
        --pod $POD_NAME \
        -e APP_NAME="AstroWorks" \
        -e APP_ENV=local \
        -e APP_DEBUG=true \
        -e APP_URL=http://localhost:8000 \
        -e DB_CONNECTION=pgsql \
        -e DB_HOST=localhost \
        -e DB_PORT=5432 \
        -e DB_DATABASE=$DB_NAME \
        -e DB_USERNAME=$DB_USER \
        -e DB_PASSWORD=$DB_PASSWORD \
        -e SESSION_DRIVER=database \
        -e CACHE_STORE=database \
        -e QUEUE_CONNECTION=database \
        -v $(pwd)/storage:/app/storage:Z \
        -v $(pwd)/bootstrap/cache:/app/bootstrap/cache:Z \
        -v $(pwd)/Caddyfile:/etc/caddy/Caddyfile:ro,Z \
        astroworks-app:latest
}

# Function to run Laravel migrations
run_migrations() {
    print_status "Running Laravel migrations..."
    sleep 5
    
    # Generate app key if not exists
    podman exec $APP_CONTAINER php artisan key:generate --no-interaction
    
    # Run migrations
    podman exec $APP_CONTAINER php artisan migrate --force
    
    # Clear caches
    podman exec $APP_CONTAINER php artisan config:clear
    podman exec $APP_CONTAINER php artisan cache:clear
    podman exec $APP_CONTAINER php artisan route:clear
    podman exec $APP_CONTAINER php artisan view:clear
}

# Function to show status
show_status() {
    print_status "=== Pod Status ==="
    podman pod ps
    
    print_status "=== Container Status ==="
    podman ps --pod
    
    print_status "=== Application URLs ==="
    echo "Application: http://localhost:8000"
    echo "PostgreSQL: localhost:5432"
    
    print_status "=== Database Connection Details ==="
    echo "Database: $DB_NAME"
    echo "Username: $DB_USER"
    echo "Password: $DB_PASSWORD"
}

# Main execution
main() {
    print_status "Starting AstroWorks Podman Pod Setup..."
    
    # Check if we're in the right directory
    if [ ! -f "composer.json" ]; then
        print_error "composer.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    cleanup
    create_network
    create_pod
    create_postgres_container
    build_app_image
    create_app_container
    run_migrations
    show_status
    
    print_status "Setup completed successfully!"
    print_status "Your application is now running at http://localhost:8000"
}

# Handle script arguments
case "${1:-}" in
    "cleanup")
        cleanup
        print_status "Cleanup completed."
        ;;
    "status")
        show_status
        ;;
    "logs")
        if [ -n "${2:-}" ]; then
            podman logs -f "${2}"
        else
            print_status "Available containers:"
            podman ps --format "table {{.Names}}"
            print_status "Usage: $0 logs <container_name>"
        fi
        ;;
    "restart")
        print_status "Restarting pod..."
        podman pod restart $POD_NAME
        ;;
    "stop")
        print_status "Stopping pod..."
        podman pod stop $POD_NAME
        ;;
    "start")
        print_status "Starting pod..."
        podman pod start $POD_NAME
        ;;
    *)
        main
        ;;
esac