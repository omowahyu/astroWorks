<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;

Route::get('/', function () {
    return Inertia::render('Homepage');
})->name('home');

Route::get('/product/{id}/purchase', [ProductController::class, 'purchase'])->name('product.purchase');

Route::post('/cart/add', [ProductController::class, 'addToCart'])->name('cart.add');

Route::post('/cart/update', [ProductController::class, 'updateCart'])->name('cart.update');

Route::get('/cart', [ProductController::class, 'cart'])->name('cart');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
