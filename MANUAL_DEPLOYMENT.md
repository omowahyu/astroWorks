# Manual Deployment Guide for AstroKabinet

Since the automated scripts are having issues, here's a step-by-step manual deployment guide.

## Prerequisites
- SSH access to VPS (103.117.56.159)
- User: astro
- Target path: /var/www/astrokabinet.id

## Step 1: Prepare Local Files

1. **Clear caches and optimize locally:**
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
composer install --no-dev --optimize-autoloader
npm run build
```

2. **Create deployment archive manually:**
```bash
# Create a temporary directory
mkdir deployment-temp
```

3. **Copy files excluding unnecessary ones:**
```bash
# Copy all files except excluded ones
robocopy . deployment-temp /E /XD .git .github node_modules tests storage\logs storage\framework\cache storage\framework\sessions storage\framework\views bootstrap\cache /XF .env .env.local .env.example *.log .phpunit.result.cache deploy*.sh deploy*.ps1 *.tar.gz
```

4. **Create archive:**
```bash
cd deployment-temp
tar -czf ../astrokabinet-deployment.tar.gz .
cd ..
```

## Step 2: Upload to VPS

```bash
scp astrokabinet-deployment.tar.gz astro@103.117.56.159:/tmp/
```

## Step 3: Deploy on VPS

SSH into the VPS:
```bash
ssh astro@103.117.56.159
```

Then run these commands on the VPS:

### 3.1 Create Backup
```bash
# Create backup directory
sudo mkdir -p /var/www/backups

# Backup current deployment if exists
if [ -d "/var/www/astrokabinet.id" ]; then
    sudo tar -czf /var/www/backups/backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /var/www/astrokabinet.id .
    echo "Backup created"
fi
```

### 3.2 Extract New Deployment
```bash
# Create deployment directory
sudo mkdir -p /var/www/astrokabinet.id

# Extract files
cd /var/www/astrokabinet.id
sudo tar -xzf /tmp/astrokabinet-deployment.tar.gz
sudo rm /tmp/astrokabinet-deployment.tar.gz
```

### 3.3 Set Up Environment
```bash
# Copy production environment
sudo cp .env.production .env

# Create necessary directories
sudo mkdir -p storage/logs
sudo mkdir -p storage/framework/cache
sudo mkdir -p storage/framework/sessions
sudo mkdir -p storage/framework/views
sudo mkdir -p storage/app/public
sudo mkdir -p bootstrap/cache
```

### 3.4 Set Permissions
```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/astrokabinet.id

# Set permissions
sudo chmod -R 755 /var/www/astrokabinet.id
sudo chmod -R 775 /var/www/astrokabinet.id/storage
sudo chmod -R 775 /var/www/astrokabinet.id/bootstrap/cache
```

### 3.5 Install Dependencies and Configure
```bash
# Install Composer dependencies
sudo -u www-data composer install --no-dev --optimize-autoloader --no-interaction

# Generate application key if needed
sudo -u www-data php artisan key:generate --force

# Run migrations
sudo -u www-data php artisan migrate --force

# Create storage link
sudo -u www-data php artisan storage:link

# Seed admin user
sudo -u www-data php artisan db:seed --class=AdminUserSeeder --force
```

### 3.6 Optimize Application
```bash
# Clear caches
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan route:clear
sudo -u www-data php artisan view:clear

# Cache for production
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache
```

### 3.7 Restart Services
```bash
# Restart web services
sudo systemctl reload nginx
sudo systemctl restart php8.3-fpm
# If php8.3-fpm doesn't exist, try:
# sudo systemctl restart php8.2-fpm
```

## Step 4: Verify Deployment

1. **Check website:**
   - Visit: https://astrokabinet.id
   - Should show the homepage

2. **Check admin dashboard:**
   - Visit: https://astrokabinet.id/dashboard
   - Login with:
     - Email: team@astrokabinet.id
     - Password: Astrokabinet25!

3. **Test functionality:**
   - Create a product
   - Upload images (mobile and desktop)
   - Check product display on frontend

## Step 5: Cleanup

On your local machine:
```bash
# Remove temporary files
rm -rf deployment-temp
rm astrokabinet-deployment.tar.gz
```

## Troubleshooting

### If website shows 500 error:
```bash
# Check logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/www/astrokabinet.id/storage/logs/laravel.log
```

### If permissions are wrong:
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/astrokabinet.id
sudo chmod -R 755 /var/www/astrokabinet.id
sudo chmod -R 775 /var/www/astrokabinet.id/storage
sudo chmod -R 775 /var/www/astrokabinet.id/bootstrap/cache
```

### If database connection fails:
```bash
# Check .env file
sudo nano /var/www/astrokabinet.id/.env
# Verify database credentials match .env.production
```

### If images don't work:
```bash
# Recreate storage link
sudo -u www-data php artisan storage:link --force
```

## Rollback (if needed)

If something goes wrong:
```bash
# Find latest backup
ls -la /var/www/backups/

# Restore from backup
cd /var/www/astrokabinet.id
sudo tar -xzf /var/www/backups/backup_YYYYMMDD_HHMMSS.tar.gz

# Restart services
sudo systemctl reload nginx
sudo systemctl restart php8.3-fpm
```

## Success Indicators

✅ Website loads at https://astrokabinet.id
✅ Admin dashboard accessible at https://astrokabinet.id/dashboard
✅ Can login with admin credentials
✅ Can create products
✅ Can upload device-specific images
✅ Images display correctly on frontend
✅ No errors in logs
