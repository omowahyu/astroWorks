# Fix: Homepage dan Detail Page Image Consistency

## Masalah

Gambar thumbnail yang ditampilkan di homepage berbeda dengan gambar yang ditampilkan di detail page. Misalnya:
- Homepage menampilkan `gambar[0]` (thumbnail pertama)
- Detail page menampilkan `gambar[1]` atau `gambar[2]` (gallery images)

## Penyebab

Perbedaan ini disebabkan oleh **logika pemilihan gambar yang berbeda** antara kedua komponen:

### 1. Homepage (ProductCarousel)
```tsx
<DynamicImageSingle
    preferThumbnail={true}        // ← Prioritas thumbnail
    imageType="thumbnail"         // ← Jenis gambar: thumbnail
    productImages={product.images}
/>
```

**Logika pemilihan:**
1. `main_thumbnail` (jika ada dan sesuai device)
2. `thumbnails[0]` (thumbnail pertama)
3. Fallback ke jenis gambar lain

### 2. Detail Page (DynamicImageGallery) - SEBELUM PERBAIKAN
```tsx
const allValidImages = [...validGalleryImages, ...validHeroImages, ...validThumbnailImages];
```

**Logika pemilihan (LAMA):**
1. `gallery[0]` (gallery image pertama)
2. `hero[0]` (hero image pertama)  
3. `thumbnails[0]` (thumbnail pertama)

## Solusi

Mengubah urutan prioritas di `DynamicImageGallery` agar sesuai dengan homepage:

### Perubahan di `processGalleryImages()`

```tsx
// 1. Add main_thumbnail first if available and matches current device
if (productImages.main_thumbnail && productImages.main_thumbnail.image_url?.trim()) {
    const mainThumbDeviceType = (productImages.main_thumbnail as any).device_type || 'desktop';
    const shouldIncludeMainThumb = deviceTypeFilter === 'all' || 
        (deviceTypeFilter || currentDeviceType) === mainThumbDeviceType;
    
    if (shouldIncludeMainThumb) {
        allValidImages.push(productImages.main_thumbnail as GalleryImageData);
    }
}

// 2. Add thumbnails (excluding main_thumbnail if already added)
const thumbnailsToAdd = validThumbnailImages.filter(thumb => 
    !productImages.main_thumbnail || thumb.id !== productImages.main_thumbnail.id
);
allValidImages = [...allValidImages, ...thumbnailsToAdd];

// 3. Add gallery images
allValidImages = [...allValidImages, ...validGalleryImages];

// 4. Add hero images last
allValidImages = [...allValidImages, ...validHeroImages];
```

### Urutan Prioritas Baru

1. **main_thumbnail** (jika ada dan sesuai device filter)
2. **thumbnails** (kecuali yang sudah ada di main_thumbnail)
3. **gallery images**
4. **hero images**

## Hasil

Sekarang kedua halaman akan menampilkan gambar yang konsisten:
- Homepage: `main_thumbnail` atau `thumbnails[0]`
- Detail page: `main_thumbnail` atau `thumbnails[0]` (sama dengan homepage)

## File yang Diubah

- `resources/js/components/image/dynamic-image-gallery.tsx`
  - Mengubah logika `processGalleryImages()`
  - Menambahkan prioritas untuk `main_thumbnail`
  - Mengubah urutan penggabungan array gambar
  - Menambahkan debug logging untuk monitoring

## Perbaikan Device Type Filtering

### Masalah Tambahan yang Ditemukan
Beberapa gambar tidak tampil (putih) karena filtering device_type yang terlalu ketat tanpa fallback.

### Solusi Device Filtering

#### 1. DynamicImageGallery - Fallback Logic
```tsx
// 5. Fallback: If no images match device filter, include all images regardless of device_type
if (allValidImages.length === 0 && deviceTypeFilter !== 'all') {
    debugLog('🖼️ No images found for device filter, falling back to all images');
    const allThumbnails = productImages.thumbnails?.filter(img => img?.image_url?.trim()) || [];
    const allGallery = productImages.gallery?.filter(img => img?.image_url?.trim()) || [];
    const allHero = productImages.hero?.filter(img => img?.image_url?.trim()) || [];

    // Add main_thumbnail first if available
    if (productImages.main_thumbnail && productImages.main_thumbnail.image_url?.trim()) {
        allValidImages.push(productImages.main_thumbnail as GalleryImageData);
    }

    // Add remaining images
    const remainingThumbnails = allThumbnails.filter(thumb =>
        !productImages.main_thumbnail || thumb.id !== productImages.main_thumbnail.id
    );
    allValidImages = [...allValidImages, ...remainingThumbnails, ...allGallery, ...allHero];
}
```

#### 2. DynamicImageSingle - Enhanced Fallback
```tsx
// Fallback: If no device-specific images found, use any available image
if (!mobileImage && !desktopImage) {
    // Try main_thumbnail regardless of device_type
    if (productImages.main_thumbnail && productImages.main_thumbnail.image_url?.trim()) {
        const mainThumbDeviceType = (productImages.main_thumbnail as any).device_type || 'desktop';
        if (mainThumbDeviceType === 'mobile') {
            mobileImage = productImages.main_thumbnail;
        } else {
            desktopImage = productImages.main_thumbnail;
        }
    }

    // If still no images, try any available image from any type
    if (!mobileImage && !desktopImage) {
        const allImages = [
            ...(productImages.thumbnails || []),
            ...(productImages.gallery || []),
            ...(productImages.hero || [])
        ].filter(img => img?.image_url?.trim());

        if (allImages.length > 0) {
            const firstImage = allImages[Math.min(index - 1, allImages.length - 1)] || allImages[0];
            const imageDeviceType = (firstImage as any).device_type || 'desktop';
            if (imageDeviceType === 'mobile') {
                mobileImage = firstImage;
            } else {
                desktopImage = firstImage;
            }
        }
    }
}
```

## Testing

1. **Konsistensi Homepage-Detail:**
   - Buka homepage dan lihat gambar produk yang ditampilkan
   - Klik produk untuk masuk ke detail page
   - Verifikasi bahwa gambar pertama di gallery sama dengan yang di homepage

2. **Device Type Filtering:**
   - Test pada mobile dan desktop
   - Verifikasi tidak ada gambar putih/kosong
   - Pastikan fallback bekerja ketika tidak ada gambar sesuai device

3. **Debug Mode:**
   - Aktifkan debug di kedua komponen
   - Monitor console untuk melihat proses pemilihan gambar

## Debug Mode

### DynamicImageGallery Debug
```tsx
<DynamicImageGallery
    debug={true}  // ← Aktifkan untuk melihat log
    // ... props lainnya
/>
```

### DynamicImageSingle Debug
```tsx
<DynamicImageSingle
    debug={true}  // ← Aktifkan untuk melihat log
    // ... props lainnya
/>
```

### Debug Information
- **Gallery**: Jumlah gambar per tipe, device filter, fallback usage
- **Single**: Device type detection, image selection process, fallback logic
- **Consistency**: Main thumbnail usage, image prioritization
