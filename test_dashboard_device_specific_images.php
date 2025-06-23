<?php

require_once 'vendor/autoload.php';

use App\Models\Product;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "📱💻 TESTING DASHBOARD DEVICE-SPECIFIC IMAGES\n";
echo "=============================================\n\n";

// Test 1: Verify Classic Dining Chair Set device-specific images
echo "🔍 TEST 1: Classic Dining Chair Set Device Images\n";
echo "-------------------------------------------------\n";

$product = Product::with(['images', 'categories', 'defaultUnit'])->find(12);

if ($product) {
    // Group images by type for DynamicImageSingle (like dashboard controller does)
    $thumbnails = $product->images->where('image_type', 'thumbnail');
    $gallery = $product->images->where('image_type', 'gallery');
    $hero = $product->images->where('image_type', 'hero');

    echo "Product: {$product->name}\n";
    echo "Total images: {$product->images->count()}\n\n";

    // Format data exactly like dashboard controller
    $dashboardData = [
        'id' => $product->id,
        'name' => $product->name,
        'images' => [
            'thumbnails' => $thumbnails->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image_type' => $image->image_type,
                    'device_type' => $image->device_type ?? 'desktop',
                    'aspect_ratio' => $image->aspect_ratio,
                    'sort_order' => $image->sort_order,
                    'alt_text' => $image->alt_text,
                    'image_url' => $image->image_url,
                ];
            })->values()->toArray(),
            'gallery' => $gallery->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image_type' => $image->image_type,
                    'device_type' => $image->device_type ?? 'desktop',
                    'aspect_ratio' => $image->aspect_ratio,
                    'sort_order' => $image->sort_order,
                    'alt_text' => $image->alt_text,
                    'image_url' => $image->image_url,
                ];
            })->values()->toArray(),
            'main_thumbnail' => $thumbnails->first() ? [
                'id' => $thumbnails->first()->id,
                'image_type' => $thumbnails->first()->image_type,
                'device_type' => $thumbnails->first()->device_type ?? 'desktop',
                'aspect_ratio' => $thumbnails->first()->aspect_ratio,
                'sort_order' => $thumbnails->first()->sort_order,
                'alt_text' => $thumbnails->first()->alt_text,
                'image_url' => $thumbnails->first()->image_url,
            ] : null,
        ],
    ];

    echo "Dashboard data structure:\n";
    echo 'Thumbnails: '.count($dashboardData['images']['thumbnails'])." images\n";
    foreach ($dashboardData['images']['thumbnails'] as $thumb) {
        echo "  - {$thumb['device_type']} (aspect: {$thumb['aspect_ratio']}): {$thumb['image_url']}\n";
    }

    echo 'Gallery: '.count($dashboardData['images']['gallery'])." images\n";
    foreach ($dashboardData['images']['gallery'] as $gallery) {
        echo "  - {$gallery['device_type']} (aspect: {$gallery['aspect_ratio']}): {$gallery['image_url']}\n";
    }

    echo 'Main thumbnail: '.($dashboardData['images']['main_thumbnail'] ? 'Available' : 'None')."\n";
    if ($dashboardData['images']['main_thumbnail']) {
        $mainThumb = $dashboardData['images']['main_thumbnail'];
        echo "  - {$mainThumb['device_type']} (aspect: {$mainThumb['aspect_ratio']}): {$mainThumb['image_url']}\n";
    }
}

echo "\n";

// Test 2: Verify DynamicImageSingle logic
echo "⚛️ TEST 2: DynamicImageSingle Logic Simulation\n";
echo "----------------------------------------------\n";

if ($product) {
    $productImages = $dashboardData['images'];

    // Separate mobile and desktop images (like DynamicImageSingle does)
    $mobileImages = [
        'thumbnails' => array_filter($productImages['thumbnails'], fn ($img) => $img['device_type'] === 'mobile'),
        'gallery' => array_filter($productImages['gallery'], fn ($img) => $img['device_type'] === 'mobile'),
        'hero' => [],
    ];

    $desktopImages = [
        'thumbnails' => array_filter($productImages['thumbnails'], fn ($img) => $img['device_type'] === 'desktop'),
        'gallery' => array_filter($productImages['gallery'], fn ($img) => $img['device_type'] === 'desktop'),
        'hero' => [],
    ];

    echo "Mobile images available:\n";
    echo '  Thumbnails: '.count($mobileImages['thumbnails'])."\n";
    echo '  Gallery: '.count($mobileImages['gallery'])."\n";
    if (count($mobileImages['thumbnails']) > 0) {
        $mobileThumb = array_values($mobileImages['thumbnails'])[0];
        echo "  Selected mobile image: {$mobileThumb['image_url']}\n";
    }

    echo "\nDesktop images available:\n";
    echo '  Thumbnails: '.count($desktopImages['thumbnails'])."\n";
    echo '  Gallery: '.count($desktopImages['gallery'])."\n";
    if (count($desktopImages['gallery']) > 0) {
        $desktopGallery = array_values($desktopImages['gallery'])[0];
        echo "  Selected desktop image: {$desktopGallery['image_url']}\n";
    }
}

echo "\n";

// Test 3: Aspect ratio verification
echo "📐 TEST 3: Aspect Ratio Verification\n";
echo "------------------------------------\n";

if ($product) {
    foreach ($product->images as $image) {
        $expectedRatio = $image->device_type === 'mobile' ? 0.8 : 1.78;
        $actualRatio = $image->aspect_ratio;
        $isCorrect = abs($actualRatio - $expectedRatio) < 0.01;

        echo "Image ID {$image->id} ({$image->device_type}):\n";
        echo "  Expected ratio: {$expectedRatio} (".($image->device_type === 'mobile' ? '4:5' : '16:9').")\n";
        echo "  Actual ratio: {$actualRatio}\n";
        echo '  Correct: '.($isCorrect ? 'Yes' : 'No')."\n\n";
    }
}

echo "🎉 DASHBOARD DEVICE-SPECIFIC IMAGES TEST COMPLETE!\n";
echo "==================================================\n";
echo "Expected behavior in dashboard:\n";
echo "- Mobile devices: Show mobile images (4:5 aspect ratio)\n";
echo "- Desktop devices: Show desktop images (16:9 aspect ratio)\n";
echo "- DynamicImageSingle should automatically select correct image based on device\n";
echo "- Images uploaded via mobile form only appear on mobile\n";
echo "- Images uploaded via desktop form only appear on desktop\n";
