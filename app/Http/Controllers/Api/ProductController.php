<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with([
            'thumbnailImages',
            'mainThumbnail',
            'defaultUnit',
            'categories'
        ]);

        // Apply filters if provided
        if ($request->has('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    /**
     * Display the specified product by slug
     */
    public function show(string $slug): JsonResponse
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
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
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
            'galleryImages',
            'heroImages',
            'primaryImage'
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
                            'image_type' => $image->image_type,
                            'device_type' => $image->device_type ?? 'desktop',
                            'aspect_ratio' => $image->aspect_ratio,
                            'sort_order' => $image->sort_order,
                            'image_url' => $image->image_url,
                            'alt_text' => $image->alt_text,
                            'variants' => $image->image_variants
                        ];
                    }),
                    'gallery' => $accessory->galleryImages->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'image_type' => $image->image_type,
                            'device_type' => $image->device_type ?? 'desktop',
                            'aspect_ratio' => $image->aspect_ratio,
                            'sort_order' => $image->sort_order,
                            'image_url' => $image->image_url,
                            'alt_text' => $image->alt_text,
                            'variants' => $image->image_variants
                        ];
                    }),
                    'hero' => $accessory->heroImages->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'image_type' => $image->image_type,
                            'device_type' => $image->device_type ?? 'desktop',
                            'aspect_ratio' => $image->aspect_ratio,
                            'sort_order' => $image->sort_order,
                            'image_url' => $image->image_url,
                            'alt_text' => $image->alt_text,
                            'variants' => $image->image_variants
                        ];
                    }),
                    'main_thumbnail' => $accessory->mainThumbnail ? [
                        'id' => $accessory->mainThumbnail->id,
                        'image_type' => $accessory->mainThumbnail->image_type,
                        'device_type' => $accessory->mainThumbnail->device_type ?? 'desktop',
                        'aspect_ratio' => $accessory->mainThumbnail->aspect_ratio,
                        'sort_order' => $accessory->mainThumbnail->sort_order,
                        'image_url' => $accessory->mainThumbnail->image_url,
                        'alt_text' => $accessory->mainThumbnail->alt_text,
                        'variants' => $accessory->mainThumbnail->image_variants
                    ] : null
                ],
                'unit_types' => $accessory->unitTypes,
                'misc_options' => $accessory->miscOptions,
                'default_unit' => $accessory->defaultUnit,
                'default_misc' => $accessory->defaultMisc
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
                        'variants' => $image->image_variants
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
                        'variants' => $image->image_variants
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
                        'variants' => $image->image_variants
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
                    'variants' => $product->mainThumbnail->image_variants
                ] : null
            ],
            'unit_types' => $product->unitTypes,
            'misc_options' => $product->miscOptions,
            'default_unit' => $product->defaultUnit,
            'default_misc' => $product->defaultMisc,
            'categories' => $product->categories
        ];

        return response()->json([
            'success' => true,
            'data' => $productData,
            'accessories' => $accessories
        ]);
    }
}
