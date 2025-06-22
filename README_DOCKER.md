# 🐳 Docker Setup untuk AstroKabinet

Panduan cepat untuk menjalankan AstroKabinet menggunakan Docker.

## 🚀 Quick Start

### 1. Install Docker

**macOS:**
```bash
brew install --cask docker
```

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. Setup dan Jalankan

```bash
# Clone repository
git clone <repo-url>
cd astrokabinet

# Jalankan setup otomatis
./docker-setup.sh

# Atau jalankan aplikasi langsung
./docker-run.sh
```

### 3. Akses Aplikasi

- **Web App**: http://localhost:8000
- **Database**: localhost:5432
- **Vite Dev Server**: http://localhost:5173 (jika menggunakan profile dev)

## 📋 Commands Berguna

```bash
# Lihat status containers
docker-compose ps

# Lihat logs
docker-compose logs -f

# Akses shell aplikasi
docker-compose exec app bash

# Jalankan artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan make:controller ExampleController

# Jalankan tests
docker-compose exec app php artisan test

# Stop aplikasi
docker-compose down

# Restart aplikasi
docker-compose restart
```

## 🔧 Development Mode

```bash
# Dengan hot reloading untuk frontend
docker-compose --profile dev up -d

# Dengan Redis caching
docker-compose --profile cache up -d
```

## 🏭 Production Deployment

```bash
# Setup production
cp .env.production .env
# Edit .env dengan konfigurasi production

# Jalankan production stack
docker-compose -f docker-compose.prod.yml up -d

# Setup database
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force
```

## 🔍 Troubleshooting

### Docker tidak ditemukan
```bash
# Install Docker terlebih dahulu
brew install --cask docker  # macOS
# atau download dari docker.com
```

### Permission errors
```bash
docker-compose exec app chown -R www-data:www-data /app/storage /app/bootstrap/cache
docker-compose exec app chmod -R 775 /app/storage /app/bootstrap/cache
```

### Database connection issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U astroworks

# View database logs
docker-compose logs postgres
```

### Build issues
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t astrokabinet:latest .
```

## 📁 File Structure

```
├── Dockerfile                 # Main application image
├── docker-compose.yml         # Development environment
├── docker-compose.override.yml # Development overrides
├── docker-compose.prod.yml    # Production environment
├── docker-setup.sh            # Setup script
├── docker-run.sh              # Run script
├── .env.production            # Production environment template
└── .github/workflows/deploy.yml # CI/CD pipeline
```

## 🌐 GitHub Actions CI/CD

Workflow otomatis akan:
1. ✅ Menjalankan tests
2. 🏗️ Build Docker image
3. 📦 Push ke GitHub Container Registry
4. 🚀 Deploy ke production server

### Setup CI/CD:
1. Tambahkan secrets di GitHub:
   - `HOST`: IP server production
   - `USERNAME`: Username server
   - `SSH_PRIVATE_KEY`: Private key SSH

2. Tambahkan variables:
   - `APP_URL`: URL aplikasi
   - `DEPLOY_PATH`: Path deployment di server

## 📚 Dokumentasi Lengkap

Lihat [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) untuk dokumentasi lengkap.

---

**Happy Coding! 🎉**