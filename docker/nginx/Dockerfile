FROM nginx:1.25-alpine

WORKDIR /var/www

# Install OpenSSL untuk membuat self-signed certificate
RUN apk add --no-cache openssl

# Buat self-signed certificate untuk testing
RUN mkdir -p /etc/ssl/certs /etc/ssl/private && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=AstroKabinet/OU=IT/CN=astrokabinet.id"

# Hapus konfigurasi default nginx
RUN rm /etc/nginx/conf.d/default.conf

# Salin konfigurasi custom kita
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
