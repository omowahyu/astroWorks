# Use a distroless image for a smaller and more secure footprint
FROM gcr.io/distroless/nginx:latest

# Copy your custom nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy static assets
COPY --from=php:8.3-fpm-alpine /var/www/public /var/www/public
