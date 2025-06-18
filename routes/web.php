<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Cache homepage data for 10 minutes (more aggressive caching)
    $featuredVideo = \Illuminate\Support\Facades\Cache::remember('homepage.featured_video', 600, function () {
        return \App\Models\Video::active()->ordered()->first();
    });

    // Optimized query with selective fields and limited data + longer caching
    $categoriesWithProducts = \Illuminate\Support\Facades\Cache::remember('homepage.categories', 600, function () {
        return \App\Models\Category::select(['categories.id', 'categories.name', 'categories.is_accessory'])
            ->with([
                'products' => function ($query) {
                    $query->select(['products.id', 'products.name', 'products.description', 'products.slug'])
                        ->take(6); // Limit products per category for homepage
                },
                'products.thumbnailImages' => function ($query) {
                    $query->select(['product_images.id', 'product_images.product_id', 'product_images.image_path', 'product_images.alt_text', 'product_images.sort_order'])
                        ->orderBy('product_images.sort_order')
                        ->take(1); // Only first thumbnail for homepage
                },
                'products.defaultUnit' => function ($query) {
                    $query->select(['unit_types.id', 'unit_types.product_id', 'unit_types.label', 'unit_types.price']);
                },
            ])
            ->whereHas('products') // Only categories that have products
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'is_accessory' => $category->is_accessory,
                    'products' => $category->products->map(function ($product) {
                        $thumbnail = $product->thumbnailImages->first();

                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'description' => $product->description,
                            'slug' => $product->slug,
                            'primary_image_url' => $product->primary_image_url,
                            'images' => [
                                'thumbnails' => $thumbnail ? [[
                                    'id' => $thumbnail->id,
                                    'image_url' => $thumbnail->image_url,
                                    'alt_text' => $thumbnail->alt_text,
                                ]] : [],
                                'gallery' => [], // Not needed for homepage
                                'hero' => [], // Not needed for homepage
                                'main_thumbnail' => $thumbnail ? [
                                    'id' => $thumbnail->id,
                                    'image_url' => $thumbnail->image_url,
                                    'alt_text' => $thumbnail->alt_text,
                                ] : null,
                            ],
                            'default_unit' => $product->defaultUnit ? [
                                'label' => $product->defaultUnit->label,
                                'price' => $product->defaultUnit->price,
                            ] : null,
                        ];
                    }),
                ];
            });
    });

    return Inertia::render('public/homepage', [
        'featuredVideo' => $featuredVideo,
        'categories' => $categoriesWithProducts,
    ]);
})->name('home');

Route::get('/company', function () {
    return Inertia::render('public/company');
})->name('company');

Route::get('/product/{id}/purchase', [ProductController::class, 'purchase'])->name('product.purchase');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');

Route::post('/add-to-cart', [ProductController::class, 'addToCart'])->name('cart.add');

Route::post('/update-cart', [ProductController::class, 'updateCart'])->name('cart.update');

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
                        'primary_image_url' => $product->primary_image_url,
                    ];
                }),
        ];

        $videosOverview = [
            'total_videos' => \App\Models\Video::count(),
            'active_videos' => \App\Models\Video::where('is_active', true)->count(),
            'featured_video' => \App\Models\Video::active()->ordered()->first(),
            'recent_videos' => \App\Models\Video::latest()->take(5)->get(),
        ];

        return Inertia::render('dashboard/index', [
            'productsOverview' => $productsOverview,
            'videosOverview' => $videosOverview,
        ]);
    })->name('dashboard');
});

// Product Images API Routes (JSON responses for frontend) - TODO: Implement ProductImageController
// Route::prefix('products')->group(function () {
//     Route::get('{product}/images', [App\Http\Controllers\Api\ProductImageController::class, 'getProductImages']);
//     Route::get('{product}/images/{type}', [App\Http\Controllers\Api\ProductImageController::class, 'getImagesByType']);
//     Route::get('{product}/thumbnail', [App\Http\Controllers\Api\ProductImageController::class, 'getMainThumbnail']);
// });

// Dashboard management routes
Route::prefix('dashboard')->name('dashboard.')->middleware(['auth', 'verified'])->group(function () {
    // Categories management
    Route::resource('categories', App\Http\Controllers\Admin\CategoryController::class);

    // Products management
    Route::resource('products', App\Http\Controllers\Admin\ProductController::class);
    Route::post('products/{product}/images', [App\Http\Controllers\Admin\ProductController::class, 'uploadImages'])
        ->name('products.upload-images');
    Route::delete('images/{image}', [App\Http\Controllers\Admin\ProductController::class, 'deleteImage'])
        ->name('images.delete');
    Route::patch('images/{image}/primary', [App\Http\Controllers\Admin\ProductController::class, 'setPrimaryImage'])
        ->name('images.set-primary');

    // Videos management
    Route::resource('videos', App\Http\Controllers\Admin\VideoController::class);
    Route::patch('videos/{video}/toggle-active', [App\Http\Controllers\Admin\VideoController::class, 'toggleActive'])
        ->name('videos.toggle-active');
    Route::post('videos/update-order', [App\Http\Controllers\Admin\VideoController::class, 'updateOrder'])
        ->name('videos.update-order');

    // Payment settings management
    Route::get('payment', [App\Http\Controllers\Admin\PaymentSettingController::class, 'index'])
        ->name('payment.index');
    Route::patch('payment', [App\Http\Controllers\Admin\PaymentSettingController::class, 'update'])
        ->name('payment.update');

    // Image Upload Routes with Compression
    Route::prefix('images')->name('images.')->group(function () {
        Route::post('upload', [App\Http\Controllers\Admin\ImageUploadController::class, 'uploadDeviceImages'])->name('upload');
        Route::post('analyze', [App\Http\Controllers\Admin\ImageUploadController::class, 'analyzeImage'])->name('analyze');
        Route::post('compression-preview', [App\Http\Controllers\Admin\ImageUploadController::class, 'getCompressionPreview'])->name('compression-preview');
        Route::get('compression-levels', [App\Http\Controllers\Admin\ImageUploadController::class, 'getCompressionLevels'])->name('compression-levels');
        Route::delete('delete', [App\Http\Controllers\Admin\ImageUploadController::class, 'deleteImage'])->name('delete');
        Route::get('stats', [App\Http\Controllers\Admin\ImageUploadController::class, 'getUploadStats'])->name('stats');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
