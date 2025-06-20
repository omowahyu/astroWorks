#!/bin/bash
set -e

echo "Deployment started on server..."
echo "Code has been pulled from git."

# Load environment variables from .env file
# This file is already on the server and is not overwritten
export $(grep -v '^#' .env | xargs)

# Install dependencies and build assets
echo "Installing dependencies and building assets..."
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
npm ci || npm install
npm run build

# Build and start the Docker containers in detached mode
echo "Building and restarting containers..."
docker-compose -f docker-compose.production.yml up -d --build

# Run database migrations inside the container
echo "Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T app php artisan migrate --force

# Optimize Laravel
echo "Optimizing application..."
docker-compose -f docker-compose.production.yml exec -T app php artisan optimize:clear
docker-compose -f docker-compose.production.yml exec -T app php artisan optimize

echo "Deployment finished!"
