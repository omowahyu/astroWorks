# Implementasi Soft Cropping untuk Gambar Produk

## Overview

Sistem telah diperbarui untuk menggunakan **soft cropping** alih-alih hard cropping. Soft cropping mempertahankan gambar asli tanpa memotongnya secara fisik, dan menggunakan CSS `aspect-ratio` untuk mengatur tampilan.

## Perubahan yang Dilakukan

### 1. Backend - ImageOptimizationService.php

**Sebelum:**
- Menggunakan `cropToAspectRatio()` yang memotong gambar secara fisik
- Gambar dipotong dari tengah untuk mencapai rasio aspek tertentu

**Sesudah:**
- Menggunakan `optimizeForDevice()` yang hanya mengubah ukuran proporsional
- Gambar dipertahankan dalam rasio aspek aslinya
- Optimasi berdasarkan dimensi maksimal untuk setiap perangkat:
  - Mobile: 800x1200px
  - Desktop: 1920x1080px

```php
// Fungsi baru untuk optimasi tanpa cropping
protected function optimizeForDevice($image, string $deviceType)
{
    $maxDimensions = [
        'mobile' => ['width' => 800, 'height' => 1200],
        'desktop' => ['width' => 1920, 'height' => 1080]
    ];
    
    // Resize proporsional tanpa cropping
    $scale = min($scaleWidth, $scaleHeight, 1);
    if ($scale < 1) {
        $image = $image->resize($newWidth, $newHeight);
    }
    
    return $image;
}
```

### 2. Frontend - DynamicImageSingle.tsx

**Perubahan CSS:**
- `object-cover` → `object-contain`
- Gambar akan ditampilkan sepenuhnya dalam container
- CSS `aspect-ratio` mengatur bentuk container

```tsx
// Sebelum
className="absolute inset-0 w-full h-full object-cover"

// Sesudah  
className="absolute inset-0 w-full h-full object-contain"
```

### 3. LazyImage Component

**Fitur Baru:**
- Menambahkan prop `objectFit` dengan default `'contain'`
- Mendukung berbagai mode: `'cover' | 'contain' | 'fill' | 'scale-down' | 'none'`

```tsx
<LazyImage 
  src="/path/to/image.jpg"
  alt="Product image"
  objectFit="contain" // Default untuk soft cropping
/>

// Untuk kasus khusus yang memerlukan cropping
<LazyImage 
  src="/path/to/image.jpg"
  alt="Product image"
  objectFit="cover"
/>
```

## CSS Aspect Ratio Implementation

### Dynamic Image CSS

```css
/* Mobile: 4:5 aspect ratio */
@media (max-width: 767px) {
  .dynamic-image-single {
    aspect-ratio: 4 / 5;
  }
}

/* Desktop: 16:9 aspect ratio */
@media (min-width: 768px) {
  .dynamic-image-single {
    aspect-ratio: 16 / 9;
  }
}
```

### Container Structure

```tsx
<div className="aspect-[4/5] md:aspect-[16/9] overflow-hidden">
  <img 
    className="w-full h-full object-contain"
    src={imageUrl}
    alt={altText}
  />
</div>
```

## Keuntungan Soft Cropping

### ✅ Kelebihan

1. **Preservasi Gambar**: Tidak ada bagian gambar yang hilang
2. **Kualitas Terjaga**: Gambar asli tetap utuh
3. **Fleksibilitas**: Dapat menampilkan gambar dengan berbagai rasio aspek
4. **Performance**: Mengurangi beban server karena tidak perlu cropping
5. **User Experience**: Pengguna melihat gambar lengkap

### ⚠️ Pertimbangan

1. **Whitespace**: Mungkin ada ruang kosong jika rasio aspek gambar berbeda dengan container
2. **Konsistensi Layout**: Perlu desain yang mempertimbangkan variasi ukuran gambar

## Migrasi dari Hard Cropping

### Langkah-langkah:

1. **Backend**: Gambar yang sudah ada tetap bisa digunakan
2. **Frontend**: Komponen otomatis menggunakan `object-contain`
3. **CSS**: Aspect ratio sudah dikonfigurasi di `dynamic-image.css`

### Backward Compatibility:

- Gambar lama yang sudah di-crop tetap berfungsi
- Gambar baru akan menggunakan soft cropping
- Tidak perlu regenerasi gambar yang sudah ada

## Penggunaan dalam Komponen

### DynamicImageSingle

```tsx
<DynamicImageSingle
  productId="product-uuid"
  alt="Product name"
  className="w-full" // Container akan mengikuti aspect-ratio CSS
  imageType="gallery"
/>
```

### DynamicImageGallery

```tsx
<DynamicImageGallery
  productId="product-uuid"
  productImages={productImages}
  className="w-full"
  rounded="xl"
/>
```

## Testing

Untuk menguji implementasi:

1. Upload gambar dengan berbagai rasio aspek
2. Periksa tampilan di mobile (4:5) dan desktop (16:9)
3. Pastikan tidak ada bagian gambar yang terpotong
4. Verifikasi whitespace handling sesuai desain

## Konfigurasi Khusus

Jika diperlukan hard cropping untuk kasus tertentu:

```tsx
// Gunakan LazyImage dengan objectFit="cover"
<LazyImage 
  src={imageUrl}
  alt={altText}
  objectFit="cover" // Akan melakukan cropping
  className="w-full h-full"
/>
```

## Kesimpulan

Implementasi soft cropping memberikan pengalaman yang lebih baik dengan mempertahankan integritas gambar asli sambil tetap menjaga konsistensi layout melalui CSS aspect-ratio. Sistem ini lebih fleksibel dan ramah terhadap berbagai jenis konten gambar.