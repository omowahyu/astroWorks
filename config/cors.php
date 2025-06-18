<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'dashboard/*', 'admin/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        // Development URLs (currently active)
        'http://localhost:8000',
        'https://localhost:8000',
        'http://astroworks.test',
        'https://astroworks.test',

        // Production URLs (will be active when APP_ENV=production)
        env('APP_ENV') === 'production' ? 'https://astrokabinet.id' : null,
        env('APP_ENV') === 'production' ? 'https://www.astrokabinet.id' : null,
        env('APP_ENV') === 'production' ? 'https://admin.astrokabinet.id' : null,
        env('APP_ENV') === 'production' ? 'https://dashboard.astrokabinet.id' : null,
    ]),

    'allowed_origins_patterns' => [
        '/^https?:\/\/.*\.astrokabinet\.id$/',
        '/^https?:\/\/.*\.astroworks\.test$/',
        '/^https?:\/\/localhost(:\d+)?$/',
        '/^https?:\/\/127\.0\.0\.1(:\d+)?$/',
    ],

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-Inertia',
        'X-Inertia-Version',
        'X-Inertia-Partial-Component',
        'X-Inertia-Partial-Data',
    ],

    'exposed_headers' => [
        'X-Inertia',
        'X-Inertia-Location',
    ],

    'max_age' => 0,

    'supports_credentials' => true,

];
