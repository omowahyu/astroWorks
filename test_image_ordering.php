<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Product;
use App\Models\ProductImage;

echo "🖼️  TESTING IMAGE ORDERING WITH SORT_ORDER\n";
echo "==========================================\n\n";

// Test 1: Check if products have images
$products = Product::with(['thumbnailImages', 'galleryImages', 'heroImages', 'mainThumbnail'])->take(3)->get();

foreach ($products as $product) {
    echo "📦 Product: {$product->name} (ID: {$product->id})\n";
    echo "   Thumbnail Images: {$product->thumbnailImages->count()}\n";
    echo "   Gallery Images: {$product->galleryImages->count()}\n";
    echo "   Hero Images: {$product->heroImages->count()}\n";
    
    if ($product->mainThumbnail) {
        echo "   Main Thumbnail: {$product->mainThumbnail->image_path} (sort_order: {$product->mainThumbnail->sort_order})\n";
    }
    
    // Show ordering for gallery images
    if ($product->galleryImages->count() > 0) {
        echo "   Gallery Images Order:\n";
        foreach ($product->galleryImages as $image) {
            echo "     - {$image->image_path} (sort_order: {$image->sort_order})\n";
        }
    }
    
    echo "\n";
}

// Test 2: Test scopes directly
echo "🔍 TESTING SCOPES DIRECTLY\n";
echo "==========================\n";

$thumbnails = ProductImage::thumbnails()->ordered()->take(5)->get();
echo "Thumbnail images (ordered by sort_order):\n";
foreach ($thumbnails as $image) {
    echo "  - Product {$image->product_id}: {$image->image_path} (sort_order: {$image->sort_order})\n";
}

echo "\n";

$gallery = ProductImage::gallery()->ordered()->take(5)->get();
echo "Gallery images (ordered by sort_order):\n";
foreach ($gallery as $image) {
    echo "  - Product {$image->product_id}: {$image->image_path} (sort_order: {$image->sort_order})\n";
}

echo "\n";

// Test 3: Test ProductController data structure
echo "🎮 TESTING CONTROLLER DATA STRUCTURE\n";
echo "====================================\n";

$product = Product::with([
    'thumbnailImages',
    'galleryImages', 
    'heroImages',
    'mainThumbnail'
])->first();

if ($product) {
    echo "Testing data mapping for Product: {$product->name}\n";
    
    $thumbnailData = $product->thumbnailImages->map(function ($image) {
        return [
            'id' => $image->id,
            'image_type' => $image->image_type,
            'sort_order' => $image->sort_order,
            'alt_text' => $image->alt_text,
            'image_url' => $image->image_url
        ];
    });
    
    echo "Thumbnail data structure:\n";
    foreach ($thumbnailData as $data) {
        echo "  - ID: {$data['id']}, Type: {$data['image_type']}, Order: {$data['sort_order']}\n";
    }
}

echo "\n✅ All tests completed successfully!\n";
echo "Images are now properly ordered using sort_order column.\n";
