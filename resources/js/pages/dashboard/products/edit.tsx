import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Upload, X, GripVertical } from 'lucide-react';
import DeviceImageUpload from '@/components/image/device-image-upload';
import DynamicImageSingle from '@/components/image/dynamic-image-single';

interface Category {
    id: number;
    name: string;
    is_accessory: boolean;
    products_count: number;
}

interface UnitType {
    id?: number;
    label: string;
    price: string;
    is_default: boolean;
}

interface MiscOption {
    id?: number;
    name?: string;
    label: string;
    value: string;
    is_default: boolean;
}

interface ProductImage {
    id: number;
    image_url: string;
    alt_text: string;
    image_type: string;
    sort_order: number;
    device_type?: 'mobile' | 'desktop';
    aspect_ratio?: number;
}

interface Product {
    id: number;
    name: string;
    description: string;
    slug: string;
    categories: Category[];
    unit_types: UnitType[];
    misc_options: MiscOption[];
    images: ProductImage[];
}

interface Props {
    product: Product;
    categories: Category[];
}

interface ImagePreview {
    file?: File;
    url: string;
    id: string;
    existing_id?: number;
    alt_text?: string;
    deviceType: 'mobile' | 'desktop';
    aspectRatio: number;
}

interface DeviceImageGroup {
    mobile: ImagePreview[];
    desktop: ImagePreview[];
}

interface ProductFormData {
    name: string;
    description: string;
    categories: number[];
    unit_types: UnitType[];
    misc_options: MiscOption[];
    mobile_images: File[];
    desktop_images: File[];
    existing_mobile_images: ProductImage[];
    existing_desktop_images: ProductImage[];
    [key: string]: any;
}

const breadcrumbs = (productId: number): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Products',
        href: '/dashboard/products',
    },
    {
        title: 'Edit',
        href: `/dashboard/products/${productId}/edit`,
    },
];

export default function ProductEdit({ product, categories }: Props) {
    const [imagesPreviews, setImagesPreviews] = useState<DeviceImageGroup>({
        mobile: [],
        desktop: []
    });
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors } = useForm<ProductFormData>({
        name: product.name || '',
        description: product.description || '',
        categories: product.categories.map(cat => cat.id) || [],
        unit_types: product.unit_types && product.unit_types.length > 0 
            ? product.unit_types 
            : [{ label: '', price: '0', is_default: true }],
        misc_options: product.misc_options || [],
        mobile_images: [] as File[],
        desktop_images: [] as File[],
        existing_mobile_images: product.images?.filter(img => img.device_type === 'mobile') || [],
        existing_desktop_images: product.images?.filter(img => img.device_type === 'desktop') || []
    });

    // Initialize existing images
    useEffect(() => {
        const mobileImages: ImagePreview[] = (product.images?.filter(img => img.device_type === 'mobile') || []).map(img => ({
            url: img.image_url,
            id: `existing-mobile-${img.id}`,
            existing_id: img.id,
            alt_text: img.alt_text,
            deviceType: 'mobile' as const,
            aspectRatio: 0.8
        }));
        
        const desktopImages: ImagePreview[] = (product.images?.filter(img => img.device_type === 'desktop') || []).map(img => ({
            url: img.image_url,
            id: `existing-desktop-${img.id}`,
            existing_id: img.id,
            alt_text: img.alt_text,
            deviceType: 'desktop' as const,
            aspectRatio: 1.78
        }));
        
        setImagesPreviews(prev => {
            // Don't reset images if we're currently submitting or if there are uploaded images to preserve
            if (isSubmitting) {
                return prev;
            }
            
            // Preserve newly uploaded images (those without existing_id) when reinitializing
            const newMobileUploads = prev.mobile.filter(img => !img.existing_id);
            const newDesktopUploads = prev.desktop.filter(img => !img.existing_id);
            
            return {
                mobile: [...mobileImages, ...newMobileUploads],
                desktop: [...desktopImages, ...newDesktopUploads]
            };
        });
    }, [product.images, isSubmitting]);

    // Note: unitTypes and miscOptions are now managed directly in form data

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate unit types before submission
        const hasEmptyUnitTypes = (data.unit_types as UnitType[]).some(ut => !ut.label.trim() || !ut.price.trim());
        if (hasEmptyUnitTypes) {
            alert('Please fill in all unit type labels and prices before submitting.');
            return;
        }

        setIsSubmitting(true);
        // Check if there are any files to upload
        const hasFiles = (data.mobile_images as File[]).length > 0 || (data.desktop_images as File[]).length > 0;
        
        if (hasFiles) {
            // Use FormData for file uploads with router.post
            const formData = new FormData();
            formData.append('name', data.name as string);
            formData.append('description', data.description as string);
            formData.append('_method', 'PUT');

            (data.categories as number[]).forEach((categoryId, index) => {
                formData.append(`categories[${index}]`, categoryId.toString());
            });

            (data.unit_types as UnitType[]).forEach((unitType, index) => {
                if (unitType.id) {
                    formData.append(`unit_types[${index}][id]`, unitType.id.toString());
                }
                formData.append(`unit_types[${index}][label]`, unitType.label);
                formData.append(`unit_types[${index}][price]`, unitType.price);
                formData.append(`unit_types[${index}][is_default]`, unitType.is_default ? '1' : '0');
            });

            (data.misc_options as MiscOption[]).forEach((miscOption, index) => {
                if (miscOption.id) {
                    formData.append(`misc_options[${index}][id]`, miscOption.id.toString());
                }
                formData.append(`misc_options[${index}][label]`, miscOption.label);
                formData.append(`misc_options[${index}][value]`, miscOption.value);
                formData.append(`misc_options[${index}][is_default]`, miscOption.is_default ? '1' : '0');
            });

            (data.mobile_images as File[]).forEach((image, index) => {
                formData.append(`mobile_images[${index}]`, image);
            });
            
            (data.desktop_images as File[]).forEach((image, index) => {
                formData.append(`desktop_images[${index}]`, image);
            });

            // Send existing images order for mobile
            imagesPreviews.mobile.forEach((preview, index) => {
                if (preview.existing_id) {
                    formData.append(`existing_mobile_images_order[${index}]`, preview.existing_id.toString());
                }
            });
            
            // Send existing images order for desktop
            imagesPreviews.desktop.forEach((preview, index) => {
                if (preview.existing_id) {
                    formData.append(`existing_desktop_images_order[${index}]`, preview.existing_id.toString());
                }
            });

            router.post(`/dashboard/products/${product.id}`, formData, {
                forceFormData: true,
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Clear the uploaded images from state after successful submission
                setData('mobile_images', [] as File[]);
                setData('desktop_images', [] as File[]);
                    
                    // Clear image previews for newly uploaded images only
                    setImagesPreviews(prev => ({
                        mobile: prev.mobile.filter(img => img.existing_id),
                        desktop: prev.desktop.filter(img => img.existing_id)
                    }));
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    // Preserve image state on validation error
                    // Images remain in both data state and preview state
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } else {
            // Use regular object for data without files
            const submissionData = {
                ...data,
                unit_types: data.unit_types,
                misc_options: data.misc_options,
                _method: 'PUT'
            };

            router.post(`/dashboard/products/${product.id}`, submissionData, {
                preserveState: true,
                preserveScroll: true,
                onError: (errors: any) => {
                    console.error('Validation errors:', errors);
                    // Preserve all state on validation error
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        }
    };

    const addUnitType = () => {
        const newUnitTypes = [...(data.unit_types as UnitType[]), { label: '', price: '0', is_default: false }];
        setData('unit_types', newUnitTypes);
    };

    const removeUnitType = (index: number) => {
        if ((data.unit_types as UnitType[]).length > 1) {
            const newUnitTypes = (data.unit_types as UnitType[]).filter((_, i) => i !== index);
            setData('unit_types', newUnitTypes);
        }
    };

    const updateUnitType = (index: number, field: keyof UnitType, value: string | boolean | number) => {
        const newUnitTypes = [...(data.unit_types as UnitType[])];
        if (field === 'is_default' && value === true) {
            newUnitTypes.forEach((ut, i) => {
                ut.is_default = i === index;
            });
        } else {
            newUnitTypes[index] = { ...newUnitTypes[index], [field]: value };
        }
        setData('unit_types', newUnitTypes);
    };

    const addMiscOption = () => {
        const newMiscOptions = [...(data.misc_options as MiscOption[]), { label: '', value: '', is_default: false }];
        setData('misc_options', newMiscOptions);
     };

     const removeMiscOption = (index: number) => {
         const newMiscOptions = (data.misc_options as MiscOption[]).filter((_, i) => i !== index);
         setData('misc_options', newMiscOptions);
     };

     const updateMiscOption = (index: number, field: keyof MiscOption, value: string | boolean) => {
         const newMiscOptions = [...(data.misc_options as MiscOption[])];
         newMiscOptions[index] = { ...newMiscOptions[index], [field]: value };
         setData('misc_options', newMiscOptions);
     };

    const handleCategoryChange = (value: string) => {
        if (value && !(data.categories as number[]).includes(parseInt(value))) {
            setData('categories', [...(data.categories as number[]), parseInt(value)]);
            setSelectedCategory('');
        }
    };

    const removeCategoryFromSelection = (categoryId: number) => {
        setData('categories', (data.categories as number[]).filter(id => id !== categoryId));
    };

    const handleMobileUpload = (files: FileList, compressionLevel?: string) => {
        const fileArray = Array.from(files);
        const newPreviews: ImagePreview[] = fileArray.map(file => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
            deviceType: 'mobile' as const,
            aspectRatio: 0.8
        }));

        setImagesPreviews(prev => ({
            ...prev,
            mobile: [...prev.mobile, ...newPreviews]
        }));
        
        setData('mobile_images', [...(data.mobile_images as File[]), ...fileArray]);
    };

    const handleDesktopUpload = (files: FileList, compressionLevel?: string) => {
        const fileArray = Array.from(files);
        const newPreviews: ImagePreview[] = fileArray.map(file => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
            deviceType: 'desktop' as const,
            aspectRatio: 1.78
        }));

        setImagesPreviews(prev => ({
            ...prev,
            desktop: [...prev.desktop, ...newPreviews]
        }));
        
        setData('desktop_images', [...(data.desktop_images as File[]), ...fileArray]);
    };

    const removeImage = (imageId: string, deviceType: 'mobile' | 'desktop') => {
        const imageToRemove = imagesPreviews[deviceType].find(img => img.id === imageId);
        if (imageToRemove) {
            if (imageToRemove.url.startsWith('blob:')) {
                URL.revokeObjectURL(imageToRemove.url);
            }
            setImagesPreviews(prev => ({
                ...prev,
                [deviceType]: prev[deviceType].filter(img => img.id !== imageId)
            }));
            if (imageToRemove.file) {
                const currentImages = deviceType === 'mobile' ? (data.mobile_images as File[]) : (data.desktop_images as File[]);
                setData(
                    deviceType === 'mobile' ? 'mobile_images' : 'desktop_images', 
                    currentImages.filter(file => file !== imageToRemove.file)
                );
            }
        }
    };

    const moveImage = (fromIndex: number, toIndex: number, deviceType: 'mobile' | 'desktop') => {
        const newPreviews = [...imagesPreviews[deviceType]];
        const [movedPreview] = newPreviews.splice(fromIndex, 1);
        newPreviews.splice(toIndex, 0, movedPreview);

        setImagesPreviews(prev => ({
            ...prev,
            [deviceType]: newPreviews
        }));
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            [...imagesPreviews.mobile, ...imagesPreviews.desktop].forEach(image => {
                if (image && image.url && image.url.startsWith('blob:')) {
                    URL.revokeObjectURL(image.url);
                }
            });
        };
    }, [imagesPreviews]);

    return (
        <AppLayout breadcrumbs={breadcrumbs(product.id)}>
            <Head title={`Edit Product - ${product.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Edit Product</h1>
                        <p className="text-muted-foreground">
                            Update product information and settings.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/products">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    value={data.name as string}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter product name"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description as string}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter product description"
                                    rows={4}
                                />
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="category-select">Add Category</Label>
                                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category to add" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories
                                            .filter(category => !(data.categories as number[]).includes(category.id))
                                            .map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>
                                                            {category.name}
                                                            {category.is_accessory && (
                                                                <span className="ml-1 text-xs text-muted-foreground">(Accessory)</span>
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            {category.products_count} products
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Selected Categories */}
                            {(data.categories as number[]).length > 0 && (
                                <div>
                                    <Label>Selected Categories</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(data.categories as number[]).map((categoryId: number) => {
                                            const category = categories.find(c => c.id === categoryId);
                                            return category ? (
                                                <div key={categoryId} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                    <span>
                                                        {category.name}
                                                        {category.is_accessory && (
                                                            <span className="ml-1 text-xs">(Accessory)</span>
                                                        )}
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            ({category.products_count} products)
                                                        </span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCategoryFromSelection(categoryId)}
                                                        className="ml-2 hover:text-blue-900"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                            {errors.categories && <p className="text-sm text-red-600">{errors.categories}</p>}
                        </CardContent>
                    </Card>

                    {/* Product Images Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gambar Produk</CardTitle>
                            <CardDescription>
                                Kelola semua gambar produk dalam satu tempat. Gambar pertama akan menjadi thumbnail utama.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Unified Image Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {/* Existing Images from Server */}
                                {product.images?.map((image, index) => {
                                    const isMobile = image.device_type === 'mobile';
                                    const isFirstImage = index === 0;
                                    return (
                                        <div key={`existing-${image.id}`} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                                            <div className={isMobile ? "aspect-[4/5]" : "aspect-[16/9]"}>
                                                <img
                                                    src={image.image_url}
                                                    alt={image.alt_text || `${isMobile ? 'Mobile' : 'Desktop'} Image ${index + 1}`}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/images/placeholder-product.svg';
                                                    }}
                                                />
                                            </div>
                                            
                                            {/* Device Type Label */}
                                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                {isMobile ? 'Mobile' : 'Desktop'}
                                            </div>
                                            
                                            {/* Thumbnail Badge */}
                                            {isFirstImage && (
                                                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                                    Thumbnail
                                                </div>
                                            )}
                                            
                                            {/* Server Badge */}
                                            <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                Server
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {/* New Uploaded Images Preview */}
                                {[...imagesPreviews.mobile, ...imagesPreviews.desktop].map((image, index) => {
                                    const isMobile = image.deviceType === 'mobile';
                                    const globalIndex = (product.images?.length || 0) + index;
                                    const isFirstOverall = globalIndex === 0;
                                    
                                    return (
                                        <div key={image.id} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                                            <div className={isMobile ? "aspect-[4/5]" : "aspect-[16/9]"}>
                                                <img
                                                    src={image.url}
                                                    alt={`${isMobile ? 'Mobile' : 'Desktop'} Preview ${index + 1}`}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            
                                            {/* Device Type Label */}
                                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                {isMobile ? 'Mobile' : 'Desktop'}
                                            </div>
                                            
                                            {/* Thumbnail Badge */}
                                            {isFirstOverall && (
                                                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                                    Thumbnail
                                                </div>
                                            )}
                                            
                                            {/* New Upload Badge */}
                                            <div className="absolute bottom-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                                                Baru
                                            </div>
                                            
                                            {/* Action Controls */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {index > 0 && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => moveImage(index, index - 1, image.deviceType)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        ↑
                                                    </Button>
                                                )}
                                                {index < imagesPreviews[image.deviceType].length - 1 && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => moveImage(index, index + 1, image.deviceType)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        ↓
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => removeImage(image.id, image.deviceType)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {/* Empty State */}
                                {(!product.images || product.images.length === 0) && 
                                 imagesPreviews.mobile.length === 0 && 
                                 imagesPreviews.desktop.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-lg font-medium">Belum ada gambar</p>
                                        <p className="text-sm">Upload gambar mobile dan desktop untuk produk ini</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Upload Controls */}
                            <div className="border-t pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Upload Gambar Mobile (4:5)</Label>
                                        <DeviceImageUpload
                                            onMobileUpload={handleMobileUpload}
                                            onDesktopUpload={() => {}}
                                            maxFiles={10}
                                            disabled={processing}
                                            showCompressionOptions={true}
                                            defaultCompressionLevel="moderate"
                                            mobileImages={[]}
                                            desktopImages={[]}
                                            onRemoveImage={() => {}}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Upload Gambar Desktop (16:9)</Label>
                                        <DeviceImageUpload
                                            onMobileUpload={() => {}}
                                            onDesktopUpload={handleDesktopUpload}
                                            maxFiles={10}
                                            disabled={processing}
                                            showCompressionOptions={true}
                                            defaultCompressionLevel="moderate"
                                            mobileImages={[]}
                                            desktopImages={[]}
                                            onRemoveImage={() => {}}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Preview Component */}
                            {(product.images && product.images.length > 0) && (
                                <div className="border-t pt-6">
                                    <Label className="text-sm font-medium mb-2 block">Preview Frontend</Label>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Pratinjau bagaimana gambar akan tampil di halaman produk
                                    </p>
                                    <div className="max-w-md">
                                        <DynamicImageSingle
                                            productId={product.id.toString()}
                                            alt={`${product.name} preview`}
                                            className="border rounded-lg"
                                            useDatabase={true}
                                            preferThumbnail={true}
                                            debug={false}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                     {/* Unit Types & Pricing */}
                     <Card>
                         <CardHeader>
                             <CardTitle>Unit Types & Pricing</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-4">
                             {(data.unit_types as UnitType[]).map((unitType, index) => (
                                 <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                     <div className="flex-1">
                                         <Input
                                             placeholder="Unit type (e.g., Small, Medium, Large)"
                                             value={unitType.label}
                                             onChange={(e) => updateUnitType(index, 'label', e.target.value)}
                                         />
                                     </div>
                                     <div className="flex-1">
                                         <Input
                                             type="text"
                                             placeholder="Price"
                                             value={unitType.price}
                                             onChange={(e) => updateUnitType(index, 'price', e.target.value)}
                                         />
                                     </div>
                                     <div className="flex items-center space-x-2">
                                         <Checkbox
                                             checked={unitType.is_default}
                                             onCheckedChange={(checked) => updateUnitType(index, 'is_default', checked)}
                                         />
                                         <Label>Default</Label>
                                     </div>
                                     <Button
                                         type="button"
                                         variant="destructive"
                                         size="sm"
                                         onClick={() => removeUnitType(index)}
                                     >
                                         Remove
                                     </Button>
                                 </div>
                             ))}
                             
                             <Button
                                 type="button"
                                 variant="outline"
                                 onClick={addUnitType}
                                 className="w-full"
                             >
                                 Add Unit Type
                             </Button>
                             
                             {errors.unit_types && (
                                 <div className="text-red-500 text-sm">{errors.unit_types}</div>
                             )}
                         </CardContent>
                     </Card>

                     {/* Misc Options */}
                     <Card>
                         <CardHeader>
                             <CardTitle>Misc Options</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-4">
                             {(data.misc_options as MiscOption[]).map((option, index) => (
                                 <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                     <div className="flex-1">
                                         <Input
                                             placeholder="Option label"
                                             value={option.label}
                                             onChange={(e) => updateMiscOption(index, 'label', e.target.value)}
                                         />
                                     </div>
                                     <div className="flex-1">
                                         <Input
                                             placeholder="Option value"
                                             value={option.value}
                                             onChange={(e) => updateMiscOption(index, 'value', e.target.value)}
                                         />
                                     </div>
                                     <div className="flex items-center space-x-2">
                                         <Checkbox
                                             checked={option.is_default}
                                             onCheckedChange={(checked) => updateMiscOption(index, 'is_default', checked)}
                                         />
                                         <Label>Default</Label>
                                     </div>
                                     <Button
                                         type="button"
                                         variant="destructive"
                                         size="sm"
                                         onClick={() => removeMiscOption(index)}
                                     >
                                         Remove
                                     </Button>
                                 </div>
                             ))}
                             
                             <Button
                                 type="button"
                                 variant="outline"
                                 onClick={addMiscOption}
                                 className="w-full"
                             >
                                 Add Misc Option
                             </Button>
                         </CardContent>
                     </Card>

                     {/* Submit */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/products">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}