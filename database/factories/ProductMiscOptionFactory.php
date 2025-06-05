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
            'label' => $this->faker->randomElement(['Tema', 'Warna']),
            'value' => $this->faker->randomElement(['Hitam', 'Putih', 'Coklat', 'Skandinavian']),
            'is_default' => false,
        ];
    }
}
