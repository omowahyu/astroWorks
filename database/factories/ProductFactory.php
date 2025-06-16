<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Realistic furniture names by category
        $furnitureNames = [
            'kitchen' => [
                'Modern Kitchen Cabinet Set',
                'Scandinavian Kitchen Island',
                'Minimalist Upper Cabinet',
                'Contemporary Base Cabinet',
                'Industrial Kitchen Storage',
                'Classic Pantry Cabinet',
                'Sleek Kitchen Counter',
                'Elegant Kitchen Hutch'
            ],
            'wardrobe' => [
                'Minimalist Sliding Wardrobe',
                'Classic Wooden Armoire',
                'Modern Walk-in Closet',
                'Scandinavian Wardrobe Set',
                'Contemporary Closet System',
                'Elegant Bedroom Wardrobe',
                'Industrial Style Closet',
                'Luxury Dressing Room'
            ],
            'living_room' => [
                'Scandinavian Dining Table',
                'Modern Coffee Table',
                'Elegant Sofa Set',
                'Contemporary TV Console',
                'Minimalist Bookshelf',
                'Classic Dining Chair Set',
                'Industrial Side Table',
                'Luxury Entertainment Unit'
            ],
            'accessories' => [
                'Premium Cabinet Handles',
                'Soft-Close Drawer Slides',
                'LED Under-Cabinet Lighting',
                'Adjustable Shelf Brackets',
                'Modern Door Hinges',
                'Elegant Knob Collection',
                'Smart Storage Solutions',
                'Designer Hardware Set'
            ]
        ];

        // Randomly select from all categories
        $allNames = array_merge(...array_values($furnitureNames));
        $name = $this->faker->randomElement($allNames);

        return [
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1000, 9999),
            'description' => $this->faker->paragraph(),
        ];
    }
}
