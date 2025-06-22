#!/bin/bash

# AstroKabinet Docker Run Script
# This script helps you run the application locally with Docker

set -e

echo "🚀 Starting AstroKabinet Application"
echo "==================================="
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

# Check if image exists
if ! docker image inspect astrokabinet:latest &> /dev/null; then
    echo "🏗️  Docker image not found. Building..."
    ./docker-setup.sh
fi

# Function to check if container is running
check_container() {
    docker ps --filter "name=$1" --format "table {{.Names}}" | grep -q "$1"
}

# Function to wait for database
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."
    timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U astroworks -d astroworks; do sleep 2; done'
    echo "✅ Database is ready"
}

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for database
wait_for_db

# Check if APP_KEY is set
if ! docker-compose exec -T app php artisan key:generate --show | grep -q "base64:"; then
    echo "🔑 Generating application key..."
    docker-compose exec app php artisan key:generate
fi

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose exec app php artisan migrate --force

# Create storage link
echo "🔗 Creating storage link..."
docker-compose exec app php artisan storage:link

# Set proper permissions
echo "🔐 Setting proper permissions..."
docker-compose exec app chown -R www-data:www-data /app/storage /app/bootstrap/cache
docker-compose exec app chmod -R 775 /app/storage /app/bootstrap/cache

echo ""
echo "🎉 Application started successfully!"
echo ""
echo "📊 Container Status:"
docker-compose ps
echo ""
echo "🌐 Application URL: http://localhost:8000"
echo "🗄️  Database URL: localhost:5432"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop application: docker-compose down"
echo "   Restart:          docker-compose restart"
echo "   Run artisan:      docker-compose exec app php artisan [command]"
echo "   Access shell:     docker-compose exec app bash"
echo "   Database shell:   docker-compose exec postgres psql -U astroworks -d astroworks"