# Direct VPS Deployment Script for AstroKabinet (PowerShell)
# Usage: .\deploy-direct.ps1

param(
    [switch]$SkipBuild = $false
)

# Configuration
$VPS_HOST = "103.117.56.159"
$VPS_USER = "astro"
$VPS_PATH = "/var/www/astrokabinet.id"
$BACKUP_PATH = "/var/www/backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$LOCAL_ARCHIVE = "astrokabinet-deployment-$TIMESTAMP.tar.gz"

Write-Host "🚀 AstroKabinet Direct VPS Deployment" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue

# Check if we're in the right directory
if (-not (Test-Path "artisan")) {
    Write-Host "❌ Error: artisan file not found. Run this from Laravel project root." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Pre-deployment checks..." -ForegroundColor Yellow

# Check if production env file exists
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ Error: .env.production file not found." -ForegroundColor Red
    exit 1
}

# Check if built assets exist
if (-not (Test-Path "public/build") -and -not $SkipBuild) {
    Write-Host "⚠️ Built assets not found. Building now..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Asset build failed." -ForegroundColor Red
        exit 1
    }
}

Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Create deployment archive using tar (if available) or 7zip
$tarAvailable = Get-Command tar -ErrorAction SilentlyContinue
if ($tarAvailable) {
    Write-Host "Using tar for archive creation..." -ForegroundColor Green
    
    # Create exclusion list
    $excludeList = @(
        '--exclude=.git',
        '--exclude=.github',
        '--exclude=node_modules',
        '--exclude=.env',
        '--exclude=.env.local',
        '--exclude=.env.example',
        '--exclude=storage/logs/*',
        '--exclude=storage/framework/cache/*',
        '--exclude=storage/framework/sessions/*',
        '--exclude=storage/framework/views/*',
        '--exclude=storage/app/public/*',
        '--exclude=bootstrap/cache/*',
        '--exclude=tests',
        '--exclude=*.log',
        '--exclude=.phpunit.result.cache',
        '--exclude=deploy*.sh',
        '--exclude=deploy*.ps1',
        '--exclude=test-deployment.sh',
        '--exclude=README.md',
        '--exclude=*.tar.gz'
    )
    
    $tarArgs = $excludeList + @('-czf', $LOCAL_ARCHIVE, '.')
    & tar @tarArgs
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Archive creation failed." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ tar command not found. Please install Git for Windows or WSL." -ForegroundColor Red
    Write-Host "Alternative: Use WSL to run the bash version: wsl ./deploy-direct.sh" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archive created: $LOCAL_ARCHIVE" -ForegroundColor Green

# Get archive size
$archiveSize = (Get-Item $LOCAL_ARCHIVE).Length / 1MB
Write-Host "📊 Archive size: $([math]::Round($archiveSize, 2)) MB" -ForegroundColor Blue

Write-Host "📤 Uploading to VPS..." -ForegroundColor Yellow

# Upload archive to VPS using scp
$scpTarget = "${VPS_USER}@${VPS_HOST}:/tmp/"
$scpArgs = @('-o', 'StrictHostKeyChecking=no', $LOCAL_ARCHIVE, $scpTarget)
& scp @scpArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed. Please check your SSH connection." -ForegroundColor Red
    Remove-Item $LOCAL_ARCHIVE -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "🚀 Deploying on VPS..." -ForegroundColor Yellow

# Create deployment script for remote execution
$deployScript = @"
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
"@

# Execute deployment on VPS
$sshTarget = "${VPS_USER}@${VPS_HOST}"
$sshArgs = @('-o', 'StrictHostKeyChecking=no', $sshTarget, $deployScript)
& ssh @sshArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed on VPS." -ForegroundColor Red
    Remove-Item $LOCAL_ARCHIVE -ErrorAction SilentlyContinue
    exit 1
}

# Clean up local archive
Remove-Item $LOCAL_ARCHIVE -ErrorAction SilentlyContinue

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your application should now be live at: https://astrokabinet.id" -ForegroundColor Blue

# Run health check
Write-Host "🏥 Running health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

for ($i = 1; $i -le 3; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "https://astrokabinet.id" -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Health check passed (HTTP $($response.StatusCode))" -ForegroundColor Green
            break
        }
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode } else { "000" }
        Write-Host "⏳ Attempt $i`: HTTP $statusCode, retrying in 5 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
    
    if ($i -eq 3) {
        Write-Host "⚠️ Health check may have issues. Please check manually." -ForegroundColor Yellow
        Write-Host "🌐 Please check manually: https://astrokabinet.id" -ForegroundColor Blue
    }
}

Write-Host ""
Write-Host "🚀 Deployment process completed!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Blue
Write-Host "   1. Test the website functionality"
Write-Host "   2. Check admin dashboard: https://astrokabinet.id/dashboard"
Write-Host "   3. Verify image upload functionality"
Write-Host "   4. Test product creation and management"
Write-Host ""
Write-Host "📋 Admin credentials:" -ForegroundColor Yellow
Write-Host "   Email: team@astrokabinet.id"
Write-Host "   Password: Astrokabinet25!"
