# Video Drag and Drop Implementation

## ✅ **Implementation Summary**

Saya telah berhasil menambahkan drag and drop functionality untuk mengatur urutan video di dashboard `/dashboard/videos`. Implementasi menggunakan `@dnd-kit` library yang modern dan accessible.

## 📦 **Dependencies Added**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Libraries Used:
- `@dnd-kit/core` - Core drag and drop functionality
- `@dnd-kit/sortable` - Sortable list implementation
- `@dnd-kit/utilities` - Utility functions for transforms

## 🔧 **Implementation Details**

### 1. **SortableVideoCard Component**
Komponen baru yang membungkus setiap video card dengan drag and drop functionality:

```typescript
function SortableVideoCard({ video, onDelete, onToggleActive, getYouTubeThumbnail }: SortableVideoCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: video.id });

    // Visual feedback saat dragging
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card className={`${isDragging ? 'opacity-50 shadow-lg' : ''} transition-all duration-200`}>
            {/* Drag Handle dengan GripVertical icon */}
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5" />
            </div>
            {/* Rest of card content */}
        </Card>
    );
}
```

### 2. **Main Component Updates**
Updated `VideosIndex` component dengan drag and drop logic:

```typescript
export default function VideosIndex({ videos }: Props) {
    const [videoList, setVideoList] = useState<Video[]>(videos.data);
    const [isUpdating, setIsUpdating] = useState(false);

    // Sensors untuk handle mouse dan keyboard
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setVideoList((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);
                
                // Update sort_order untuk semua items
                const updatedItems = newItems.map((item, index) => ({
                    ...item,
                    sort_order: index
                }));

                // Send update ke server
                updateVideoOrder(updatedItems);

                return updatedItems;
            });
        }
    };
}
```

### 3. **Server Communication**
Automatic update ke server setelah drag and drop:

```typescript
const updateVideoOrder = async (updatedVideos: Video[]) => {
    setIsUpdating(true);
    try {
        const videoData = updatedVideos.map((video, index) => ({
            id: video.id,
            sort_order: index
        }));

        await router.post('/dashboard/videos/update-order', {
            videos: videoData
        }, {
            preserveState: true,
            preserveScroll: true,
            onError: (errors) => {
                // Revert to original order on error
                setVideoList(videos.data);
            }
        });
    } catch (error) {
        // Error handling dengan revert
        setVideoList(videos.data);
    } finally {
        setIsUpdating(false);
    }
};
```

### 4. **DndContext Setup**
Wrapper untuk enable drag and drop:

```typescript
<DndContext
    sensors={sensors}
    collisionDetection={closestCenter}
    onDragEnd={handleDragEnd}
>
    <SortableContext
        items={videoList.map(video => video.id)}
        strategy={verticalListSortingStrategy}
    >
        <div className="grid gap-6">
            {videoList.map((video) => (
                <SortableVideoCard
                    key={video.id}
                    video={video}
                    onDelete={handleDelete}
                    onToggleActive={toggleActive}
                    getYouTubeThumbnail={getYouTubeThumbnail}
                />
            ))}
        </div>
    </SortableContext>
</DndContext>
```

## 🎨 **UI/UX Features**

### 1. **Visual Feedback**
- **Drag Handle**: `GripVertical` icon yang jelas untuk menunjukkan area drag
- **Cursor Changes**: `cursor-grab` → `cursor-grabbing` saat drag
- **Opacity Effect**: Item yang di-drag menjadi semi-transparent
- **Shadow Effect**: Shadow yang lebih prominent saat dragging

### 2. **Loading States**
- **Update Indicator**: "Updating video order..." message
- **Preserve State**: Tidak reload halaman saat update
- **Error Handling**: Revert ke urutan asli jika update gagal

### 3. **Accessibility**
- **Keyboard Support**: Drag and drop bisa dilakukan dengan keyboard
- **Screen Reader**: Proper ARIA attributes dari @dnd-kit
- **Focus Management**: Proper focus handling

## 🔗 **Backend Integration**

### Existing Endpoints Used:

#### 1. Update Video Order:
```php
// Route: POST /dashboard/videos/update-order
public function updateOrder(Request $request)
{
    $validated = $request->validate([
        'videos' => 'required|array',
        'videos.*.id' => 'required|exists:videos,id',
        'videos.*.sort_order' => 'required|integer|min:0'
    ]);

    foreach ($validated['videos'] as $videoData) {
        Video::where('id', $videoData['id'])
            ->update(['sort_order' => $videoData['sort_order']]);
    }

    return back()->with('success', 'Video order updated successfully.');
}
```

#### 2. Toggle Video Active Status:
```php
// Route: PATCH /dashboard/videos/{video}/toggle-active
public function toggleActive(Video $video)
{
    $video->update([
        'is_active' => !$video->is_active
    ]);

    return back()->with('success', 'Video status updated successfully.');
}
```

### ⚠️ **Fixed Issues:**
- **Method Mismatch**: Changed `router.post()` to `router.patch()` for toggle-active endpoint
- **Route Compatibility**: Ensured frontend calls match backend route definitions

## ✅ **Features Implemented**

### 1. **Drag and Drop**
- ✅ Smooth drag and drop interaction
- ✅ Visual feedback during drag
- ✅ Automatic reordering
- ✅ Real-time sort_order update

### 2. **Server Sync**
- ✅ Automatic save to database
- ✅ Optimistic UI updates
- ✅ Error handling dengan revert
- ✅ Loading states

### 3. **User Experience**
- ✅ Intuitive drag handle
- ✅ Clear visual feedback
- ✅ No page reload required
- ✅ Keyboard accessibility

### 4. **Error Handling**
- ✅ Network error handling
- ✅ Validation error handling
- ✅ Automatic revert on failure
- ✅ User feedback

## 🎯 **Usage Instructions**

1. **Navigate** to `/dashboard/videos`
2. **Drag** the grip icon (⋮⋮) on the left side of each video card
3. **Drop** to reorder videos
4. **Order updates** automatically saved to database
5. **Visual feedback** shows current operation status

## 🔧 **Technical Benefits**

- **Modern Library**: @dnd-kit is actively maintained dan accessible
- **Performance**: Optimized rendering dengan minimal re-renders
- **Accessibility**: Built-in keyboard dan screen reader support
- **Mobile Friendly**: Touch support untuk mobile devices
- **Type Safe**: Full TypeScript support

## 📱 **Responsive Design**

- **Desktop**: Full drag and drop functionality
- **Mobile**: Touch-based dragging
- **Tablet**: Optimized for touch interactions
- **Keyboard**: Full keyboard navigation support

Video management sekarang memiliki drag and drop functionality yang modern, accessible, dan user-friendly untuk mengatur urutan tampil video di homepage.
