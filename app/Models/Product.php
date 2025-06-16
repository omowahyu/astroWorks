<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category> $categories
 * @property-read int|null $categories_count
 * @property-read \App\Models\ProductMiscOption|null $defaultMisc
 * @property-read \App\Models\UnitType|null $defaultUnit
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductImage> $images
 * @property-read int|null $images_count
 * @property-read \App\Models\ProductImage|null $primaryImage
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductMiscOption> $miscOptions
 * @property-read int|null $misc_options_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UnitType> $unitTypes
 * @property-read int|null $unit_types_count
 * @method static \Database\Factories\ProductFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product withoutTrashed()
 * @mixin \Eloquent
 */
class Product extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = ['name', 'description', 'slug'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\UnitType>
     */
    public function unitTypes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UnitType::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne<\App\Models\UnitType>
     */
    public function defaultUnit(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UnitType::class)->where('is_default', true);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\ProductMiscOption>
     */
    public function miscOptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductMiscOption::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne<\App\Models\ProductMiscOption>
     */
    public function defaultMisc(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProductMiscOption::class)->where('is_default', true);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\ProductImage>
     */
    public function images(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductImage::class)->ordered();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne<\App\Models\ProductImage>
     */
    public function primaryImage(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\ProductImage>
     */
    public function thumbnailImages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductImage::class)->thumbnails()->orderedByDisplay();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\ProductImage>
     */
    public function galleryImages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductImage::class)->gallery()->orderedByDisplay();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\ProductImage>
     */
    public function heroImages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductImage::class)->hero()->orderedByDisplay();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne<\App\Models\ProductImage>
     */
    public function mainThumbnail(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProductImage::class)
                    ->thumbnails()
                    ->orderBy('display_order')
                    ->orderBy('created_at');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<\App\Models\Category>
     */
    public function categories(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    /**
     * Get the primary image URL or a fallback
     *
     * @return string
     */
    public function getPrimaryImageUrlAttribute(): string
    {
        if ($this->primaryImage) {
            return $this->primaryImage->image_url;
        }

        // Check if there are any images in storage
        $imagePath = "storage/images/product_{$this->id}_image_1.jpg";
        if (file_exists(public_path($imagePath))) {
            return asset($imagePath);
        }

        // Fallback to placeholder
        return "https://picsum.photos/seed/{$this->id}/800/600";
    }

    /**
     * Get all image URLs for the product
     *
     * @return array
     */
    public function getImageUrlsAttribute(): array
    {
        $urls = $this->images->pluck('image_url')->toArray();

        // If no database images, check for files in storage
        if (empty($urls)) {
            $storageUrls = [];
            for ($i = 1; $i <= 5; $i++) {
                $imagePath = "storage/images/product_{$this->id}_image_{$i}.jpg";
                if (file_exists(public_path($imagePath))) {
                    $storageUrls[] = asset($imagePath);
                }
            }

            if (!empty($storageUrls)) {
                return $storageUrls;
            }

            // Final fallback to placeholder images
            $id = $this->id;
            return [
                "https://picsum.photos/seed/{$id}/800/600",
                "https://picsum.photos/seed/" . ($id + 1) . "/800/600",
                "https://picsum.photos/seed/" . ($id + 2) . "/800/600",
            ];
        }

        return $urls;
    }

    /**
     * Get image variants for responsive display
     * Mobile: 4:5 portrait, Desktop: 16:9 landscape
     *
     * @return array
     */
    public function getImageVariantsAttribute(): array
    {
        $baseUrl = $this->primary_image_url;

        // Check for optimized variants in storage
        $mobilePortrait = null;
        $desktopLandscape = null;

        // Check for mobile portrait (4:5) variant
        $mobilePortraitPath = "storage/images/product_{$this->id}_mobile_portrait.jpg";
        if (file_exists(public_path($mobilePortraitPath))) {
            $mobilePortrait = asset($mobilePortraitPath);
        }

        // Check for desktop landscape (16:9) variant
        $desktopLandscapePath = "storage/images/product_{$this->id}_desktop_landscape.jpg";
        if (file_exists(public_path($desktopLandscapePath))) {
            $desktopLandscape = asset($desktopLandscapePath);
        }

        return [
            'original' => $baseUrl,
            'mobile_portrait' => $mobilePortrait ?: $baseUrl,
            'desktop_landscape' => $desktopLandscape ?: $baseUrl,
        ];
    }
}
