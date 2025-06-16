<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Services\ImageOptimizationService;

/**
 * Admin Product Controller
 * 
 * Handles CRUD operations for products in the admin dashboard
 */
class ProductController extends Controller
{
    protected ImageOptimizationService $imageService;

    public function __construct(ImageOptimizationService $imageService)
    {
        $this->imageService = $imageService;
    }
    /**
     * Display a listing of products
     */
    public function index()
    {
        $products = Product::with(['primaryImage', 'categories', 'defaultUnit'])
            ->paginate(10);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products
        ]);
    }

    /**
     * Show the form for creating a new product
     */
    public function create()
    {
        $categories = Category::all();

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'categories' => 'array',
            'categories.*' => 'exists:categories,id',
            'unit_types' => 'required|array|min:1',
            'unit_types.*.label' => 'required|string|max:255',
            'unit_types.*.price' => 'required|numeric|min:0',
            'unit_types.*.is_default' => 'boolean',
            'misc_options' => 'array',
            'misc_options.*.label' => 'required|string|max:255',
            'misc_options.*.value' => 'required|string|max:255',
            'misc_options.*.is_default' => 'boolean',
            'images' => 'array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description']
        ]);

        // Attach categories
        if (isset($validated['categories'])) {
            $product->categories()->attach($validated['categories']);
        }

        // Create unit types
        foreach ($validated['unit_types'] as $index => $unitTypeData) {
            $product->unitTypes()->create([
                'label' => $unitTypeData['label'],
                'price' => $unitTypeData['price'],
                'is_default' => $unitTypeData['is_default'] ?? ($index === 0)
            ]);
        }

        // Create misc options
        if (isset($validated['misc_options'])) {
            foreach ($validated['misc_options'] as $miscOptionData) {
                $product->miscOptions()->create([
                    'label' => $miscOptionData['label'],
                    'value' => $miscOptionData['value'],
                    'is_default' => $miscOptionData['is_default'] ?? false
                ]);
            }
        }

        // Handle image uploads with optimization
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                try {
                    $filename = "product_{$product->id}_image_" . ($index + 1);
                    $imageData = $this->imageService->processProductImage($image, $filename);

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $imageData['original_path'],
                        'mobile_portrait_path' => $imageData['mobile_portrait_path'],
                        'mobile_square_path' => $imageData['mobile_square_path'],
                        'desktop_landscape_path' => $imageData['desktop_landscape_path'],
                        'alt_text' => "{$product->name} - Image " . ($index + 1),
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                        'original_file_size' => $imageData['original_file_size'],
                        'optimized_file_size' => $imageData['optimized_file_size'],
                        'image_metadata' => $imageData['image_metadata']
                    ]);
                } catch (\Exception $e) {
                    // Log error but continue with other images
                    \Log::error("Failed to process image for product {$product->id}: " . $e->getMessage());
                }
            }
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified product
     */
    public function show(Product $product)
    {
        $product->load(['images', 'unitTypes', 'miscOptions', 'categories']);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the specified product
     */
    public function edit(Product $product)
    {
        $product->load(['images', 'unitTypes', 'miscOptions', 'categories']);
        $categories = Category::all();

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'categories' => 'array',
            'categories.*' => 'exists:categories,id'
        ]);

        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description']
        ]);

        // Sync categories
        if (isset($validated['categories'])) {
            $product->categories()->sync($validated['categories']);
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product)
    {
        // Delete associated images from storage
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $publicPath = public_path("storage/images/" . basename($image->image_path));
            if (file_exists($publicPath)) {
                unlink($publicPath);
            }
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Upload additional images for a product
     */
    public function uploadImages(Request $request, Product $product)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $existingImagesCount = $product->images()->count();

        foreach ($request->file('images') as $index => $image) {
            try {
                $imageNumber = $existingImagesCount + $index + 1;
                $filename = "product_{$product->id}_image_{$imageNumber}";
                $imageData = $this->imageService->processProductImage($image, $filename);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $imageData['original_path'],
                    'mobile_portrait_path' => $imageData['mobile_portrait_path'],
                    'mobile_square_path' => $imageData['mobile_square_path'],
                    'desktop_landscape_path' => $imageData['desktop_landscape_path'],
                    'alt_text' => "{$product->name} - Image {$imageNumber}",
                    'is_primary' => $existingImagesCount === 0 && $index === 0,
                    'sort_order' => $existingImagesCount + $index,
                    'original_file_size' => $imageData['original_file_size'],
                    'optimized_file_size' => $imageData['optimized_file_size'],
                    'image_metadata' => $imageData['image_metadata']
                ]);
            } catch (\Exception $e) {
                \Log::error("Failed to process additional image for product {$product->id}: " . $e->getMessage());
            }
        }

        return back()->with('success', 'Images uploaded successfully.');
    }

    /**
     * Delete a product image
     */
    public function deleteImage(ProductImage $image)
    {
        // Delete all image variants using the service
        $imagePaths = [
            'image_path' => $image->image_path,
            'mobile_portrait_path' => $image->mobile_portrait_path,
            'mobile_square_path' => $image->mobile_square_path,
            'desktop_landscape_path' => $image->desktop_landscape_path,
        ];

        $this->imageService->deleteImageVariants($imagePaths);

        $image->delete();

        return back()->with('success', 'Image deleted successfully.');
    }

    /**
     * Set primary image
     */
    public function setPrimaryImage(ProductImage $image)
    {
        // Remove primary status from other images
        ProductImage::where('product_id', $image->product_id)
            ->update(['is_primary' => false]);

        // Set this image as primary
        $image->update(['is_primary' => true]);

        return back()->with('success', 'Primary image updated successfully.');
    }
}
