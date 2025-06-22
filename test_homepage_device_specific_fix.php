<?php

require_once 'vendor/autoload.php';

use App\Models\Product;
use App\Models\Category;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🏠 TESTING HOMEPAGE DEVICE-SPECIFIC IMAGE FIX\n";
echo "=============================================\n\n";

// Test 1: Simulate homepage data structure
echo "📋 TEST 1: Homepage Data Structure\n";
echo "----------------------------------\n";

// Simulate the homepage controller logic
$categoriesWithProducts = Category::with([
    'products' => function ($query) {
        $query->select(['products.id', 'products.name', 'products.description', 'products.slug'])
              ->take(6);
    },
    'products.images' => function ($query) {
        $query->select(['product_images.id', 'product_images.product_id', 'product_images.image_path', 
                       'product_images.image_type', 'product_images.device_type', 'product_images.aspect_ratio',
                       'product_images.sort_order', 'product_images.alt_text'])
              ->orderBy('product_images.sort_order');
    }
])->whereHas('products')->take(3)->get();

foreach ($categoriesWithProducts as $category) {
    echo "Category: {$category->name}\n";
    echo "Products: {$category->products->count()}\n";
    
    foreach ($category->products as $product) {
        // Group images by type and device (like DynamicImageSingle does)
        $thumbnails = $product->images->where('image_type', 'thumbnail');
        $gallery = $product->images->where('image_type', 'gallery');
        
        // Separate by device type
        $mobileImages = [
            'thumbnails' => $thumbnails->where('device_type', 'mobile'),
            'gallery' => $gallery->where('device_type', 'mobile'),
        ];
        
        $desktopImages = [
            'thumbnails' => $thumbnails->where('device_type', 'desktop'),
            'gallery' => $gallery->where('device_type', 'desktop'),
        ];

        echo "  Product: {$product->name} (ID: {$product->id})\n";
        echo "    Mobile: {$mobileImages['gallery']->count()} gallery, {$mobileImages['thumbnails']->count()} thumbnails\n";
        echo "    Desktop: {$desktopImages['gallery']->count()} gallery, {$desktopImages['thumbnails']->count()} thumbnails\n";
        
        // Simulate new carousel logic: preferThumbnail=false, imageType="gallery"
        $selectedMobileImage = null;
        if ($mobileImages['gallery']->count() > 0) {
            $selectedMobileImage = $mobileImages['gallery']->first();
            echo "    📱 Mobile will show: " . basename($selectedMobileImage->image_path) . " (gallery)\n";
        } elseif ($mobileImages['thumbnails']->count() > 0) {
            $selectedMobileImage = $mobileImages['thumbnails']->first();
            echo "    📱 Mobile will show: " . basename($selectedMobileImage->image_path) . " (thumbnail fallback)\n";
        } else {
            echo "    📱 Mobile will show: Placeholder\n";
        }
        
        $selectedDesktopImage = null;
        if ($desktopImages['gallery']->count() > 0) {
            $selectedDesktopImage = $desktopImages['gallery']->first();
            echo "    💻 Desktop will show: " . basename($selectedDesktopImage->image_path) . " (gallery)\n";
        } elseif ($desktopImages['thumbnails']->count() > 0) {
            $selectedDesktopImage = $desktopImages['thumbnails']->first();
            echo "    💻 Desktop will show: " . basename($selectedDesktopImage->image_path) . " (thumbnail fallback)\n";
        } else {
            echo "    💻 Desktop will show: Placeholder\n";
        }
        
        // Check if device-specific images are working correctly
        if ($selectedMobileImage && $selectedDesktopImage) {
            $mobileAspect = $selectedMobileImage->aspect_ratio;
            $desktopAspect = $selectedDesktopImage->aspect_ratio;
            
            $mobileCorrect = abs($mobileAspect - 0.8) < 0.01; // 4:5 = 0.8
            $desktopCorrect = abs($desktopAspect - 1.78) < 0.01; // 16:9 = 1.78
            
            echo "    ✅ Device-specific: " . ($mobileCorrect && $desktopCorrect ? 'Correct' : 'Incorrect') . "\n";
            echo "       Mobile aspect: {$mobileAspect} (expected: 0.8)\n";
            echo "       Desktop aspect: {$desktopAspect} (expected: 1.78)\n";
        }
        
        echo "\n";
    }
    echo "\n";
}

echo "🎯 TEST 2: Classic Dining Chair Set Specific Test\n";
echo "------------------------------------------------\n";

$classicChair = Product::with(['images'])->find(12);
if ($classicChair) {
    $thumbnails = $classicChair->images->where('image_type', 'thumbnail');
    $gallery = $classicChair->images->where('image_type', 'gallery');
    
    $mobileGallery = $gallery->where('device_type', 'mobile');
    $desktopGallery = $gallery->where('device_type', 'desktop');
    
    echo "Product: {$classicChair->name}\n";
    echo "Mobile gallery images: {$mobileGallery->count()}\n";
    echo "Desktop gallery images: {$desktopGallery->count()}\n\n";
    
    echo "Homepage carousel behavior (preferThumbnail=false, imageType='gallery'):\n";
    
    if ($mobileGallery->count() > 0) {
        $mobileImg = $mobileGallery->first();
        echo "📱 Mobile users will see: {$mobileImg->image_url}\n";
        echo "   Aspect ratio: {$mobileImg->aspect_ratio} (4:5)\n";
    }
    
    if ($desktopGallery->count() > 0) {
        $desktopImg = $desktopGallery->first();
        echo "💻 Desktop users will see: {$desktopImg->image_url}\n";
        echo "   Aspect ratio: {$desktopImg->aspect_ratio} (16:9)\n";
    }
}

echo "\n";

echo "🎉 HOMEPAGE DEVICE-SPECIFIC IMAGE FIX TEST COMPLETE!\n";
echo "===================================================\n";
echo "Summary of changes:\n";
echo "✅ Homepage carousel: preferThumbnail=false, imageType='gallery'\n";
echo "✅ Product detail page: preferThumbnail=false, imageType='gallery'\n";
echo "✅ Dashboard products: Already fixed previously\n";
echo "✅ Form uploads: Already using DeviceImageUpload correctly\n\n";
echo "Expected behavior:\n";
echo "📱 Mobile devices: Show mobile images (4:5 aspect ratio)\n";
echo "💻 Desktop devices: Show desktop images (16:9 aspect ratio)\n";
echo "🖼️ Device-specific uploads: Mobile form → mobile display, Desktop form → desktop display\n";
