# Docker Deployment Guide

This guide covers how to set up and deploy AstroKabinet using Docker for both local development and production environments.

## Prerequisites

### For Local Development
- Docker Desktop (macOS/Windows) or Docker Engine (Linux)
- Git
- Terminal/Command Line access

### For Production Deployment
- Linux server with Docker and Docker Compose
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)
- GitHub account (for CI/CD)

## Local Development Setup

### 1. Install Docker

**macOS (using Homebrew):**
```bash
brew install --cask docker
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

**Windows:**
Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

### 2. Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd astrokabinet

# Make scripts executable
chmod +x docker-setup.sh docker-run.sh

# Run the setup script
./docker-setup.sh

# Start the application
./docker-run.sh
```

### 3. Manual Setup

If you prefer manual setup:

```bash
# Create environment file
cp .env.example .env

# Create necessary directories
mkdir -p storage/app/public storage/framework/{cache,sessions,views} storage/logs bootstrap/cache public/storage/images

# Build the Docker image
docker build -t astrokabinet:latest .

# Start services
docker-compose up -d

# Wait for database to be ready
docker-compose exec app php artisan migrate
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan storage:link
```

### 4. Development Commands

```bash
# View logs
docker-compose logs -f

# Access application shell
docker-compose exec app bash

# Run Artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan make:controller ExampleController

# Run tests
docker-compose exec app php artisan test

# Access database
docker-compose exec postgres psql -U astroworks -d astroworks

# Stop services
docker-compose down

# Rebuild and restart
docker-compose down
docker build -t astrokabinet:latest .
docker-compose up -d
```

### 5. Development with Hot Reloading

For frontend development with hot reloading:

```bash
# Start with Vite dev server
docker-compose --profile dev up -d

# Or run Vite separately
npm run dev
```

## Production Deployment

### 1. Server Setup

Prepare your production server:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Application Deployment

```bash
# Clone repository
git clone <your-repo-url> /var/www/astrokabinet
cd /var/www/astrokabinet

# Copy production environment
cp .env.production .env

# Edit environment variables
nano .env
# Update: APP_KEY, DB_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD, APP_URL, etc.

# Generate application key
docker run --rm -v $(pwd):/app -w /app dunglas/frankenphp:php8.3 php artisan key:generate --show
# Copy the generated key to .env file

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Run initial setup
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force
docker-compose -f docker-compose.prod.yml exec app php artisan storage:link
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec app php artisan view:cache
```

### 3. GitHub Actions CI/CD Setup

1. **Repository Secrets** (Settings → Secrets and variables → Actions):
   ```
   HOST: your-server-ip
   USERNAME: your-server-username
   SSH_PRIVATE_KEY: your-ssh-private-key
   ```

2. **Repository Variables**:
   ```
   APP_URL: https://yourdomain.com
   DEPLOY_PATH: /var/www/astrokabinet
   ```

3. **Enable GitHub Container Registry**:
   - Go to Settings → Actions → General
   - Enable "Read and write permissions" for GITHUB_TOKEN

### 4. SSL Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (add to crontab)
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 5. Nginx Configuration (Optional)

Create `/etc/nginx/sites-available/astrokabinet`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check resource usage
docker stats
```

### Backup

```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U astroworks astroworks > backup_$(date +%Y%m%d_%H%M%S).sql

# Application files backup
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz storage public/storage
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Clear caches
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec app php artisan view:cache
```

## Troubleshooting

### Common Issues

1. **Permission Issues**:
   ```bash
   docker-compose exec app chown -R www-data:www-data /app/storage /app/bootstrap/cache
   docker-compose exec app chmod -R 775 /app/storage /app/bootstrap/cache
   ```

2. **Database Connection Issues**:
   ```bash
   # Check if database is running
   docker-compose exec postgres pg_isready -U astroworks
   
   # Check database logs
   docker-compose logs postgres
   ```

3. **Build Issues**:
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t astrokabinet:latest .
   ```

4. **Storage Issues**:
   ```bash
   # Recreate storage link
   docker-compose exec app php artisan storage:link
   
   # Check storage permissions
   docker-compose exec app ls -la storage/
   ```

### Performance Optimization

1. **Enable OPcache** (already configured in production)
2. **Use Redis for caching**:
   ```bash
   docker-compose -f docker-compose.prod.yml --profile redis up -d
   ```
3. **Optimize images**:
   ```bash
   # Use multi-stage builds
   # Minimize layers
   # Use .dockerignore
   ```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Passwords**: Use strong, unique passwords
3. **SSL/TLS**: Always use HTTPS in production
4. **Firewall**: Configure proper firewall rules
5. **Updates**: Keep Docker and base images updated
6. **Secrets**: Use Docker secrets for sensitive data

## Support

For issues and questions:
1. Check the logs: `docker-compose logs`
2. Review this documentation
3. Check GitHub Issues
4. Contact the development team