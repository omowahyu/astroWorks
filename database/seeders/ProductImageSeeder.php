<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductImage;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        foreach ($products as $product) {
            // Create 1 thumbnail image with Picsum URL
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => "https://picsum.photos/seed/{$product->id}-thumb/800/600",
                'alt_text' => "{$product->name} - Thumbnail",
                'image_type' => ProductImage::TYPE_THUMBNAIL,
                'device_type' => 'desktop',
                'aspect_ratio' => 1.33, // 4:3 ratio
                'sort_order' => 0
            ]);

            // Create mobile thumbnail image
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => "https://picsum.photos/seed/{$product->id}-thumb-mobile/640/800",
                'alt_text' => "{$product->name} - Mobile Thumbnail",
                'image_type' => ProductImage::TYPE_THUMBNAIL,
                'device_type' => 'mobile',
                'aspect_ratio' => 0.8, // 4:5 ratio
                'sort_order' => 0
            ]);

            // Create 1 hero image
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => "https://picsum.photos/seed/{$product->id}-hero/1200/675",
                'alt_text' => "{$product->name} - Hero Image",
                'image_type' => ProductImage::TYPE_HERO,
                'device_type' => 'desktop',
                'aspect_ratio' => 1.78, // 16:9 ratio
                'sort_order' => 1
            ]);

            // Create mobile hero image
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => "https://picsum.photos/seed/{$product->id}-hero-mobile/640/800",
                'alt_text' => "{$product->name} - Mobile Hero Image",
                'image_type' => ProductImage::TYPE_HERO,
                'device_type' => 'mobile',
                'aspect_ratio' => 0.8, // 4:5 ratio
                'sort_order' => 1
            ]);

            // Create 3-5 gallery images
            $galleryCount = rand(3, 5);

            for ($i = 0; $i < $galleryCount; $i++) {
                $imageNumber = $i + 1;
                $seed = $product->id + ($i * 100); // Different seed for each image

                // Desktop gallery image
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => "https://picsum.photos/seed/{$seed}-gallery/1200/675",
                    'alt_text' => "{$product->name} - Gallery Image {$imageNumber}",
                    'image_type' => ProductImage::TYPE_GALLERY,
                    'device_type' => 'desktop',
                    'aspect_ratio' => 1.78, // 16:9 ratio
                    'sort_order' => $i + 2 // Start after thumbnail and hero
                ]);

                // Mobile gallery image
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => "https://picsum.photos/seed/{$seed}-gallery-mobile/640/800",
                    'alt_text' => "{$product->name} - Mobile Gallery Image {$imageNumber}",
                    'image_type' => ProductImage::TYPE_GALLERY,
                    'device_type' => 'mobile',
                    'aspect_ratio' => 0.8, // 4:5 ratio
                    'sort_order' => $i + 2 // Start after thumbnail and hero
                ]);
            }
        }
    }
}
