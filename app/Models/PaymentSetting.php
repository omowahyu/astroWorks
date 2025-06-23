<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PaymentSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
    ];

    /**
     * Get setting value by key
     */
    public static function get(string $key, $default = null)
    {
        try {
            // Check if application is fully bootstrapped
            if (app()->bound('cache')) {
                return Cache::remember("payment_setting_{$key}", 3600, function () use ($key, $default) {
                    $setting = static::where('key', $key)->first();

                    return $setting ? $setting->value : $default;
                });
            }

            // Fallback to direct database query if cache is not available
            $setting = static::where('key', $key)->first();

            return $setting ? $setting->value : $default;
        } catch (\Exception $e) {
            // If any error occurs, return default value
            return $default;
        }
    }

    /**
     * Set setting value by key
     */
    public static function set(string $key, $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        try {
            if (app()->bound('cache')) {
                Cache::forget("payment_setting_{$key}");
            }
        } catch (\Exception $e) {
            // Ignore cache errors during early bootstrap
        }
    }

    /**
     * Get all settings grouped by group
     */
    public static function getAllGrouped(): array
    {
        try {
            if (app()->bound('cache')) {
                return Cache::remember('payment_settings_grouped', 3600, function () {
                    return static::all()->groupBy('group')->toArray();
                });
            }

            // Fallback to direct query if cache is not available
            return static::all()->groupBy('group')->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Clear all settings cache
     */
    public static function clearCache(): void
    {
        Cache::forget('payment_settings_grouped');
        $keys = static::pluck('key');
        foreach ($keys as $key) {
            Cache::forget("payment_setting_{$key}");
        }
    }
}
