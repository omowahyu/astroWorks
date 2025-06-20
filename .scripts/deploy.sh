#!/bin/bash
set -e

echo "Deployment started on server..."
echo "Code has been copied via SCP."

# Load environment variables from .env file
# This file is already on the server and is not overwritten
export $(grep -v '^#' .env | xargs)

# Build and start the Docker containers in detached mode
# The --build step will now be much faster
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
