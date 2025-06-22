import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { Smartphone, Monitor, Upload, X, Settings2 } from 'lucide-react';

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
                
                toast.success(
                    'Image compressed',
                    `${file.name} compressed successfully`
                );
            } else {
                compressedFiles.push(file);
            }
        } catch (error) {
            console.error(`Failed to compress ${file.name}:`, error);
            toast.error('Compression failed', `Failed to compress ${file.name}`);
            compressedFiles.push(file);
        }
    }
    
    const dt = new DataTransfer();
    compressedFiles.forEach(file => dt.items.add(file));
    return dt.files;
};

const validateFiles = async (files: FileList, deviceType: 'mobile' | 'desktop'): Promise<FileList | null> => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File too large', `${file.name} exceeds 30MB limit`);
            continue;
        }
        
        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type', `${file.name} is not an image`);
            continue;
        }
        
        validFiles.push(file);
    }
    
    if (validFiles.length < files.length) {
        toast.warning(
            'Some files skipped',
            `${files.length - validFiles.length} files were skipped. ${validFiles.length} files will be processed.`
        );
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
                
                toast.info('Processing images...', 'Compressing images...');
                const compressedFiles = await compressMultipleImages(validFiles, compressionLevel);
                
                if (deviceType === 'mobile') {
                    onMobileUpload(compressedFiles, compressionLevel);
                } else {
                    onDesktopUpload(compressedFiles, compressionLevel);
                }
            } catch (error) {
                console.error('Error processing files:', error);
                toast.error('Error', 'An error occurred while processing images.');
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
                
                toast.info('Processing images...', 'Compressing images...');
                const compressedFiles = await compressMultipleImages(validFiles, compressionLevel);
                
                if (deviceType === 'mobile') {
                    onMobileUpload(compressedFiles, compressionLevel);
                } else {
                    onDesktopUpload(compressedFiles, compressionLevel);
                }
            } catch (error) {
                console.error('Error processing files:', error);
                toast.error('Error', 'An error occurred while processing images.');
            }
        }
        e.target.value = '';
    }, [onMobileUpload, onDesktopUpload, compressionLevel]);

    const formatFileSize = (bytes: number): string => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderUploadArea = (deviceType: 'mobile' | 'desktop') => {
        const isDragOver = dragOver === deviceType;
        const images = deviceType === 'mobile' ? mobileImages : desktopImages;
        const aspectRatio = deviceType === 'mobile' ? '4:5' : '16:9';
        const icon = deviceType === 'mobile' ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />;

        return (
            <Card className={`transition-all duration-200 ${isDragOver ? 'border-blue-500 bg-blue-50' : ''}`}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {icon}
                            <span className="capitalize">{deviceType}</span>
                            <span className="text-sm font-normal text-gray-500">({aspectRatio})</span>
                        </div>
                        <span className="text-sm text-gray-500">{images.length}/{maxFiles}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                            isDragOver 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onDragOver={(e) => handleDragOver(e, deviceType)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, deviceType)}
                        onClick={() => {
                            if (!disabled) {
                                document.getElementById(`file-input-${deviceType}`)?.click();
                            }
                        }}
                    >
                        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-1">
                            Drop images or click to browse
                        </p>
                        <p className="text-xs text-gray-500">
                            PNG, JPG, WebP, GIF • Max 30MB
                        </p>
                        
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

                    {/* Image Preview */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((image) => (
                                <div key={image.id} className="relative group">
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        className={`w-full h-16 object-cover rounded border ${
                                            deviceType === 'mobile' ? 'aspect-[4/5]' : 'aspect-[16/9]'
                                        }`}
                                    />
                                    {onRemoveImage && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveImage(image.id, deviceType)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={disabled}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                    {image.size && image.compressed_size && image.size !== image.compressed_size && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b">
                                            <div className="text-green-300 text-center">
                                                -{Math.round(((image.size - image.compressed_size) / image.size) * 100)}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            {/* Simplified Compression Settings */}
            {showCompressionOptions && (
                <Card className="bg-gray-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Settings2 className="h-4 w-4 text-gray-600" />
                                <Label className="text-sm font-medium">Compression</Label>
                            </div>
                            <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lossless">Lossless (Best Quality)</SelectItem>
                                    <SelectItem value="minimal">Minimal (90% Quality)</SelectItem>
                                    <SelectItem value="moderate">Moderate (70% Quality)</SelectItem>
                                    <SelectItem value="aggressive">Aggressive (50% Quality)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upload Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderUploadArea('mobile')}
                {renderUploadArea('desktop')}
            </div>
        </div>
    );
};

export default DeviceImageUpload;
