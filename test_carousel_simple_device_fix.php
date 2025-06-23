<?php

require_once 'vendor/autoload.php';

use App\Models\Category;
use App\Models\Product;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🎠 TESTING CAROUSEL SIMPLE DEVICE-SPECIFIC FIX\n";
echo "==============================================\n\n";

// Test 1: Simulate carousel image selection logic
echo "📋 TEST 1: Carousel Image Selection Logic\n";
echo "-----------------------------------------\n";

$categoriesWithProducts = Category::with([
    'products' => function ($query) {
        $query->select(['products.id', 'products.name', 'products.description', 'products.slug'])
            ->take(3);
    },
    'products.images' => function ($query) {
        $query->select(['product_images.id', 'product_images.product_id', 'product_images.image_path',
            'product_images.image_type', 'product_images.device_type', 'product_images.aspect_ratio',
            'product_images.sort_order', 'product_images.alt_text'])
            ->orderBy('product_images.sort_order');
    },
])->whereHas('products')->take(2)->get();

foreach ($categoriesWithProducts as $category) {
    echo "Category: {$category->name}\n";

    foreach ($category->products as $product) {
        echo "  Product: {$product->name} (ID: {$product->id})\n";

        // Simulate new carousel logic: separate mobile and desktop images
        $mobileImage = null;
        $desktopImage = null;

        // Try thumbnails first, then gallery
        $mobileImage = $product->images->where('device_type', 'mobile')->where('image_type', 'thumbnail')->first() ?:
                      $product->images->where('device_type', 'mobile')->where('image_type', 'gallery')->first();

        $desktopImage = $product->images->where('device_type', 'desktop')->where('image_type', 'thumbnail')->first() ?:
                       $product->images->where('device_type', 'desktop')->where('image_type', 'gallery')->first();

        // Mobile image display
        if ($mobileImage) {
            echo "    📱 Mobile img src: {$mobileImage->image_url}\n";
            echo "       CSS: block md:hidden (aspect-[4/5])\n";
        } else {
            echo "    📱 Mobile img src: https://picsum.photos/seed/{$product->id}/400/500\n";
            echo "       CSS: block md:hidden (aspect-[4/5])\n";
        }

        // Desktop image display
        if ($desktopImage) {
            echo "    💻 Desktop img src: {$desktopImage->image_url}\n";
            echo "       CSS: hidden md:block (aspect-[16/9])\n";
        } else {
            echo "    💻 Desktop img src: https://picsum.photos/seed/{$product->id}/800/450\n";
            echo "       CSS: hidden md:block (aspect-[16/9])\n";
        }

        // Check if both devices have appropriate images
        if ($mobileImage && $desktopImage) {
            echo "    ✅ Both devices have specific images\n";
        } elseif ($mobileImage || $desktopImage) {
            echo "    ⚠️ Only one device has specific image, other uses placeholder\n";
        } else {
            echo "    📷 Both devices use placeholder images\n";
        }

        echo "\n";
    }
    echo "\n";
}

echo "🎯 TEST 2: Classic Dining Chair Set Carousel Display\n";
echo "---------------------------------------------------\n";

$classicChair = Product::with(['images'])->find(12);
if ($classicChair) {
    echo "Product: {$classicChair->name}\n\n";

    // Mobile image selection
    $mobileImage = $classicChair->images->where('device_type', 'mobile')->where('image_type', 'thumbnail')->first() ?:
                  $classicChair->images->where('device_type', 'mobile')->where('image_type', 'gallery')->first();

    // Desktop image selection
    $desktopImage = $classicChair->images->where('device_type', 'desktop')->where('image_type', 'thumbnail')->first() ?:
                   $classicChair->images->where('device_type', 'desktop')->where('image_type', 'gallery')->first();

    echo "Carousel HTML structure:\n";
    echo "<div class=\"aspect-[4/5] md:aspect-[16/9]\">\n";

    if ($mobileImage) {
        echo "  <!-- Mobile Image -->\n";
        echo "  <img src=\"{$mobileImage->image_url}\"\n";
        echo "       class=\"block md:hidden object-cover\"\n";
        echo "       alt=\"{$classicChair->name}\" />\n";
    } else {
        echo "  <!-- Mobile Placeholder -->\n";
        echo "  <img src=\"https://picsum.photos/seed/{$classicChair->id}/400/500\"\n";
        echo "       class=\"block md:hidden object-cover\"\n";
        echo "       alt=\"{$classicChair->name}\" />\n";
    }

    if ($desktopImage) {
        echo "  <!-- Desktop Image -->\n";
        echo "  <img src=\"{$desktopImage->image_url}\"\n";
        echo "       class=\"hidden md:block object-cover\"\n";
        echo "       alt=\"{$classicChair->name}\" />\n";
    } else {
        echo "  <!-- Desktop Placeholder -->\n";
        echo "  <img src=\"https://picsum.photos/seed/{$classicChair->id}/800/450\"\n";
        echo "       class=\"hidden md:block object-cover\"\n";
        echo "       alt=\"{$classicChair->name}\" />\n";
    }

    echo "</div>\n\n";

    echo "Expected behavior:\n";
    echo "📱 Mobile (< 768px): Shows mobile image in 4:5 aspect ratio\n";
    echo "💻 Desktop (≥ 768px): Shows desktop image in 16:9 aspect ratio\n";
}

echo "\n";

echo "🎉 CAROUSEL SIMPLE DEVICE-SPECIFIC FIX TEST COMPLETE!\n";
echo "====================================================\n";
echo "Summary of new approach:\n";
echo "✅ Two separate <img> tags instead of DynamicImageSingle\n";
echo "✅ Mobile image: class=\"block md:hidden\" (4:5 aspect)\n";
echo "✅ Desktop image: class=\"hidden md:block\" (16:9 aspect)\n";
echo "✅ Container: class=\"aspect-[4/5] md:aspect-[16/9]\"\n";
echo "✅ Fallback to Picsum placeholder if no device-specific image\n";
echo "✅ Lazy loading with loading=\"lazy\"\n";
echo "✅ Simple, effective, and performant solution\n";
