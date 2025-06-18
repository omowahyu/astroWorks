<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductMiscOption>
 */
class ProductMiscOptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'label' => 'Warna', // Only use Warna, no more Tema
            'value' => $this->faker->randomElement(['Hitam', 'Putih', 'Coklat', 'Natural Wood', 'Walnut']),
            'is_default' => false,
        ];
    }
}
