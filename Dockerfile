# ---- Stage 1: Build ----
# Gunakan image PHP 8.2 dengan FPM dan Node.js untuk build
FROM php:8.2-fpm as builder

# Install dependensi sistem yang dibutuhkan untuk ekstensi PHP dan Laravel
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    nodejs \
    npm \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Set working directory
WORKDIR /app

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Salin file dependensi dulu untuk caching
COPY database/ database/
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-plugins --no-scripts --prefer-dist

# Salin sisa source code aplikasi
COPY . .

# Buat file .env dari .env.example untuk build
RUN cp .env.example .env

# Generate application key
RUN php artisan key:generate
# Cache config dan routes untuk performa
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# Hapus file yang tidak perlu di produksi setelah build
RUN rm -f .env .env.example docker-compose.yml Dockerfile

# Build aset Inertia.js/Vue/React
RUN npm install
RUN npm run build

# Atur kepemilikan file
RUN chown -R www-data:www-data /app

# ---- Stage 2: Final Image ----
# Gunakan image PHP FPM yang lebih ramping
FROM php:8.2-fpm-alpine

# Set working directory
WORKDIR /app

# Salin user/group dari image sebelumnya
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Salin ekstensi PHP yang sudah ter-install
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/

# Salin vendor, aset, dan file aplikasi yang sudah di-build
COPY --from=builder /app/vendor/ /app/vendor/
COPY --from=builder /app/public/ /app/public/
COPY --from=builder /app/bootstrap/ /app/bootstrap/
COPY --from=builder /app/config/ /app/config/
COPY --from=builder /app/database/ /app/database/
COPY --from=builder /app/resources/ /app/resources/
COPY --from=builder /app/routes/ /app/routes/
COPY --from=builder /app/storage/ /app/storage/
COPY --from=builder /app/app/ /app/app/
COPY --from=builder /app/artisan /app/artisan

# Atur kepemilikan lagi di image final
RUN chown -R www-data:www-data /app

# Expose port untuk PHP-FPM
EXPOSE 9000

# Command default untuk menjalankan PHP-FPM
CMD ["php-fpm"]
