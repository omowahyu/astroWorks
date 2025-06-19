# AstroKabinet Docker Deployment Guide

Panduan lengkap untuk deployment AstroKabinet menggunakan Docker di production server.

## Prerequisites

- VPS dengan Ubuntu 20.04+ 
- Domain astrokabinet.id sudah pointing ke server
- MySQL database sudah setup
- User `astro` atau `deployer` dengan sudo access

## Server Information

- **Server IP**: 103.117.56.159
- **Domain**: astrokabinet.id
- **Database**: astroworks
- **DB User**: astro
- **App Directory**: /var/www/astrokabinet.id

## Quick Deployment

### 1. Setup Docker Environment (First Time Only)

```bash
# Login ke server
ssh astro@103.117.56.159

# Clone repository
git clone <your-repo-url> /var/www/astrokabinet.id
cd /var/www/astrokabinet.id

# Setup Docker environment
chmod +x deployment/docker-deploy.sh
./deployment/docker-deploy.sh

# Logout dan login kembali untuk apply docker group
exit
ssh astro@103.117.56.159
```

### 2. Deploy Application

```bash
cd /var/www/astrokabinet.id

# Run complete deployment
chmod +x deploy-production.sh
./deploy-production.sh
```

## Manual Deployment Steps

### 1. Docker Setup

```bash
# Install Docker dan dependencies
./deployment/docker-deploy.sh
```

### 2. Application Deployment

```bash
# Backup existing deployment
./deployment/backup.sh

# Deploy application
./deployment/app-deploy.sh
```

## Docker Commands

### Container Management

```bash
# Start containers
docker-compose -f docker-compose.production.yml up -d

# Stop containers
docker-compose -f docker-compose.production.yml down

# Restart containers
docker-compose -f docker-compose.production.yml restart

# View container status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Laravel Commands

```bash
# Access container shell
docker-compose -f docker-compose.production.yml exec app bash

# Run artisan commands
docker-compose -f docker-compose.production.yml exec app php artisan migrate
docker-compose -f docker-compose.production.yml exec app php artisan cache:clear
docker-compose -f docker-compose.production.yml exec app php artisan config:cache
```

## Backup & Rollback

### Create Backup

```bash
./deployment/backup.sh
```

### Rollback Deployment

```bash
./deployment/rollback.sh
```

## Troubleshooting

### Container Issues

```bash
# Check container logs
docker-compose -f docker-compose.production.yml logs app
docker-compose -f docker-compose.production.yml logs nginx

# Restart specific service
docker-compose -f docker-compose.production.yml restart app
docker-compose -f docker-compose.production.yml restart nginx
```

### Database Connection Issues

```bash
# Test database connection from container
docker-compose -f docker-compose.production.yml exec app php artisan tinker
# In tinker: DB::connection()->getPdo();
```

### SSL Certificate Issues

```bash
# Renew SSL certificate
sudo certbot renew

# Test SSL
curl -I https://astrokabinet.id
```

### Permission Issues

```bash
# Fix storage permissions
docker-compose -f docker-compose.production.yml exec app chown -R www-data:www-data /app/storage /app/bootstrap/cache
```

## File Structure

```
/var/www/astrokabinet.id/
├── docker-compose.production.yml    # Production Docker Compose
├── Dockerfile                       # Application Docker image
├── .env.production                  # Production environment
├── deploy-production.sh             # Main deployment script
└── deployment/
    ├── docker-deploy.sh            # Docker setup script
    ├── app-deploy.sh               # Application deployment
    ├── backup.sh                   # Backup script
    ├── rollback.sh                 # Rollback script
    └── nginx/
        └── docker-nginx.conf       # Nginx config for Docker
```

## Environment Configuration

Key environment variables in `.env.production`:

```env
APP_URL=https://astrokabinet.id
DB_HOST=host.docker.internal
DB_DATABASE=astroworks
DB_USERNAME=astro
DB_PASSWORD=QjytaT#YL6
REDIS_HOST=host.docker.internal
```

## Security Notes

- SSL certificates managed by Let's Encrypt
- Nginx configured with security headers
- Database credentials secured
- Docker containers run as non-root user
- Regular backups automated

## Monitoring

### Health Checks

```bash
# Application health
curl -f https://astrokabinet.id

# Container health
docker-compose -f docker-compose.production.yml ps

# Database health
mysql -u astro -p'QjytaT#YL6' -e "SELECT 1"
```

### Log Locations

- Application logs: `docker-compose logs app`
- Nginx logs: `docker-compose logs nginx`
- System logs: `/var/log/syslog`

## Support

Untuk troubleshooting lebih lanjut:

1. Check container logs
2. Verify environment configuration
3. Test database connectivity
4. Check SSL certificate status
5. Review nginx configuration
