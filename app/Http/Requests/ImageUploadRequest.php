<?php

namespace App\Http\Requests;

use App\Services\LoggingService;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ImageUploadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'device_type' => 'required|in:mobile,desktop',
            'image_type' => 'required|in:thumbnail,gallery,hero',
            'compression_level' => 'required|in:lossless,minimal,moderate,aggressive',
            'images' => 'required|array|max:10',
            'images.*' => [
                'required',
                'file',
                'image',
                'max:30720', // 30MB in KB
                'mimes:jpeg,jpg,png,webp,gif',
                'dimensions:min_width=100,min_height=100,max_width=8000,max_height=8000',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Product ID is required',
            'product_id.exists' => 'The selected product does not exist',
            'device_type.required' => 'Device type is required',
            'device_type.in' => 'Device type must be either mobile or desktop',
            'image_type.required' => 'Image type is required',
            'image_type.in' => 'Image type must be thumbnail, gallery, or hero',
            'compression_level.required' => 'Compression level is required',
            'compression_level.in' => 'Invalid compression level',
            'images.required' => 'At least one image is required',
            'images.max' => 'Maximum 10 images can be uploaded at once',
            'images.*.required' => 'Each image file is required',
            'images.*.file' => 'Each upload must be a valid file',
            'images.*.image' => 'Each file must be a valid image',
            'images.*.max' => 'Each image must not exceed 30MB',
            'images.*.mimes' => 'Images must be in JPEG, PNG, WebP, or GIF format',
            'images.*.dimensions' => 'Images must be between 100x100 and 8000x8000 pixels',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'product_id' => 'product',
            'device_type' => 'device type',
            'image_type' => 'image type',
            'compression_level' => 'compression level',
            'images.*' => 'image',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        // Log validation failure
        LoggingService::logValidationFailure(
            'ImageUploadRequest',
            $validator->errors()->toArray(),
            $this->all()
        );

        // Log security event for potential abuse
        if ($this->hasFile('images')) {
            $fileCount = count($this->file('images'));
            $totalSize = 0;

            foreach ($this->file('images') as $file) {
                $totalSize += $file->getSize();
            }

            if ($fileCount > 10 || $totalSize > 300 * 1024 * 1024) { // 300MB total
                LoggingService::logSecurityEvent('suspicious_upload_attempt', 'warning', [
                    'file_count' => $fileCount,
                    'total_size' => $totalSize,
                    'errors' => $validator->errors()->toArray(),
                ]);
            }
        }

        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'error_count' => $validator->errors()->count(),
            ], 422)
        );
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // Custom validation for aspect ratio based on device type
            if ($this->hasFile('images') && ! $validator->errors()->has('device_type')) {
                $deviceType = $this->input('device_type');

                foreach ($this->file('images') as $index => $file) {
                    if ($file->isValid()) {
                        $imageInfo = getimagesize($file->getPathname());
                        if ($imageInfo) {
                            $aspectRatio = $imageInfo[0] / $imageInfo[1];

                            // Mobile should be 4:5 (0.8) with 15% tolerance
                            if ($deviceType === 'mobile') {
                                $targetRatio = 0.8;
                                $tolerance = 0.15;

                                if (abs($aspectRatio - $targetRatio) > ($targetRatio * $tolerance)) {
                                    $validator->errors()->add(
                                        "images.{$index}",
                                        'Mobile images should have a 4:5 aspect ratio (portrait). Current ratio: '.round($aspectRatio, 2)
                                    );
                                }
                            }

                            // Desktop should be 16:9 (1.78) with 15% tolerance
                            if ($deviceType === 'desktop') {
                                $targetRatio = 1.78;
                                $tolerance = 0.15;

                                if (abs($aspectRatio - $targetRatio) > ($targetRatio * $tolerance)) {
                                    $validator->errors()->add(
                                        "images.{$index}",
                                        'Desktop images should have a 16:9 aspect ratio (landscape). Current ratio: '.round($aspectRatio, 2)
                                    );
                                }
                            }
                        }
                    }
                }
            }

            // Rate limiting check
            $this->checkRateLimit($validator);
        });
    }

    /**
     * Check rate limiting for image uploads
     */
    private function checkRateLimit(Validator $validator): void
    {
        $userId = auth()->id();
        $cacheKey = "image_upload_rate_limit:{$userId}";

        $uploadCount = cache()->get($cacheKey, 0);
        $maxUploads = 50; // Max 50 uploads per hour

        if ($uploadCount >= $maxUploads) {
            LoggingService::logSecurityEvent('rate_limit_exceeded', 'warning', [
                'user_id' => $userId,
                'upload_count' => $uploadCount,
                'max_uploads' => $maxUploads,
            ]);

            $validator->errors()->add('images', 'Upload rate limit exceeded. Please try again later.');
        } else {
            // Increment counter
            cache()->put($cacheKey, $uploadCount + 1, now()->addHour());
        }
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Log the upload attempt
        LoggingService::logApiRequest($this, [
            'operation' => 'image_upload_attempt',
            'product_id' => $this->input('product_id'),
            'device_type' => $this->input('device_type'),
            'image_count' => $this->hasFile('images') ? count($this->file('images')) : 0,
        ]);
    }
}
