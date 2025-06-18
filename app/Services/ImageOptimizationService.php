<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

/**
 * Image Optimization Service
 *
 * Handles image optimization, metadata removal, and multi-format generation
 */
class ImageOptimizationService
{
    protected ImageManager $imageManager;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver);
    }

    /**
     * Process uploaded image with optimization and multi-format generation
     */
    public function processProductImage(UploadedFile $file, string $baseFilename): array
    {
        // Validate file size (30MB max)
        if ($file->getSize() > 30 * 1024 * 1024) {
            throw new \InvalidArgumentException('File size exceeds 30MB limit');
        }

        $originalSize = $file->getSize();
        $extension = $file->getClientOriginalExtension();

        // Read and optimize the original image
        $image = $this->imageManager->read($file->getPathname());

        // Remove all metadata while preserving image quality
        $optimizedImageData = $this->removeMetadata($image);

        // Generate different aspect ratio versions
        $variants = $this->generateImageVariants($image, $baseFilename, $extension);

        // Save optimized original
        $originalPath = "images/{$baseFilename}.{$extension}";
        Storage::disk('public')->put($originalPath, $optimizedImageData);

        // Also save to public/storage/images for direct access
        $publicPath = public_path("storage/images/{$baseFilename}.{$extension}");
        file_put_contents($publicPath, $optimizedImageData);

        $optimizedSize = strlen($optimizedImageData);

        return [
            'original_path' => $originalPath,
            'mobile_portrait_path' => $variants['mobile_portrait'],
            'mobile_square_path' => $variants['mobile_square'],
            'desktop_landscape_path' => $variants['desktop_landscape'],
            'original_file_size' => $originalSize,
            'optimized_file_size' => $optimizedSize,
            'metadata_removed' => $originalSize - $optimizedSize,
            'image_metadata' => [
                'original_width' => $image->width(),
                'original_height' => $image->height(),
                'format' => $extension,
                'optimization_date' => now()->toISOString(),
            ],
        ];
    }

    /**
     * Remove metadata from image while preserving quality
     *
     * @param  \Intervention\Image\Image  $image
     */
    protected function removeMetadata($image): string
    {
        // Encode image without metadata
        // This removes EXIF, IPTC, XMP data while preserving image quality
        return $image->encode(quality: 100)->toString();
    }

    /**
     * Generate different aspect ratio variants
     *
     * @param  \Intervention\Image\Image  $image
     */
    protected function generateImageVariants($image, string $baseFilename, string $extension): array
    {
        $variants = [];

        // Mobile Portrait (4:5 aspect ratio)
        $mobilePortrait = clone $image;
        $mobilePortrait = $this->cropToAspectRatio($mobilePortrait, 4, 5);
        $mobilePortraitData = $this->removeMetadata($mobilePortrait);
        $mobilePortraitPath = "images/{$baseFilename}_mobile_portrait.{$extension}";

        Storage::disk('public')->put($mobilePortraitPath, $mobilePortraitData);
        file_put_contents(public_path("storage/images/{$baseFilename}_mobile_portrait.{$extension}"), $mobilePortraitData);
        $variants['mobile_portrait'] = $mobilePortraitPath;

        // Mobile Square (1:1 aspect ratio)
        $mobileSquare = clone $image;
        $mobileSquare = $this->cropToAspectRatio($mobileSquare, 1, 1);
        $mobileSquareData = $this->removeMetadata($mobileSquare);
        $mobileSquarePath = "images/{$baseFilename}_mobile_square.{$extension}";

        Storage::disk('public')->put($mobileSquarePath, $mobileSquareData);
        file_put_contents(public_path("storage/images/{$baseFilename}_mobile_square.{$extension}"), $mobileSquareData);
        $variants['mobile_square'] = $mobileSquarePath;

        // Desktop Landscape (16:9 aspect ratio)
        $desktopLandscape = clone $image;
        $desktopLandscape = $this->cropToAspectRatio($desktopLandscape, 16, 9);
        $desktopLandscapeData = $this->removeMetadata($desktopLandscape);
        $desktopLandscapePath = "images/{$baseFilename}_desktop_landscape.{$extension}";

        Storage::disk('public')->put($desktopLandscapePath, $desktopLandscapeData);
        file_put_contents(public_path("storage/images/{$baseFilename}_desktop_landscape.{$extension}"), $desktopLandscapeData);
        $variants['desktop_landscape'] = $desktopLandscapePath;

        return $variants;
    }

    /**
     * Crop image to specific aspect ratio from center
     *
     * @param  \Intervention\Image\Image  $image
     * @return \Intervention\Image\Image
     */
    protected function cropToAspectRatio($image, int $widthRatio, int $heightRatio)
    {
        $currentWidth = $image->width();
        $currentHeight = $image->height();

        $targetRatio = $widthRatio / $heightRatio;
        $currentRatio = $currentWidth / $currentHeight;

        if ($currentRatio > $targetRatio) {
            // Image is wider than target ratio, crop width
            $newWidth = $currentHeight * $targetRatio;
            $newHeight = $currentHeight;
            $x = ($currentWidth - $newWidth) / 2;
            $y = 0;
        } else {
            // Image is taller than target ratio, crop height
            $newWidth = $currentWidth;
            $newHeight = $currentWidth / $targetRatio;
            $x = 0;
            $y = ($currentHeight - $newHeight) / 2;
        }

        return $image->crop((int) $newWidth, (int) $newHeight, (int) $x, (int) $y);
    }

    /**
     * Get responsive image URL based on device type
     *
     * @param  string  $deviceType  ('mobile' or 'desktop')
     * @param  string  $mobileFormat  ('portrait' or 'square')
     */
    public function getResponsiveImageUrl(array $imagePaths, string $deviceType = 'desktop', string $mobileFormat = 'portrait'): string
    {
        if ($deviceType === 'mobile') {
            if ($mobileFormat === 'square' && ! empty($imagePaths['mobile_square_path'])) {
                return asset('storage/'.$imagePaths['mobile_square_path']);
            } elseif (! empty($imagePaths['mobile_portrait_path'])) {
                return asset('storage/'.$imagePaths['mobile_portrait_path']);
            }
        } else {
            if (! empty($imagePaths['desktop_landscape_path'])) {
                return asset('storage/'.$imagePaths['desktop_landscape_path']);
            }
        }

        // Fallback to original image
        return asset('storage/'.$imagePaths['image_path']);
    }

    /**
     * Delete all image variants
     */
    public function deleteImageVariants(array $imagePaths): void
    {
        $pathsToDelete = [
            $imagePaths['image_path'] ?? null,
            $imagePaths['mobile_portrait_path'] ?? null,
            $imagePaths['mobile_square_path'] ?? null,
            $imagePaths['desktop_landscape_path'] ?? null,
        ];

        foreach ($pathsToDelete as $path) {
            if ($path) {
                // Delete from storage
                Storage::disk('public')->delete($path);

                // Delete from public directory
                $publicPath = public_path('storage/'.$path);
                if (file_exists($publicPath)) {
                    unlink($publicPath);
                }
            }
        }
    }
}
