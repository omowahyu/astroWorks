#!/bin/bash

# Test Deployment Script
# This script tests the deployment process locally before pushing to CI/CD

set -e

echo "🧪 Testing deployment process..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Error: artisan file not found. Run this from Laravel project root.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Running pre-deployment checks...${NC}"

# Check PHP version
PHP_VERSION=$(php -r "echo PHP_VERSION;")
echo "PHP Version: $PHP_VERSION"

# Check if required extensions are installed
echo "Checking PHP extensions..."
php -m | grep -E "(curl|mbstring|pdo|zip)" || {
    echo -e "${RED}❌ Missing required PHP extensions${NC}"
    exit 1
}

# Check Node.js version
NODE_VERSION=$(node --version)
echo "Node.js Version: $NODE_VERSION"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
composer install --no-dev --optimize-autoloader --no-interaction
npm ci

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
php artisan test || {
    echo -e "${RED}❌ Tests failed. Fix tests before deployment.${NC}"
    exit 1
}

# Build assets
echo -e "${YELLOW}🏗️ Building assets...${NC}"
npm run build || {
    echo -e "${RED}❌ Asset build failed.${NC}"
    exit 1
}

# Test deployment package creation
echo -e "${YELLOW}📦 Testing deployment package creation...${NC}"
mkdir -p test-deployment
rsync -av --exclude-from=.deployignore . test-deployment/

# Check package size
PACKAGE_SIZE=$(du -sh test-deployment | cut -f1)
echo "Deployment package size: $PACKAGE_SIZE"

# Create test archive
cd test-deployment
tar -czf ../test-deployment.tar.gz .
cd ..

ARCHIVE_SIZE=$(du -sh test-deployment.tar.gz | cut -f1)
echo "Archive size: $ARCHIVE_SIZE"

# Cleanup
rm -rf test-deployment test-deployment.tar.gz

echo -e "${GREEN}✅ All pre-deployment checks passed!${NC}"
echo -e "${GREEN}🚀 Ready for deployment to production.${NC}"

echo ""
echo "To deploy:"
echo "1. Push to main branch for automatic deployment"
echo "2. Or manually trigger deployment in GitHub Actions"
echo ""
echo "To rollback if needed:"
echo "1. Go to GitHub Actions"
echo "2. Run 'Safe Deploy with Rollback' workflow"
echo "3. Set 'rollback' input to 'true'"
