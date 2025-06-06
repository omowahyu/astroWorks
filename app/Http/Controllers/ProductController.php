<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function purchase($id)
    {
        $product = Product::with([
            'unitTypes',
            'miscOptions',
            'defaultUnit',
            'defaultMisc'
        ])->findOrFail($id);

        // Get accessory products
        $accessories = Product::whereHas('categories', function ($query) {
            $query->where('is_accessory', true);
        })->with(['defaultUnit', 'defaultMisc', 'unitTypes', 'miscOptions'])->get();

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
