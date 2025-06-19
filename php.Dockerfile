# Stage 1: PHP Base
FROM php:8.3-fpm-alpine AS base
WORKDIR /var/www

# Install system dependencies for PHP extensions
RUN apk add --no-cache \
    $PHPIZE_DEPS \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    linux-headers

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    zip \
    gd \
    mbstring \
    exif \
    pcntl \
    bcmath \
    sockets

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# ---

# Stage 2: Vendor Dependencies
FROM base AS vendor
WORKDIR /var/www
COPY composer.json composer.lock ./
# Note: Using --no-dev for production
RUN composer install --no-scripts --no-autoloader --no-dev
COPY . .
RUN composer dump-autoload --optimize

# --- STAGE REMOVED ---
# The 'frontend' build stage is no longer needed here.
# It's now handled by the GitHub Action.
# ---

# Stage 3: Final Production Image
FROM php:8.3-fpm-alpine AS production
WORKDIR /var/www

ARG PUID=1000
ARG PGID=1000

# Create a non-root user
RUN addgroup -g ${PGID} sail && \
    adduser -u ${PUID} -G sail -s /bin/sh -D sail

# Install production dependencies
RUN apk add --no-cache \
    libzip \
    libpng \
    libjpeg-turbo \
    freetype \
    oniguruma \
    libxml2 \
    supervisor

# Install PHP extensions from the base image
COPY --from=base /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
COPY --from=base /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/

# Copy application code from the 'vendor' stage
COPY --from=vendor /var/www/vendor ./vendor

# Copy the rest of the application code and PRE-BUILT assets.
# The 'public/build' directory is now part of the build context
# sent to the Docker daemon because our GitHub Action created it.
COPY --chown=sail:sail . .

# Set permissions
RUN chown -R sail:sail /var/www
USER sail

# Install Octane with RoadRunner
RUN composer require laravel/octane spiral/roadrunner-cli
RUN php artisan octane:install --server=roadrunner

# Expose port for Octane
EXPOSE 8000

# Run Octane
CMD ["php", "artisan", "octane:start", "--host=0.0.0.0", "--port=8000"]
