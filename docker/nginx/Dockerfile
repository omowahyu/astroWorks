FROM nginx:1.25-alpine

WORKDIR /var/www

# Hapus konfigurasi default nginx
RUN rm /etc/nginx/conf.d/default.conf

# Salin konfigurasi custom kita
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
