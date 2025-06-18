# 🎨 Layout System Documentation

## 📋 Overview

Sistem layout untuk homepage dan product detail pages yang konsisten dan reusable. Layout ini menggunakan header dan footer yang sama dengan customization options untuk berbagai kebutuhan.

## 🏗️ Layout Structure

```
resources/js/layouts/
├── home/
│   ├── home-default-layout.tsx    # Layout untuk homepage
│   └── product-layout.tsx         # Layout untuk product detail
├── home-layout.tsx                # Wrapper layout dengan variant
└── app-layout.tsx                 # Layout untuk dashboard/admin
```

## 🎯 Layout Components

### 1. **HomeDefaultLayout**
Layout utama untuk homepage dan halaman umum.

**Features:**
- ✅ Consistent header dengan navigation
- ✅ Footer dengan company info dan links
- ✅ SEO meta tags
- ✅ Responsive design
- ✅ Customizable container classes

**Usage:**
```tsx
import HomeDefaultLayout from '@/layouts/home/home-default-layout';

export default function Homepage() {
    return (
        <HomeDefaultLayout 
            title="AstroWorks - Furniture & Interior Design"
            description="Solusi furniture dan interior design terpercaya"
            showFooter={true}
            containerClass="custom-container"
        >
            {/* Page content */}
        </HomeDefaultLayout>
    );
}
```

### 2. **ProductLayout**
Layout khusus untuk product detail pages dengan SEO optimization.

**Features:**
- ✅ Product-specific SEO meta tags
- ✅ Open Graph & Twitter Card support
- ✅ Structured data (JSON-LD) untuk SEO
- ✅ Breadcrumb navigation
- ✅ Product-optimized background
- ✅ Same header & footer consistency

**Usage:**
```tsx
import ProductLayout from '@/layouts/home/product-layout';

export default function ProductDetail() {
    const breadcrumbItems = [
        { label: 'Products', href: '/' },
        { label: product.name }
    ];

    return (
        <ProductLayout
            title={`${product.name} - AstroWorks`}
            description={product.description}
            productName={product.name}
            productPrice={formatPrice(product.price)}
            productImage={product.image_url}
            breadcrumbItems={breadcrumbItems}
        >
            {/* Product content */}
        </ProductLayout>
    );
}
```

### 3. **HomeLayout (Wrapper)**
Unified wrapper yang bisa digunakan untuk kedua layout dengan variant.

**Usage:**
```tsx
import HomeLayout from '@/layouts/home-layout';

// For homepage
<HomeLayout variant="default" title="Homepage">
    {/* Homepage content */}
</HomeLayout>

// For product detail
<HomeLayout 
    variant="product" 
    title="Product Detail"
    productName="Product Name"
    breadcrumbItems={breadcrumbs}
>
    {/* Product content */}
</HomeLayout>
```

## 🧩 Shared Components

### **Header Component**
**Location:** `resources/js/components/layout/header.tsx`

**Features:**
- ✅ Gradient background (blue to purple)
- ✅ Logo dengan link ke homepage
- ✅ Navigation menu (Company, Tutorial, Chat, Keranjang)
- ✅ Responsive design
- ✅ Hover effects dan transitions

**Navigation Items:**
- **Company** → `/company`
- **Tutorial** → `/` (placeholder)
- **Chat** → `/` (placeholder)
- **Keranjang** → `/cart`

### **Footer Component**
**Location:** `resources/js/components/layout/footer.tsx`

**Features:**
- ✅ Company information dengan logo
- ✅ Quick links navigation
- ✅ Services list
- ✅ Contact information
- ✅ Social media links
- ✅ Copyright dan legal links
- ✅ Responsive grid layout

**Sections:**
1. **Company Info** - Logo, description, social media
2. **Quick Links** - Navigation links
3. **Services** - Service offerings
4. **Contact** - Phone, email, address

## 🎨 Design System

### **Color Scheme**
```css
/* Header & Footer Gradient */
background: linear-gradient(to bottom, #5EC2DB, #5F44F0)

/* Main Content */
background: white
border-radius: 1.5rem (rounded-t-3xl)

/* Product Pages */
background: gray-50 (for better contrast)
```

### **Typography**
- **Font Family:** Instrument Sans (Google Fonts)
- **Weights:** 400, 500, 600
- **Responsive scaling:** text-sm → text-lg

### **Spacing & Layout**
- **Container:** `container mx-auto px-4 sm:px-6 lg:px-8`
- **Main padding:** `py-5 lg:py-16`
- **Section gaps:** `space-y-4` to `space-y-8`

## 📱 Responsive Design

### **Breakpoints**
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px  
- **Desktop:** > 1024px

### **Mobile Optimizations**
- ✅ Collapsible navigation
- ✅ Touch-friendly buttons
- ✅ Optimized image sizes
- ✅ Readable font sizes
- ✅ Proper spacing

### **Desktop Enhancements**
- ✅ Larger images dan content
- ✅ Multi-column layouts
- ✅ Hover effects
- ✅ Better typography hierarchy

## 🔍 SEO Features

### **Meta Tags**
```tsx
<Head title={title}>
    <meta name="description" content={description} />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    {/* Open Graph */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="product" />
    <meta property="og:image" content={productImage} />
    
    {/* Twitter Card */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={productImage} />
</Head>
```

### **Structured Data (JSON-LD)**
```json
{
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Product Name",
    "description": "Product Description",
    "image": "product-image-url",
    "brand": {
        "@type": "Brand",
        "name": "AstroWorks"
    },
    "offers": {
        "@type": "Offer",
        "price": "price",
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock"
    }
}
```

## 🚀 Performance Optimizations

### **Image Loading**
- ✅ Preconnect ke Google Fonts
- ✅ Optimized image components
- ✅ Lazy loading untuk heavy components

### **Code Splitting**
- ✅ Layout components terpisah
- ✅ Lazy loading untuk ProductCarousel
- ✅ Dynamic imports untuk heavy components

### **Caching**
- ✅ Font preloading
- ✅ Static asset optimization
- ✅ Component memoization

## 📝 Usage Examples

### **Homepage Implementation**
```tsx
// resources/js/pages/public/homepage.tsx
import HomeDefaultLayout from '@/layouts/home/home-default-layout';

export default function Welcome() {
    return (
        <HomeDefaultLayout 
            title="AstroWorks - Furniture & Interior Design"
            description="Solusi furniture dan interior design terpercaya"
        >
            <div className="px-4 lg:px-6">
                <VideoEmbed video={featuredVideo} />
            </div>
            <ProductCarouselLazy categories={categories} />
        </HomeDefaultLayout>
    );
}
```

### **Product Detail Implementation**
```tsx
// resources/js/pages/product/[slug].tsx
import ProductLayout from '@/layouts/home/product-layout';

export default function ProductDetail() {
    const breadcrumbItems = [
        { label: 'Products', href: '/' },
        { label: product.name }
    ];

    return (
        <ProductLayout
            title={`${product.name} - AstroWorks`}
            description={product.description}
            productName={product.name}
            productPrice={formatPrice(finalTotal)}
            productImage={productImage}
            breadcrumbItems={breadcrumbItems}
        >
            {/* Product content with custom mobile header */}
            <header className="fixed lg:hidden top-0 z-50 w-full">
                {/* Custom mobile navigation */}
            </header>
            
            <div className="container mx-auto px-4 py-8">
                {/* Product details */}
            </div>
        </ProductLayout>
    );
}
```

## 🎯 Best Practices

1. **Consistent Props:** Selalu gunakan props yang sama untuk title, description
2. **SEO Optimization:** Pastikan setiap halaman memiliki unique title dan description
3. **Image Optimization:** Gunakan proper alt text dan optimized images
4. **Responsive Design:** Test di berbagai device sizes
5. **Performance:** Lazy load heavy components
6. **Accessibility:** Proper ARIA labels dan semantic HTML

## 🔧 Customization

Layout system ini dirancang untuk mudah dikustomisasi:

- **Colors:** Update di Tailwind config atau component level
- **Typography:** Ganti font di Head component
- **Spacing:** Adjust padding/margin via props
- **Components:** Extend atau override individual components
- **SEO:** Customize meta tags per halaman

**Layout system sekarang siap untuk development dan production!** 🎉
