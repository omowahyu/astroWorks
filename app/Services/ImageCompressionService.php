<?php

namespace App\Services;

use App\Exceptions\ImageProcessingException;
use App\Services\LoggingService;
use Illuminate\Http\UploadedFile;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Interfaces\ImageInterface;

class ImageCompressionService
{
    private ImageManager $imageManager;
    
    // Maximum file size in bytes (30MB)
    private const MAX_FILE_SIZE = 30 * 1024 * 1024;
    
    // Quality settings for different compression levels
    private const QUALITY_SETTINGS = [
        'lossless' => 100,    // No quality loss, only metadata removal
        'minimal' => 95,      // Minimal compression
        'moderate' => 85,     // Moderate compression
        'aggressive' => 75    // More aggressive compression
    ];

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver());
    }

    /**
     * Compress image while maintaining quality
     *
     * @param UploadedFile $file
     * @param string $compressionLevel ('lossless', 'minimal', 'moderate', 'aggressive')
     * @return array
     * @throws ImageProcessingException
     */
    public function compressImage(UploadedFile $file, string $compressionLevel = 'lossless'): array
    {
        $startTime = microtime(true);

        $context = [
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'compression_level' => $compressionLevel,
            'mime_type' => $file->getMimeType()
        ];

        try {
            // Log operation start
            LoggingService::logImageOperation('compression.start', $context);

            // Validate file size
            if ($file->getSize() > self::MAX_FILE_SIZE) {
                throw ImageProcessingException::validationFailed(
                    'File size exceeds 30MB limit. Current size: ' . $this->formatFileSize($file->getSize()),
                    $context
                );
            }

            // Validate compression level
            if (!array_key_exists($compressionLevel, self::QUALITY_SETTINGS)) {
                throw ImageProcessingException::validationFailed(
                    'Invalid compression level. Use: lossless, minimal, moderate, or aggressive',
                    $context
                );
            }

            $originalSize = $file->getSize();
            $originalPath = $file->getPathname();

            // Get original image info
            $imageInfo = getimagesize($originalPath);
            if (!$imageInfo) {
                throw ImageProcessingException::validationFailed('Invalid image file', $context);
            }

            $originalWidth = $imageInfo[0];
            $originalHeight = $imageInfo[1];
            $mimeType = $imageInfo['mime'];

            // Load image with Intervention Image
            try {
                $image = $this->imageManager->read($originalPath);
            } catch (\Exception $e) {
                throw ImageProcessingException::compressionFailed(
                    'Failed to load image: ' . $e->getMessage(),
                    array_merge($context, ['intervention_error' => $e->getMessage()])
                );
            }

            // Apply compression based on level
            try {
                $compressedData = $this->applyCompression($image, $mimeType, $compressionLevel);
            } catch (\Exception $e) {
                // Clean up memory before throwing exception
                $image = null;
                gc_collect_cycles();
                
                throw ImageProcessingException::compressionFailed(
                    'Compression process failed: ' . $e->getMessage(),
                    array_merge($context, ['compression_error' => $e->getMessage()])
                );
            }

            // Clean up image object to free memory
            $image = null;
            gc_collect_cycles();

            // Calculate compression stats
            $compressedSize = strlen($compressedData);
            $compressionRatio = round((($originalSize - $compressedSize) / $originalSize) * 100, 2);

            $result = [
                'compressed_data' => $compressedData,
                'original_size' => $originalSize,
                'compressed_size' => $compressedSize,
                'compression_ratio' => $compressionRatio,
                'savings_bytes' => $originalSize - $compressedSize,
                'width' => $originalWidth,
                'height' => $originalHeight,
                'mime_type' => $mimeType,
                'aspect_ratio' => round($originalWidth / $originalHeight, 2),
                'compression_level' => $compressionLevel,
                'quality_used' => self::QUALITY_SETTINGS[$compressionLevel]
            ];

            // Log successful compression with performance metrics
            LoggingService::logPerformance('compression', $startTime, [
                'compression_ratio' => $compressionRatio,
                'original_size' => $originalSize,
                'compressed_size' => $compressedSize,
                'savings_bytes' => $originalSize - $compressedSize
            ]);

            LoggingService::logImageOperation('compression.success', array_merge($context, [
                'compression_ratio' => $compressionRatio,
                'savings_bytes' => $originalSize - $compressedSize
            ]));

            return $result;

        } catch (ImageProcessingException $e) {
            // Clean up memory before re-throwing
            if (isset($image)) {
                $image = null;
                gc_collect_cycles();
            }
            // Re-throw our custom exceptions
            throw $e;
        } catch (\Exception $e) {
            // Clean up memory before throwing
            if (isset($image)) {
                $image = null;
                gc_collect_cycles();
            }
            // Wrap unexpected exceptions
            throw ImageProcessingException::compressionFailed(
                'Unexpected error during compression: ' . $e->getMessage(),
                array_merge($context, [
                    'unexpected_error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ])
            );
        }
    }

    /**
     * Apply compression based on level
     *
     * @param ImageInterface $image
     * @param string $mimeType
     * @param string $compressionLevel
     * @return string
     */
    private function applyCompression(ImageInterface $image, string $mimeType, string $compressionLevel): string
    {
        $quality = self::QUALITY_SETTINGS[$compressionLevel];

        // Remove all metadata (EXIF, IPTC, etc.) for all compression levels
        // This is done automatically by Intervention Image when encoding

        switch ($mimeType) {
            case 'image/jpeg':
                return $image->toJpeg($quality);
                
            case 'image/png':
                // For PNG, we use compression level (0-9) instead of quality
                $pngCompression = $this->getPngCompressionLevel($compressionLevel);
                return $image->toPng($pngCompression);
                
            case 'image/webp':
                return $image->toWebp($quality);
                
            case 'image/gif':
                // GIF doesn't support quality settings, just remove metadata
                return $image->toGif();
                
            default:
                // Default to JPEG for unsupported formats
                return $image->toJpeg($quality);
        }
    }

    /**
     * Get PNG compression level based on compression setting
     *
     * @param string $compressionLevel
     * @return int
     */
    private function getPngCompressionLevel(string $compressionLevel): int
    {
        return match ($compressionLevel) {
            'lossless' => 1,    // Minimal compression
            'minimal' => 3,     // Light compression
            'moderate' => 6,    // Moderate compression
            'aggressive' => 9   // Maximum compression
        };
    }

    /**
     * Compress image with automatic level selection based on file size
     *
     * @param UploadedFile $file
     * @param int $targetSizeBytes
     * @return array
     * @throws \Exception
     */
    public function compressToTargetSize(UploadedFile $file, int $targetSizeBytes = null): array
    {
        $targetSizeBytes = $targetSizeBytes ?? (5 * 1024 * 1024); // Default 5MB target

        // Try different compression levels until we reach target size
        $compressionLevels = ['lossless', 'minimal', 'moderate', 'aggressive'];
        
        foreach ($compressionLevels as $level) {
            $result = $this->compressImage($file, $level);
            
            if ($result['compressed_size'] <= $targetSizeBytes) {
                $result['target_achieved'] = true;
                $result['target_size'] = $targetSizeBytes;
                return $result;
            }
        }

        // If even aggressive compression doesn't reach target, return aggressive result
        $result['target_achieved'] = false;
        $result['target_size'] = $targetSizeBytes;
        
        return $result;
    }

    /**
     * Batch compress multiple images
     *
     * @param array $files
     * @param string $compressionLevel
     * @return array
     */
    public function compressMultiple(array $files, string $compressionLevel = 'lossless'): array
    {
        $results = [];
        $totalOriginalSize = 0;
        $totalCompressedSize = 0;
        $errors = [];

        foreach ($files as $index => $file) {
            try {
                $result = $this->compressImage($file, $compressionLevel);
                $results[] = array_merge($result, [
                    'file_index' => $index,
                    'original_name' => $file->getClientOriginalName()
                ]);
                
                $totalOriginalSize += $result['original_size'];
                $totalCompressedSize += $result['compressed_size'];
                
                // Force garbage collection after each file to prevent memory buildup
                gc_collect_cycles();
                
            } catch (\Exception $e) {
                $errors[] = [
                    'file_index' => $index,
                    'file_name' => $file->getClientOriginalName(),
                    'error' => $e->getMessage()
                ];
                
                // Clean up memory even on error
                gc_collect_cycles();
            }
        }

        return [
            'results' => $results,
            'errors' => $errors,
            'summary' => [
                'total_files' => count($files),
                'successful' => count($results),
                'failed' => count($errors),
                'total_original_size' => $totalOriginalSize,
                'total_compressed_size' => $totalCompressedSize,
                'total_savings' => $totalOriginalSize - $totalCompressedSize,
                'average_compression_ratio' => count($results) > 0 
                    ? round((($totalOriginalSize - $totalCompressedSize) / $totalOriginalSize) * 100, 2)
                    : 0
            ]
        ];
    }

    /**
     * Get compression recommendations based on file size and type
     *
     * @param UploadedFile $file
     * @return array
     */
    public function getCompressionRecommendation(UploadedFile $file): array
    {
        $fileSize = $file->getSize();
        $mimeType = $file->getMimeType();

        // Size-based recommendations
        if ($fileSize < 1024 * 1024) { // < 1MB
            $recommendation = 'lossless';
            $reason = 'File is already small, lossless compression recommended';
        } elseif ($fileSize < 5 * 1024 * 1024) { // < 5MB
            $recommendation = 'minimal';
            $reason = 'Moderate file size, minimal compression recommended';
        } elseif ($fileSize < 15 * 1024 * 1024) { // < 15MB
            $recommendation = 'moderate';
            $reason = 'Large file size, moderate compression recommended';
        } else {
            $recommendation = 'aggressive';
            $reason = 'Very large file size, aggressive compression recommended';
        }

        // Type-specific adjustments
        if ($mimeType === 'image/png') {
            $typeNote = 'PNG files benefit more from lossless compression';
        } elseif ($mimeType === 'image/jpeg') {
            $typeNote = 'JPEG files can handle moderate compression well';
        } else {
            $typeNote = 'Standard compression applies';
        }

        return [
            'recommended_level' => $recommendation,
            'reason' => $reason,
            'type_note' => $typeNote,
            'file_size' => $fileSize,
            'file_size_formatted' => $this->formatFileSize($fileSize),
            'mime_type' => $mimeType
        ];
    }

    /**
     * Format file size in human readable format
     *
     * @param int $bytes
     * @return string
     */
    public function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Validate image file
     *
     * @param UploadedFile $file
     * @return bool
     * @throws \Exception
     */
    public function validateImage(UploadedFile $file): bool
    {
        // Check file size
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \Exception('File size exceeds 30MB limit');
        }

        // Check if it's a valid image
        $imageInfo = getimagesize($file->getPathname());
        if (!$imageInfo) {
            throw new \Exception('Invalid image file');
        }

        // Check supported formats
        $supportedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($imageInfo['mime'], $supportedMimes)) {
            throw new \Exception('Unsupported image format. Supported: JPEG, PNG, WebP, GIF');
        }

        return true;
    }
}
