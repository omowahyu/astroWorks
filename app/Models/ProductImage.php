<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Product Image Model
 *
 * Handles product images with support for multiple images per product,
 * image types, and proper ordering.
 *
 * @property int $id
 * @property int $product_id
 * @property string $image_path
 * @property string|null $alt_text
 * @property int $sort_order
 * @property string $image_type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Product $product
 */
class ProductImage extends Model
{
    use HasFactory;
    use SoftDeletes;

    // Image type constants
    public const TYPE_THUMBNAIL = 'thumbnail';
    public const TYPE_GALLERY = 'gallery';
    public const TYPE_HERO = 'hero';

    public const TYPES = [
        self::TYPE_THUMBNAIL,
        self::TYPE_GALLERY,
        self::TYPE_HERO,
    ];

    // Device type constants
    public const DEVICE_MOBILE = 'mobile';
    public const DEVICE_DESKTOP = 'desktop';

    public const DEVICE_TYPES = [
        self::DEVICE_MOBILE,
        self::DEVICE_DESKTOP,
    ];

    // Aspect ratio constants
    public const ASPECT_RATIO_MOBILE = 0.8; // 4:5
    public const ASPECT_RATIO_DESKTOP = 1.78; // 16:9

    protected $fillable = [
        'product_id',
        'image_path',
        'alt_text',
        'sort_order',
        'image_type',
        'device_type',
        'aspect_ratio',
        'image_dimensions'
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'aspect_ratio' => 'decimal:2',
        'image_dimensions' => 'array'
    ];

    /**
     * Get the product that owns this image
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Product>
     */
    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the full URL for the image
     *
     * @return string
     */
    public function getImageUrlAttribute(): string
    {
        // If image_path is already a full URL (like Picsum), return it directly
        if (filter_var($this->image_path, FILTER_VALIDATE_URL)) {
            return $this->image_path;
        }

        // For local files, check if they exist before returning URL
        $publicPath = "storage/images/" . basename($this->image_path);
        if (file_exists(public_path($publicPath))) {
            return asset($publicPath);
        }

        // If local file doesn't exist, use Picsum placeholder like products without images
        return "https://picsum.photos/seed/{$this->product_id}/800/600";
    }

    /**
     * Get responsive image URL - now just returns the main image URL
     *
     * @param string $deviceType ('mobile' or 'desktop') - kept for compatibility
     * @param string $mobileFormat ('portrait' or 'square') - kept for compatibility
     * @return string
     */
    public function getResponsiveImageUrl(string $deviceType = 'desktop', string $mobileFormat = 'portrait'): string
    {
        // Since we removed variant paths, just return the main image URL
        return $this->image_url;
    }

    /**
     * Get all image variant URLs - simplified since we removed variant paths
     *
     * @return array
     */
    public function getImageVariantsAttribute(): array
    {
        return [
            'original' => $this->image_url,
            'mobile_portrait' => $this->image_url,
            'mobile_square' => $this->image_url,
            'desktop_landscape' => $this->image_url,
        ];
    }

    /**
     * Get file size savings from optimization
     *
     * @return array
     */
    public function getOptimizationStatsAttribute(): array
    {
        if (!$this->original_file_size || !$this->optimized_file_size) {
            return [
                'savings_bytes' => 0,
                'savings_percentage' => 0,
                'original_size_mb' => 0,
                'optimized_size_mb' => 0
            ];
        }

        $savingsBytes = $this->original_file_size - $this->optimized_file_size;
        $savingsPercentage = ($savingsBytes / $this->original_file_size) * 100;

        return [
            'savings_bytes' => $savingsBytes,
            'savings_percentage' => round($savingsPercentage, 2),
            'original_size_mb' => round($this->original_file_size / (1024 * 1024), 2),
            'optimized_size_mb' => round($this->optimized_file_size / (1024 * 1024), 2)
        ];
    }

    /**
     * Scope to get only thumbnail images (replaces primary functionality)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePrimary($query)
    {
        return $query->where('image_type', self::TYPE_THUMBNAIL);
    }

    /**
     * Scope to order images by sort order
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at');
    }



    /**
     * Scope to get images by type
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('image_type', $type);
    }

    /**
     * Scope to get thumbnail images
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeThumbnails($query)
    {
        return $query->where('image_type', self::TYPE_THUMBNAIL);
    }

    /**
     * Scope to get gallery images
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeGallery($query)
    {
        return $query->where('image_type', self::TYPE_GALLERY);
    }

    /**
     * Scope to get hero images
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeHero($query)
    {
        return $query->where('image_type', self::TYPE_HERO);
    }

    /**
     * Scope to get images by device type
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $deviceType
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForDevice($query, string $deviceType)
    {
        return $query->where('device_type', $deviceType);
    }

    /**
     * Scope to get mobile images (4:5 aspect ratio)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeMobile($query)
    {
        return $query->where('device_type', self::DEVICE_MOBILE);
    }

    /**
     * Scope to get desktop images (16:9 aspect ratio)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDesktop($query)
    {
        return $query->where('device_type', self::DEVICE_DESKTOP);
    }

    /**
     * Check if image has correct aspect ratio for device type
     *
     * @return bool
     */
    public function hasCorrectAspectRatio(): bool
    {
        if (!$this->aspect_ratio) {
            return false;
        }

        $tolerance = 0.1; // Allow 10% tolerance

        if ($this->device_type === self::DEVICE_MOBILE) {
            return abs($this->aspect_ratio - self::ASPECT_RATIO_MOBILE) <= $tolerance;
        }

        if ($this->device_type === self::DEVICE_DESKTOP) {
            return abs($this->aspect_ratio - self::ASPECT_RATIO_DESKTOP) <= $tolerance;
        }

        return false;
    }

    /**
     * Boot the model to handle thumbnail image logic
     */
    protected static function booted(): void
    {
        // Ensure only one thumbnail image per device type per product
        static::saving(function ($image) {
            if ($image->image_type === self::TYPE_THUMBNAIL) {
                // Only update thumbnails of the same device type
                static::query()
                    ->where('product_id', $image->product_id)
                    ->where('device_type', $image->device_type)
                    ->where('id', '!=', $image->id)
                    ->update(['image_type' => self::TYPE_GALLERY]);
            }
        });

        // If this is the first image for a product, make it thumbnail
        static::created(function ($image) {
            $imageCount = static::where('product_id', $image->product_id)->count();
            if ($imageCount === 1 && $image->image_type !== self::TYPE_THUMBNAIL) {
                $image->update(['image_type' => self::TYPE_THUMBNAIL]);
            }
        });
    }
}
