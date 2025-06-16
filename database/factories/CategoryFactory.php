<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            ['name' => 'Kitchen', 'is_accessory' => false],
            ['name' => 'Wardrobe', 'is_accessory' => false],
            ['name' => 'Living Room', 'is_accessory' => false],
            ['name' => 'Bedroom', 'is_accessory' => false],
            ['name' => 'Accessories', 'is_accessory' => true],
        ];

        $selected = $this->faker->randomElement($categories);

        return [
            'name' => $selected['name'],
            'is_accessory' => $selected['is_accessory'],
        ];
    }
}
