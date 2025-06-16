<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\UnitType;
use App\Models\ProductMiscOption;

class RealisticProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define realistic furniture names by category
        $furnitureByCategory = [
            'Kitchen' => [
                'Modern Kitchen Cabinet Set',
                'Scandinavian Kitchen Island',
                'Minimalist Upper Cabinet',
                'Contemporary Base Cabinet',
                'Industrial Kitchen Storage',
                'Classic Pantry Cabinet',
                'Sleek Kitchen Counter',
                'Elegant Kitchen Hutch',
                'Smart Kitchen Organizer',
                'Premium Spice Rack Cabinet'
            ],
            'Wardrobe' => [
                'Minimalist Sliding Wardrobe',
                'Classic Wooden Armoire',
                'Modern Walk-in Closet',
                'Scandinavian Wardrobe Set',
                'Contemporary Closet System',
                'Elegant Bedroom Wardrobe',
                'Industrial Style Closet',
                'Luxury Dressing Room',
                'Compact Wardrobe Solution',
                'Designer Closet Collection'
            ],
            'Living Room' => [
                'Scandinavian Dining Table',
                'Modern Coffee Table',
                'Elegant Sofa Set',
                'Contemporary TV Console',
                'Minimalist Bookshelf',
                'Classic Dining Chair Set',
                'Industrial Side Table',
                'Luxury Entertainment Unit',
                'Designer Display Cabinet',
                'Premium Lounge Collection'
            ],
            'Bedroom' => [
                'Modern Platform Bed',
                'Scandinavian Nightstand',
                'Elegant Dresser Set',
                'Contemporary Bed Frame',
                'Minimalist Bedside Table',
                'Classic Bedroom Suite',
                'Industrial Bed Design',
                'Luxury Headboard Collection',
                'Designer Bedroom Storage',
                'Premium Sleep Solution'
            ],
            'Accessories' => [
                'Premium Cabinet Handles',
                'Soft-Close Drawer Slides',
                'LED Under-Cabinet Lighting',
                'Adjustable Shelf Brackets',
                'Modern Door Hinges',
                'Elegant Knob Collection',
                'Smart Storage Solutions',
                'Designer Hardware Set',
                'Professional Installation Kit',
                'Luxury Finishing Touches'
            ]
        ];

        // Clear existing data
        Product::query()->delete();
        Category::query()->delete();

        // Create categories
        $categories = [];
        foreach ($furnitureByCategory as $categoryName => $products) {
            $categories[$categoryName] = Category::create([
                'name' => $categoryName,
                'is_accessory' => $categoryName === 'Accessories'
            ]);
        }

        // Create products for each category
        foreach ($furnitureByCategory as $categoryName => $productNames) {
            $category = $categories[$categoryName];
            
            foreach ($productNames as $productName) {
                $product = Product::create([
                    'name' => $productName,
                    'description' => $this->generateDescription($productName, $categoryName)
                ]);

                // Attach to category
                $product->categories()->attach($category->id);

                // Create unit types
                $this->createUnitTypes($product, $categoryName);

                // Create misc options
                $this->createMiscOptions($product);
            }
        }
    }

    /**
     * Generate realistic descriptions based on product name and category
     */
    private function generateDescription(string $productName, string $categoryName): string
    {
        $descriptions = [
            'Kitchen' => [
                'Crafted with premium materials for modern kitchen spaces.',
                'Designed for functionality and style in contemporary homes.',
                'Features smart storage solutions and elegant finishes.',
                'Perfect blend of durability and aesthetic appeal.',
                'Engineered for efficient kitchen organization.'
            ],
            'Wardrobe' => [
                'Spacious storage solution with modern design elements.',
                'Optimized for bedroom organization and style.',
                'Features premium materials and smooth operation.',
                'Designed for maximum storage efficiency.',
                'Contemporary design meets practical functionality.'
            ],
            'Living Room' => [
                'Elegant centerpiece for modern living spaces.',
                'Combines comfort with sophisticated design.',
                'Perfect for entertaining and daily relaxation.',
                'Crafted with attention to detail and quality.',
                'Designed to complement contemporary interiors.'
            ],
            'Bedroom' => [
                'Creates a peaceful and stylish bedroom environment.',
                'Designed for comfort and modern aesthetics.',
                'Features premium materials and elegant finishes.',
                'Perfect for contemporary bedroom spaces.',
                'Combines functionality with sophisticated design.'
            ],
            'Accessories' => [
                'Premium hardware for professional installations.',
                'Designed for durability and smooth operation.',
                'Enhances functionality and aesthetic appeal.',
                'Professional-grade quality and finish.',
                'Perfect complement to modern furniture designs.'
            ]
        ];

        $categoryDescriptions = $descriptions[$categoryName] ?? $descriptions['Living Room'];
        return fake()->randomElement($categoryDescriptions);
    }

    /**
     * Create unit types for products
     */
    private function createUnitTypes(Product $product, string $categoryName): void
    {
        $unitsByCategory = [
            'Kitchen' => ['2.4x0.6m', '3.0x0.6m', '3.6x0.6m'],
            'Wardrobe' => ['2.0x2.4m', '2.5x2.4m', '3.0x2.4m'],
            'Living Room' => ['1.2x0.6m', '1.8x0.9m', '2.4x1.2m'],
            'Bedroom' => ['1.8x2.0m', '2.0x2.0m', '2.2x2.0m'],
            'Accessories' => ['Set of 4', 'Set of 6', 'Set of 8']
        ];

        $units = $unitsByCategory[$categoryName] ?? $unitsByCategory['Living Room'];
        $basePrices = [2500000, 3500000, 4500000]; // Base prices in IDR

        foreach ($units as $index => $unit) {
            UnitType::create([
                'product_id' => $product->id,
                'label' => $unit,
                'price' => $basePrices[$index] + rand(-500000, 1000000),
                'is_default' => $index === 0
            ]);
        }
    }

    /**
     * Create misc options for products
     */
    private function createMiscOptions(Product $product): void
    {
        // Color options
        $colors = ['Natural Wood', 'White', 'Black', 'Walnut'];
        foreach ($colors as $index => $color) {
            ProductMiscOption::create([
                'product_id' => $product->id,
                'label' => 'Color',
                'value' => $color,
                'is_default' => $index === 0
            ]);
        }

        // Finish options
        $finishes = ['Matte', 'Glossy', 'Textured'];
        foreach ($finishes as $index => $finish) {
            ProductMiscOption::create([
                'product_id' => $product->id,
                'label' => 'Finish',
                'value' => $finish,
                'is_default' => $index === 0
            ]);
        }
    }
}
