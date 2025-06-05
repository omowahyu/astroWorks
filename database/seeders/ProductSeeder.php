<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Product;
use App\Models\UnitType;
use App\Models\ProductMiscOption;


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

            // Misc Options (label: Tema, Warna)
            foreach (['Tema', 'Warna'] as $label) {
                $values = ProductMiscOption::factory()->count(2)->make(['label' => $label]);
                $values[0]->is_default = true;
                $product->miscOptions()->saveMany($values);
            }
        });
    }
}
