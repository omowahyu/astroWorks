# Unified Image Management System

## Overview

The Unified Image Management System provides a comprehensive solution for managing product images in the dashboard edit page. It consolidates existing images and new uploads into a single, intuitive interface that allows users to see all images together while maintaining clear visual distinctions between different image states.

## Features

### ✅ **Unified Image Preview Section**
- **Single Interface**: All images (existing and new) are displayed in one cohesive preview area
- **Device Separation**: Clear separation between mobile (4:5) and desktop (16:9) images
- **Dual View Modes**: 
  - **Unified View**: Stacked sections for mobile and desktop images
  - **Separated View**: Traditional side-by-side layout

### ✅ **Reference and Comparison**
- **Visual Context**: Users can see existing images while uploading new ones
- **Consistency Checking**: Easy to maintain visual consistency across image sets
- **Side-by-side Comparison**: Compare existing and new images in the same interface

### ✅ **Replace Functionality**
- **Delete Existing**: Remove existing images directly from the preview
- **Restore Deleted**: Undo deletion before saving (marked for deletion)
- **Immediate Feedback**: Visual indicators show which images will be deleted

### ✅ **Clear Visual Distinction**
- **State Badges**: 
  - 🟢 **"Saved"** - Existing images in database
  - 🔵 **"New"** - Newly uploaded images pending save
  - 🔴 **"Deleted"** - Existing images marked for deletion
- **Border Colors**: Different border colors for each state
- **Opacity Effects**: Deleted images shown with reduced opacity

### ✅ **Improved UX**
- **Drag & Drop**: Upload new images by dragging to device-specific areas
- **Compression Options**: Built-in image compression with quality settings
- **Summary Statistics**: Real-time count of saved, new, and deleted images
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Component Architecture

### UnifiedImageManager Component

**Location**: `resources/js/components/image/unified-image-manager.tsx`

**Key Props**:
```typescript
interface UnifiedImageManagerProps {
    existingImages: ExistingImage[];           // Images from database
    onMobileUpload: (files: FileList) => void; // Handle mobile uploads
    onDesktopUpload: (files: FileList) => void; // Handle desktop uploads
    onDeleteExisting: (imageId: number) => void; // Mark existing for deletion
    onRestoreExisting: (imageId: number) => void; // Restore deleted image
    newMobileImages: NewImagePreview[];        // New mobile uploads
    newDesktopImages: NewImagePreview[];       // New desktop uploads
    onRemoveNewImage: (id: string, type: 'mobile' | 'desktop') => void;
    deletedImageIds?: number[];                // IDs marked for deletion
    // ... other configuration props
}
```

### Image State Management

**Three Image States**:
1. **`existing`** - Images already saved in database
2. **`new`** - Newly uploaded images pending save
3. **`deleted`** - Existing images marked for deletion

**State Transitions**:
- `existing` → `deleted` (via delete button)
- `deleted` → `existing` (via restore button)
- `new` → removed (via remove button)

## Backend Integration

### Controller Updates

**File**: `app/Http/Controllers/Admin/ProductController.php`

**New Validation Rules**:
```php
'deleted_image_ids' => 'array',
'deleted_image_ids.*' => 'exists:product_images,id'
```

**Delete Handling**:
```php
// Handle deleted images
if (isset($validated['deleted_image_ids']) && !empty($validated['deleted_image_ids'])) {
    foreach ($validated['deleted_image_ids'] as $imageId) {
        $image = ProductImage::where('id', $imageId)
            ->where('product_id', $product->id)
            ->first();
        
        if ($image) {
            // Delete physical file if it exists
            if (!filter_var($image->image_path, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($image->image_path);
                $publicPath = public_path("storage/images/" . basename($image->image_path));
                if (file_exists($publicPath)) {
                    unlink($publicPath);
                }
            }
            
            // Delete database record
            $image->delete();
        }
    }
}
```

### Form Data Structure

**Frontend Form Data**:
```typescript
interface ProductFormData {
    // ... existing fields
    deleted_image_ids: number[];  // New field for tracking deletions
}
```

**Submission Data**:
- `mobile_images`: New mobile image files
- `desktop_images`: New desktop image files  
- `deleted_image_ids`: Array of existing image IDs to delete
- `existing_mobile_images_order`: Order of remaining mobile images
- `existing_desktop_images_order`: Order of remaining desktop images

## Usage Example

### In Product Edit Page

```tsx
<UnifiedImageManager
    existingImages={product.images || []}
    onMobileUpload={handleMobileUpload}
    onDesktopUpload={handleDesktopUpload}
    onDeleteExisting={handleDeleteExisting}
    onRestoreExisting={handleRestoreExisting}
    newMobileImages={imagesPreviews.mobile.filter(img => !img.existing_id)}
    newDesktopImages={imagesPreviews.desktop.filter(img => !img.existing_id)}
    onRemoveNewImage={removeImage}
    maxFiles={10}
    disabled={processing}
    showCompressionOptions={true}
    defaultCompressionLevel="moderate"
    deletedImageIds={deletedImageIds}
/>
```

### Event Handlers

```tsx
const handleDeleteExisting = (imageId: number) => {
    setDeletedImageIds(prev => [...prev, imageId]);
    setData('deleted_image_ids', [...deletedImageIds, imageId]);
};

const handleRestoreExisting = (imageId: number) => {
    const newDeletedIds = deletedImageIds.filter(id => id !== imageId);
    setDeletedImageIds(newDeletedIds);
    setData('deleted_image_ids', newDeletedIds);
};
```

## Visual Design

### State Indicators

**Badges**:
- **Saved**: Gray badge with "Saved" text
- **New**: Green badge with "New" text  
- **Deleted**: Red badge with "Deleted" text

**Border Colors**:
- **Existing**: Gray border (`border-gray-200`)
- **New**: Green border (`border-green-300`)
- **Deleted**: Red border with opacity (`border-red-300 opacity-50`)

**Action Buttons**:
- **Delete**: Red trash icon for existing images
- **Restore**: Gray rotate icon for deleted images
- **Remove**: Red X icon for new images

### Layout Modes

**Unified View**:
- Mobile images section on top
- Desktop images section below
- Large grid layout (up to 6 columns)
- Prominent upload areas

**Separated View**:
- Side-by-side columns
- Mobile on left, desktop on right
- Compact grid layout
- Smaller upload areas

## Benefits

### For Users
1. **Single Source of Truth**: All images visible in one place
2. **Visual Context**: See existing images while uploading new ones
3. **Mistake Prevention**: Restore accidentally deleted images
4. **Clear Feedback**: Understand exactly what will happen on save

### For Developers
1. **Unified Component**: Single component handles all image management
2. **Clear State Management**: Well-defined image states and transitions
3. **Flexible Layout**: Multiple view modes for different use cases
4. **Extensible**: Easy to add new features or image types

### For Maintenance
1. **Consolidated Logic**: All image management in one place
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Consistent UX**: Same patterns across all image management features
4. **Easy Testing**: Clear component boundaries and state management

## Migration Notes

### From Previous Implementation
- **Replaced**: `DeviceImageUpload` component with `UnifiedImageManager`
- **Enhanced**: Added delete/restore functionality for existing images
- **Improved**: Better visual feedback and state management
- **Maintained**: All existing upload and compression features

### Backward Compatibility
- **API**: All existing backend endpoints remain unchanged
- **Data**: No database schema changes required
- **Functionality**: All previous features are preserved and enhanced

## Future Enhancements

### Potential Additions
1. **Drag Reordering**: Drag and drop to reorder images
2. **Bulk Operations**: Select multiple images for batch operations
3. **Image Editing**: Basic crop/resize functionality
4. **Preview Modal**: Full-size image preview with navigation
5. **Metadata Editing**: Edit alt text and other image properties inline

This unified system provides a much more intuitive and powerful image management experience while maintaining all the robustness and features of the previous implementation.
