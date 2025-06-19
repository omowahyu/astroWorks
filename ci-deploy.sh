#!/bin/bash

# AstroKabinet CI/CD Deployment Script with Retry Logic
# Enhanced version of quick-deploy.sh with retry mechanisms

set -e

echo "🚀 AstroKabinet CI/CD Deployment with Retry Logic"
echo "================================================="

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

# Retry function
retry_command() {
    local max_attempts=$1
    local delay=$2
    local command="${@:3}"
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Attempt $attempt/$max_attempts: $command"
        
        if eval "$command"; then
            print_status "✅ Command succeeded on attempt $attempt"
            return 0
        else
            print_warning "❌ Command failed on attempt $attempt"
            if [ $attempt -lt $max_attempts ]; then
                print_status "Waiting $delay seconds before retry..."
                sleep $delay
            fi
        fi
        
        ((attempt++))
    done
    
    print_error "Command failed after $max_attempts attempts"
    return 1
}

# Configuration
APP_DIR="/var/www/astrokabinet.id"
REPO_URL="https://github.com/omowahyu/astroworks.git"

print_status "Starting CI/CD deployment process..."

# Step 1: Setup directory
print_status "Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Step 2: Clone or update repository with retry
if [ -d "$APP_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $APP_DIR
    retry_command 3 10 "git fetch origin"
    retry_command 3 5 "git reset --hard origin/main"
else
    print_status "Cloning repository..."
    retry_command 3 10 "git clone $REPO_URL $APP_DIR"
    cd $APP_DIR
fi

# Step 3: Make scripts executable
print_status "Making scripts executable..."
chmod +x deployment/*.sh 2>/dev/null || true
chmod +x deploy-production.sh 2>/dev/null || true
chmod +x quick-deploy.sh 2>/dev/null || true
chmod +x ci-deploy.sh 2>/dev/null || true

# Step 4: Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker not installed. Installing Docker..."
    if [ -f "./deployment/docker-deploy.sh" ]; then
        ./deployment/docker-deploy.sh
    else
        print_error "Docker installation script not found"
        exit 1
    fi
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
    if [ -f ".env.production" ]; then
        cp .env.production .env
        print_status "Copied .env.production to .env"
    else
        print_warning ".env.production not found, creating minimal .env"
        cat > .env << EOF
APP_NAME=AstroKabinet
APP_ENV=production
APP_KEY=base64:$(openssl rand -base64 32)
APP_DEBUG=false
APP_URL=https://astrokabinet.id
VITE_APP_NAME=AstroKabinet
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=astroworks
DB_USERNAME=astroapp
DB_PASSWORD=AstroApp123
DB_ROOT_PASSWORD=RootAstro123
REDIS_HOST=redis
EOF
    fi
fi

# Generate APP_KEY if not set
if ! grep -q "APP_KEY=base64:" .env; then
    print_status "Generating APP_KEY..."
    sed -i 's/APP_KEY=/APP_KEY=base64:'"$(openssl rand -base64 32)"'/' .env
fi

# Step 7: Deploy with Docker (with retry logic)
print_status "Deploying with Docker..."

# Stop existing containers with retry
print_status "Stopping existing containers..."
retry_command 3 5 "docker-compose -f docker-compose.production.yml down || true"

# Build and start containers with retry
print_status "Building and starting containers with retry logic..."
retry_command 3 30 "docker-compose -f docker-compose.production.yml up -d --build"

# Wait for containers
print_status "Waiting for containers to be ready..."
sleep 15

# Run Laravel setup with retry
print_status "Setting up Laravel with retry logic..."
retry_command 3 10 "docker-compose -f docker-compose.production.yml exec -T app php artisan key:generate --force"
retry_command 3 10 "docker-compose -f docker-compose.production.yml exec -T app php artisan migrate --force"
retry_command 3 5 "docker-compose -f docker-compose.production.yml exec -T app php artisan storage:link"
retry_command 3 5 "docker-compose -f docker-compose.production.yml exec -T app php artisan config:cache"
retry_command 3 5 "docker-compose -f docker-compose.production.yml exec -T app php artisan route:cache"
retry_command 3 5 "docker-compose -f docker-compose.production.yml exec -T app php artisan view:cache"

# Set permissions with retry
retry_command 3 5 "docker-compose -f docker-compose.production.yml exec -T app chown -R www-data:www-data /app/storage /app/bootstrap/cache"

# Create admin user with retry
print_status "Creating admin user..."
retry_command 2 5 'docker-compose -f docker-compose.production.yml exec -T app php artisan tinker --execute="
if (!\App\Models\User::where(\"email\", \"team@astrokabinet.id\")->exists()) {
    \App\Models\User::create([
        \"name\" => \"Admin AstroKabinet\",
        \"email\" => \"team@astrokabinet.id\",
        \"password\" => bcrypt(\"Astrokabinet25!\"),
        \"email_verified_at\" => now(),
    ]);
    echo \"Admin user created successfully\";
} else {
    echo \"Admin user already exists\";
}
"'

# Test application
print_status "Testing application..."
sleep 5

if curl -f -s https://astrokabinet.id > /dev/null; then
    print_status "✅ CI/CD Deployment successful!"
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

print_status "CI/CD Deployment completed!"
echo ""
echo "Useful commands:"
echo "- View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "- Restart: docker-compose -f docker-compose.production.yml restart"
echo "- Stop: docker-compose -f docker-compose.production.yml down"
