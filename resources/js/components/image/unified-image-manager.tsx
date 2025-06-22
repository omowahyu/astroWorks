import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
    Smartphone, 
    Monitor, 
    Upload, 
    X, 
    Settings2, 
    ImageIcon, 
    CheckCircle, 
    AlertCircle,
    Trash2,
    GripVertical,
    Eye,
    RotateCcw
} from 'lucide-react';

interface ExistingImage {
    id: number;
    image_url: string;
    alt_text: string;
    image_type: string;
    sort_order: number;
    device_type: 'mobile' | 'desktop';
    aspect_ratio?: number;
}

interface NewImagePreview {
    file: File;
    url: string;
    id: string;
    deviceType: 'mobile' | 'desktop';
    aspectRatio: number;
}

interface UnifiedImageManagerProps {
    existingImages: ExistingImage[];
    onMobileUpload: (files: FileList, compressionLevel?: string) => void;
    onDesktopUpload: (files: FileList, compressionLevel?: string) => void;
    onDeleteExisting: (imageId: number) => void;
    onRestoreExisting: (imageId: number) => void;
    newMobileImages: NewImagePreview[];
    newDesktopImages: NewImagePreview[];
    onRemoveNewImage: (imageId: string, deviceType: 'mobile' | 'desktop') => void;
    maxFiles?: number;
    disabled?: boolean;
    showCompressionOptions?: boolean;
    defaultCompressionLevel?: string;
    deletedImageIds?: number[];
}

// Image state types
type ImageState = 'existing' | 'new' | 'deleted';

interface UnifiedImage {
    id: string;
    displayId: number | string;
    url: string;
    name: string;
    deviceType: 'mobile' | 'desktop';
    state: ImageState;
    sortOrder: number;
    file?: File;
    existingId?: number;
}

const UnifiedImageManager: React.FC<UnifiedImageManagerProps> = ({
    existingImages,
    onMobileUpload,
    onDesktopUpload,
    onDeleteExisting,
    onRestoreExisting,
    newMobileImages,
    newDesktopImages,
    onRemoveNewImage,
    maxFiles = 10,
    disabled = false,
    showCompressionOptions = true,
    defaultCompressionLevel = 'lossless',
    deletedImageIds = []
}) => {
    const [dragOver, setDragOver] = useState<'mobile' | 'desktop' | null>(null);
    const [compressionLevel, setCompressionLevel] = useState(defaultCompressionLevel);
    const [viewMode, setViewMode] = useState<'unified' | 'separated'>('unified');

    // Combine all images into unified view
    const getUnifiedImages = useCallback((): { mobile: UnifiedImage[], desktop: UnifiedImage[] } => {
        const mobileImages: UnifiedImage[] = [];
        const desktopImages: UnifiedImage[] = [];

        // Add existing images
        existingImages.forEach(img => {
            const isDeleted = deletedImageIds.includes(img.id);
            const unifiedImg: UnifiedImage = {
                id: `existing-${img.id}`,
                displayId: img.id,
                url: img.image_url,
                name: img.alt_text || `Image ${img.id}`,
                deviceType: img.device_type,
                state: isDeleted ? 'deleted' : 'existing',
                sortOrder: img.sort_order,
                existingId: img.id
            };

            if (img.device_type === 'mobile') {
                mobileImages.push(unifiedImg);
            } else {
                desktopImages.push(unifiedImg);
            }
        });

        // Add new images
        newMobileImages.forEach((img, index) => {
            mobileImages.push({
                id: img.id,
                displayId: img.id,
                url: img.url,
                name: img.file.name,
                deviceType: 'mobile',
                state: 'new',
                sortOrder: 1000 + index, // High sort order for new images
                file: img.file
            });
        });

        newDesktopImages.forEach((img, index) => {
            desktopImages.push({
                id: img.id,
                displayId: img.id,
                url: img.url,
                name: img.file.name,
                deviceType: 'desktop',
                state: 'new',
                sortOrder: 1000 + index, // High sort order for new images
                file: img.file
            });
        });

        // Sort by sort order
        mobileImages.sort((a, b) => a.sortOrder - b.sortOrder);
        desktopImages.sort((a, b) => a.sortOrder - b.sortOrder);

        return { mobile: mobileImages, desktop: desktopImages };
    }, [existingImages, newMobileImages, newDesktopImages, deletedImageIds]);

    const unifiedImages = getUnifiedImages();

    // File upload handlers with compression
    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, deviceType: 'mobile' | 'desktop') => {
        const files = e.target.files;
        if (files && files.length > 0) {
            if (deviceType === 'mobile') {
                onMobileUpload(files, compressionLevel);
            } else {
                onDesktopUpload(files, compressionLevel);
            }
        }
        e.target.value = '';
    }, [onMobileUpload, onDesktopUpload, compressionLevel]);

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
            if (deviceType === 'mobile') {
                onMobileUpload(files, compressionLevel);
            } else {
                onDesktopUpload(files, compressionLevel);
            }
        }
    }, [onMobileUpload, onDesktopUpload, compressionLevel]);

    // Get state badge for images
    const getStateBadge = (state: ImageState) => {
        switch (state) {
            case 'existing':
                return <Badge variant="secondary" className="text-xs">Saved</Badge>;
            case 'new':
                return <Badge variant="default" className="text-xs bg-green-500">New</Badge>;
            case 'deleted':
                return <Badge variant="destructive" className="text-xs">Deleted</Badge>;
        }
    };

    // Get action buttons for each image
    const getActionButtons = (image: UnifiedImage) => {
        if (image.state === 'existing') {
            return (
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteExisting(image.existingId!)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={disabled}
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            );
        } else if (image.state === 'deleted') {
            return (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRestoreExisting(image.existingId!)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={disabled}
                >
                    <RotateCcw className="h-3 w-3" />
                </Button>
            );
        } else {
            return (
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveNewImage(image.id, image.deviceType)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={disabled}
                >
                    <X className="h-3 w-3" />
                </Button>
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Image Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage existing images and upload new ones in a unified interface
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        type="button"
                        variant={viewMode === 'unified' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('unified')}
                    >
                        Unified View
                    </Button>
                    <Button
                        type="button"
                        variant={viewMode === 'separated' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('separated')}
                    >
                        Separated View
                    </Button>
                </div>
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

            {/* Image Management Area */}
            {viewMode === 'unified' ? (
                // Unified View - All images together
                <div className="space-y-6">
                    {/* Mobile Images Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Smartphone className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Mobile Images (4:5)</CardTitle>
                                        <CardDescription>
                                            {unifiedImages.mobile.filter(img => img.state !== 'deleted').length} active images
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('mobile-file-input')?.click()}
                                    disabled={disabled}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Add Mobile Images
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Mobile Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                                    dragOver === 'mobile'
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-300 hover:border-green-400'
                                } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                onDragOver={(e) => handleDragOver(e, 'mobile')}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 'mobile')}
                                onClick={() => !disabled && document.getElementById('mobile-file-input')?.click()}
                            >
                                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                    Drop mobile images here or click to browse
                                </p>
                            </div>

                            {/* Mobile Images Grid */}
                            {unifiedImages.mobile.length > 0 && (
                                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                    {unifiedImages.mobile.map((image) => (
                                        <div key={image.id} className="group relative">
                                            <div className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                                                image.state === 'deleted'
                                                    ? 'border-red-300 opacity-50'
                                                    : image.state === 'new'
                                                    ? 'border-green-300'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                                <img
                                                    src={image.url}
                                                    alt={image.name}
                                                    className="w-full aspect-[4/5] object-cover"
                                                />

                                                {/* State Badge */}
                                                <div className="absolute top-2 left-2">
                                                    {getStateBadge(image.state)}
                                                </div>

                                                {/* Action Button */}
                                                <div className="absolute top-2 right-2">
                                                    {getActionButtons(image)}
                                                </div>

                                                {/* Image Info Overlay */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                    <p className="text-white text-xs truncate">{image.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Desktop Images Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Monitor className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Desktop Images (16:9)</CardTitle>
                                        <CardDescription>
                                            {unifiedImages.desktop.filter(img => img.state !== 'deleted').length} active images
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('desktop-file-input')?.click()}
                                    disabled={disabled}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Add Desktop Images
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Desktop Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                                    dragOver === 'desktop'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-blue-400'
                                } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                onDragOver={(e) => handleDragOver(e, 'desktop')}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 'desktop')}
                                onClick={() => !disabled && document.getElementById('desktop-file-input')?.click()}
                            >
                                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                    Drop desktop images here or click to browse
                                </p>
                            </div>

                            {/* Desktop Images Grid */}
                            {unifiedImages.desktop.length > 0 && (
                                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                    {unifiedImages.desktop.map((image) => (
                                        <div key={image.id} className="group relative">
                                            <div className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                                                image.state === 'deleted'
                                                    ? 'border-red-300 opacity-50'
                                                    : image.state === 'new'
                                                    ? 'border-green-300'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                                <img
                                                    src={image.url}
                                                    alt={image.name}
                                                    className="w-full aspect-[16/9] object-cover"
                                                />

                                                {/* State Badge */}
                                                <div className="absolute top-2 left-2">
                                                    {getStateBadge(image.state)}
                                                </div>

                                                {/* Action Button */}
                                                <div className="absolute top-2 right-2">
                                                    {getActionButtons(image)}
                                                </div>

                                                {/* Image Info Overlay */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                    <p className="text-white text-xs truncate">{image.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                // Separated View - Traditional side-by-side layout
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Mobile Column */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Smartphone className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle>Mobile Images</CardTitle>
                                    <CardDescription>4:5 aspect ratio</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Mobile upload and images */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                                    dragOver === 'mobile' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                }`}
                                onDragOver={(e) => handleDragOver(e, 'mobile')}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 'mobile')}
                                onClick={() => document.getElementById('mobile-file-input')?.click()}
                            >
                                <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Drop or click to upload</p>
                            </div>

                            {unifiedImages.mobile.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {unifiedImages.mobile.map((image) => (
                                        <div key={image.id} className="group relative">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className={`w-full aspect-[4/5] object-cover rounded border-2 ${
                                                    image.state === 'deleted' ? 'opacity-50 border-red-300' : 'border-gray-200'
                                                }`}
                                            />
                                            <div className="absolute top-1 left-1">{getStateBadge(image.state)}</div>
                                            <div className="absolute top-1 right-1">{getActionButtons(image)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Desktop Column */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Monitor className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle>Desktop Images</CardTitle>
                                    <CardDescription>16:9 aspect ratio</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Desktop upload and images */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                                    dragOver === 'desktop' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                }`}
                                onDragOver={(e) => handleDragOver(e, 'desktop')}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 'desktop')}
                                onClick={() => document.getElementById('desktop-file-input')?.click()}
                            >
                                <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Drop or click to upload</p>
                            </div>

                            {unifiedImages.desktop.length > 0 && (
                                <div className="grid grid-cols-1 gap-2">
                                    {unifiedImages.desktop.map((image) => (
                                        <div key={image.id} className="group relative">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className={`w-full aspect-[16/9] object-cover rounded border-2 ${
                                                    image.state === 'deleted' ? 'opacity-50 border-red-300' : 'border-gray-200'
                                                }`}
                                            />
                                            <div className="absolute top-1 left-1">{getStateBadge(image.state)}</div>
                                            <div className="absolute top-1 right-1">{getActionButtons(image)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Hidden File Inputs */}
            <input
                id="mobile-file-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'mobile')}
                disabled={disabled}
            />
            <input
                id="desktop-file-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'desktop')}
                disabled={disabled}
            />

            {/* Summary */}
            <Card className="bg-gray-50">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {unifiedImages.mobile.filter(img => img.state === 'existing').length}
                            </div>
                            <div className="text-sm text-gray-600">Mobile Saved</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {unifiedImages.desktop.filter(img => img.state === 'existing').length}
                            </div>
                            <div className="text-sm text-gray-600">Desktop Saved</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-600">
                                {unifiedImages.mobile.filter(img => img.state === 'new').length +
                                 unifiedImages.desktop.filter(img => img.state === 'new').length}
                            </div>
                            <div className="text-sm text-gray-600">New Uploads</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600">
                                {deletedImageIds.length}
                            </div>
                            <div className="text-sm text-gray-600">Marked for Deletion</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UnifiedImageManager;
