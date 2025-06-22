<?php

require_once 'vendor/autoload.php';

use App\Models\Product;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔧 TESTING DASHBOARD IMAGE SELECTION FIX\n";
echo "========================================\n\n";

// Test the new dashboard settings: preferThumbnail=false, imageType="gallery"
echo "📋 TEST: Dashboard Image Selection Logic\n";
echo "----------------------------------------\n";

$product = Product::with(['images'])->find(12);

if ($product) {
    // Group images by type and device (like DynamicImageSingle does)
    $thumbnails = $product->images->where('image_type', 'thumbnail');
    $gallery = $product->images->where('image_type', 'gallery');
    
    // Separate by device type
    $mobileImages = [
        'thumbnails' => $thumbnails->where('device_type', 'mobile')->values(),
        'gallery' => $gallery->where('device_type', 'mobile')->values(),
        'hero' => collect([])
    ];

    $desktopImages = [
        'thumbnails' => $thumbnails->where('device_type', 'desktop')->values(),
        'gallery' => $gallery->where('device_type', 'desktop')->values(),
        'hero' => collect([])
    ];

    echo "Product: {$product->name}\n";
    echo "Total images: {$product->images->count()}\n\n";

    echo "Available images by device:\n";
    echo "Mobile:\n";
    echo "  - Thumbnails: " . count($mobileImages['thumbnails']) . "\n";
    echo "  - Gallery: " . count($mobileImages['gallery']) . "\n";
    
    echo "Desktop:\n";
    echo "  - Thumbnails: " . count($desktopImages['thumbnails']) . "\n";
    echo "  - Gallery: " . count($desktopImages['gallery']) . "\n\n";

    // Simulate DynamicImageSingle logic with new settings:
    // preferThumbnail=false, imageType="gallery"
    
    echo "DynamicImageSingle selection logic (preferThumbnail=false, imageType='gallery'):\n";
    
    // Mobile image selection
    $selectedMobileImage = null;
    if ($mobileImages['gallery']->count() > 0) {
        $selectedMobileImage = $mobileImages['gallery']->first(); // First gallery image
        echo "✅ Mobile: Selected gallery image - " . basename($selectedMobileImage->image_path) . "\n";
    } elseif ($mobileImages['thumbnails']->count() > 0) {
        $selectedMobileImage = $mobileImages['thumbnails']->first(); // Fallback to thumbnail
        echo "⚠️ Mobile: Fallback to thumbnail - " . basename($selectedMobileImage->image_path) . "\n";
    } else {
        echo "❌ Mobile: No image available\n";
    }

    // Desktop image selection
    $selectedDesktopImage = null;
    if ($desktopImages['gallery']->count() > 0) {
        $selectedDesktopImage = $desktopImages['gallery']->first(); // First gallery image
        echo "✅ Desktop: Selected gallery image - " . basename($selectedDesktopImage->image_path) . "\n";
    } elseif ($desktopImages['thumbnails']->count() > 0) {
        $selectedDesktopImage = $desktopImages['thumbnails']->first(); // Fallback to thumbnail
        echo "⚠️ Desktop: Fallback to thumbnail - " . basename($selectedDesktopImage->image_path) . "\n";
    } else {
        echo "❌ Desktop: No image available\n";
    }

    echo "\nExpected dashboard behavior:\n";
    if ($selectedMobileImage) {
        echo "📱 Mobile users will see: {$selectedMobileImage->image_url}\n";
        echo "   Aspect ratio: {$selectedMobileImage->aspect_ratio} (4:5)\n";
    }
    if ($selectedDesktopImage) {
        echo "💻 Desktop users will see: {$selectedDesktopImage->image_url}\n";
        echo "   Aspect ratio: {$selectedDesktopImage->aspect_ratio} (16:9)\n";
    }
}

echo "\n";

// Test with other products to ensure consistency
echo "🔍 TEST: Other Products Consistency\n";
echo "-----------------------------------\n";

$otherProducts = Product::with(['images'])->where('id', '!=', 12)->take(3)->get();

foreach ($otherProducts as $product) {
    $thumbnails = $product->images->where('image_type', 'thumbnail');
    $gallery = $product->images->where('image_type', 'gallery');
    
    $mobileGallery = $gallery->where('device_type', 'mobile')->count();
    $desktopGallery = $gallery->where('device_type', 'desktop')->count();
    $mobileThumbnails = $thumbnails->where('device_type', 'mobile')->count();
    $desktopThumbnails = $thumbnails->where('device_type', 'desktop')->count();
    
    echo "Product: {$product->name} (ID: {$product->id})\n";
    echo "  Mobile: {$mobileGallery} gallery, {$mobileThumbnails} thumbnails\n";
    echo "  Desktop: {$desktopGallery} gallery, {$desktopThumbnails} thumbnails\n";
    
    // Check if this product will have images on both devices
    $hasMobileImage = $mobileGallery > 0 || $mobileThumbnails > 0;
    $hasDesktopImage = $desktopGallery > 0 || $desktopThumbnails > 0;
    
    if ($hasMobileImage && $hasDesktopImage) {
        echo "  ✅ Will show device-specific images\n";
    } elseif ($hasMobileImage || $hasDesktopImage) {
        echo "  ⚠️ Will show images on one device only\n";
    } else {
        echo "  📷 Will show placeholder images\n";
    }
    echo "\n";
}

echo "🎉 DASHBOARD IMAGE SELECTION FIX TEST COMPLETE!\n";
echo "===============================================\n";
echo "Summary of changes:\n";
echo "- Changed preferThumbnail from true to false\n";
echo "- Changed imageType from 'thumbnail' to 'gallery'\n";
echo "- This ensures both mobile and desktop get appropriate images\n";
echo "- Gallery images are prioritized over thumbnails\n";
echo "- Device-specific images are properly selected\n";
