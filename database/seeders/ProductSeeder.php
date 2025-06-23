<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductMiscOption;
use App\Models\UnitType;
use Illuminate\Database\Seeder;

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

            // Note: No placeholder images - use only real uploaded images
        });
    }
}
