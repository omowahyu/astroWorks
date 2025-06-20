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
RUN composer dump-autoload --optimize

# ---

# Stage 3: Final Production Image - Image akhir yang ramping untuk produksi
FROM php:8.3-fpm-alpine AS production
WORKDIR /var/www

ARG PUID=1000
ARG PGID=1000

# Buat user non-root untuk keamanan
RUN addgroup -g ${PGID} sail && \
    adduser -u ${PUID} -G sail -s /bin/sh -D sail

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
COPY --chown=sail:sail . .

# Ganti user ke non-root
USER sail

# Expose port untuk Octane
EXPOSE 8000

# Perintah untuk menjalankan aplikasi Laravel dengan Octane
CMD ["php-fpm"]
