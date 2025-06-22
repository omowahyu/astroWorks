# Homepage Image Display Fix

## 🐛 Problem

Produk "Classic Dining Chair Set" dan produk lainnya tidak menampilkan gambar di homepage meskipun memiliki gambar yang tersimpan di database dan file sistem.

## 🔍 Root Cause Analysis

### 1. **Query Homepage Tidak Lengkap**
- Query di `routes/web.php` hanya mengambil `thumbnailImages` 
- Tidak mengambil `galleryImages` dan `heroImages`
- Field `device_type` dan `aspect_ratio` tidak diselect

### 2. **Manual Image Logic di ProductCarousel**
- Komponen `ProductCarousel` menggunakan logika manual untuk mencari gambar
- Tidak menggunakan komponen `DynamicImageSingle` yang sudah ada
- Logic pencarian gambar tidak konsisten dengan komponen lain

### 3. **Cache Issue**
- Homepage menggunakan cache 10 menit
- Perubahan data tidak langsung terlihat

## ✅ Solutions Implemented

### 1. **Enhanced Homepage Query**

**File**: `routes/web.php`

```php
// ✅ BEFORE: Only thumbnails
'products.thumbnailImages' => function ($query) {
    $query->select(['product_images.id', 'product_images.product_id', 'product_images.image_path', 'product_images.alt_text', 'product_images.sort_order'])
          ->orderBy('product_images.sort_order')
          ->take(1);
},

// ✅ AFTER: Complete image data with device_type
'products.thumbnailImages' => function ($query) {
    $query->select(['product_images.id', 'product_images.product_id', 'product_images.image_path', 'product_images.alt_text', 'product_images.sort_order', 'product_images.device_type', 'product_images.aspect_ratio'])
          ->orderBy('product_images.sort_order')
          ->take(2); // Get both mobile and desktop thumbnails
},
'products.galleryImages' => function ($query) {
    $query->select(['product_images.id', 'product_images.product_id', 'product_images.image_path', 'product_images.alt_text', 'product_images.sort_order', 'product_images.device_type', 'product_images.aspect_ratio'])
          ->orderBy('product_images.sort_order')
          ->take(4);
},
'products.heroImages' => function ($query) {
    $query->select(['product_images.id', 'product_images.product_id', 'product_images.image_path', 'product_images.alt_text', 'product_images.sort_order', 'product_images.device_type', 'product_images.aspect_ratio'])
          ->orderBy('product_images.sort_order')
          ->take(2);
},
```

### 2. **Replaced Manual Logic with DynamicImageSingle**

**File**: `resources/js/components/product/product-carousel.tsx`

```tsx
// ❌ BEFORE: Manual image logic (47 lines)
{(() => {
    const mobileImageUrl = product.images?.thumbnails?.find(img => img.device_type === 'mobile')?.image_url ||
                          product.images?.gallery?.find(img => img.device_type === 'mobile')?.image_url;
    
    const desktopImageUrl = product.images?.thumbnails?.find(img => img.device_type === 'desktop')?.image_url ||
                           product.images?.gallery?.find(img => img.device_type === 'desktop')?.image_url;
    
    const finalMobileUrl = mobileImageUrl || '/images/placeholder-product.svg';
    const finalDesktopUrl = desktopImageUrl || '/images/placeholder-product.svg';
    
    return (
        <>
            <img src={finalMobileUrl} className="w-full h-full object-cover rounded-xl block md:hidden" />
            <img src={finalDesktopUrl} className="w-full h-full object-cover rounded-xl hidden md:block" />
        </>
    );
})()}

// ✅ AFTER: Using DynamicImageSingle component (11 lines)
<DynamicImageSingle
    productId={product.id}
    alt={product.name}
    className="w-full h-full"
    mobileRounded="xl"
    desktopRounded="xl"
    useDatabase={true}
    preferThumbnail={true}
    imageType="thumbnail"
    productImages={product.images}
/>
```

### 3. **Cache Clearing**

```bash
php artisan cache:clear
```

## 🎯 Benefits

### 1. **Consistency**
- Homepage sekarang menggunakan komponen yang sama dengan detail page
- Logic image handling terpusat di `DynamicImageSingle`
- Responsive behavior konsisten

### 2. **Maintainability**
- Mengurangi duplikasi kode (47 lines → 11 lines)
- Satu tempat untuk logic image handling
- Easier debugging dan testing

### 3. **Performance**
- Lazy loading otomatis dari `DynamicImageSingle`
- Intersection Observer untuk efficient loading
- Proper error handling dan fallbacks

### 4. **Device-Type Support**
- Otomatis menampilkan gambar mobile (4:5) di mobile
- Otomatis menampilkan gambar desktop (16:9) di desktop
- Responsive switching saat resize window

## 🧪 Testing Results

### Before Fix
```bash
Product ID: 12
Product Name: Classic Dining Chair Set
Thumbnail Images: 2
Gallery Images: 0  # ❌ Not loaded in homepage query
Hero Images: 0     # ❌ Not loaded in homepage query
```

### After Fix
```bash
Product ID: 12
Product Name: Classic Dining Chair Set
Thumbnail Images: 2  # ✅ Both mobile and desktop
Gallery Images: 4    # ✅ Now loaded
Hero Images: 2       # ✅ Now loaded

Thumbnail Images Details:
- ID: 149, Device: mobile, URL: http://localhost:8001/storage/images/product_12_mobile_image_1.png
- ID: 150, Device: desktop, URL: http://localhost:8001/storage/images/product_12_desktop_image_1.png
```

## 📱 Device-Type Implementation

### Database Structure
```sql
ALTER TABLE product_images ADD COLUMN device_type ENUM('mobile', 'desktop') DEFAULT 'desktop';
ALTER TABLE product_images ADD COLUMN aspect_ratio DECIMAL(4,2);
```

### Image Types by Device
- **Mobile Images**: 4:5 aspect ratio (640x800)
- **Desktop Images**: 16:9 aspect ratio (1200x675)
- **Automatic Selection**: Based on `window.innerWidth < 768`

### Responsive Behavior
- Mobile device: Shows mobile images (4:5)
- Desktop device: Shows desktop images (16:9)
- Fallback: If device-specific image not available, shows any available image
- Placeholder: If no images available, shows "Image Tidak Tersedia"

## 🔮 Future Enhancements

1. **Image Optimization**: WebP format support
2. **Progressive Loading**: Blur-to-sharp transition
3. **Preloading**: Preload next carousel images
4. **Analytics**: Track image load performance
5. **A/B Testing**: Different image layouts

## 📊 Performance Impact

- **Bundle Size**: Reduced by removing manual logic
- **Runtime Performance**: Better with centralized component
- **Memory Usage**: Optimized with Intersection Observer
- **Network**: Lazy loading reduces initial load

## 🛡️ Error Handling

1. **Missing Images**: Graceful fallback to placeholder
2. **Network Errors**: Retry mechanism in DynamicImageSingle
3. **Invalid URLs**: Automatic fallback to Picsum placeholder
4. **Device Detection**: Fallback to desktop if detection fails
