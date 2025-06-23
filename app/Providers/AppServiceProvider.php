<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\ImageOptimizationService::class, function ($app) {
            return new \App\Services\ImageOptimizationService;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure rate limiters
        \Illuminate\Support\Facades\RateLimiter::for('image_uploads', function ($request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many upload attempts. Please try again later.',
                        'error_type' => 'rate_limit_exceeded',
                    ], 429);
                });
        });
    }
}
