<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
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
            'categories'
        ])->where('slug', $slug)->first();

        if (!$product) {
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
                'categories'
            ])->find($slug);
        }

        if (!$product) {
            abort(404, 'Product not found');
        }

        // Get accessory products
        $accessories = Product::whereHas('categories', function ($query) {
            $query->where('is_accessory', true);
        })->with(['defaultUnit', 'defaultMisc', 'unitTypes', 'miscOptions', 'mainThumbnail'])->get();

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
                        'sort_order' => $image->sort_order,
                        'alt_text' => $image->alt_text,
                        'image_url' => $image->image_url,
                        'variants' => $image->image_variants
                    ];
                }),
                'gallery' => $product->galleryImages->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_type' => $image->image_type,
                        'sort_order' => $image->sort_order,
                        'alt_text' => $image->alt_text,
                        'image_url' => $image->image_url,
                        'variants' => $image->image_variants
                    ];
                }),
                'hero' => $product->heroImages->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_type' => $image->image_type,
                        'sort_order' => $image->sort_order,
                        'alt_text' => $image->alt_text,
                        'image_url' => $image->image_url,
                        'variants' => $image->image_variants
                    ];
                }),
                'main_thumbnail' => $product->mainThumbnail ? [
                    'id' => $product->mainThumbnail->id,
                    'image_type' => $product->mainThumbnail->image_type,
                    'sort_order' => $product->mainThumbnail->sort_order,
                    'alt_text' => $product->mainThumbnail->alt_text,
                    'image_url' => $product->mainThumbnail->image_url,
                    'variants' => $product->mainThumbnail->image_variants
                ] : null
            ],
            'unit_types' => $product->unitTypes,
            'misc_options' => $product->miscOptions,
            'default_unit' => $product->defaultUnit,
            'default_misc' => $product->defaultMisc,
            'categories' => $product->categories
        ];

        return Inertia::render('product/Show', [
            'product' => $productData,
            'accessories' => $accessories
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
            'primaryImage'
        ])->findOrFail($id);

        // Get accessory products
        $accessories = Product::whereHas('categories', function ($query) {
            $query->where('is_accessory', true);
        })->with(['defaultUnit', 'defaultMisc', 'unitTypes', 'miscOptions', 'primaryImage'])->get();

        return Inertia::render('ProductPurchase', [
            'product' => $product,
            'accessories' => $accessories
        ]);
    }

    public function addToCart(Request $request)
    {
        $product = Product::with(['unitTypes', 'miscOptions'])->findOrFail($request->product_id);
        $unitType = $product->unitTypes()->findOrFail($request->unit_type_id);
        
        // Process accessories
        $processedAccessories = [];
        if ($request->accessories) {
            foreach ($request->accessories as $accessoryId => $accessoryData) {
                $accessory = Product::with(['defaultUnit'])->find($accessoryId);
                if ($accessory && $accessoryData['quantity'] > 0) {
                    $processedAccessories[$accessoryId] = [
                        'name' => $accessory->name,
                        'quantity' => $accessoryData['quantity'],
                        'unit_type' => [
                            'id' => $accessory->defaultUnit->id,
                            'label' => $accessory->defaultUnit->label,
                            'price' => $accessory->defaultUnit->price
                        ]
                    ];
                }
            }
        }

        $cartItem = [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_type_id' => $unitType->id,
            'unit_type_label' => $unitType->label,
            'unit_price' => (float) $unitType->price,
            'misc_options' => $request->misc_options ?? [],
            'accessories' => $processedAccessories,
            'quantity' => $request->quantity,
            'price' => $request->price
        ];

        // Store in session
        $cart = session()->get('cart', []);
        $cart[] = $cartItem;
        session()->put('cart', $cart);

        return redirect()->route('cart')->with('success', 'Produk berhasil ditambahkan ke keranjang!');
    }

    public function cart()
    {
        $cart = session()->get('cart', []);

        return Inertia::render('Cart', [
            'cart' => $cart
        ]);
    }

    public function updateCart(Request $request)
    {
        session()->put('cart', $request->cart);
        
        return response()->json(['success' => true]);
    }
}
