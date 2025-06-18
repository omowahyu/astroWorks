#!/bin/bash

# Server Setup Script for Astrokabinet
# Run this on the server: astro@103.117.56.159

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_header "Astrokabinet Server Setup"

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y nginx php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring \
    php8.2-curl php8.2-zip php8.2-gd php8.2-intl php8.2-bcmath \
    composer curl wget unzip git

# Install Node.js 22
print_status "Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/astrokabinet.id
sudo chown -R astro:www-data /var/www/astrokabinet.id
sudo chmod -R 755 /var/www/astrokabinet.id

# Configure PHP-FPM
print_status "Configuring PHP-FPM..."
sudo sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/' /etc/php/8.2/fpm/php.ini
sudo sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 100M/' /etc/php/8.2/fpm/php.ini
sudo sed -i 's/post_max_size = 8M/post_max_size = 100M/' /etc/php/8.2/fpm/php.ini
sudo sed -i 's/max_execution_time = 30/max_execution_time = 300/' /etc/php/8.2/fpm/php.ini
sudo sed -i 's/memory_limit = 128M/memory_limit = 512M/' /etc/php/8.2/fpm/php.ini

# Configure Nginx
print_status "Configuring Nginx..."

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Create Nginx configuration for astrokabinet.id
sudo tee /etc/nginx/sites-available/astrokabinet.id > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name astrokabinet.id www.astrokabinet.id;

    root /var/www/astrokabinet.id/public;
    index index.php index.html index.htm;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Handle Laravel routes
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Handle PHP files
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        
        # Increase timeouts for large requests
        fastcgi_read_timeout 300;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Deny access to sensitive files
    location ~ /(?:\.env|\.git|\.gitignore|\.gitattributes|composer\.json|composer\.lock|package\.json|package-lock\.json|webpack\.mix\.js|artisan) {
        deny all;
    }

    # Handle static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Handle uploads directory
    location /uploads/ {
        expires 1M;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    # Increase client max body size for file uploads
    client_max_body_size 100M;

    # Logging
    access_log /var/log/nginx/astrokabinet.id.access.log;
    error_log /var/log/nginx/astrokabinet.id.error.log;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/astrokabinet.id /etc/nginx/sites-enabled/

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Start and enable services
print_status "Starting and enabling services..."
sudo systemctl enable nginx
sudo systemctl enable php8.2-fpm
sudo systemctl start nginx
sudo systemctl start php8.2-fpm

# Create a simple info page for testing
print_status "Creating test page..."
sudo mkdir -p /var/www/astrokabinet.id/public
sudo tee /var/www/astrokabinet.id/public/info.php > /dev/null << 'EOF'
<?php
echo "<h1>Astrokabinet Server Info</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Server Time: " . date('Y-m-d H:i:s') . "</p>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
phpinfo();
?>
EOF

sudo chown -R www-data:www-data /var/www/astrokabinet.id
sudo chmod -R 755 /var/www/astrokabinet.id

print_header "Setup Complete!"
print_status "✅ Nginx installed and configured"
print_status "✅ PHP 8.2-FPM installed and configured"
print_status "✅ Node.js 22 installed"
print_status "✅ Composer installed"
print_status "✅ Application directory created: /var/www/astrokabinet.id"
print_status "✅ Firewall configured"

echo ""
print_warning "Next steps:"
echo "1. Test the server: http://astrokabinet.id/info.php"
echo "2. Deploy your Laravel application"
echo "3. Configure SSL certificates for HTTPS"
echo "4. Set up your .env file with database credentials"

echo ""
print_status "Server is ready for deployment! 🚀"
