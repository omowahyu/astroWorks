FROM nginx:1.25-alpine

# Set working directory sesuai root web
WORKDIR /var/www/public

# Install dan buat self-signed certificate untuk testing, lalu hapus openssl
RUN apk add --no-cache openssl && \
    mkdir -p /etc/ssl/certs /etc/ssl/private && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=AstroKabinet/OU=IT/CN=astrokabinet.id" && \
    apk del openssl

# Hapus konfigurasi default nginx
RUN rm /etc/nginx/conf.d/default.conf

# Salin konfigurasi custom
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
