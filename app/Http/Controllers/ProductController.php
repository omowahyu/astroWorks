<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show($slug)
    {
        $product = Product::with([
            'thumbnailImages',
            'galleryImages',
            'heroImages',
            'mainThumbnail',
            'unitTypes',
            'miscOptions',
            'defaultUnit',
            'defaultMisc',
            'categories',
        ])->where('slug', $slug)->first();

        if (! $product) {
            // Try to find by ID if slug doesn't work
            $product = Product::with([
                'thumbnailImages',
                'galleryImages',
                'heroImages',
                'mainThumbnail',
                'unitTypes',
                'miscOptions',
                'defaultUnit',
                'defaultMisc',
                'categories',
            ])->find($slug);
        }

        if (! $product) {
            abort(404, 'Product not found');
        }

        // Get accessory products with complete image data
        $accessories = Product::whereHas('categories', function ($query) {
            $query->where('is_accessory', true);
        })->with([
            'defaultUnit',
            'defaultMisc',
            'unitTypes',
            'miscOptions',
            'mainThumbnail',
            'thumbnailImages',
            'primaryImage',
        ])->get()->map(function ($accessory) {
            return [
                'id' => $accessory->id,
                'name' => $accessory->name,
                'description' => $accessory->description,
                'slug' => $accessory->slug,
                'primary_image_url' => $accessory->primary_image_url,
                'images' => [
                    'thumbnails' => $accessory->thumbnailImages->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'image_url' => $image->image_url,
                            'alt_text' => $image->alt_text,
                        ];
                    }),
                    'main_thumbnail' => $accessory->mainThumbnail ? [
                        'id' => $accessory->mainThumbnail->id,
                        'image_url' => $accessory->mainThumbnail->image_url,
                        'alt_text' => $accessory->mainThumbnail->alt_text,
                    ] : null,
                ],
                'default_unit' => $accessory->defaultUnit ? [
                    'id' => $accessory->defaultUnit->id,
                    'label' => $accessory->defaultUnit->label,
                    'price' => $accessory->defaultUnit->price,
                ] : null,
                'unit_types' => $accessory->unitTypes,
                'misc_options' => $accessory->miscOptions,
            ];
        });

        // Format product data with complete image information
        $productData = [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'slug' => $product->slug,
            'images' => [
                'thumbnails' => $product->thumbnailImages->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_type' => $image->image_type,
                        'device_type' => $image->device_type ?? 'desktop',
                        'aspect_ratio' => $image->aspect_ratio,
                        'image_dimensions' => $image->image_dimensions,
                        'sort_order' => $image->sort_order,
                        'alt_text' => $image->alt_text,
                        'image_url' => $image->image_url,
                        'variants' => $image->image_variants,
                    ];
                }),
                'gallery' => $product->galleryImages->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_type' => $image->image_type,
                        'device_type' => $image->device_type ?? 'desktop',
                        'aspect_ratio' => $image->aspect_ratio,
                        'image_dimensions' => $image->image_dimensions,
                        'sort_order' => $image->sort_order,
                        'alt_text' => $image->alt_text,
                        'image_url' => $image->image_url,
                        'variants' => $image->image_variants,
                    ];
                }),
                'hero' => $product->heroImages->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_type' => $image->image_type,
                        'device_type' => $image->device_type ?? 'desktop',
                        'aspect_ratio' => $image->aspect_ratio,
                        'image_dimensions' => $image->image_dimensions,
                        'sort_order' => $image->sort_order,
                        'alt_text' => $image->alt_text,
                        'image_url' => $image->image_url,
                        'variants' => $image->image_variants,
                    ];
                }),
                'main_thumbnail' => $product->mainThumbnail ? [
                    'id' => $product->mainThumbnail->id,
                    'image_type' => $product->mainThumbnail->image_type,
                    'device_type' => $product->mainThumbnail->device_type ?? 'desktop',
                    'aspect_ratio' => $product->mainThumbnail->aspect_ratio,
                    'image_dimensions' => $product->mainThumbnail->image_dimensions,
                    'sort_order' => $product->mainThumbnail->sort_order,
                    'alt_text' => $product->mainThumbnail->alt_text,
                    'image_url' => $product->mainThumbnail->image_url,
                    'variants' => $product->mainThumbnail->image_variants,
                ] : null,
            ],
            'unit_types' => $product->unitTypes,
            'misc_options' => $product->miscOptions,
            'default_unit' => $product->defaultUnit,
            'default_misc' => $product->defaultMisc,
            'categories' => $product->categories,
        ];

        return Inertia::render('product/[slug]', [
            'product' => $productData,
            'accessories' => $accessories,
        ]);
    }

    public function purchase($id)
    {
        $product = Product::with([
            'unitTypes',
            'miscOptions',
            'defaultUnit',
            'defaultMisc',
            'images',
            'primaryImage',
        ])->findOrFail($id);

        // Get accessory products
        $accessories = Product::whereHas('categories', function ($query) {
            $query->where('is_accessory', true);
        })->with(['defaultUnit', 'defaultMisc', 'unitTypes', 'miscOptions', 'primaryImage'])->get();

        return Inertia::render('public/product-purchase', [
            'product' => $product,
            'accessories' => $accessories,
        ]);
    }

    public function addToCart(Request $request)
    {
        // Validate the cart batch data
        $request->validate([
            'batch_id' => 'required',
            'batch_name' => 'required|string',
            'main_product' => 'required|array',
            'main_product.product_id' => 'required|exists:products,id',
            'main_product.unit_type_id' => 'required|exists:unit_types,id',
            'main_product.quantity' => 'required|integer|min:1',
            'accessories' => 'array',
            'batch_total' => 'required|numeric|min:0',
        ]);

        // Create cart batch structure
        $cartBatch = [
            'batch_id' => $request->batch_id,
            'batch_name' => $request->batch_name,
            'main_product' => $request->main_product,
            'accessories' => $request->accessories ?? [],
            'batch_total' => $request->batch_total,
            'created_at' => now()->toISOString(),
        ];

        // Get existing cart from session
        $cart = session()->get('cart', []);

        // Add new batch to cart
        $cart[] = $cartBatch;

        // Store updated cart in session
        session()->put('cart', $cart);

        return redirect()->route('cart')->with('success', 'Produk berhasil ditambahkan ke keranjang!');
    }

    public function cart()
    {
        $cart = session()->get('cart', []);

        return Inertia::render('cart', [
            'cart' => $cart,
        ]);
    }

    public function updateCart(Request $request)
    {
        $cart = $request->input('cart', []);
        session()->put('cart', $cart);

        return response()->json(['success' => true]);
    }
}
