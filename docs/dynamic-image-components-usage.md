# Dynamic Image Components - TSX Implementation

## Overview

Komponen DynamicImageSingle dan DynamicImageGallery telah dikonversi dari Svelte ke TSX dengan pembaruan skema database dan optimasi untuk transisi yang mulus antara mobile (4:5) dan desktop (16:9).

## Key Features

### ✨ **Seamless Responsive Transitions**
- **Mobile**: Gambar 4:5 (portrait) hanya tampil di mobile
- **Desktop**: Gambar 16:9 (landscape) hanya tampil di desktop
- **No Transition Jitter**: Transisi antar device tanpa jeda atau flicker

### 🚀 **Performance Optimizations**
- **Intersection Observer**: Lazy loading dengan observer
- **GPU Acceleration**: Transform3d untuk smooth transitions
- **Preloading**: Preload kedua gambar untuk transisi instant
- **Memory Efficient**: Cleanup observers dan timers

### 🗄️ **New Database Schema Support**
- **Image Types**: thumbnail, gallery, hero
- **Responsive Variants**: mobile_portrait, mobile_square, desktop_landscape
- **Display Order**: Urutan tampilan yang konsisten

## Components

### DynamicImageSingle

Komponen untuk menampilkan satu gambar dengan responsive variants.

```tsx
import DynamicImageSingle from '@/components/image/DynamicImageSingle';

// Basic usage
<DynamicImageSingle
  productId="product-uuid"
  alt="Product Name"
  className="w-full h-64"
/>

// Advanced usage
<DynamicImageSingle
  productId="product-uuid"
  alt="Product Name"
  className="w-full h-64"
  rounded="xl"
  imageType="thumbnail"
  preferThumbnail={true}
  useDatabase={true}
  debug={false}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `productId` | `string` | - | **Required** Product UUID |
| `alt` | `string` | - | **Required** Alt text |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `React.CSSProperties` | `{}` | Inline styles |
| `rounded` | `string` | `''` | Border radius (xl, 2xl, etc) |
| `imageType` | `'thumbnail' \| 'gallery' \| 'hero'` | `'thumbnail'` | Image type to load |
| `preferThumbnail` | `boolean` | `false` | Use any available thumbnail |
| `useDatabase` | `boolean` | `true` | Use database as primary source |
| `debug` | `boolean` | `false` | Enable debug logging |

### DynamicImageGallery

Komponen untuk menampilkan gallery dengan navigasi dan thumbnails.

```tsx
import DynamicImageGallery from '@/components/image/DynamicImageGallery';

// Basic usage
<DynamicImageGallery
  productId="product-uuid"
  name="Product Name"
  className="w-full"
/>

// Advanced usage
<DynamicImageGallery
  productId="product-uuid"
  name="Product Name"
  className="w-full"
  autoAdvance={true}
  autoAdvanceInterval={5000}
  rounded="2xl"
  imageCount={5}
  debug={false}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `productId` | `string` | - | **Required** Product UUID |
| `name` | `string` | - | **Required** Product name for alt text |
| `className` | `string` | `''` | Additional CSS classes |
| `imageCount` | `number` | `3` | Fallback image count |
| `autoAdvance` | `boolean` | `false` | Enable auto-advance |
| `autoAdvanceInterval` | `number` | `5000` | Auto-advance interval (ms) |
| `rounded` | `string` | `'2xl'` | Border radius |
| `useDatabase` | `boolean` | `true` | Use database as primary source |
| `debug` | `boolean` | `false` | Enable debug logging |

## Data Source

Komponen menggunakan data yang diteruskan melalui **Inertia props** dari Laravel controller, bukan API endpoints. Data images sudah di-load di server-side dan diteruskan ke frontend melalui Inertia.

## Database Schema

### Image Types
- `thumbnail`: Gambar kecil untuk preview
- `gallery`: Gambar untuk detail produk
- `hero`: Gambar utama untuk banner

### Responsive Variants
- `mobile_portrait`: 4:5 aspect ratio
- `mobile_square`: 1:1 aspect ratio  
- `desktop_landscape`: 16:9 aspect ratio

## CSS Classes

### Aspect Ratios
```css
/* Mobile: 4:5 */
@media (max-width: 767px) {
  .dynamic-image-single {
    aspect-ratio: 4 / 5;
  }
}

/* Desktop: 16:9 */
@media (min-width: 768px) {
  .dynamic-image-single {
    aspect-ratio: 16 / 9;
  }
}
```

### Performance Optimizations
```css
.dynamic-image-single img {
  transform: translateZ(0); /* GPU acceleration */
  backface-visibility: hidden;
  will-change: opacity;
  transition: opacity 0.3s ease-out;
}
```

## Usage Examples

### ProductCarousel
```tsx
<DynamicImageSingle
  productId={product.id}
  alt={product.name}
  className="w-full h-full"
  rounded="xl"
  useDatabase={true}
  preferThumbnail={true}
  imageType="thumbnail"
  productImages={product.images}
/>
```

### Product Detail Page
```tsx
<DynamicImageGallery
  productId={product.id}
  name={product.name}
  className="w-full max-w-2xl"
  autoAdvance={false}
  rounded="2xl"
  productImages={product.images}
/>
```

### Admin Dashboard
```tsx
<DynamicImageSingle
  productId={product.id}
  alt={product.name}
  className="w-20 h-16"
  rounded="md"
  preferThumbnail={true}
/>
```

## Migration Notes

### From Svelte to TSX
1. ✅ Converted reactive statements to useCallback/useMemo
2. ✅ Converted stores to useState
3. ✅ Converted lifecycle to useEffect
4. ✅ Updated event handlers to React patterns

### Database Schema Updates
1. ✅ Added `image_type` column
2. ✅ Added `is_thumbnail` column  
3. ✅ Added `display_order` column
4. ✅ Updated API endpoints
5. ✅ Updated model relationships

### Performance Improvements
1. ✅ Intersection Observer for lazy loading
2. ✅ GPU acceleration for smooth transitions
3. ✅ Preloading for instant transitions
4. ✅ Memory cleanup for observers/timers

## Troubleshooting

### Images Not Loading
1. Check database has images with correct `image_type`
2. Verify API endpoints are accessible
3. Enable `debug={true}` for logging

### Transition Issues
1. Ensure CSS is imported in app.css
2. Check aspect ratios are correctly applied
3. Verify GPU acceleration is working

### Performance Issues
1. Check Intersection Observer is working
2. Verify images are being preloaded
3. Monitor memory usage for leaks
