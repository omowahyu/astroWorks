#!/bin/bash

# AstroKabinet Deployment Script
# This script sets up the complete production environment

set -e

echo "🚀 Starting AstroKabinet deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="astrokabinet.id"
APP_DIR="/var/www/astrokabinet.id"
NGINX_CONF="/etc/nginx/sites-available/astrokabinet.id"
PHP_CONF="/etc/php/8.2/fpm/pool.d/astrokabinet.conf"

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y nginx php8.2-fpm php8.2-mysql php8.2-xml php8.2-gd php8.2-curl php8.2-mbstring php8.2-zip php8.2-bcmath php8.2-intl php8.2-redis mysql-client redis-server certbot python3-certbot-nginx git curl unzip

# Install Composer
print_status "Installing Composer..."
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
fi

# Install Node.js and npm
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# Setup Nginx configuration
print_status "Setting up Nginx configuration..."
sudo cp deployment/nginx/astrokabinet.id.conf $NGINX_CONF
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Setup PHP-FPM configuration
print_status "Setting up PHP-FPM configuration..."
sudo cp deployment/php/astrokabinet.conf $PHP_CONF

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Restart services
print_status "Restarting services..."
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
sudo systemctl enable nginx
sudo systemctl enable php8.2-fpm

# Setup SSL with Let's Encrypt
print_status "Setting up SSL certificate..."
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_warning "SSL certificate not found. Please run the following command manually:"
    echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    echo "Then restart nginx: sudo systemctl restart nginx"
fi

# Setup MySQL database
print_status "Setting up MySQL database..."
mysql -u astro -p'QjytaT#YL6' -e "CREATE DATABASE IF NOT EXISTS astroworks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Setup application permissions
print_status "Setting up application permissions..."
if [ -d "$APP_DIR" ]; then
    sudo chown -R $USER:www-data $APP_DIR
    sudo find $APP_DIR -type f -exec chmod 644 {} \;
    sudo find $APP_DIR -type d -exec chmod 755 {} \;
    sudo chmod -R 775 $APP_DIR/storage $APP_DIR/bootstrap/cache
fi

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/astrokabinet > /dev/null <<EOF
/var/log/nginx/astrokabinet.id.*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \`cat /var/run/nginx.pid\`
        fi
    endscript
}

$APP_DIR/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF

print_status "✅ Deployment setup completed!"
print_warning "Next steps:"
echo "1. Push your code to the main branch to trigger GitHub Actions deployment"
echo "2. Setup SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "3. Configure GitHub secrets for CI/CD"
echo "4. Test the application at https://$DOMAIN"
