<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class HealthCheckController extends Controller
{
    /**
     * Basic health check endpoint
     */
    public function basic(): JsonResponse
    {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'service' => 'AstroKabinet',
            'version' => config('app.version', '1.0.0')
        ]);
    }

    /**
     * Detailed health check with dependencies
     */
    public function detailed(): JsonResponse
    {
        $startTime = microtime(true);
        $checks = [];
        $overallStatus = 'healthy';

        // Database check
        $checks['database'] = $this->checkDatabase();
        if ($checks['database']['status'] !== 'healthy') {
            $overallStatus = 'unhealthy';
        }

        // Cache check
        $checks['cache'] = $this->checkCache();
        if ($checks['cache']['status'] !== 'healthy') {
            $overallStatus = 'degraded';
        }

        // Storage check
        $checks['storage'] = $this->checkStorage();
        if ($checks['storage']['status'] !== 'healthy') {
            $overallStatus = 'degraded';
        }

        // Memory check
        $checks['memory'] = $this->checkMemory();
        if ($checks['memory']['status'] !== 'healthy') {
            $overallStatus = 'degraded';
        }

        // Disk space check
        $checks['disk'] = $this->checkDiskSpace();
        if ($checks['disk']['status'] !== 'healthy') {
            $overallStatus = 'degraded';
        }

        $responseTime = round((microtime(true) - $startTime) * 1000, 2);

        return response()->json([
            'status' => $overallStatus,
            'timestamp' => now()->toISOString(),
            'service' => 'AstroKabinet',
            'version' => config('app.version', '1.0.0'),
            'response_time_ms' => $responseTime,
            'checks' => $checks
        ], $overallStatus === 'healthy' ? 200 : 503);
    }

    /**
     * Check database connectivity and performance
     */
    private function checkDatabase(): array
    {
        try {
            $startTime = microtime(true);
            
            // Test basic connectivity
            DB::connection()->getPdo();
            
            // Test a simple query
            $result = DB::select('SELECT 1 as test');
            
            // Test products table (main business table)
            $productCount = DB::table('products')->count();
            
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            return [
                'status' => 'healthy',
                'response_time_ms' => $responseTime,
                'product_count' => $productCount,
                'connection' => 'active'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'connection' => 'failed'
            ];
        }
    }

    /**
     * Check cache system
     */
    private function checkCache(): array
    {
        try {
            $startTime = microtime(true);
            $testKey = 'health_check_' . time();
            $testValue = 'test_value';
            
            // Test cache write
            Cache::put($testKey, $testValue, 60);
            
            // Test cache read
            $retrieved = Cache::get($testKey);
            
            // Clean up
            Cache::forget($testKey);
            
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            if ($retrieved === $testValue) {
                return [
                    'status' => 'healthy',
                    'response_time_ms' => $responseTime,
                    'driver' => config('cache.default')
                ];
            } else {
                return [
                    'status' => 'unhealthy',
                    'error' => 'Cache read/write test failed',
                    'driver' => config('cache.default')
                ];
            }
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'driver' => config('cache.default')
            ];
        }
    }

    /**
     * Check storage system
     */
    private function checkStorage(): array
    {
        try {
            $startTime = microtime(true);
            $testFile = 'health_check_' . time() . '.txt';
            $testContent = 'health check test';
            
            // Test file write
            Storage::disk('public')->put($testFile, $testContent);
            
            // Test file read
            $retrieved = Storage::disk('public')->get($testFile);
            
            // Test file exists
            $exists = Storage::disk('public')->exists($testFile);
            
            // Clean up
            Storage::disk('public')->delete($testFile);
            
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            if ($retrieved === $testContent && $exists) {
                return [
                    'status' => 'healthy',
                    'response_time_ms' => $responseTime,
                    'disk' => 'public'
                ];
            } else {
                return [
                    'status' => 'unhealthy',
                    'error' => 'Storage read/write test failed',
                    'disk' => 'public'
                ];
            }
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'disk' => 'public'
            ];
        }
    }

    /**
     * Check memory usage
     */
    private function checkMemory(): array
    {
        $memoryUsage = memory_get_usage(true);
        $memoryPeak = memory_get_peak_usage(true);
        $memoryLimit = $this->parseMemoryLimit(ini_get('memory_limit'));
        
        $usagePercentage = $memoryLimit > 0 ? round(($memoryUsage / $memoryLimit) * 100, 2) : 0;
        
        $status = 'healthy';
        if ($usagePercentage > 90) {
            $status = 'unhealthy';
        } elseif ($usagePercentage > 75) {
            $status = 'degraded';
        }
        
        return [
            'status' => $status,
            'usage_bytes' => $memoryUsage,
            'usage_mb' => round($memoryUsage / 1024 / 1024, 2),
            'peak_bytes' => $memoryPeak,
            'peak_mb' => round($memoryPeak / 1024 / 1024, 2),
            'limit_bytes' => $memoryLimit,
            'limit_mb' => round($memoryLimit / 1024 / 1024, 2),
            'usage_percentage' => $usagePercentage
        ];
    }

    /**
     * Check disk space
     */
    private function checkDiskSpace(): array
    {
        $path = storage_path();
        $freeBytes = disk_free_space($path);
        $totalBytes = disk_total_space($path);
        
        $usedBytes = $totalBytes - $freeBytes;
        $usagePercentage = round(($usedBytes / $totalBytes) * 100, 2);
        
        $status = 'healthy';
        if ($usagePercentage > 95) {
            $status = 'unhealthy';
        } elseif ($usagePercentage > 85) {
            $status = 'degraded';
        }
        
        return [
            'status' => $status,
            'free_bytes' => $freeBytes,
            'free_gb' => round($freeBytes / 1024 / 1024 / 1024, 2),
            'used_bytes' => $usedBytes,
            'used_gb' => round($usedBytes / 1024 / 1024 / 1024, 2),
            'total_bytes' => $totalBytes,
            'total_gb' => round($totalBytes / 1024 / 1024 / 1024, 2),
            'usage_percentage' => $usagePercentage,
            'path' => $path
        ];
    }

    /**
     * Parse memory limit string to bytes
     */
    private function parseMemoryLimit(string $limit): int
    {
        if ($limit === '-1') {
            return 0; // Unlimited
        }
        
        $limit = trim($limit);
        $last = strtolower($limit[strlen($limit) - 1]);
        $value = (int) $limit;
        
        switch ($last) {
            case 'g':
                $value *= 1024;
            case 'm':
                $value *= 1024;
            case 'k':
                $value *= 1024;
        }
        
        return $value;
    }
}
