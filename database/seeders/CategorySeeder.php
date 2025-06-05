<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;


use App\Models\Category;
use App\Models\Product;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::factory()->count(5)->create();

        Product::all()->each(function ($product) use ($categories) {
            $randomCategories = $categories->random(2);
            $categoryIds = [];
            foreach ($randomCategories as $category) {
                $categoryIds[] = $category->id;
            }
            $product->categories()->attach($categoryIds);
        });
    }
}
