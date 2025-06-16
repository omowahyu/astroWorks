<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;

Route::get('/', function () {
    $featuredVideo = \App\Models\Video::active()->ordered()->first();

    // Get categories with their products and complete image data
    $categoriesWithProducts = \App\Models\Category::with([
        'products.thumbnailImages',
        'products.galleryImages',
        'products.heroImages',
        'products.mainThumbnail',
        'products.defaultUnit'
    ])
        ->whereHas('products') // Only categories that have products
        ->get()
        ->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'is_accessory' => $category->is_accessory,
                'products' => $category->products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'slug' => $product->slug,
                        'primary_image_url' => $product->primary_image_url,
                        'image_variants' => $product->image_variants,
                        'images' => [
                            'thumbnails' => $product->thumbnailImages->map(function ($image) {
                                return [
                                    'id' => $image->id,
                                    'image_type' => $image->image_type,
                                    'is_thumbnail' => $image->is_thumbnail,
                                    'is_primary' => $image->is_primary,
                                    'display_order' => $image->display_order,
                                    'alt_text' => $image->alt_text,
                                    'image_url' => $image->image_url,
                                    'variants' => $image->image_variants
                                ];
                            }),
                            'gallery' => $product->galleryImages->map(function ($image) {
                                return [
                                    'id' => $image->id,
                                    'image_type' => $image->image_type,
                                    'is_thumbnail' => $image->is_thumbnail,
                                    'is_primary' => $image->is_primary,
                                    'display_order' => $image->display_order,
                                    'alt_text' => $image->alt_text,
                                    'image_url' => $image->image_url,
                                    'variants' => $image->image_variants
                                ];
                            }),
                            'hero' => $product->heroImages->map(function ($image) {
                                return [
                                    'id' => $image->id,
                                    'image_type' => $image->image_type,
                                    'is_thumbnail' => $image->is_thumbnail,
                                    'is_primary' => $image->is_primary,
                                    'display_order' => $image->display_order,
                                    'alt_text' => $image->alt_text,
                                    'image_url' => $image->image_url,
                                    'variants' => $image->image_variants
                                ];
                            }),
                            'main_thumbnail' => $product->mainThumbnail ? [
                                'id' => $product->mainThumbnail->id,
                                'image_type' => $product->mainThumbnail->image_type,
                                'is_thumbnail' => $product->mainThumbnail->is_thumbnail,
                                'is_primary' => $product->mainThumbnail->is_primary,
                                'display_order' => $product->mainThumbnail->display_order,
                                'alt_text' => $product->mainThumbnail->alt_text,
                                'image_url' => $product->mainThumbnail->image_url,
                                'variants' => $product->mainThumbnail->image_variants
                            ] : null
                        ],
                        'default_unit' => $product->defaultUnit ? [
                            'label' => $product->defaultUnit->label,
                            'price' => $product->defaultUnit->price
                        ] : null
                    ];
                })
            ];
        });

    return Inertia::render('Homepage', [
        'featuredVideo' => $featuredVideo,
        'categoriesWithProducts' => $categoriesWithProducts
    ]);
})->name('home');

Route::get('/product/{id}/purchase', [ProductController::class, 'purchase'])->name('product.purchase');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');

Route::post('/cart/add', [ProductController::class, 'addToCart'])->name('cart.add');

Route::post('/cart/update', [ProductController::class, 'updateCart'])->name('cart.update');

Route::get('/cart', [ProductController::class, 'cart'])->name('cart');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        // Get dashboard data
        $productsOverview = [
            'total_products' => \App\Models\Product::count(),
            'active_products' => \App\Models\Product::count(), // All products are considered active for now
            'categories_count' => \App\Models\Category::count(),
            'recent_products' => \App\Models\Product::with('primaryImage')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'created_at' => $product->created_at,
                        'primary_image_url' => $product->primary_image_url
                    ];
                })
        ];

        $videosOverview = [
            'total_videos' => \App\Models\Video::count(),
            'active_videos' => \App\Models\Video::where('is_active', true)->count(),
            'featured_video' => \App\Models\Video::active()->ordered()->first(),
            'recent_videos' => \App\Models\Video::latest()->take(5)->get()
        ];

        return Inertia::render('dashboard', [
            'productsOverview' => $productsOverview,
            'videosOverview' => $videosOverview
        ]);
    })->name('dashboard');
});

// Product Images API Routes (JSON responses for frontend)
Route::prefix('products')->group(function () {
    Route::get('{product}/images', [App\Http\Controllers\Api\ProductImageController::class, 'getProductImages']);
    Route::get('{product}/images/{type}', [App\Http\Controllers\Api\ProductImageController::class, 'getImagesByType']);
    Route::get('{product}/thumbnail', [App\Http\Controllers\Api\ProductImageController::class, 'getMainThumbnail']);
});

// Admin routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::resource('products', App\Http\Controllers\Admin\ProductController::class);
    Route::post('products/{product}/images', [App\Http\Controllers\Admin\ProductController::class, 'uploadImages'])
        ->name('products.upload-images');
    Route::delete('images/{image}', [App\Http\Controllers\Admin\ProductController::class, 'deleteImage'])
        ->name('images.delete');
    Route::patch('images/{image}/primary', [App\Http\Controllers\Admin\ProductController::class, 'setPrimaryImage'])
        ->name('images.set-primary');

    Route::resource('videos', App\Http\Controllers\Admin\VideoController::class);
    Route::patch('videos/{video}/toggle-active', [App\Http\Controllers\Admin\VideoController::class, 'toggleActive'])
        ->name('videos.toggle-active');
    Route::post('videos/update-order', [App\Http\Controllers\Admin\VideoController::class, 'updateOrder'])
        ->name('videos.update-order');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
