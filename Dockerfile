# Stage 1: Build the application
FROM php:8.3-fpm as builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql exif pcntl

# Install Composer directly
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install dependencies and build assets
RUN composer install --no-dev --optimize-autoloader
RUN npm install

# Create a minimal .env file for build process
RUN echo "APP_NAME=AstroWorks" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_KEY=base64:$(openssl rand -base64 32)" >> .env && \
    echo "APP_DEBUG=false" >> .env && \
    echo "APP_URL=https://astrokabinet.id" >> .env && \
    echo "VITE_APP_NAME=AstroWorks" >> .env

# Generate application key and run build
RUN php artisan key:generate --force
RUN npm run build

# Stage 2: Create the final distroless image
FROM gcr.io/distroless/cc-debian12

WORKDIR /var/www/html

# Copy the built application from the builder stage
COPY --from=builder /var/www/html .

# Copy the Octane server binary
COPY --from=builder /var/www/html/vendor/bin/roadrunner-worker /usr/local/bin/roadrunner-worker

# Expose port for Octane
EXPOSE 8000

# Set the entrypoint to start Octane
CMD ["/usr/local/bin/roadrunner-worker", "serve", "--host=0.0.0.0", "--port=8000"]
