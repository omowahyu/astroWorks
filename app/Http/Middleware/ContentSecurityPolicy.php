<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContentSecurityPolicy
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Determine if we're in development mode
        $isDev = app()->environment('local') ||
                 str_contains($request->getHost(), 'astroworks.test') ||
                 str_contains($request->getHost(), 'localhost');

        // In development, use a more permissive CSP
        if ($isDev) {
            $csp = [
                "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: localhost:* astroworks.test:*",
                "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https: http: localhost:* astroworks.test:*",
                "style-src 'self' 'unsafe-inline' https: http:",
                "style-src-elem 'self' 'unsafe-inline' https: http:",
                "font-src 'self' https: http: data:",
                "img-src 'self' data: https: http: blob:",
                "media-src 'self' https: http:",
                "frame-src 'self' https: http:",
                "connect-src 'self' https: http: ws: wss: blob:",
                "object-src 'none'",
                "base-uri 'self'"
            ];
        } else {
            // Production CSP - more restrictive
            $csp = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://www.gstatic.com",
                "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://www.gstatic.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net",
                "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net",
                "font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net",
                "img-src 'self' data: https: http: blob:",
                "media-src 'self' https://www.youtube.com https://*.googlevideo.com",
                "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
                "connect-src 'self' https://www.youtube.com https://*.googlevideo.com https://picsum.photos blob:",
                "object-src 'none'",
                "base-uri 'self'"
            ];
        }

        $response->headers->set('Content-Security-Policy', implode('; ', $csp));
        
        // Additional security headers
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}
