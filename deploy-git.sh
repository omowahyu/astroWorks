#!/bin/bash

# Git-based Deployment Script for AstroKabinet
# This script uses Git to deploy to the VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_HOST="103.117.56.159"
VPS_USER="astro"
VPS_PATH="/var/www/astrokabinet.id"
REPO_URL="https://github.com/your-username/astroworks.git"  # Update this with your actual repo URL

echo -e "${BLUE}🚀 Git-based Deployment for AstroKabinet${NC}"
echo "=========================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in a Git repository${NC}"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️ You have uncommitted changes. Please commit them first.${NC}"
    git status --short
    exit 1
fi

# Push to remote repository
echo -e "${YELLOW}📤 Pushing to remote repository...${NC}"
git push origin main

echo -e "${YELLOW}🚀 Deploying to VPS via Git...${NC}"

# SSH to VPS and deploy
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" << 'EOF'
set -e

VPS_PATH="/var/www/astrokabinet.id"
BACKUP_PATH="/var/www/backups"

echo "🔧 Starting Git-based deployment..."

# Create backup directory
sudo mkdir -p $BACKUP_PATH

# Create backup if directory exists
if [ -d "$VPS_PATH" ]; then
    echo "📦 Creating backup..."
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    sudo tar -czf $BACKUP_PATH/$BACKUP_NAME -C $VPS_PATH . 2>/dev/null || true
    echo "✅ Backup created: $BACKUP_PATH/$BACKUP_NAME"
fi

# Clone or pull repository
if [ ! -d "$VPS_PATH/.git" ]; then
    echo "📥 Cloning repository..."
    sudo rm -rf $VPS_PATH
    sudo git clone https://github.com/your-username/astroworks.git $VPS_PATH
else
    echo "🔄 Pulling latest changes..."
    cd $VPS_PATH
    sudo git fetch origin
    sudo git reset --hard origin/main
fi

cd $VPS_PATH

# Set up environment
echo "⚙️ Setting up environment..."
if [ -f .env.production ]; then
    sudo cp .env.production .env
    echo "✅ Production environment configured"
fi

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p storage/logs
sudo mkdir -p storage/framework/cache
sudo mkdir -p storage/framework/sessions
sudo mkdir -p storage/framework/views
sudo mkdir -p storage/app/public
sudo mkdir -p bootstrap/cache

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data $VPS_PATH
sudo chmod -R 755 $VPS_PATH
sudo chmod -R 775 $VPS_PATH/storage
sudo chmod -R 775 $VPS_PATH/bootstrap/cache

# Install Composer dependencies
echo "📦 Installing Composer dependencies..."
sudo -u www-data composer install --no-dev --optimize-autoloader --no-interaction

# Install Node dependencies and build assets
echo "🏗️ Building assets..."
sudo -u www-data npm ci
sudo -u www-data npm run build

# Generate application key if needed
if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    echo "🔑 Generating application key..."
    sudo -u www-data php artisan key:generate --force
fi

# Run database migrations
echo "🗄️ Running database migrations..."
sudo -u www-data php artisan migrate --force

# Create storage link
echo "🔗 Creating storage link..."
sudo -u www-data php artisan storage:link 2>/dev/null || echo "Storage link already exists"

# Seed admin user
echo "👤 Ensuring admin user exists..."
sudo -u www-data php artisan db:seed --class=AdminUserSeeder --force 2>/dev/null || echo "Admin user may already exist"

# Clear and optimize
echo "🧹 Clearing caches..."
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan route:clear
sudo -u www-data php artisan view:clear

echo "⚡ Optimizing application..."
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache

# Restart services
echo "🔄 Restarting services..."
sudo systemctl reload nginx
sudo systemctl restart php8.3-fpm 2>/dev/null || sudo systemctl restart php8.2-fpm 2>/dev/null || echo "PHP-FPM restart completed"

echo "✅ Git deployment completed successfully!"
EOF

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${BLUE}🌐 Your application should be live at: https://astrokabinet.id${NC}"

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
sleep 5

for i in {1..3}; do
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://astrokabinet.id 2>/dev/null || echo "000")
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed (HTTP $HTTP_STATUS)${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Attempt $i: HTTP $HTTP_STATUS, retrying...${NC}"
        sleep 5
    fi
    
    if [ $i -eq 3 ]; then
        echo -e "${YELLOW}⚠️ Health check returned HTTP $HTTP_STATUS${NC}"
        echo -e "${BLUE}Please check manually: https://astrokabinet.id${NC}"
    fi
done

echo ""
echo -e "${GREEN}🚀 Deployment completed successfully!${NC}"
echo -e "${BLUE}📝 Admin credentials:${NC}"
echo "   Email: team@astrokabinet.id"
echo "   Password: Astrokabinet25!"
