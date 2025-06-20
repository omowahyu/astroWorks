# Stage 1: PHP Base - Fondasi dengan PHP dan ekstensi yang dibutuhkan
FROM php:8.3-fpm-alpine AS base
WORKDIR /var/www

# Mencegah pesan interaktif dari apk
ENV DEBIAN_FRONTEND=noninteractive

# Install dependensi sistem yang dibutuhkan untuk ekstensi PHP
RUN apk add --no-cache \
    $PHPIZE_DEPS \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    linux-headers

# Install ekstensi PHP yang umum digunakan oleh Laravel
RUN docker-php-ext-install \
    pdo_mysql \
    zip \
    gd \
    mbstring \
    exif \
    pcntl \
    bcmath \
    sockets

# Install Composer secara global
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# ---

# Stage 2: Vendor Dependencies - Khusus untuk menginstall dependensi Composer
FROM base AS vendor
WORKDIR /var/www

# Manfaatkan cache Docker. Hanya jalankan 'composer install' jika composer.lock berubah
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Salin sisa aplikasi dan generate autoload
COPY . .

# Clear any cached service providers that might reference missing packages
RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php bootstrap/cache/routes-v7.php

# Remove Octane from composer.lock and regenerate dependencies
RUN composer remove laravel/octane --no-interaction --ignore-platform-reqs || true
RUN composer install --no-scripts --no-autoloader --no-dev --no-interaction --prefer-dist --optimize-autoloader
RUN composer dump-autoload --optimize

# ---

# Stage 3: Final Production Image - Image akhir yang ramping untuk produksi
FROM php:8.3-fpm-alpine AS production
WORKDIR /var/www

ARG PUID=1000
ARG PGID=1000

# Buat user non-root untuk keamanan (jika belum ada)
RUN if ! getent group www-data > /dev/null 2>&1; then \
        addgroup -g ${PGID} www-data; \
    fi && \
    if ! getent passwd www-data > /dev/null 2>&1; then \
        adduser -u ${PUID} -G www-data -s /bin/sh -D www-data; \
    fi

# Install hanya dependensi sistem yang dibutuhkan saat runtime
RUN apk add --no-cache \
    libzip \
    libpng \
    libjpeg-turbo \
    freetype \
    oniguruma \
    libxml2

# Salin ekstensi PHP yang sudah ter-compile dari tahap 'base'
COPY --from=base /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
COPY --from=base /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/

# Salin direktori vendor dari tahap 'vendor'
COPY --from=vendor /var/www/vendor ./vendor

# Salin sisa kode aplikasi dan aset yang sudah di-build
COPY --chown=www-data:www-data . .

# Set permissions untuk storage dan bootstrap/cache directories
RUN chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

# Ganti user ke non-root
USER www-data

# Expose port untuk PHP-FPM
EXPOSE 9000

# Perintah untuk menjalankan aplikasi Laravel dengan PHP-FPM
CMD ["php-fpm"]
