# Fix: Additional Items Device Type Filtering

## Masalah

Gambar pada bagian "Additional Items" (accessories) tidak tampil berdasarkan device type yang sesuai. Beberapa gambar muncul putih atau tidak sesuai dengan device yang sedang digunakan.

## Penyebab

1. **Backend**: Data accessories tidak menyertakan informasi `device_type` dan struktur gambar yang lengkap
2. **Frontend**: Komponen `DynamicImageSingle` tidak mendapat informasi device_type yang cukup untuk accessories
3. **Missing Relations**: Backend tidak memuat relasi `galleryImages` dan `heroImages` untuk accessories

## Analisis Backend

### Sebelum Perbaikan
```php
'images' => [
    'thumbnails' => $accessory->thumbnailImages->map(function ($image) {
        return [
            'id' => $image->id,
            'image_url' => $image->image_url,
            'alt_text' => $image->alt_text
        ];
    }),
    // Missing: gallery, hero, main_thumbnail
    // Missing: device_type, aspect_ratio, variants
]
```

### Setelah Perbaikan
```php
'images' => [
    'thumbnails' => $accessory->thumbnailImages->map(function ($image) {
        return [
            'id' => $image->id,
            'image_type' => $image->image_type,
            'device_type' => $image->device_type ?? 'desktop',
            'aspect_ratio' => $image->aspect_ratio,
            'sort_order' => $image->sort_order,
            'image_url' => $image->image_url,
            'alt_text' => $image->alt_text,
            'variants' => $image->image_variants
        ];
    }),
    'gallery' => $accessory->galleryImages->map(function ($image) {
        // ... struktur lengkap dengan device_type
    }),
    'hero' => $accessory->heroImages->map(function ($image) {
        // ... struktur lengkap dengan device_type
    }),
    'main_thumbnail' => $accessory->mainThumbnail ? [
        // ... struktur lengkap dengan device_type
    ] : null
]
```

## Perbaikan yang Dilakukan

### 1. Backend Controllers

#### ProductController.php
- Menambahkan relasi `galleryImages` dan `heroImages` pada eager loading
- Menyertakan `device_type`, `aspect_ratio`, `variants` pada semua jenis gambar
- Menambahkan `main_thumbnail` dengan struktur lengkap

#### Api/ProductController.php
- Perbaikan yang sama untuk API endpoint
- Memastikan konsistensi struktur data antara web dan API

### 2. Frontend Component

#### [slug].tsx - Additional Items Section
```tsx
<DynamicImageSingle
    productId={accessory.id.toString()}
    alt={accessory.name}
    className="w-full h-full"
    mobileRounded="xl"
    desktopRounded="md"
    useDatabase={true}
    preferThumbnail={true}
    imageType="thumbnail"
    deviceType="auto"          // ← Ditambahkan untuk auto-detection
    debug={false}              // ← Ditambahkan untuk debugging
    productImages={accessory.images}
/>
```

## Struktur Data Accessories Baru

```typescript
interface AccessoryImages {
    thumbnails: Array<{
        id: number;
        image_type: 'thumbnail';
        device_type: 'mobile' | 'desktop';
        aspect_ratio: number;
        sort_order: number;
        image_url: string;
        alt_text: string;
        variants: any;
    }>;
    gallery: Array<{
        // ... struktur yang sama
    }>;
    hero: Array<{
        // ... struktur yang sama
    }>;
    main_thumbnail: {
        // ... struktur yang sama
    } | null;
}
```

## Fallback Logic

Dengan perbaikan di `DynamicImageSingle`, accessories sekarang memiliki fallback logic:

1. **Prioritas Utama**: `main_thumbnail` sesuai device_type
2. **Fallback 1**: `thumbnails[0]` sesuai device_type
3. **Fallback 2**: `main_thumbnail` apapun device_type-nya
4. **Fallback 3**: Gambar pertama dari semua jenis tanpa filter device

## Testing

### 1. Verifikasi Backend Data
```bash
# Test API endpoint
curl -X GET "http://localhost:8001/api/products/{slug}" | jq '.accessories[0].images'

# Pastikan struktur data lengkap dengan device_type
```

### 2. Verifikasi Frontend
1. Buka detail page produk yang memiliki accessories
2. Periksa bagian "Additional Items"
3. Verifikasi gambar tampil sesuai device (mobile/desktop)
4. Test responsive behavior dengan mengubah ukuran browser

### 3. Debug Mode
```tsx
// Aktifkan debug untuk monitoring
<DynamicImageSingle
    debug={true}
    // ... props lainnya
/>
```

## Perbaikan Syntax Error

### Masalah
Terjadi syntax error: `unexpected single-quoted string "main_thumbnail", expecting "]"`

### Penyebab
- Duplikasi key `main_thumbnail` dalam array accessories images
- Missing comma setelah array closing bracket

### Solusi
- Menghapus duplikasi `main_thumbnail` yang tidak diperlukan
- Memastikan syntax PHP array yang benar

## File yang Diubah

1. **app/Http/Controllers/ProductController.php**
   - Menambahkan relasi `galleryImages`, `heroImages`
   - Memperbaiki struktur data accessories images
   - ✅ **Fixed**: Menghapus duplikasi `main_thumbnail`

2. **app/Http/Controllers/Api/ProductController.php**
   - Perbaikan yang sama untuk API endpoint
   - ✅ **Fixed**: Menghapus duplikasi `main_thumbnail`

3. **resources/js/pages/product/[slug].tsx**
   - Menambahkan prop `deviceType="auto"` dan `debug={false}`

## Hasil yang Diharapkan

1. **Device-Responsive Images**: Accessories menampilkan gambar sesuai device type
2. **No More White Images**: Fallback logic mencegah gambar kosong
3. **Consistent Structure**: Data accessories memiliki struktur yang sama dengan product utama
4. **Better Performance**: Eager loading yang optimal untuk semua relasi gambar
