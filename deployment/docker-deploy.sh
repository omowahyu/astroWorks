#!/bin/bash

# AstroKabinet Docker Deployment Script
# Setup Docker daemonless untuk production

set -e

echo "🚀 Starting AstroKabinet Docker deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="astrokabinet.id"
APP_DIR="/var/www/astrokabinet.id"
USER="astro"

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

# Check if running as correct user
if [[ $USER != "astro" && $USER != "deployer" ]]; then
   print_warning "Running as user: $USER. Recommended to run as 'astro' or 'deployer'"
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    sudo apt-get update
    sudo apt-get install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update

    # Install Docker packages
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    print_warning "Please logout and login again to apply docker group changes"
fi

# Install Docker Compose (standalone)
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install other required packages
print_status "Installing additional packages..."
sudo apt install -y mysql-client redis-tools certbot git curl unzip

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Setup MySQL database
print_status "Setting up MySQL database..."
mysql -u astro -p'QjytaT#YL6' -e "CREATE DATABASE IF NOT EXISTS astroworks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || print_warning "Database might already exist"

# Setup SSL certificate
print_status "Setting up SSL certificate..."
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_warning "Setting up temporary nginx for SSL certificate..."
    
    # Install nginx temporarily for certbot
    sudo apt install -y nginx
    
    # Create temporary nginx config
    sudo tee /etc/nginx/sites-available/temp-$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/temp-$DOMAIN /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo systemctl restart nginx
    
    # Get SSL certificate
    sudo certbot certonly --webroot -w /var/www/html -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Stop nginx (Docker will handle it)
    sudo systemctl stop nginx
    sudo systemctl disable nginx
fi

print_status "✅ Docker setup completed!"
print_status "Next steps to deploy your application:"
echo ""
echo "1. Copy your application code to: $APP_DIR"
echo "2. Navigate to application directory: cd $APP_DIR"
echo "3. Build and start containers: docker-compose -f docker-compose.production.yml up -d --build"
echo "4. Run Laravel setup commands:"
echo "   docker-compose -f docker-compose.production.yml exec app php artisan key:generate"
echo "   docker-compose -f docker-compose.production.yml exec app php artisan migrate --force"
echo "   docker-compose -f docker-compose.production.yml exec app php artisan storage:link"
echo "   docker-compose -f docker-compose.production.yml exec app php artisan config:cache"
echo "   docker-compose -f docker-compose.production.yml exec app php artisan route:cache"
echo "   docker-compose -f docker-compose.production.yml exec app php artisan view:cache"
echo ""
echo "5. Test the application at https://$DOMAIN"
echo ""
print_warning "Make sure to logout and login again if Docker was just installed!"
