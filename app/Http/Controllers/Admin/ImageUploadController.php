<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DeviceImageUploadService;
use App\Services\ImageCompressionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImageUploadController extends Controller
{
    private DeviceImageUploadService $uploadService;

    private ImageCompressionService $compressionService;

    public function __construct(
        DeviceImageUploadService $uploadService,
        ImageCompressionService $compressionService
    ) {
        $this->uploadService = $uploadService;
        $this->compressionService = $compressionService;
    }

    /**
     * Upload images for specific device type
     */
    public function uploadDeviceImages(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'device_type' => 'required|in:mobile,desktop',
            'image_type' => 'required|in:thumbnail,gallery,hero',
            'compression_level' => 'required|in:lossless,minimal,moderate,aggressive',
            'images' => 'required|array|max:10',
            'images.*' => 'required|file|image|max:30720', // 30MB in KB
        ]);

        try {
            $files = $request->file('images');
            $productId = $request->input('product_id');
            $deviceType = $request->input('device_type');
            $imageType = $request->input('image_type');
            $compressionLevel = $request->input('compression_level');

            $result = $this->uploadService->uploadMultipleForDevice(
                $files,
                $productId,
                $deviceType,
                $imageType,
                $compressionLevel
            );

            return response()->json([
                'success' => true,
                'message' => 'Images uploaded successfully',
                'data' => [
                    'uploaded_images' => $result['uploaded'],
                    'errors' => $result['errors'],
                    'summary' => [
                        'total_uploaded' => count($result['uploaded']),
                        'total_errors' => count($result['errors']),
                        'device_type' => $deviceType,
                        'compression_level' => $compressionLevel,
                    ],
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: '.$e->getMessage(),
            ], 400);
        }
    }

    /**
     * Analyze image before upload
     */
    public function analyzeImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|image|max:30720',
            'device_type' => 'required|in:mobile,desktop',
        ]);

        try {
            $file = $request->file('image');
            $deviceType = $request->input('device_type');

            $analysis = $this->uploadService->analyzeImageForUpload($file, $deviceType);

            return response()->json([
                'success' => true,
                'data' => $analysis,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Analysis failed: '.$e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get compression preview
     */
    public function getCompressionPreview(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|image|max:30720',
            'compression_level' => 'required|in:lossless,minimal,moderate,aggressive',
        ]);

        try {
            $file = $request->file('image');
            $compressionLevel = $request->input('compression_level');

            $result = $this->compressionService->compressImage($file, $compressionLevel);

            return response()->json([
                'success' => true,
                'data' => [
                    'original_size' => $result['original_size'],
                    'original_size_formatted' => $this->compressionService->formatFileSize($result['original_size']),
                    'compressed_size' => $result['compressed_size'],
                    'compressed_size_formatted' => $this->compressionService->formatFileSize($result['compressed_size']),
                    'compression_ratio' => $result['compression_ratio'],
                    'savings_bytes' => $result['savings_bytes'],
                    'savings_formatted' => $this->compressionService->formatFileSize($result['savings_bytes']),
                    'width' => $result['width'],
                    'height' => $result['height'],
                    'aspect_ratio' => $result['aspect_ratio'],
                    'compression_level' => $compressionLevel,
                    'quality_used' => $result['quality_used'],
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Compression preview failed: '.$e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get compression level recommendations
     */
    public function getCompressionLevels(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'compression_levels' => $this->uploadService->getCompressionLevels(),
                'aspect_ratio_info' => $this->uploadService->getAspectRatioInfo(),
                'max_file_size' => 30 * 1024 * 1024, // 30MB
                'max_file_size_formatted' => '30 MB',
                'supported_formats' => ['JPEG', 'PNG', 'WebP', 'GIF'],
            ],
        ]);
    }

    /**
     * Delete uploaded image
     */
    public function deleteImage(Request $request): JsonResponse
    {
        $request->validate([
            'image_id' => 'required|integer|exists:product_images,id',
        ]);

        try {
            $imageId = $request->input('image_id');
            $image = \App\Models\ProductImage::findOrFail($imageId);

            $deleted = $this->uploadService->deleteImage($image);

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Image deleted successfully',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete image',
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: '.$e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get upload statistics
     */
    public function getUploadStats(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        try {
            $productId = $request->input('product_id');

            $mobileImages = $this->uploadService->getImagesForDevice($productId, 'mobile');
            $desktopImages = $this->uploadService->getImagesForDevice($productId, 'desktop');

            $totalOriginalSize = 0;
            $totalCompressedSize = 0;

            foreach ([$mobileImages, $desktopImages] as $imageCollection) {
                foreach ($imageCollection as $image) {
                    $dimensions = $image->image_dimensions;
                    if (isset($dimensions['original_size'])) {
                        $totalOriginalSize += $dimensions['original_size'];
                    }
                    if (isset($dimensions['compressed_size'])) {
                        $totalCompressedSize += $dimensions['compressed_size'];
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'mobile_images' => $mobileImages->count(),
                    'desktop_images' => $desktopImages->count(),
                    'total_images' => $mobileImages->count() + $desktopImages->count(),
                    'total_original_size' => $totalOriginalSize,
                    'total_compressed_size' => $totalCompressedSize,
                    'total_savings' => $totalOriginalSize - $totalCompressedSize,
                    'compression_ratio' => $totalOriginalSize > 0
                        ? round((($totalOriginalSize - $totalCompressedSize) / $totalOriginalSize) * 100, 2)
                        : 0,
                    'formatted' => [
                        'total_original_size' => $this->compressionService->formatFileSize($totalOriginalSize),
                        'total_compressed_size' => $this->compressionService->formatFileSize($totalCompressedSize),
                        'total_savings' => $this->compressionService->formatFileSize($totalOriginalSize - $totalCompressedSize),
                    ],
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stats retrieval failed: '.$e->getMessage(),
            ], 400);
        }
    }
}
