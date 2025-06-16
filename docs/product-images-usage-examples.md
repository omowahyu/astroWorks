# Product Images - Usage Examples

## Overview

Sistem product images telah diperbarui untuk mendukung:
- **Thumbnail images**: Gambar kecil untuk preview produk
- **Gallery images**: Gambar untuk detail produk (multiple images)
- **Hero images**: Gambar utama untuk banner/hero section
- **Device-specific variants**: Mobile portrait, mobile square, desktop landscape

## Database Schema

### Image Types
- `thumbnail`: Gambar thumbnail untuk preview
- `gallery`: Gambar galeri untuk detail produk
- `hero`: Gambar hero untuk banner

### Key Columns
- `image_type`: ENUM('thumbnail', 'gallery', 'hero')
- `is_thumbnail`: BOOLEAN untuk backward compatibility
- `display_order`: INTEGER untuk urutan tampilan
- `mobile_portrait_path`: Path untuk mobile portrait (4:5)
- `mobile_square_path`: Path untuk mobile square (1:1)
- `desktop_landscape_path`: Path untuk desktop landscape (16:9)

## Usage Examples

### 1. Mengambil Thumbnail Images

```php
// Ambil semua thumbnail images untuk produk
$thumbnails = $product->thumbnailImages;

// Ambil thumbnail utama
$mainThumbnail = $product->mainThumbnail;

// Query dengan scope
$thumbnails = ProductImage::where('product_id', $productId)
    ->thumbnails()
    ->orderedByDisplay()
    ->get();
```

### 2. Mengambil Gallery Images

```php
// Ambil semua gallery images untuk detail produk
$galleryImages = $product->galleryImages;

// Query dengan scope
$galleryImages = ProductImage::where('product_id', $productId)
    ->gallery()
    ->orderedByDisplay()
    ->get();
```

### 3. Mengambil Hero Images

```php
// Ambil hero images
$heroImages = $product->heroImages;

// Query dengan scope
$heroImages = ProductImage::where('product_id', $productId)
    ->hero()
    ->orderedByDisplay()
    ->get();
```

### 4. Responsive Images

```php
// Ambil URL responsive berdasarkan device
$image = ProductImage::find(1);

// Mobile portrait
$mobileUrl = $image->getResponsiveImageUrl('mobile', 'portrait');

// Mobile square
$mobileSquareUrl = $image->getResponsiveImageUrl('mobile', 'square');

// Desktop landscape
$desktopUrl = $image->getResponsiveImageUrl('desktop');

// Ambil semua variants
$variants = $image->image_variants;
/*
[
    'original' => 'url_to_original',
    'mobile_portrait' => 'url_to_mobile_portrait',
    'mobile_square' => 'url_to_mobile_square',
    'desktop_landscape' => 'url_to_desktop_landscape'
]
*/
```

### 5. Membuat Image Baru

```php
// Thumbnail image
ProductImage::create([
    'product_id' => $productId,
    'image_path' => 'images/product_1_thumb.jpg',
    'alt_text' => 'Product Thumbnail',
    'image_type' => ProductImage::TYPE_THUMBNAIL,
    'is_thumbnail' => true,
    'is_primary' => true,
    'display_order' => 0
]);

// Gallery image
ProductImage::create([
    'product_id' => $productId,
    'image_path' => 'images/product_1_gallery_1.jpg',
    'alt_text' => 'Product Gallery Image 1',
    'image_type' => ProductImage::TYPE_GALLERY,
    'display_order' => 1
]);

// Hero image
ProductImage::create([
    'product_id' => $productId,
    'image_path' => 'images/product_1_hero.jpg',
    'alt_text' => 'Product Hero Image',
    'image_type' => ProductImage::TYPE_HERO,
    'display_order' => 2
]);
```

### 6. Frontend Usage (Blade/React/Vue)

```php
<!-- Blade Template -->
<!-- Thumbnail untuk product listing -->
@if($product->mainThumbnail)
    <img src="{{ $product->mainThumbnail->getResponsiveImageUrl('mobile', 'square') }}" 
         alt="{{ $product->mainThumbnail->alt_text }}"
         class="product-thumbnail">
@endif

<!-- Gallery untuk product detail -->
<div class="product-gallery">
    @foreach($product->galleryImages as $image)
        <img src="{{ $image->getResponsiveImageUrl('desktop') }}" 
             alt="{{ $image->alt_text }}"
             class="gallery-image">
    @endforeach
</div>

<!-- Hero image untuk banner -->
@if($product->heroImages->first())
    <div class="hero-section">
        <img src="{{ $product->heroImages->first()->getResponsiveImageUrl('desktop') }}" 
             alt="{{ $product->heroImages->first()->alt_text }}"
             class="hero-image">
    </div>
@endif
```

### 7. API Response Structure

```php
// ProductController
public function show(Product $product)
{
    return response()->json([
        'product' => $product,
        'images' => [
            'thumbnail' => $product->mainThumbnail?->image_variants,
            'gallery' => $product->galleryImages->map(fn($img) => $img->image_variants),
            'hero' => $product->heroImages->map(fn($img) => $img->image_variants)
        ]
    ]);
}
```

## Migration Commands

```bash
# Jalankan migration untuk menambah kolom baru
php artisan migrate

# Jalankan seeder untuk contoh data
php artisan db:seed --class=ProductImageSeeder
```

## Constants

```php
// Image type constants
ProductImage::TYPE_THUMBNAIL  // 'thumbnail'
ProductImage::TYPE_GALLERY    // 'gallery'
ProductImage::TYPE_HERO       // 'hero'
ProductImage::TYPES          // ['thumbnail', 'gallery', 'hero']
```
