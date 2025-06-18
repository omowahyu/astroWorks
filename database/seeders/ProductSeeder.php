<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Product;
use App\Models\UnitType;
use App\Models\ProductMiscOption;
use App\Models\ProductImage;


class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::factory(10)->create()->each(function ($product) {
            // Unit Types (satu default)
            $unitTypes = UnitType::factory()->count(3)->make();
            $unitTypes[0]->is_default = true;
            $product->unitTypes()->saveMany($unitTypes);

            // Misc Options (only Warna - no more Tema)
            $colorOptions = ProductMiscOption::factory()->count(3)->make(['label' => 'Warna']);
            $colorOptions[0]->is_default = true;
            $product->miscOptions()->saveMany($colorOptions);

            // Create placeholder images
            $this->createPlaceholderImages($product);
        });
    }

    private function createPlaceholderImages($product)
    {
        // Create placeholder image URLs using a placeholder service
        $placeholderImages = [
            "https://picsum.photos/800/600?random={$product->id}1",
            "https://picsum.photos/800/600?random={$product->id}2",
            "https://picsum.photos/800/600?random={$product->id}3"
        ];

        foreach ($placeholderImages as $index => $imageUrl) {
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $imageUrl,
                'alt_text' => "{$product->name} - Image " . ($index + 1),
                'image_type' => $index === 0 ? ProductImage::TYPE_THUMBNAIL : ProductImage::TYPE_GALLERY,
                'sort_order' => $index
            ]);
        }
    }
}
