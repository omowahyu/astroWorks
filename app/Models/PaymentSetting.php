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
        return Cache::remember("payment_setting_{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            return $setting ? $setting->value : $default;
        });
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

        Cache::forget("payment_setting_{$key}");
    }

    /**
     * Get all settings grouped by group
     */
    public static function getAllGrouped(): array
    {
        return Cache::remember('payment_settings_grouped', 3600, function () {
            return static::all()->groupBy('group')->toArray();
        });
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
