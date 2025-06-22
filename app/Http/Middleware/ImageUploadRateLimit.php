<?php

namespace App\Http\Middleware;

use App\Services\LoggingService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class ImageUploadRateLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $userId = auth()->id();
        $ipAddress = $request->ip();
        
        // Create rate limit keys
        $userKey = "image_upload_user:{$userId}";
        $ipKey = "image_upload_ip:{$ipAddress}";
        
        // Define limits
        $userLimit = 50; // 50 uploads per hour per user
        $ipLimit = 100;  // 100 uploads per hour per IP
        $userLimitWindow = 3600; // 1 hour in seconds
        $ipLimitWindow = 3600;   // 1 hour in seconds
        
        // Check user-based rate limit
        if ($userId && $this->isRateLimited($userKey, $userLimit, $userLimitWindow)) {
            LoggingService::logSecurityEvent('user_rate_limit_exceeded', 'warning', [
                'user_id' => $userId,
                'limit' => $userLimit,
                'window' => $userLimitWindow,
                'endpoint' => $request->path()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Upload rate limit exceeded. Please try again later.',
                'error_type' => 'rate_limit_exceeded',
                'retry_after' => $this->getRetryAfter($userKey)
            ], 429);
        }
        
        // Check IP-based rate limit
        if ($this->isRateLimited($ipKey, $ipLimit, $ipLimitWindow)) {
            LoggingService::logSecurityEvent('ip_rate_limit_exceeded', 'warning', [
                'ip_address' => $ipAddress,
                'user_id' => $userId,
                'limit' => $ipLimit,
                'window' => $ipLimitWindow,
                'endpoint' => $request->path()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Too many upload requests from this IP. Please try again later.',
                'error_type' => 'rate_limit_exceeded',
                'retry_after' => $this->getRetryAfter($ipKey)
            ], 429);
        }
        
        // Increment counters
        $this->incrementCounter($userKey, $userLimitWindow);
        $this->incrementCounter($ipKey, $ipLimitWindow);
        
        // Add rate limit headers to response
        $response = $next($request);
        
        if ($response instanceof \Illuminate\Http\JsonResponse) {
            $userRemaining = max(0, $userLimit - $this->getCurrentCount($userKey));
            $ipRemaining = max(0, $ipLimit - $this->getCurrentCount($ipKey));
            
            $response->headers->set('X-RateLimit-User-Limit', $userLimit);
            $response->headers->set('X-RateLimit-User-Remaining', $userRemaining);
            $response->headers->set('X-RateLimit-IP-Limit', $ipLimit);
            $response->headers->set('X-RateLimit-IP-Remaining', $ipRemaining);
        }
        
        return $response;
    }
    
    /**
     * Check if the rate limit is exceeded
     */
    private function isRateLimited(string $key, int $limit, int $window): bool
    {
        $current = $this->getCurrentCount($key);
        return $current >= $limit;
    }
    
    /**
     * Get current count for a key
     */
    private function getCurrentCount(string $key): int
    {
        return Cache::get($key, 0);
    }
    
    /**
     * Increment the counter for a key
     */
    private function incrementCounter(string $key, int $window): void
    {
        $current = Cache::get($key, 0);
        Cache::put($key, $current + 1, $window);
    }
    
    /**
     * Get retry after time in seconds
     */
    private function getRetryAfter(string $key): int
    {
        $ttl = Cache::getStore()->getRedis()->ttl($key);
        return max(0, $ttl);
    }
}
