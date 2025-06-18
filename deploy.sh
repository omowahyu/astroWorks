#!/bin/bash

# Astrokabinet Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment process..."

# Configuration
REMOTE_HOST="103.117.56.159"
REMOTE_USER="astro"
REMOTE_PATH="/var/www/astrokabinet.id"
LOCAL_ARCHIVE="/tmp/astrokabinet-deployment.tar.gz"

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

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    print_error "artisan file not found. Please run this script from the Laravel project root."
    exit 1
fi

# Install dependencies and build assets
print_status "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction --no-progress --prefer-dist

print_status "Installing Node.js dependencies..."
npm ci

print_status "Building assets..."
npm run build

# Create deployment archive
print_status "Creating deployment archive..."
tar --exclude='.git' \
    --exclude='.github' \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='.env.example' \
    --exclude='README.md' \
    --exclude='tests' \
    --exclude='storage/logs/*' \
    --exclude='storage/framework/cache/*' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    --exclude='deploy.sh' \
    --exclude='deployment.tar.gz' \
    -czf "$LOCAL_ARCHIVE" .

print_status "Archive created: $LOCAL_ARCHIVE"

# Transfer to server
print_status "Transferring files to server..."
scp -o StrictHostKeyChecking=no "$LOCAL_ARCHIVE" "$REMOTE_USER@$REMOTE_HOST:/tmp/"

# Deploy on server
print_status "Deploying on server..."
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
set -e

# Create backup
if [ -d "/var/www/astrokabinet.id" ]; then
    sudo cp -r /var/www/astrokabinet.id /var/www/astrokabinet.id.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
fi

# Create directory
sudo mkdir -p /var/www/astrokabinet.id
sudo chown -R astro:www-data /var/www/astrokabinet.id

# Extract files
cd /var/www/astrokabinet.id
sudo tar -xzf /tmp/astrokabinet-deployment.tar.gz --strip-components=0
sudo rm /tmp/astrokabinet-deployment.tar.gz

# Create necessary directories
sudo mkdir -p storage/logs
sudo mkdir -p storage/framework/cache
sudo mkdir -p storage/framework/sessions
sudo mkdir -p storage/framework/views
sudo mkdir -p bootstrap/cache
sudo mkdir -p public/uploads

# Set permissions
sudo chown -R www-data:www-data /var/www/astrokabinet.id
sudo chmod -R 755 /var/www/astrokabinet.id
sudo chmod -R 775 /var/www/astrokabinet.id/storage
sudo chmod -R 775 /var/www/astrokabinet.id/bootstrap/cache

echo "✅ Files extracted and permissions set"
EOF

# Clean up local archive
rm "$LOCAL_ARCHIVE"

print_status "Deployment completed! 🎉"
print_warning "Don't forget to:"
print_warning "1. Create/update the .env file on the server"
print_warning "2. Run Laravel commands (migrate, cache, etc.)"
print_warning "3. Configure Nginx if not already done"

echo ""
echo "To complete the deployment, run these commands on the server:"
echo "ssh $REMOTE_USER@$REMOTE_HOST"
echo "cd $REMOTE_PATH"
echo "# Create .env file with your configuration"
echo "sudo -u www-data php artisan key:generate --force"
echo "sudo -u www-data php artisan migrate --force"
echo "sudo -u www-data php artisan config:cache"
echo "sudo -u www-data php artisan route:cache"
echo "sudo -u www-data php artisan view:cache"
echo "sudo -u www-data php artisan storage:link"
echo "sudo systemctl reload php8.2-fpm"
echo "sudo systemctl reload nginx"
