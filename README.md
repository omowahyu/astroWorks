# 🪑 AstroKabinet

**AstroKabinet** adalah platform e-commerce modern untuk furniture dan interior design yang dibangun dengan Laravel 12 dan React 19.

## 🚀 Quick Start

### Development
```bash
# Clone repository
git clone <repository-url>
cd astrokabinet

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run development server
composer run dev
```

### Production (Docker)
```bash
# Build and start containers
make setup
make start
```

## 🛠️ Tech Stack

- **Backend**: Laravel 12, PHP 8.2+, PostgreSQL 16
- **Frontend**: React 19, TypeScript, TailwindCSS 4
- **Build**: Vite 6, PNPM
- **Server**: FrankenPHP (Production)
- **Container**: Docker/Podman

## 📚 Documentation

Dokumentasi lengkap tersedia di direktori [`./docs/`](./docs/):

- **[Requirements](./docs/requirements.md)** - Spesifikasi lengkap project
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Panduan deployment production
- **[Implementation Summary](./docs/implementation-summary.md)** - Ringkasan implementasi
- **[Image System](./docs/image-compression-system.md)** - Sistem kompresi gambar
- **[Product Features](./docs/product-detail-implementation.md)** - Fitur produk
- **[Testing Results](./docs/TESTING-RESULTS.md)** - Hasil testing

## 🎯 Key Features

- ✅ **Product Management** - CRUD dengan image optimization
- ✅ **Multi-device Images** - Responsive image system
- ✅ **E-commerce Flow** - Cart → WhatsApp checkout
- ✅ **Admin Dashboard** - Content management interface
- ✅ **Performance Optimized** - Lazy loading, compression
- ✅ **SEO Ready** - Slug-based URLs, meta tags

## 🔧 Development Commands

```bash
# Development server with hot reload
composer run dev

# Run tests
composer run test
php artisan test

# Code quality
npm run lint
npm run format
./vendor/bin/pint

# Build for production
npm run build
```

## 📱 Browser Support

- Chrome 90+, Firefox 88+, Safari 14+
- Mobile: iOS 14+, Android 8+

## 📞 Support

Untuk pertanyaan teknis, lihat dokumentasi di `./docs/` atau hubungi tim development.

---

**Domain Production**: [astrokabinet.id](https://astrokabinet.id)
