<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductUploadTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic feature test example.
     */
    public function test_product_can_be_created_with_images(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $this->actingAs($user);

        // Create categories for testing
        $category1 = \App\Models\Category::factory()->create();
        $category2 = \App\Models\Category::factory()->create();

        $mobileImage = UploadedFile::fake()->image('mobile.jpg', 800, 1000);
        $desktopImage = UploadedFile::fake()->image('desktop.jpg', 1920, 1080);

        $productData = [
            'name' => 'Test Product',
            'description' => 'This is a test description.',
            'categories' => [$category1->id, $category2->id], // Use actual category IDs
            'unit_types' => [
                ['label' => 'Standard', 'price' => 100, 'is_default' => true]
            ],
            'misc_options' => [
                ['label' => 'Color', 'value' => 'Red']
            ],
            'mobile_images' => [$mobileImage],
            'desktop_images' => [$desktopImage],
        ];

        $response = $this->post(route('dashboard.products.store'), $productData);

        $response->assertRedirect(route('dashboard.products.index'));
        $response->assertSessionHas('success', 'Product created successfully.');

        // Verify product was created
        $product = \App\Models\Product::where('name', 'Test Product')->first();
        $this->assertNotNull($product);
        $this->assertEquals('Test Product', $product->name);
        $this->assertEquals('This is a test description.', $product->description);
        $this->assertEquals('test-product', $product->slug);

        // Verify categories were attached
        $this->assertTrue($product->categories->contains($category1));
        $this->assertTrue($product->categories->contains($category2));

        // Verify unit types were created
        $this->assertEquals(1, $product->unitTypes->count());
        $defaultUnitType = $product->unitTypes->where('is_default', true)->first();
        $this->assertNotNull($defaultUnitType);
        $this->assertEquals('Standard', $defaultUnitType->label);
        $this->assertEquals(100.00, $defaultUnitType->price);

        // Verify images were uploaded and processed
        $this->assertEquals(2, $product->images->count());
        
        // Check mobile image
        $mobileImage = $product->images->where('device_type', 'mobile')->first();
        $this->assertNotNull($mobileImage);
        $this->assertEquals('mobile', $mobileImage->device_type);
        Storage::disk('public')->assertExists($mobileImage->image_path);
        
        // Check desktop image
        $desktopImage = $product->images->where('device_type', 'desktop')->first();
        $this->assertNotNull($desktopImage);
        $this->assertEquals('desktop', $desktopImage->device_type);
        Storage::disk('public')->assertExists($desktopImage->image_path);
        
        // Verify image variants were created
        Storage::disk('public')->assertExists('images/product_' . $product->id . '_mobile_image_1_mobile_portrait.jpg');
        Storage::disk('public')->assertExists('images/product_' . $product->id . '_mobile_image_1_mobile_square.jpg');
        Storage::disk('public')->assertExists('images/product_' . $product->id . '_mobile_image_1_desktop_landscape.jpg');
        Storage::disk('public')->assertExists('images/product_' . $product->id . '_desktop_image_1_mobile_portrait.jpg');
        Storage::disk('public')->assertExists('images/product_' . $product->id . '_desktop_image_1_mobile_square.jpg');
        Storage::disk('public')->assertExists('images/product_' . $product->id . '_desktop_image_1_desktop_landscape.jpg');
    }
}