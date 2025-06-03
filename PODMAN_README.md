# AstroWorks - Podman PostgreSQL & FrankenPHP Setup

Panduan lengkap untuk menjalankan aplikasi Laravel AstroWorks menggunakan Podman pod dengan PostgreSQL dan FrankenPHP.

## Persyaratan Sistem

- **Podman** 4.0+ terpasang
- **Make** (opsional, untuk kemudahan pengelolaan)
- **Git** untuk kloning repositori
- **Sistem operasi**: Linux (Ubuntu/Fedora/CentOS/RHEL)

### Instalasi Podman

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install podman
```

#### Fedora:
```bash
sudo dnf install podman
```

#### CentOS/RHEL:
```bash
sudo yum install podman
```

## Struktur Proyek

```
astroworks/
├── Dockerfile              # Image FrankenPHP dengan Laravel
├── Caddyfile              # Konfigurasi FrankenPHP/Caddy
├── docker-compose.yml     # Alternatif Docker Compose
├── podman-setup.sh        # Script setup Podman pod
├── astroworks.service     # Systemd service file
├── Makefile              # Command shortcuts
├── PODMAN_README.md      # Dokumentasi ini
└── .env.example          # Environment variables template
```

## Quick Start

### 1. Setup Awal

```bash
# Clone repositori (jika belum)
git clone <repository-url> astroworks
cd astroworks

# Copy environment file
cp .env.example .env

# Berikan permission pada script setup
chmod +x podman-setup.sh
```

### 2. Menjalankan dengan Script

```bash
# Setup lengkap (pertama kali)
./podman-setup.sh

# Atau menggunakan Make
make setup
```

### 3. Verifikasi

```bash
# Cek status
make status

# Cek health
make health

# Akses aplikasi
curl http://localhost:8000
```

## Penggunaan Makefile

Makefile menyediakan shortcut untuk operasi umum:

### Operasi Dasar
```bash
make help         # Tampilkan bantuan
make setup        # Setup pod lengkap
make start        # Start pod
make stop         # Stop pod
make restart      # Restart pod
make status       # Lihat status
make clean        # Bersihkan semua resource
```

### Database Operations
```bash
make migrate      # Jalankan migrasi
make seed         # Jalankan seeder
make fresh        # Fresh migration + seed
make db-shell     # Buka PostgreSQL shell
make backup       # Backup database
```

### Development
```bash
make shell        # Buka shell di container app
make logs         # Lihat logs (tambahkan CONTAINER=nama)
make test         # Jalankan tests
```

### Laravel Artisan
```bash
make artisan CMD="route:list"
make artisan CMD="make:controller UserController"
make artisan CMD="queue:work"
```

### Composer & NPM
```bash
make composer CMD="install"
make composer CMD="require laravel/sanctum"
make npm CMD="run build"
make npm CMD="install"
```

## Manual Pod Management

### Membuat Pod

```bash
# Buat network
podman network create astroworks-network

# Buat pod dengan port mapping
podman pod create \
  --name astroworks-pod \
  --network astroworks-network \
  --publish 8000:8000 \
  --publish 5432:5432
```

### PostgreSQL Container

```bash
podman run -d \
  --name astroworks-postgres \
  --pod astroworks-pod \
  -e POSTGRES_DB=astroworks \
  -e POSTGRES_USER=astroworks \
  -e POSTGRES_PASSWORD=astroworks123 \
  -v astroworks_postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

### Application Container

```bash
# Build image terlebih dahulu
podman build -t astroworks-app:latest .

# Jalankan container
podman run -d \
  --name astroworks-app \
  --pod astroworks-pod \
  -e DB_CONNECTION=pgsql \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_DATABASE=astroworks \
  -e DB_USERNAME=astroworks \
  -e DB_PASSWORD=astroworks123 \
  -v $(pwd)/storage:/app/storage:Z \
  -v $(pwd)/bootstrap/cache:/app/bootstrap/cache:Z \
  astroworks-app:latest
```

## Konfigurasi Environment

File `.env` utama yang perlu dikonfigurasi:

```env
APP_NAME=AstroWorks
APP_ENV=local
APP_URL=http://localhost:8000

# Database PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=astroworks
DB_USERNAME=astroworks
DB_PASSWORD=astroworks123

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

## Systemd Service

Untuk menjalankan sebagai service sistem:

### Instalasi Service

```bash
# Install service
make install-service

# Start service
sudo systemctl start astroworks

# Enable auto-start
sudo systemctl enable astroworks

# Check status
sudo systemctl status astroworks
```

### Mengelola Service

```bash
# Start
sudo systemctl start astroworks

# Stop
sudo systemctl stop astroworks

# Restart
sudo systemctl restart astroworks

# Logs
sudo journalctl -u astroworks -f
```

## Troubleshooting

### Container Tidak Start

```bash
# Cek logs
make logs CONTAINER=astroworks-app
make logs CONTAINER=astroworks-postgres

# Cek pod status
podman pod ps

# Restart pod
make restart
```

### Database Connection Error

```bash
# Cek PostgreSQL status
podman exec astroworks-postgres pg_isready -U astroworks

# Test connection
podman exec astroworks-app php artisan tinker
# Di tinker: DB::connection()->getPdo()
```

### Permission Issues

```bash
# Fix storage permissions
sudo chown -R $USER:$USER storage bootstrap/cache
chmod -R 755 storage bootstrap/cache

# SELinux context (jika diperlukan)
sudo setsebool -P container_manage_cgroup on
```

### Port Conflicts

```bash
# Cek port yang digunakan
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :5432

# Ubah port di script atau docker-compose
# Edit PORT mapping di podman-setup.sh
```

## Performance Tuning

### PostgreSQL Tuning

Buat file `postgresql.conf` custom:

```bash
# Dalam container PostgreSQL
podman exec -it astroworks-postgres psql -U astroworks -c "
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
"
```

### FrankenPHP Tuning

Edit `Caddyfile` untuk optimasi:

```caddyfile
{
    frankenphp {
        worker ./public/index.php 4
        max_requests_per_worker 1000
    }
}
```

## Monitoring

### Health Check

```bash
# Application health
curl -f http://localhost:8000/health || echo "App down"

# Database health
podman exec astroworks-postgres pg_isready -U astroworks

# Comprehensive health check
make health
```

### Logs Monitoring

```bash
# Real-time logs
make logs CONTAINER=astroworks-app

# All pod logs
podman pod logs -f astroworks-pod

# System service logs
sudo journalctl -u astroworks -f
```

## Backup & Restore

### Database Backup

```bash
# Manual backup
make backup

# Scheduled backup (crontab)
0 2 * * * cd /path/to/astroworks && make backup
```

### Volume Backup

```bash
# Backup PostgreSQL data volume
podman run --rm \
  -v astroworks_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-data-backup.tar.gz -C /data .
```

### Restore

```bash
# Restore database
podman exec -i astroworks-postgres psql -U astroworks astroworks < backup.sql

# Restore volume
podman run --rm \
  -v astroworks_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-data-backup.tar.gz -C /data
```

## Production Deployment

### Security Hardening

1. **Environment Variables**: Gunakan secrets management
2. **Firewall**: Tutup port yang tidak diperlukan
3. **SSL/TLS**: Setup reverse proxy dengan SSL
4. **User Permissions**: Jalankan dengan non-root user

### Scaling

```bash
# Multiple app instances
podman run -d --name astroworks-app-2 --pod astroworks-pod astroworks-app:latest
podman run -d --name astroworks-app-3 --pod astroworks-pod astroworks-app:latest

# Load balancer (nginx/caddy)
# Setup di depan multiple instances
```

## URLs & Endpoints

- **Aplikasi**: http://localhost:8000
- **Database**: localhost:5432
- **Health Check**: http://localhost:8000/health (jika tersedia)

## Dukungan & Kontribusi

Untuk masalah atau kontribusi:

1. Buat issue di repository
2. Fork dan buat pull request
3. Ikuti coding standards yang ada

## Lisensi

Proyek ini menggunakan lisensi yang sama dengan Laravel framework.

Sekarang Anda sudah memiliki konfigurasi lengkap untuk menjalankan aplikasi Laravel AstroWorks dengan PostgreSQL dan FrankenPHP dalam Podman pod! 

**Langkah selanjutnya:**

1. **Setup awal**: `make setup`
2. **Verifikasi**: `make status && make health`
3. **Akses aplikasi**: http://localhost:8000
4. **Database**: localhost:5432

Gunakan `make help` untuk melihat semua command yang tersedia.