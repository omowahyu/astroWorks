<?php

namespace App\Services;

use App\Models\ProductImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class DeviceImageUploadService
{
    private ImageManager $imageManager;

    private ImageCompressionService $compressionService;

    public function __construct(ImageCompressionService $compressionService)
    {
        $this->imageManager = new ImageManager(new Driver);
        $this->compressionService = $compressionService;
    }

    /**
     * Upload and process image for specific device type with compression
     *
     * @param  string  $deviceType  ('mobile' or 'desktop')
     * @param  string  $imageType  ('thumbnail', 'gallery', 'hero')
     * @param  string  $compressionLevel  ('lossless', 'minimal', 'moderate', 'aggressive')
     *
     * @throws \Exception
     */
    public function uploadForDevice(
        UploadedFile $file,
        int $productId,
        string $deviceType,
        string $imageType = ProductImage::TYPE_GALLERY,
        int $sortOrder = 0,
        string $compressionLevel = 'lossless'
    ): ProductImage {
        // Validate device type
        if (! in_array($deviceType, ProductImage::DEVICE_TYPES)) {
            throw new \Exception("Invalid device type: {$deviceType}");
        }

        // Validate and compress image
        $this->compressionService->validateImage($file);
        $compressionResult = $this->compressionService->compressImage($file, $compressionLevel);

        $width = $compressionResult['width'];
        $height = $compressionResult['height'];
        $aspectRatio = $compressionResult['aspect_ratio'];

        // Validate aspect ratio for device type
        $this->validateAspectRatio($aspectRatio, $deviceType);

        // Generate filename
        $filename = $this->generateFilename($productId, $deviceType, $imageType, $file->getClientOriginalExtension());

        // Store the compressed image
        $imagePath = 'images/'.$filename;
        Storage::disk('public')->put($imagePath, $compressionResult['compressed_data']);

        // Create database record with compression info
        return ProductImage::create([
            'product_id' => $productId,
            'image_path' => $imagePath,
            'alt_text' => "Product image for {$deviceType}",
            'image_type' => $imageType,
            'device_type' => $deviceType,
            'aspect_ratio' => $aspectRatio,
            'image_dimensions' => [
                'width' => $width,
                'height' => $height,
                'original_size' => $compressionResult['original_size'],
                'compressed_size' => $compressionResult['compressed_size'],
                'compression_ratio' => $compressionResult['compression_ratio'],
                'compression_level' => $compressionLevel,
                'quality_used' => $compressionResult['quality_used'],
            ],
            'sort_order' => $sortOrder,
        ]);
    }

    /**
     * Validate aspect ratio for device type
     *
     * @throws \Exception
     */
    private function validateAspectRatio(float $aspectRatio, string $deviceType): void
    {
        $tolerance = 0.15; // Allow 15% tolerance

        if ($deviceType === ProductImage::DEVICE_MOBILE) {
            $expectedRatio = ProductImage::ASPECT_RATIO_MOBILE; // 4:5 = 0.8
            if (abs($aspectRatio - $expectedRatio) > $tolerance) {
                throw new \Exception(
                    "Mobile images must have 4:5 aspect ratio (0.8). Current ratio: {$aspectRatio}. ".
                    'Please upload an image with dimensions like 400x500, 800x1000, etc.'
                );
            }
        }

        if ($deviceType === ProductImage::DEVICE_DESKTOP) {
            $expectedRatio = ProductImage::ASPECT_RATIO_DESKTOP; // 16:9 = 1.78
            if (abs($aspectRatio - $expectedRatio) > $tolerance) {
                throw new \Exception(
                    "Desktop images must have 16:9 aspect ratio (1.78). Current ratio: {$aspectRatio}. ".
                    'Please upload an image with dimensions like 1920x1080, 1600x900, etc.'
                );
            }
        }
    }

    /**
     * Generate unique filename
     */
    private function generateFilename(int $productId, string $deviceType, string $imageType, string $extension): string
    {
        $timestamp = now()->format('YmdHis');
        $random = substr(md5(uniqid()), 0, 6);

        return "product_{$productId}_{$deviceType}_{$imageType}_{$timestamp}_{$random}.{$extension}";
    }

    /**
     * Upload multiple images for device type with compression
     */
    public function uploadMultipleForDevice(
        array $files,
        int $productId,
        string $deviceType,
        string $imageType = ProductImage::TYPE_GALLERY,
        string $compressionLevel = 'lossless'
    ): array {
        $uploadedImages = [];
        $errors = [];

        foreach ($files as $index => $file) {
            try {
                $image = $this->uploadForDevice(
                    $file,
                    $productId,
                    $deviceType,
                    $imageType,
                    $index,
                    $compressionLevel
                );
                $uploadedImages[] = $image;
            } catch (\Exception $e) {
                $errors[] = [
                    'file' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                ];
            }
        }

        return [
            'uploaded' => $uploadedImages,
            'errors' => $errors,
        ];
    }

    /**
     * Get images for specific device and product
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getImagesForDevice(int $productId, string $deviceType, ?string $imageType = null)
    {
        $query = ProductImage::where('product_id', $productId)
            ->where('device_type', $deviceType)
            ->ordered();

        if ($imageType) {
            $query->where('image_type', $imageType);
        }

        return $query->get();
    }

    /**
     * Get thumbnail image for device
     */
    public function getThumbnailForDevice(int $productId, string $deviceType): ?ProductImage
    {
        return ProductImage::where('product_id', $productId)
            ->where('device_type', $deviceType)
            ->where('image_type', ProductImage::TYPE_THUMBNAIL)
            ->first();
    }

    /**
     * Delete image and file
     */
    public function deleteImage(ProductImage $image): bool
    {
        // Delete file from storage
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        // Delete database record
        return $image->delete();
    }

    /**
     * Get compression analysis for uploaded file
     */
    public function analyzeImageForUpload(UploadedFile $file, string $deviceType): array
    {
        try {
            // Get compression recommendation
            $recommendation = $this->compressionService->getCompressionRecommendation($file);

            // Get image info
            $imageInfo = getimagesize($file->getPathname());
            $aspectRatio = round($imageInfo[0] / $imageInfo[1], 2);

            // Check aspect ratio compatibility
            $aspectRatioValid = false;
            $aspectRatioMessage = '';

            try {
                $this->validateAspectRatio($aspectRatio, $deviceType);
                $aspectRatioValid = true;
                $aspectRatioMessage = 'Aspect ratio is valid for '.$deviceType;
            } catch (\Exception $e) {
                $aspectRatioMessage = $e->getMessage();
            }

            return [
                'file_info' => [
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'size_formatted' => $this->compressionService->formatFileSize($file->getSize()),
                    'mime_type' => $file->getMimeType(),
                    'width' => $imageInfo[0],
                    'height' => $imageInfo[1],
                    'aspect_ratio' => $aspectRatio,
                ],
                'device_compatibility' => [
                    'device_type' => $deviceType,
                    'aspect_ratio_valid' => $aspectRatioValid,
                    'aspect_ratio_message' => $aspectRatioMessage,
                ],
                'compression_recommendation' => $recommendation,
                'upload_ready' => $aspectRatioValid && $file->getSize() <= 30 * 1024 * 1024,
            ];
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'upload_ready' => false,
            ];
        }
    }

    /**
     * Get aspect ratio info for device types
     */
    public static function getAspectRatioInfo(): array
    {
        return [
            ProductImage::DEVICE_MOBILE => [
                'ratio' => ProductImage::ASPECT_RATIO_MOBILE,
                'description' => '4:5 (Portrait)',
                'examples' => ['400x500', '800x1000', '1200x1500'],
                'recommended_min' => '400x500',
            ],
            ProductImage::DEVICE_DESKTOP => [
                'ratio' => ProductImage::ASPECT_RATIO_DESKTOP,
                'description' => '16:9 (Landscape)',
                'examples' => ['1920x1080', '1600x900', '1280x720'],
                'recommended_min' => '1280x720',
            ],
        ];
    }

    /**
     * Get compression level recommendations
     */
    public static function getCompressionLevels(): array
    {
        return [
            'lossless' => [
                'label' => 'Lossless',
                'description' => 'Remove metadata only, no quality loss',
                'recommended_for' => 'High-quality images, professional photos',
                'typical_savings' => '5-15%',
            ],
            'minimal' => [
                'label' => 'Minimal',
                'description' => 'Light compression with minimal quality loss',
                'recommended_for' => 'Product photos, detailed images',
                'typical_savings' => '15-30%',
            ],
            'moderate' => [
                'label' => 'Moderate',
                'description' => 'Balanced compression for web use',
                'recommended_for' => 'General web images, galleries',
                'typical_savings' => '30-50%',
            ],
            'aggressive' => [
                'label' => 'Aggressive',
                'description' => 'Maximum compression for smaller files',
                'recommended_for' => 'Large files, thumbnails',
                'typical_savings' => '50-70%',
            ],
        ];
    }
}
