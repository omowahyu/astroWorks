import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Smartphone, Monitor, Upload, X, Settings2, ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface DeviceImageUploadProps {
    onMobileUpload: (files: FileList, compressionLevel?: string) => void;
    onDesktopUpload: (files: FileList, compressionLevel?: string) => void;
    mobileImages?: Array<{ id: number; url: string; name: string; size?: number; compressed_size?: number }>;
    desktopImages?: Array<{ id: number; url: string; name: string; size?: number; compressed_size?: number }>;
    onRemoveImage?: (imageId: number, deviceType: 'mobile' | 'desktop') => void;
    maxFiles?: number;
    disabled?: boolean;
    showCompressionOptions?: boolean;
    defaultCompressionLevel?: string;
}

// Validation functions
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB in bytes

// Client-side image compression functions
const compressImageOnClient = async (file: File, compressionLevel: string): Promise<File> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            let quality = 1.0;
            switch (compressionLevel) {
                case 'minimal': quality = 0.9; break;
                case 'moderate': quality = 0.7; break;
                case 'aggressive': quality = 0.5; break;
                default: quality = 1.0;
            }
            
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: blob.type,
                            lastModified: Date.now()
                        });
                        
                        const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                        const compressedSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
                        const savings = ((file.size - blob.size) / file.size * 100).toFixed(1);
                        
                        console.log(`Compressed ${file.name}: ${originalSizeMB}MB → ${compressedSizeMB}MB (${savings}% savings)`);
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Failed to compress image'));
                    }
                },
                file.type.startsWith('image/png') ? 'image/png' : 'image/jpeg',
                quality
            );
        };
        
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = URL.createObjectURL(file);
    });
};

const compressMultipleImages = async (files: FileList, compressionLevel: string): Promise<FileList> => {
    const compressedFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
            if (file.type.startsWith('image/')) {
                const compressedFile = await compressImageOnClient(file, compressionLevel);
                compressedFiles.push(compressedFile);
                
                toast.success(`${file.name} compressed successfully`);
            } else {
                compressedFiles.push(file);
            }
        } catch (error) {
            console.error(`Failed to compress ${file.name}:`, error);
            toast.error(`Failed to compress ${file.name}`);
            compressedFiles.push(file);
        }
    }
    
    const dt = new DataTransfer();
    compressedFiles.forEach(file => dt.items.add(file));
    return dt.files;
};

const validateFiles = async (files: FileList): Promise<FileList | null> => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > MAX_FILE_SIZE) {
            toast.error(`${file.name} exceeds 30MB limit`);
            continue;
        }
        
        if (!file.type.startsWith('image/')) {
            toast.error(`${file.name} is not an image`);
            continue;
        }
        
        validFiles.push(file);
    }
    
    if (validFiles.length < files.length) {
        toast.warning(`${files.length - validFiles.length} files were skipped. ${validFiles.length} files will be processed.`);
    }
    
    const dt = new DataTransfer();
    validFiles.forEach(file => dt.items.add(file));
    return dt.files;
};

const DeviceImageUpload: React.FC<DeviceImageUploadProps> = ({
    onMobileUpload,
    onDesktopUpload,
    mobileImages = [],
    desktopImages = [],
    onRemoveImage,
    maxFiles = 10,
    disabled = false,
    showCompressionOptions = true,
    defaultCompressionLevel = 'lossless'
}) => {
    const [dragOver, setDragOver] = useState<'mobile' | 'desktop' | null>(null);
    const [compressionLevel, setCompressionLevel] = useState(defaultCompressionLevel);

    const handleDragOver = useCallback((e: React.DragEvent, deviceType: 'mobile' | 'desktop') => {
        e.preventDefault();
        setDragOver(deviceType);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(null);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent, deviceType: 'mobile' | 'desktop') => {
        e.preventDefault();
        setDragOver(null);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            try {
                const validFiles = await validateFiles(files, deviceType);
                if (!validFiles || validFiles.length === 0) return;
                
                toast.info('Compressing images...');
                const compressedFiles = await compressMultipleImages(validFiles, compressionLevel);
                
                if (deviceType === 'mobile') {
                    onMobileUpload(compressedFiles, compressionLevel);
                } else {
                    onDesktopUpload(compressedFiles, compressionLevel);
                }
            } catch (error) {
                console.error('Error processing files:', error);
                toast.error('An error occurred while processing images.');
            }
        }
    }, [onMobileUpload, onDesktopUpload, compressionLevel]);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, deviceType: 'mobile' | 'desktop') => {
        const files = e.target.files;
        if (files && files.length > 0) {
            try {
                const validFiles = await validateFiles(files, deviceType);
                if (!validFiles || validFiles.length === 0) {
                    e.target.value = '';
                    return;
                }
                
                toast.info('Compressing images...');
                const compressedFiles = await compressMultipleImages(validFiles, compressionLevel);
                
                if (deviceType === 'mobile') {
                    onMobileUpload(compressedFiles, compressionLevel);
                } else {
                    onDesktopUpload(compressedFiles, compressionLevel);
                }
            } catch (error) {
                console.error('Error processing files:', error);
                toast.error('An error occurred while processing images.');
            }
        }
        e.target.value = '';
    }, [onMobileUpload, onDesktopUpload, compressionLevel]);

    const renderUploadArea = (deviceType: 'mobile' | 'desktop') => {
        const isDragOver = dragOver === deviceType;
        const images = deviceType === 'mobile' ? mobileImages : desktopImages;
        const aspectRatio = deviceType === 'mobile' ? '4:5' : '16:9';
        const icon = deviceType === 'mobile' ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />;
        const hasImages = images.length > 0;
        const isAtLimit = images.length >= maxFiles;

        return (
            <Card className={`transition-all duration-300 hover:shadow-md ${
                isDragOver ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200'
            } ${disabled ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                                deviceType === 'mobile' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                                {icon}
                            </div>
                            <div>
                                <CardTitle className="text-lg capitalize">{deviceType} Images</CardTitle>
                                <CardDescription className="text-sm">
                                    Optimal ratio: {aspectRatio} • Max 30MB per file
                                </CardDescription>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-sm font-medium ${
                                isAtLimit ? 'text-orange-600' : 'text-gray-600'
                            }`}>
                                {images.length} / {maxFiles}
                            </div>
                            {isAtLimit && (
                                <div className="text-xs text-orange-500 flex items-center mt-1">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Limit reached
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {/* Upload Area */}
                    {!isAtLimit && (
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                                isDragOver 
                                    ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer group'}`}
                            onDragOver={(e) => handleDragOver(e, deviceType)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, deviceType)}
                            onClick={() => {
                                if (!disabled) {
                                    document.getElementById(`file-input-${deviceType}`)?.click();
                                }
                            }}
                        >
                            <div className={`transition-transform duration-300 ${
                                isDragOver ? 'scale-110' : 'group-hover:scale-105'
                            }`}>
                                <div className={`mx-auto mb-4 p-3 rounded-full ${
                                    isDragOver ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'
                                }`}>
                                    <Upload className="h-8 w-8" />
                                </div>
                                
                                <div className="space-y-2">
                                    <p className={`text-lg font-medium ${
                                        isDragOver ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                        {isDragOver ? 'Drop your images here' : 'Upload Images'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Drag & drop or <span className="text-blue-600 font-medium">browse files</span>
                                    </p>
                                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 mt-3">
                                        <span>PNG</span>
                                        <span>•</span>
                                        <span>JPG</span>
                                        <span>•</span>
                                        <span>WebP</span>
                                        <span>•</span>
                                        <span>GIF</span>
                                    </div>
                                </div>
                            </div>
                            
                            <input
                                id={`file-input-${deviceType}`}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, deviceType)}
                                disabled={disabled}
                            />
                        </div>
                    )}

                    {/* Image Preview Grid */}
                    {hasImages && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    Uploaded Images
                                </h4>
                                {!isAtLimit && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById(`file-input-${deviceType}`)?.click()}
                                        disabled={disabled}
                                        className="text-xs"
                                    >
                                        <Upload className="h-3 w-3 mr-1" />
                                        Add More
                                    </Button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {images.map((image) => (
                                    <div key={image.id} className="relative group">
                                        <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                                                    deviceType === 'mobile' ? 'aspect-[4/5] h-24' : 'aspect-[16/9] h-20'
                                                }`}
                                            />
                                            
                                            {/* Success indicator */}
                                            <div className="absolute top-2 left-2">
                                                <div className="bg-green-500 text-white rounded-full p-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                </div>
                                            </div>
                                            
                                            {/* Remove button */}
                                            {onRemoveImage && (
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveImage(image.id, deviceType)}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                                                    disabled={disabled}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                            
                                            {/* Compression info */}
                                            {image.size && image.compressed_size && image.size !== image.compressed_size && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                    <div className="text-green-300 text-xs font-medium text-center">
                                                        -{Math.round(((image.size - image.compressed_size) / image.size) * 100)}% compressed
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* File name */}
                                        <p className="text-xs text-gray-600 mt-1 truncate" title={image.name}>
                                            {image.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Product Images</h2>
                <p className="text-gray-600">
                    Upload images for both mobile and desktop views. Images will be automatically optimized.
                </p>
            </div>

            {/* Compression Settings */}
            {showCompressionOptions && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Settings2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <Label className="text-base font-semibold text-gray-900">Image Compression</Label>
                                    <p className="text-sm text-gray-600">Choose quality vs file size balance</p>
                                </div>
                            </div>
                            <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                                <SelectTrigger className="w-48 bg-white border-blue-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lossless">
                                        <div className="flex items-center justify-between w-full">
                                            <span>Lossless</span>
                                            <span className="text-xs text-gray-500 ml-2">Best Quality</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="minimal">
                                        <div className="flex items-center justify-between w-full">
                                            <span>Minimal</span>
                                            <span className="text-xs text-gray-500 ml-2">90% Quality</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="moderate">
                                        <div className="flex items-center justify-between w-full">
                                            <span>Moderate</span>
                                            <span className="text-xs text-gray-500 ml-2">70% Quality</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="aggressive">
                                        <div className="flex items-center justify-between w-full">
                                            <span>Aggressive</span>
                                            <span className="text-xs text-gray-500 ml-2">50% Quality</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upload Areas */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {renderUploadArea('mobile')}
                {renderUploadArea('desktop')}
            </div>
            
            {/* Help Text */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tips for better images:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Mobile images work best in 4:5 ratio (portrait)</li>
                    <li>• Desktop images work best in 16:9 ratio (landscape)</li>
                    <li>• Use high-quality images - compression will optimize file size</li>
                    <li>• Maximum file size: 30MB per image</li>
                </ul>
            </div>
        </div>
    );
};

export default DeviceImageUpload;
