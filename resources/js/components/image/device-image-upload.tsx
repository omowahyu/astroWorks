import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Monitor, Upload, X, AlertCircle, Settings, Zap } from 'lucide-react';

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

    const handleDrop = useCallback((e: React.DragEvent, deviceType: 'mobile' | 'desktop') => {
        e.preventDefault();
        setDragOver(null);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            if (deviceType === 'mobile') {
                onMobileUpload(files, compressionLevel);
            } else {
                onDesktopUpload(files, compressionLevel);
            }
        }
    }, [onMobileUpload, onDesktopUpload]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, deviceType: 'mobile' | 'desktop') => {
        const files = e.target.files;
        if (files && files.length > 0) {
            if (deviceType === 'mobile') {
                onMobileUpload(files, compressionLevel);
            } else {
                onDesktopUpload(files, compressionLevel);
            }
        }
        // Reset input value to allow selecting the same file again
        e.target.value = '';
    }, [onMobileUpload, onDesktopUpload]);

    const renderUploadArea = (deviceType: 'mobile' | 'desktop') => {
        const isDragOver = dragOver === deviceType;
        const images = deviceType === 'mobile' ? mobileImages : desktopImages;
        const aspectRatio = deviceType === 'mobile' ? '4:5 (Portrait)' : '16:9 (Landscape)';
        const examples = deviceType === 'mobile' 
            ? ['400x500', '800x1000', '1200x1500']
            : ['1920x1080', '1600x900', '1280x720'];

        return (
            <Card className={`transition-all duration-200 ${isDragOver ? 'border-blue-500 bg-blue-50' : ''}`}>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        {deviceType === 'mobile' ? (
                            <Smartphone className="h-5 w-5" />
                        ) : (
                            <Monitor className="h-5 w-5" />
                        )}
                        <span>{deviceType === 'mobile' ? 'Mobile Images' : 'Desktop Images'}</span>
                    </CardTitle>
                    <CardDescription>
                        Upload images with {aspectRatio} aspect ratio
                        <br />
                        <span className="text-xs text-gray-500">
                            Examples: {examples.join(', ')}
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-1">
                            Drag & drop images here or click to browse
                        </p>
                        <p className="text-xs text-gray-500">
                            {deviceType === 'mobile' ? '4:5 ratio required' : '16:9 ratio required'}
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

                    {/* Aspect Ratio Warning */}
                    <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-amber-800">
                            <p className="font-medium mb-1">Important:</p>
                            <p>
                                {deviceType === 'mobile' 
                                    ? 'Mobile images (4:5) will ONLY be displayed on mobile devices. They will not appear on desktop.'
                                    : 'Desktop images (16:9) will ONLY be displayed on desktop devices. They will not appear on mobile.'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Image Preview */}
                    {images.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Uploaded Images ({images.length}/{maxFiles})
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {images.map((image) => (
                                    <div key={image.id} className="relative group">
                                        <img
                                            src={image.url}
                                            alt={image.name}
                                            className={`w-full h-20 object-cover rounded border ${
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
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b">
                                            <div className="truncate">{image.name}</div>
                                            {image.size && image.compressed_size && (
                                                <div className="text-green-300">
                                                    {formatFileSize(image.compressed_size)}
                                                    {image.size !== image.compressed_size && (
                                                        <span className="ml-1">
                                                            (-{Math.round(((image.size - image.compressed_size) / image.size) * 100)}%)
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    const formatFileSize = (bytes: number): string => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            {/* Compression Settings */}
            {showCompressionOptions && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-blue-800">
                            <Settings className="h-5 w-5" />
                            <span>Compression Settings</span>
                        </CardTitle>
                        <CardDescription className="text-blue-600">
                            Choose compression level for uploaded images. All images are limited to 30MB maximum.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="compression-level" className="text-sm font-medium text-blue-800">
                                    Compression Level
                                </Label>
                                <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select compression level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lossless">
                                            <div className="flex items-center space-x-2">
                                                <Zap className="h-4 w-4 text-green-500" />
                                                <div>
                                                    <div className="font-medium">Lossless</div>
                                                    <div className="text-xs text-gray-500">Remove metadata only (5-15% savings)</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="minimal">
                                            <div className="flex items-center space-x-2">
                                                <Zap className="h-4 w-4 text-blue-500" />
                                                <div>
                                                    <div className="font-medium">Minimal</div>
                                                    <div className="text-xs text-gray-500">Light compression (15-30% savings)</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="moderate">
                                            <div className="flex items-center space-x-2">
                                                <Zap className="h-4 w-4 text-orange-500" />
                                                <div>
                                                    <div className="font-medium">Moderate</div>
                                                    <div className="text-xs text-gray-500">Balanced compression (30-50% savings)</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="aggressive">
                                            <div className="flex items-center space-x-2">
                                                <Zap className="h-4 w-4 text-red-500" />
                                                <div>
                                                    <div className="font-medium">Aggressive</div>
                                                    <div className="text-xs text-gray-500">Maximum compression (50-70% savings)</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-blue-800">Current Settings</Label>
                                <div className="text-xs text-blue-600 space-y-1">
                                    <div>• Max file size: 30MB</div>
                                    <div>• Metadata removal: Always enabled</div>
                                    <div>• Quality preservation: Based on level</div>
                                    <div>• Format support: JPEG, PNG, WebP, GIF</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderUploadArea('mobile')}
                {renderUploadArea('desktop')}
            </div>
            
            {/* Usage Guidelines */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-sm text-blue-800">Usage Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-blue-700 space-y-2">
                    <div className="flex items-start space-x-2">
                        <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Mobile Images (4:5):</p>
                            <p>Used exclusively on mobile devices. Portrait orientation. Examples: Product detail views on phones.</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-2">
                        <Monitor className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Desktop Images (16:9):</p>
                            <p>Used exclusively on desktop devices. Landscape orientation. Examples: Hero banners, gallery views on computers.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DeviceImageUpload;
