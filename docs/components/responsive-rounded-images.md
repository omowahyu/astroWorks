# Responsive Rounded Images

Fitur responsive rounded memungkinkan Anda untuk mengatur border radius yang berbeda untuk perangkat mobile dan desktop pada komponen `DynamicImageGallery` dan `DynamicImageSingle`.

## Props Baru

### DynamicImageGallery

```typescript
interface DynamicImageGalleryProps {
    // ... props lainnya

    /** Border radius untuk semua perangkat (optional fallback) */
    rounded?: string;

    /** Border radius khusus untuk perangkat mobile */
    mobileRounded?: string;

    /** Border radius khusus untuk perangkat desktop */
    desktopRounded?: string;
}
```

### DynamicImageSingle

```typescript
interface DynamicImageSingleProps {
    // ... props lainnya

    /** Border radius untuk semua perangkat (optional fallback) */
    rounded?: string;

    /** Border radius khusus untuk perangkat mobile */
    mobileRounded?: string;

    /** Border radius khusus untuk perangkat desktop */
    desktopRounded?: string;
}
```

## Cara Kerja

1. **Device Detection**: Komponen mendeteksi ukuran layar menggunakan `window.innerWidth < 768` untuk menentukan apakah perangkat mobile atau desktop
2. **Priority Logic**:
   - **Mobile**: Gunakan `mobileRounded` jika tersedia, fallback ke `rounded`
   - **Desktop**: Gunakan `desktopRounded` jika tersedia, fallback ke `rounded`
   - **Fallback**: Jika tidak ada device-specific rounded, gunakan `rounded`
3. **Responsive Updates**: Komponen akan otomatis update ketika ukuran layar berubah

> **Catatan**: Prop `rounded` bersifat optional dan hanya digunakan sebagai fallback. Untuk penggunaan optimal, gunakan `mobileRounded` dan `desktopRounded` secara langsung.

## Contoh Penggunaan

### Recommended Usage (Tanpa fallback)

```tsx
<DynamicImageGallery
    productId="123"
    name="Product Name"
    mobileRounded="3xl"
    desktopRounded="lg"
    useDatabase={true}
    productImages={productImages}
/>
```

### Dengan Fallback (Optional)

```tsx
<DynamicImageGallery
    productId="123"
    name="Product Name"
    rounded="xl"           // fallback jika device-specific tidak tersedia
    mobileRounded="3xl"
    desktopRounded="lg"
    useDatabase={true}
    productImages={productImages}
/>
```

### Advanced Usage dengan Efek Visual Berbeda

```tsx
// Mobile: Rounded penuh (seperti lingkaran)
// Desktop: Rounded sedang
<DynamicImageGallery
    productId="123"
    name="Product Name"
    mobileRounded="full"
    desktopRounded="xl"
    useDatabase={true}
    productImages={productImages}
/>
```

### Untuk Accessory Images

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
    productImages={accessory.images}
/>
```

## Nilai Rounded yang Didukung

- `none` atau `''` - Tidak ada border radius
- `sm` - rounded-sm (2px)
- `md` - rounded-md (6px)
- `lg` - rounded-lg (8px)
- `xl` - rounded-xl (12px)
- `2xl` - rounded-2xl (16px)
- `3xl` - rounded-3xl (24px)
- `full` - rounded-full (50%)
- Custom value - `rounded-[20px]` (akan menggunakan nilai custom)

## Breakpoint

- **Mobile**: `window.innerWidth < 768px`
- **Desktop**: `window.innerWidth >= 768px`

Breakpoint ini konsisten dengan Tailwind CSS breakpoint `md:` (768px).

## Implementasi di Product Detail Page

Pada halaman detail produk, fitur ini sudah diimplementasikan dengan contoh:

1. **Accessory Products**: Mobile menggunakan rounded lebih besar (`3xl`) dan desktop menggunakan rounded lebih kecil (`lg`)
2. **Regular Products**: Mobile menggunakan `full` (lingkaran) dan desktop menggunakan `2xl`
3. **Accessory Thumbnails**: Konsisten menggunakan `lg` untuk semua perangkat

## Performance

- Device detection menggunakan `useEffect` dengan event listener `resize`
- Perubahan rounded class tidak memicu re-render gambar, hanya mengubah CSS class
- Optimized dengan `useCallback` untuk mencegah unnecessary re-calculations

## Browser Support

Fitur ini mendukung semua browser modern yang mendukung:
- CSS `border-radius`
- JavaScript `window.innerWidth`
- React hooks (`useState`, `useEffect`, `useCallback`)
