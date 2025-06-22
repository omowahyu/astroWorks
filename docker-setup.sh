#!/bin/bash

# AstroKabinet Docker Setup Script
# This script helps you set up Docker environment for local development

set -e

echo "🚀 AstroKabinet Docker Setup"
echo "============================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Detected macOS"
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Please install Homebrew first:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    echo "🍺 Homebrew found"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "🐳 Installing Docker Desktop..."
        brew install --cask docker
        echo "✅ Docker Desktop installed"
        echo "⚠️  Please start Docker Desktop application and try again"
        exit 0
    else
        echo "✅ Docker already installed"
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        echo "⚠️  Docker daemon is not running"
        echo "   Please start Docker Desktop application"
        exit 1
    fi
    
    echo "✅ Docker daemon is running"
else
    echo "🐧 Detected Linux/Other OS"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "🐳 Please install Docker first:"
        echo "   curl -fsSL https://get.docker.com -o get-docker.sh"
        echo "   sh get-docker.sh"
        exit 1
    fi
    
    echo "✅ Docker found"
fi

echo ""
echo "🔧 Setting up environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example"
    cp .env.example .env
    
    # Generate APP_KEY
    echo "🔑 Generating application key..."
    # We'll do this after the container is built
else
    echo "✅ .env file already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p storage/app/public
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache
mkdir -p public/storage

# Create storage symlink directory if it doesn't exist
if [ ! -d "public/storage/images" ]; then
    mkdir -p public/storage/images
    echo "✅ Created public/storage/images directory"
fi

echo "✅ Directories created"

echo ""
echo "🏗️  Building Docker image..."
docker build -t astrokabinet:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run: docker-compose up -d"
echo "2. Generate app key: docker-compose exec app php artisan key:generate"
echo "3. Run migrations: docker-compose exec app php artisan migrate"
echo "4. Seed database: docker-compose exec app php artisan db:seed"
echo "5. Create storage link: docker-compose exec app php artisan storage:link"
echo ""
echo "🌐 Your application will be available at: http://localhost:8000"