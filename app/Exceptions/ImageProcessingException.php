<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ImageProcessingException extends Exception
{
    protected array $context;
    protected string $operation;

    public function __construct(
        string $message = '',
        string $operation = 'unknown',
        array $context = [],
        int $code = 0,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        
        $this->operation = $operation;
        $this->context = $context;
        
        // Log the error immediately with context
        $this->logError();
    }

    /**
     * Log the error with structured context
     */
    protected function logError(): void
    {
        Log::error('Image processing failed', [
            'operation' => $this->operation,
            'message' => $this->getMessage(),
            'context' => $this->context,
            'user_id' => auth()->id(),
            'timestamp' => now()->toISOString(),
            'trace' => $this->getTraceAsString()
        ]);
    }

    /**
     * Render the exception as an HTTP response
     */
    public function render(Request $request): JsonResponse
    {
        $response = [
            'success' => false,
            'error' => [
                'type' => 'image_processing_error',
                'operation' => $this->operation,
                'message' => $this->getMessage(),
                'timestamp' => now()->toISOString()
            ]
        ];

        // Add context for debugging in non-production environments
        if (config('app.debug')) {
            $response['error']['context'] = $this->context;
            $response['error']['trace'] = $this->getTrace();
        }

        return response()->json($response, 422);
    }

    /**
     * Get the operation that failed
     */
    public function getOperation(): string
    {
        return $this->operation;
    }

    /**
     * Get the error context
     */
    public function getContext(): array
    {
        return $this->context;
    }

    /**
     * Create exception for compression failures
     */
    public static function compressionFailed(string $reason, array $context = []): self
    {
        return new self(
            "Image compression failed: {$reason}",
            'compression',
            $context
        );
    }

    /**
     * Create exception for upload failures
     */
    public static function uploadFailed(string $reason, array $context = []): self
    {
        return new self(
            "Image upload failed: {$reason}",
            'upload',
            $context
        );
    }

    /**
     * Create exception for validation failures
     */
    public static function validationFailed(string $reason, array $context = []): self
    {
        return new self(
            "Image validation failed: {$reason}",
            'validation',
            $context
        );
    }

    /**
     * Create exception for file system failures
     */
    public static function fileSystemError(string $reason, array $context = []): self
    {
        return new self(
            "File system error: {$reason}",
            'filesystem',
            $context
        );
    }
}
