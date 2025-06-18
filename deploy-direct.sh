#!/bin/bash

# Direct VPS Deployment Script for AstroKabinet
# Usage: ./deploy-direct.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="103.117.56.159"
VPS_USER="astro"
VPS_PATH="/var/www/astrokabinet.id"
BACKUP_PATH="/var/www/backups"
LOCAL_ARCHIVE="astrokabinet-deployment-$(date +%Y%m%d_%H%M%S).tar.gz"

echo -e "${BLUE}🚀 AstroKabinet Direct VPS Deployment${NC}"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Error: artisan file not found. Run this from Laravel project root.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment checks...${NC}"

# Check if production env file exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production file not found.${NC}"
    exit 1
fi

# Check if built assets exist
if [ ! -d "public/build" ]; then
    echo -e "${YELLOW}⚠️ Built assets not found. Building now...${NC}"
    npm run build
fi

echo -e "${YELLOW}📦 Creating deployment package...${NC}"

# Create deployment archive with proper exclusions
tar --exclude='.git' \
    --exclude='.github' \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='.env.example' \
    --exclude='storage/logs/*' \
    --exclude='storage/framework/cache/*' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    --exclude='storage/app/public/*' \
    --exclude='bootstrap/cache/*' \
    --exclude='tests' \
    --exclude='*.log' \
    --exclude='.phpunit.result.cache' \
    --exclude='deploy*.sh' \
    --exclude='test-deployment.sh' \
    --exclude='README.md' \
    --exclude='*.tar.gz' \
    -czf "$LOCAL_ARCHIVE" .

echo -e "${GREEN}✅ Archive created: $LOCAL_ARCHIVE${NC}"

# Get archive size
ARCHIVE_SIZE=$(du -sh "$LOCAL_ARCHIVE" | cut -f1)
echo -e "${BLUE}📊 Archive size: $ARCHIVE_SIZE${NC}"

echo -e "${YELLOW}📤 Uploading to VPS...${NC}"

# Upload archive to VPS
scp -o StrictHostKeyChecking=no "$LOCAL_ARCHIVE" "$VPS_USER@$VPS_HOST:/tmp/"

echo -e "${YELLOW}🚀 Deploying on VPS...${NC}"

# Execute deployment commands on VPS
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" << EOF
set -e

echo "🔧 Starting deployment on VPS..."

# Create backup directory
sudo mkdir -p $BACKUP_PATH

# Create backup of current deployment
if [ -d "$VPS_PATH" ]; then
    echo "📦 Creating backup..."
    BACKUP_NAME="backup_\$(date +%Y%m%d_%H%M%S).tar.gz"
    sudo tar -czf $BACKUP_PATH/\$BACKUP_NAME -C $VPS_PATH . 2>/dev/null || true
    echo "✅ Backup created: $BACKUP_PATH/\$BACKUP_NAME"
fi

# Create deployment directory
sudo mkdir -p $VPS_PATH

# Extract new deployment
echo "📂 Extracting deployment..."
cd $VPS_PATH
sudo tar -xzf /tmp/$LOCAL_ARCHIVE
sudo rm /tmp/$LOCAL_ARCHIVE

# Set up environment
echo "⚙️ Setting up environment..."
if [ -f .env.production ]; then
    sudo cp .env.production .env
    echo "✅ Production environment configured"
else
    echo "⚠️ Warning: .env.production not found"
fi

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p storage/logs
sudo mkdir -p storage/framework/cache
sudo mkdir -p storage/framework/sessions
sudo mkdir -p storage/framework/views
sudo mkdir -p storage/app/public
sudo mkdir -p bootstrap/cache

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data $VPS_PATH
sudo chmod -R 755 $VPS_PATH
sudo chmod -R 775 $VPS_PATH/storage
sudo chmod -R 775 $VPS_PATH/bootstrap/cache

# Install/update Composer dependencies
echo "📦 Installing Composer dependencies..."
sudo -u www-data composer install --no-dev --optimize-autoloader --no-interaction

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

# Seed admin user (if needed)
echo "👤 Ensuring admin user exists..."
sudo -u www-data php artisan db:seed --class=AdminUserSeeder --force 2>/dev/null || echo "Admin user may already exist"

# Clear all caches
echo "🧹 Clearing caches..."
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan route:clear
sudo -u www-data php artisan view:clear

# Optimize application
echo "⚡ Optimizing application..."
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache

# Restart services
echo "🔄 Restarting services..."
sudo systemctl reload nginx
sudo systemctl restart php8.3-fpm 2>/dev/null || sudo systemctl restart php8.2-fpm 2>/dev/null || echo "PHP-FPM restart completed"

echo "✅ Deployment completed successfully!"
EOF

# Clean up local archive
rm "$LOCAL_ARCHIVE"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Your application should now be live at: https://astrokabinet.id${NC}"

# Run health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
sleep 5

for i in {1..3}; do
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://astrokabinet.id 2>/dev/null || echo "000")
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed (HTTP $HTTP_STATUS)${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Attempt $i: HTTP $HTTP_STATUS, retrying in 5 seconds...${NC}"
        sleep 5
    fi
    
    if [ $i -eq 3 ]; then
        echo -e "${YELLOW}⚠️ Health check returned HTTP $HTTP_STATUS${NC}"
        echo -e "${YELLOW}This might be normal if services are still starting up.${NC}"
        echo -e "${BLUE}Please check manually: https://astrokabinet.id${NC}"
    fi
done

echo ""
echo -e "${GREEN}🚀 Deployment process completed!${NC}"
echo -e "${BLUE}📝 Next steps:${NC}"
echo "   1. Test the website functionality"
echo "   2. Check admin dashboard: https://astrokabinet.id/dashboard"
echo "   3. Verify image upload functionality"
echo "   4. Test product creation and management"
echo ""
echo -e "${YELLOW}📋 Admin credentials:${NC}"
echo "   Email: team@astrokabinet.id"
echo "   Password: Astrokabinet25!"
EOF
