<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
        $products = Product::with(['images', 'categories', 'defaultUnit'])
            ->latest()
            ->paginate(15);

        // Format products data for frontend
        $formattedProducts = $products->through(function ($product) {
            // Group images by type for DynamicImageSingle
            $thumbnails = $product->images->where('image_type', 'thumbnail');
            $gallery = $product->images->where('image_type', 'gallery');
            $hero = $product->images->where('image_type', 'hero');

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'slug' => $product->slug,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
                'categories' => $product->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'is_accessory' => $category->is_accessory
                    ];
                }),
                'primary_image_url' => $product->primary_image_url,
                'thumbnail_image' => $thumbnails->first() ? [
                    'id' => $thumbnails->first()->id,
                    'image_url' => $thumbnails->first()->image_url,
                    'alt_text' => $thumbnails->first()->alt_text
                ] : null,
                'default_unit' => $product->defaultUnit ? [
                    'id' => $product->defaultUnit->id,
                    'label' => $product->defaultUnit->label,
                    'price' => $product->defaultUnit->price
                ] : null,
                'images' => [
                    'thumbnails' => $thumbnails->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'image_type' => $image->image_type,
                            'is_thumbnail' => $image->image_type === 'thumbnail',
                            'is_primary' => $image->image_type === 'thumbnail',
                            'display_order' => $image->sort_order,
                            'alt_text' => $image->alt_text,
                            'image_url' => $image->image_url,
                            'variants' => [
                                'original' => $image->image_url,
                                'mobile_portrait' => null,
                                'mobile_square' => null,
                                'desktop_landscape' => null,
                            ]
                        ];
                    })->values(),
                    'gallery' => $gallery->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'image_type' => $image->image_type,
                            'is_thumbnail' => false,
                            'is_primary' => false,
                            'display_order' => $image->sort_order,
                            'alt_text' => $image->alt_text,
                            'image_url' => $image->image_url,
                            'variants' => [
                                'original' => $image->image_url,
                                'mobile_portrait' => null,
                                'mobile_square' => null,
                                'desktop_landscape' => null,
                            ]
                        ];
                    })->values(),
                    'hero' => $hero->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'image_type' => $image->image_type,
                            'is_thumbnail' => false,
                            'is_primary' => false,
                            'display_order' => $image->sort_order,
                            'alt_text' => $image->alt_text,
                            'image_url' => $image->image_url,
                            'variants' => [
                                'original' => $image->image_url,
                                'mobile_portrait' => null,
                                'mobile_square' => null,
                                'desktop_landscape' => null,
                            ]
                        ];
                    })->values(),
                    'main_thumbnail' => $thumbnails->first() ? [
                        'id' => $thumbnails->first()->id,
                        'image_type' => $thumbnails->first()->image_type,
                        'is_thumbnail' => true,
                        'is_primary' => true,
                        'display_order' => $thumbnails->first()->sort_order,
                        'alt_text' => $thumbnails->first()->alt_text,
                        'image_url' => $thumbnails->first()->image_url,
                        'variants' => [
                            'original' => $thumbnails->first()->image_url,
                            'mobile_portrait' => null,
                            'mobile_square' => null,
                            'desktop_landscape' => null,
                        ]
                    ] : null
                ]
            ];
        });

        return Inertia::render('dashboard/products/index', [
            'products' => $formattedProducts
        ]);
    }

    /**
     * Show the form for creating a new product
     */
    public function create()
    {
        $categories = Category::withCount('products')->orderBy('name')->get();

        return Inertia::render('dashboard/products/create', [
            'categories' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'is_accessory' => $category->is_accessory,
                    'products_count' => $category->products_count
                ];
            })
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
            'mobile_images' => 'array',
            'mobile_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:30720',
            'desktop_images' => 'array',
            'desktop_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:30720'
        ]);

        // Generate unique slug
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'slug' => $slug
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

        // Handle mobile image uploads
        if ($request->hasFile('mobile_images')) {
            foreach ($request->file('mobile_images') as $index => $image) {
                try {
                    $imageNumber = $index + 1;
                    $filename = "product_{$product->id}_mobile_image_{$imageNumber}";
                    $imageData = $this->imageService->processProductImage($image, $filename);

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $imageData['original_path'],
                        'alt_text' => "{$product->name} - Mobile Image {$imageNumber}",
                        'image_type' => $index === 0 ? ProductImage::TYPE_THUMBNAIL : ProductImage::TYPE_GALLERY,
                        'sort_order' => $index,
                        'device_type' => 'mobile',
                        'aspect_ratio' => '4:5'
                    ]);
                } catch (\Exception $e) {
                    \Log::error("Failed to process mobile image for product {$product->id}: " . $e->getMessage());
                }
            }
        }

        // Handle desktop image uploads
        if ($request->hasFile('desktop_images')) {
            foreach ($request->file('desktop_images') as $index => $image) {
                try {
                    $imageNumber = $index + 1;
                    $filename = "product_{$product->id}_desktop_image_{$imageNumber}";
                    $imageData = $this->imageService->processProductImage($image, $filename);

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $imageData['original_path'],
                        'alt_text' => "{$product->name} - Desktop Image {$imageNumber}",
                        'image_type' => $index === 0 ? ProductImage::TYPE_THUMBNAIL : ProductImage::TYPE_GALLERY,
                        'sort_order' => $index,
                        'device_type' => 'desktop',
                        'aspect_ratio' => '16:9'
                    ]);
                } catch (\Exception $e) {
                    \Log::error("Failed to process desktop image for product {$product->id}: " . $e->getMessage());
                }
            }
        }

        return redirect()->route('dashboard.products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified product
     */
    public function show(Product $product)
    {
        $product->load(['images', 'unitTypes', 'miscOptions', 'categories']);

        return Inertia::render('dashboard/products/show', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the specified product
     */
    public function edit(Product $product)
    {
        $product->load(['images', 'unitTypes', 'miscOptions', 'categories']);
        $categories = Category::withCount('products')->orderBy('name')->get();

        return Inertia::render('dashboard/products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'slug' => $product->slug,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
                'categories' => $product->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'is_accessory' => $category->is_accessory
                    ];
                }),
                'unit_types' => $product->unitTypes->map(function ($unitType) {
                    return [
                        'id' => $unitType->id,
                        'label' => $unitType->label,
                        'price' => $unitType->price,
                        'is_default' => $unitType->is_default
                    ];
                }),
                'misc_options' => $product->miscOptions->map(function ($miscOption) {
                    return [
                        'id' => $miscOption->id,
                        'label' => $miscOption->label,
                        'value' => $miscOption->value,
                        'is_default' => $miscOption->is_default
                    ];
                }),
                'images' => $product->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_path' => $image->image_path,
                        'alt_text' => $image->alt_text,
                        'image_type' => $image->image_type,
                        'sort_order' => $image->sort_order
                    ];
                })
            ],
            'categories' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'is_accessory' => $category->is_accessory,
                    'products_count' => $category->products_count
                ];
            })
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
            'categories.*' => 'exists:categories,id',
            'unit_types' => 'required|array|min:1',
            'unit_types.*.id' => 'nullable|exists:unit_types,id',
            'unit_types.*.label' => 'required|string|max:255',
            'unit_types.*.price' => 'required|numeric|min:0',
            'unit_types.*.is_default' => 'boolean',
            'mobile_images' => 'array',
            'mobile_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:30720',
            'desktop_images' => 'array',
            'desktop_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:30720',
            'existing_mobile_images_order' => 'array',
            'existing_mobile_images_order.*' => 'exists:product_images,id',
            'existing_desktop_images_order' => 'array',
            'existing_desktop_images_order.*' => 'exists:product_images,id'
        ]);

        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description']
        ]);

        // Sync categories
        if (isset($validated['categories'])) {
            $product->categories()->sync($validated['categories']);
        }

        // Update unit types
        if (isset($validated['unit_types'])) {
            // Get existing unit type IDs
            $existingIds = $product->unitTypes()->pluck('id')->toArray();
            $submittedIds = array_filter(array_column($validated['unit_types'], 'id'));

            // Delete unit types that are not in the submitted data
            $toDelete = array_diff($existingIds, $submittedIds);
            if (!empty($toDelete)) {
                $product->unitTypes()->whereIn('id', $toDelete)->delete();
            }

            // Update or create unit types
            foreach ($validated['unit_types'] as $index => $unitTypeData) {
                if (isset($unitTypeData['id']) && $unitTypeData['id']) {
                    // Update existing
                    $product->unitTypes()->where('id', $unitTypeData['id'])->update([
                        'label' => $unitTypeData['label'],
                        'price' => $unitTypeData['price'],
                        'is_default' => $unitTypeData['is_default'] ?? false
                    ]);
                } else {
                    // Create new
                    $product->unitTypes()->create([
                        'label' => $unitTypeData['label'],
                        'price' => $unitTypeData['price'],
                        'is_default' => $unitTypeData['is_default'] ?? false
                    ]);
                }
            }
        }

        // Handle existing images order for mobile
        if (isset($validated['existing_mobile_images_order'])) {
            foreach ($validated['existing_mobile_images_order'] as $index => $imageId) {
                ProductImage::where('id', $imageId)
                    ->where('product_id', $product->id)
                    ->where('device_type', 'mobile')
                    ->update(['sort_order' => $index]);
            }
        }

        // Handle existing images order for desktop
        if (isset($validated['existing_desktop_images_order'])) {
            foreach ($validated['existing_desktop_images_order'] as $index => $imageId) {
                ProductImage::where('id', $imageId)
                    ->where('product_id', $product->id)
                    ->where('device_type', 'desktop')
                    ->update(['sort_order' => $index]);
            }
        }

        // Handle new mobile images
        if (isset($validated['mobile_images']) && !empty($validated['mobile_images'])) {
            $existingMobileCount = $product->images()->where('device_type', 'mobile')->count();
            
            foreach ($validated['mobile_images'] as $index => $image) {
                try {
                    $imageNumber = $existingMobileCount + $index + 1;
                    $filename = "product_{$product->id}_mobile_image_{$imageNumber}";
                    $imageData = $this->imageService->processProductImage($image, $filename);

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $imageData['original_path'],
                        'alt_text' => "{$product->name} - Mobile Image {$imageNumber}",
                        'image_type' => $existingMobileCount === 0 && $index === 0 ? ProductImage::TYPE_THUMBNAIL : ProductImage::TYPE_GALLERY,
                        'sort_order' => $existingMobileCount + $index,
                        'device_type' => 'mobile',
                        'aspect_ratio' => '4:5'
                    ]);
                } catch (\Exception $e) {
                    \Log::error("Failed to process mobile image for product {$product->id}: " . $e->getMessage());
                }
            }
        }

        // Handle new desktop images
        if (isset($validated['desktop_images']) && !empty($validated['desktop_images'])) {
            $existingDesktopCount = $product->images()->where('device_type', 'desktop')->count();
            
            foreach ($validated['desktop_images'] as $index => $image) {
                try {
                    $imageNumber = $existingDesktopCount + $index + 1;
                    $filename = "product_{$product->id}_desktop_image_{$imageNumber}";
                    $imageData = $this->imageService->processProductImage($image, $filename);

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $imageData['original_path'],
                        'alt_text' => "{$product->name} - Desktop Image {$imageNumber}",
                        'image_type' => $existingDesktopCount === 0 && $index === 0 ? ProductImage::TYPE_THUMBNAIL : ProductImage::TYPE_GALLERY,
                        'sort_order' => $existingDesktopCount + $index,
                        'device_type' => 'desktop',
                        'aspect_ratio' => '16:9'
                    ]);
                } catch (\Exception $e) {
                    \Log::error("Failed to process desktop image for product {$product->id}: " . $e->getMessage());
                }
            }
        }

        return redirect()->route('dashboard.products.index')
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

        return redirect()->route('dashboard.products.index')
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
                    'alt_text' => "{$product->name} - Image {$imageNumber}",
                    'image_type' => $existingImagesCount === 0 && $index === 0 ? ProductImage::TYPE_THUMBNAIL : ProductImage::TYPE_GALLERY,
                    'sort_order' => $existingImagesCount + $index
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
     * Set primary image (now sets as thumbnail)
     */
    public function setPrimaryImage(ProductImage $image)
    {
        // Remove thumbnail status from other images of the same product
        ProductImage::where('product_id', $image->product_id)
            ->where('image_type', ProductImage::TYPE_THUMBNAIL)
            ->update(['image_type' => ProductImage::TYPE_GALLERY]);

        // Set this image as thumbnail (primary)
        $image->update(['image_type' => ProductImage::TYPE_THUMBNAIL]);

        return back()->with('success', 'Primary image updated successfully.');
    }
}
