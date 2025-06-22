# 🚀 Deployment Guide untuk astrokabinet.id

## 📋 Checklist Pre-Deployment

### 1. Environment Configuration
Ketika siap deploy ke production dengan domain `astrokabinet.id`, update file `.env`:

```bash
# Update these values in .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://astrokabinet.id

# Update CORS domains
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,astroworks.test,astrokabinet.id,www.astrokabinet.id
SESSION_DOMAIN=.astrokabinet.id
SESSION_SECURE_COOKIE=true

# Update database credentials
DB_DATABASE=astrokabinet_production
DB_USERNAME=your_production_user
DB_PASSWORD=your_secure_password

# Update mail configuration
MAIL_FROM_ADDRESS="noreply@astrokabinet.id"
MAIL_FROM_NAME="AstroKabinet"
```

### 2. DNS Configuration
Setup DNS records untuk domain `astrokabinet.id`:

```
A     @                  -> Server IP
A     www                -> Server IP
A     admin              -> Server IP (optional subdomain)
A     dashboard          -> Server IP (optional subdomain)
CNAME www.astrokabinet.id -> astrokabinet.id
```

### 3. SSL Certificate
- Install SSL certificate untuk `astrokabinet.id` dan `www.astrokabinet.id`
- Pastikan HTTPS redirect aktif
- Update Nginx/Apache configuration

### 4. Server Configuration

#### Nginx Configuration Example:
```nginx
server {
    listen 80;
    server_name astrokabinet.id www.astrokabinet.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name astrokabinet.id www.astrokabinet.id;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/astrokabinet/public;
    index index.php;
    
    # CORS Headers
    add_header 'Access-Control-Allow-Origin' 'https://astrokabinet.id' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With,X-CSRF-TOKEN,X-Inertia,X-Inertia-Version' always;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 5. Build & Deploy Commands

```bash
# 1. Install dependencies
composer install --optimize-autoloader --no-dev
npm install

# 2. Build assets for production
npm run build

# 3. Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Run migrations
php artisan migrate --force

# 5. Set permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## 🔧 CORS Configuration Status

### Current (Development):
- ✅ `http://localhost:8000`
- ✅ `https://localhost:8000` 
- ✅ `http://astroworks.test`
- ✅ `https://astroworks.test`

### Ready for Production:
- 🔄 `https://astrokabinet.id` (akan aktif ketika APP_ENV=production)
- 🔄 `https://www.astrokabinet.id` (akan aktif ketika APP_ENV=production)
- 🔄 `https://admin.astrokabinet.id` (akan aktif ketika APP_ENV=production)
- 🔄 `https://dashboard.astrokabinet.id` (akan aktif ketika APP_ENV=production)

## 📝 Notes

1. **CORS Configuration**: Sudah siap untuk production, akan otomatis aktif ketika `APP_ENV=production`
2. **Payment Settings**: Dapat dikelola via admin panel di `/dashboard/payment`
3. **Database**: Pastikan backup database sebelum migration production
4. **Assets**: Vite build akan mengoptimalkan assets untuk production
5. **Cache**: Redis direkomendasikan untuk production cache

## 🚨 Security Checklist

- [ ] Update semua password default
- [ ] Enable HTTPS redirect
- [ ] Set `APP_DEBUG=false`
- [ ] Configure firewall rules
- [ ] Setup backup system
- [ ] Enable rate limiting
- [ ] Configure monitoring

## 📞 Support

Jika ada masalah saat deployment, cek:
1. Laravel logs: `storage/logs/laravel.log`
2. Nginx/Apache error logs
3. PHP-FPM logs
4. Browser console untuk CORS errors
