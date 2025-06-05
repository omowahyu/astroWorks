<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UnitType>
 */
class UnitTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'label' => $this->faker->randomElement(['2x3m', '2.4x2.7m', '3x4m']),
            'price' => $this->faker->randomFloat(2, 1000000, 3000000),
            'is_default' => false,
        ];
    }
}
