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
            // Create 1 thumbnail image
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => "images/product_{$product->id}_thumbnail.jpg",
                'alt_text' => "{$product->name} - Thumbnail",
                'is_primary' => true,
                'is_thumbnail' => true,
                'image_type' => ProductImage::TYPE_THUMBNAIL,
                'sort_order' => 0,
                'display_order' => 0
            ]);

            // Create 1 hero image
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => "images/product_{$product->id}_hero.jpg",
                'alt_text' => "{$product->name} - Hero Image",
                'is_primary' => false,
                'is_thumbnail' => false,
                'image_type' => ProductImage::TYPE_HERO,
                'sort_order' => 1,
                'display_order' => 1
            ]);

            // Create 3-5 gallery images
            $galleryCount = rand(3, 5);

            for ($i = 0; $i < $galleryCount; $i++) {
                $imageNumber = $i + 1;
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => "images/product_{$product->id}_gallery_{$imageNumber}.jpg",
                    'alt_text' => "{$product->name} - Gallery Image {$imageNumber}",
                    'is_primary' => false,
                    'is_thumbnail' => false,
                    'image_type' => ProductImage::TYPE_GALLERY,
                    'sort_order' => $i + 2, // Start after thumbnail and hero
                    'display_order' => $i + 2
                ]);
            }
        }
    }
}
