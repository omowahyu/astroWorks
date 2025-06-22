<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class LoggingService
{
    /**
     * Log business operation with structured context
     */
    public static function logOperation(
        string $operation,
        string $level = 'info',
        array $context = [],
        ?string $message = null
    ): void {
        $logData = [
            'operation' => $operation,
            'user_id' => auth()->id(),
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'timestamp' => now()->toISOString(),
            'context' => $context
        ];

        $message = $message ?? "Operation: {$operation}";

        Log::log($level, $message, $logData);
    }

    /**
     * Log image processing operations
     */
    public static function logImageOperation(
        string $operation,
        array $imageData = [],
        string $level = 'info',
        ?string $message = null
    ): void {
        $context = [
            'image_data' => $imageData,
            'memory_usage' => memory_get_usage(true),
            'memory_peak' => memory_get_peak_usage(true)
        ];

        self::logOperation("image.{$operation}", $level, $context, $message);
    }

    /**
     * Log product operations
     */
    public static function logProductOperation(
        string $operation,
        int $productId,
        array $data = [],
        string $level = 'info'
    ): void {
        $context = [
            'product_id' => $productId,
            'data' => $data
        ];

        self::logOperation("product.{$operation}", $level, $context);
    }

    /**
     * Log performance metrics
     */
    public static function logPerformance(
        string $operation,
        float $startTime,
        array $metrics = []
    ): void {
        $executionTime = microtime(true) - $startTime;
        
        $context = [
            'execution_time_ms' => round($executionTime * 1000, 2),
            'memory_usage' => memory_get_usage(true),
            'memory_peak' => memory_get_peak_usage(true),
            'metrics' => $metrics
        ];

        self::logOperation("performance.{$operation}", 'info', $context);
    }

    /**
     * Log security events
     */
    public static function logSecurityEvent(
        string $event,
        string $level = 'warning',
        array $context = []
    ): void {
        $securityContext = [
            'event' => $event,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'referer' => request()?->header('referer'),
            'session_id' => session()->getId(),
            'context' => $context
        ];

        Log::log($level, "Security event: {$event}", $securityContext);
    }

    /**
     * Log API requests with rate limiting info
     */
    public static function logApiRequest(
        Request $request,
        array $context = []
    ): void {
        $requestData = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'route' => $request->route()?->getName(),
            'parameters' => $request->route()?->parameters(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'content_length' => $request->header('content-length'),
            'context' => $context
        ];

        self::logOperation('api.request', 'info', $requestData);
    }

    /**
     * Log database operations
     */
    public static function logDatabaseOperation(
        string $operation,
        string $table,
        array $context = []
    ): void {
        $dbContext = [
            'table' => $table,
            'operation' => $operation,
            'context' => $context
        ];

        self::logOperation("database.{$operation}", 'info', $dbContext);
    }

    /**
     * Log file operations
     */
    public static function logFileOperation(
        string $operation,
        string $filePath,
        array $context = []
    ): void {
        $fileContext = [
            'file_path' => $filePath,
            'operation' => $operation,
            'file_exists' => file_exists($filePath),
            'context' => $context
        ];

        self::logOperation("file.{$operation}", 'info', $fileContext);
    }

    /**
     * Log validation failures
     */
    public static function logValidationFailure(
        string $validator,
        array $errors,
        array $input = []
    ): void {
        $context = [
            'validator' => $validator,
            'errors' => $errors,
            'input_keys' => array_keys($input), // Don't log sensitive input values
            'input_count' => count($input)
        ];

        self::logOperation('validation.failed', 'warning', $context);
    }

    /**
     * Log cache operations
     */
    public static function logCacheOperation(
        string $operation,
        string $key,
        array $context = []
    ): void {
        $cacheContext = [
            'cache_key' => $key,
            'operation' => $operation,
            'context' => $context
        ];

        self::logOperation("cache.{$operation}", 'debug', $cacheContext);
    }

    /**
     * Log queue job operations
     */
    public static function logJobOperation(
        string $jobClass,
        string $operation,
        array $context = []
    ): void {
        $jobContext = [
            'job_class' => $jobClass,
            'operation' => $operation,
            'queue' => config('queue.default'),
            'context' => $context
        ];

        self::logOperation("job.{$operation}", 'info', $jobContext);
    }
}
