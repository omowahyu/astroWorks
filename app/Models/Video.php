<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Video Model
 *
 * Handles YouTube videos displayed on the homepage
 *
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property string $youtube_url
 * @property string $youtube_id
 * @property string|null $thumbnail_url
 * @property bool $is_active
 * @property bool $autoplay
 * @property bool $loop
 * @property bool $muted
 * @property int $sort_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'youtube_url',
        'youtube_id',
        'thumbnail_url',
        'is_active',
        'autoplay',
        'loop',
        'muted',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'autoplay' => 'boolean',
        'loop' => 'boolean',
        'muted' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Extract YouTube ID from URL
     */
    public static function extractYouTubeId(string $url): ?string
    {
        $pattern = '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/';
        preg_match($pattern, $url, $matches);
        return $matches[1] ?? null;
    }

    /**
     * Get the embed URL for the video
     */
    public function getEmbedUrlAttribute(): string
    {
        $params = [];

        if ($this->autoplay) {
            $params[] = 'autoplay=1';
        }

        if ($this->loop) {
            $params[] = 'loop=1';
            $params[] = 'playlist=' . $this->youtube_id;
        }

        if ($this->muted) {
            $params[] = 'mute=1';
        }

        $params[] = 'controls=1';
        $params[] = 'rel=0';

        $queryString = implode('&', $params);

        return "https://www.youtube.com/embed/{$this->youtube_id}?" . $queryString;
    }

    /**
     * Get the thumbnail URL
     */
    public function getThumbnailUrlAttribute($value): string
    {
        if ($value) {
            return $value;
        }

        return "https://img.youtube.com/vi/{$this->youtube_id}/maxresdefault.jpg";
    }

    /**
     * Scope to get only active videos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by sort order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at');
    }

    /**
     * Boot the model
     */
    protected static function booted(): void
    {
        static::saving(function ($video) {
            // Extract YouTube ID from URL if not set
            if (!$video->youtube_id && $video->youtube_url) {
                $video->youtube_id = self::extractYouTubeId($video->youtube_url);
            }
        });
    }
}
