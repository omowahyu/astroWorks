Laravel 12, Inertia, React, Octane, and Docker Deployment

This repository contains a complete setup for developing and deploying a Laravel 12 application using Inertia.js (with React), Octane, and Docker. The setup is optimized for production with multi-stage builds and distroless images for security and a small footprint.
Features

    Laravel 12: The latest version of the Laravel framework.

    Inertia.js v2 with React: A modern approach to building single-page apps.

    Laravel Octane with RoadRunner: Supercharge your application's performance.

    Dockerized Environment: Consistent development and production environments.

    Multi-stage Docker Builds: Creates lean and secure production images.

    Nginx with Distroless Image: A lightweight and secure web server.

    Automated Deployment: A simple deploy.sh script for easy deployments.

    GitHub Actions Integration: A sample workflow to automate deployments on push to production.

Local Development

    Clone the repository:

    git clone <your-repo-url>
    cd <your-repo-name>

    Create a .env file:

    cp .env.example .env

    Update the .env file with your local environment settings. Make sure to set DB_HOST=mysql.

    Build and start the containers:

    docker-compose up -d --build

    Install dependencies and generate key:

    docker-compose exec laravel.app composer install
    docker-compose exec laravel.app php artisan key:generate
    docker-compose exec laravel.app npm install

    Run database migrations:

    docker-compose exec laravel.app php artisan migrate

    Access the application:
    Your application should be available at http://localhost.

Production Deployment

This setup is designed for a seamless deployment to your production server using GitHub Actions.
Prerequisites

    A VPS with Docker and Docker Compose installed.

    Your server's SSH credentials and private key stored as GitHub secrets (VPS_HOST, VPS_USERNAME, VPS_PORT, SSH_PRIVATE_KEY).

    Your .env file for production should be present on the server in the project directory.

Deployment Process

The included GitHub Actions workflow in .github/workflows/deploy.yml will automatically trigger on a push to the production branch. Here's what happens:

    The action securely connects to your server via SSH.

    It navigates to your project directory.

    It executes the ./.scripts/deploy.sh script.

The deploy.sh script performs the following steps:

    Pulls the latest code from the production branch.

    Builds the Docker images for PHP and Nginx.

    Restarts the Docker containers with the new images.

    Runs database migrations inside the running container.

    Clears and re-creates Laravel's caches.

    Reloads the Octane workers to apply all changes without downtime.

This approach ensures a zero-downtime deployment for your Laravel application.
