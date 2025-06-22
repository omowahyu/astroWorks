# 📋 Requirements Documentation - AstroKabinet

## 🎯 Project Overview

**AstroKabinet** adalah aplikasi web e-commerce untuk furniture dan interior design yang dibangun dengan teknologi modern. Aplikasi ini menyediakan platform untuk menampilkan produk furniture, mengelola katalog, dan memfasilitasi transaksi pembelian.

### 🏢 Business Domain
- **Industry**: Furniture & Interior Design
- **Target Market**: Rumah dan kantor
- **Business Model**: B2C E-commerce
- **Domain**: astrokabinet.id

## 🛠️ Technical Stack

### Backend Requirements
- **Framework**: Laravel 12.x
- **PHP Version**: ^8.2
- **Database**: PostgreSQL 16
- **Web Server**: FrankenPHP (Production) / Artisan Serve (Development)
- **Container**: Docker + Podman support

### Frontend Requirements
- **Framework**: React 19.x
- **Build Tool**: Vite 6.x
- **CSS Framework**: TailwindCSS 4.x
- **UI Components**: Radix UI, Headless UI
- **State Management**: Zustand
- **Package Manager**: PNPM 10.7.1+

### Development Tools
- **TypeScript**: 5.7.2+
- **Testing**: Pest (PHP), Jest/Vitest (JS)
- **Code Quality**: ESLint, Prettier, Laravel Pint
- **Version Control**: Git

## 🏗️ System Architecture

### Application Structure
```
├── Backend (Laravel)
│   ├── API Routes (/api/*)
│   ├── Web Routes (/)
│   ├── Authentication System
│   └── Admin Dashboard (/dashboard/*)
├── Frontend (React + Inertia.js)
│   ├── Public Pages
│   ├── Product Catalog
│   ├── Shopping Cart
│   └── Admin Interface
└── Database (PostgreSQL)
    ├── Products & Categories
    ├── Images & Media
    ├── Transactions
    └── User Management
```

### Key Integrations
- **Inertia.js**: Full-stack framework untuk SPA experience
- **Ziggy**: Laravel route generation untuk frontend
- **Intervention Image**: Image processing dan compression
- **FrankenPHP**: Modern PHP application server

## 📊 Database Schema

### Core Models & Relationships

#### Products System
```sql
products
├── id, name, description, slug
├── created_at, updated_at, deleted_at
└── Relationships:
    ├── categories (many-to-many)
    ├── images (one-to-many)
    ├── unitTypes (one-to-many)
    └── miscOptions (one-to-many)
```

#### Image Management
```sql
product_images
├── id, product_id, image_type, device_type
├── image_url, alt_text, sort_order
├── aspect_ratio, image_dimensions
├── image_variants (JSON), compression_level
└── Types: thumbnail, gallery, hero
└── Devices: mobile, desktop
```

#### Categories & Classification
```sql
categories
├── id, name, description, is_accessory
└── Pivot: category_product
```

#### Transaction System
```sql
transactions
├── id, customer_note, total_price
└── transaction_items
    ├── product_id, unit_type_id
    ├── misc_option_id, quantity, price
```

#### Configuration
```sql
videos (Featured content)
payment_settings (Payment configuration)
users (Authentication)
```

## 🎨 Frontend Features

### Public Interface
- **Homepage**: Featured video, product carousel by categories
- **Product Catalog**: Grid view dengan lazy loading
- **Product Detail**: Image gallery, specifications, purchase options
- **Shopping Cart**: Session-based cart management
- **Company Page**: Business information

### Admin Dashboard
- **Product Management**: CRUD operations
- **Image Upload**: Multi-device compression system
- **Category Management**: Product classification
- **Payment Settings**: WhatsApp & bank configuration
- **Analytics**: Image statistics dan usage

### UI/UX Features
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching
- **Image Optimization**: 4-level compression system
- **Lazy Loading**: Performance optimization
- **Touch Gestures**: Mobile-friendly interactions

## 🔧 Core Functionalities

### 1. Product Management
- **CRUD Operations**: Create, read, update, delete products
- **Slug-based URLs**: SEO-friendly product URLs
- **Category Assignment**: Multiple categories per product
- **Unit Types**: Different pricing options (per piece, per set, etc.)
- **Misc Options**: Additional product configurations

### 2. Image System
- **Multi-device Support**: Separate images for mobile/desktop
- **Image Types**: Thumbnail, gallery, hero images
- **Compression Levels**: Lossless, minimal, moderate, aggressive
- **Aspect Ratio Validation**: 4:5 (mobile), 16:9 (desktop)
- **Automatic Optimization**: WebP conversion, size optimization

### 3. E-commerce Features
- **Product Browsing**: Category-based navigation
- **Shopping Cart**: Session-based cart management
- **Purchase Flow**: Product selection → cart → WhatsApp checkout
- **Payment Integration**: WhatsApp Business + bank transfer

### 4. Content Management
- **Featured Videos**: YouTube integration for homepage
- **Image Galleries**: Swipeable product galleries
- **SEO Optimization**: Meta tags, structured data

## 🔐 Security Requirements

### Authentication & Authorization
- **Laravel Breeze**: Built-in authentication system
- **Session-based Auth**: Web guard dengan Eloquent provider
- **Password Security**: Hashed passwords, password confirmation
- **CSRF Protection**: Built-in Laravel CSRF middleware

### Data Security
- **Input Validation**: Request validation untuk semua forms
- **File Upload Security**: Image validation, size limits
- **SQL Injection Prevention**: Eloquent ORM protection
- **XSS Protection**: Blade/React escaping

### Infrastructure Security
- **HTTPS Enforcement**: SSL certificates required
- **CORS Configuration**: Proper domain restrictions
- **Environment Variables**: Sensitive data protection
- **Rate Limiting**: API throttling

## 🚀 Performance Requirements

### Frontend Performance
- **Bundle Optimization**: Vite code splitting
- **Image Optimization**: WebP format, lazy loading
- **Caching Strategy**: Browser caching, CDN ready
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1

### Backend Performance
- **Database Optimization**: Proper indexing, query optimization
- **Caching**: Redis support for sessions/cache
- **Image Processing**: Background job processing
- **API Response**: JSON optimization

### Infrastructure
- **Container Support**: Docker/Podman deployment
- **Horizontal Scaling**: Load balancer ready
- **Database**: PostgreSQL with connection pooling
- **CDN Integration**: Static asset delivery

## 🌐 Deployment Requirements

### Production Environment
- **Domain**: astrokabinet.id
- **SSL Certificate**: HTTPS enforcement
- **Web Server**: FrankenPHP atau Nginx + PHP-FPM
- **Database**: PostgreSQL 16+
- **PHP Version**: 8.2+
- **Node.js**: 18+ untuk build process

### Environment Configuration
```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://astrokabinet.id
DB_CONNECTION=pgsql
CACHE_STORE=redis (recommended)
QUEUE_CONNECTION=redis (recommended)
```

### Build Process
```bash
composer install --optimize-autoloader --no-dev
npm install && npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 📱 Browser Support

### Minimum Requirements
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Safari**: iOS 14+
- **Chrome Mobile**: Android 8+

### Progressive Enhancement
- **JavaScript Required**: SPA functionality
- **CSS Grid/Flexbox**: Modern layout support
- **WebP Support**: Image optimization
- **Touch Events**: Mobile interaction

## 🔄 Integration Requirements

### External Services
- **YouTube API**: Featured video embedding
- **WhatsApp Business**: Customer communication
- **Bank Transfer**: Payment processing
- **Image CDN**: Static asset delivery (optional)

### Internal APIs
- **Image Upload API**: Multi-device image processing
- **Product API**: CRUD operations
- **Cart API**: Session management
- **Analytics API**: Usage statistics

## 📈 Scalability Considerations

### Database Scaling
- **Read Replicas**: Query distribution
- **Connection Pooling**: Resource optimization
- **Indexing Strategy**: Performance optimization

### Application Scaling
- **Horizontal Scaling**: Multiple app instances
- **Load Balancing**: Traffic distribution
- **Session Storage**: Redis/database sessions
- **File Storage**: S3-compatible storage

### Monitoring & Maintenance
- **Error Tracking**: Laravel logs, external monitoring
- **Performance Monitoring**: APM tools
- **Backup Strategy**: Database dan file backups
- **Update Strategy**: Rolling deployments

---

## 📞 Support & Documentation

Untuk informasi lebih lanjut, lihat dokumentasi teknis di:
- `docs/implementation-summary.md` - Implementation details
- `docs/image-compression-system.md` - Image system documentation
- `docs/product-detail-implementation.md` - Product features
- `DEPLOYMENT.md` - Deployment guide
- `TESTING-RESULTS.md` - Testing documentation
