import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Upload, X, GripVertical } from 'lucide-react';
import DeviceImageUpload from '@/components/image/device-image-upload';

interface Category {
    id: number;
    name: string;
    is_accessory: boolean;
    products_count: number;
}

interface Props {
    categories: Category[];
}

interface UnitType {
    label: string;
    price: string;
    is_default: boolean;
}

interface MiscOption {
    label: string;
    value: string;
    is_default: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Products',
        href: '/dashboard/products',
    },
    {
        title: 'Create',
        href: '/dashboard/products/create',
    },
];

interface ImagePreview {
    file: File;
    url: string;
    id: string;
}

export default function ProductCreate({ categories }: Props) {
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([
        { label: '', price: '', is_default: true }
    ]);
    const [miscOptions, setMiscOptions] = useState<MiscOption[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [mobileImages, setMobileImages] = useState<Array<{ id: number; url: string; name: string; size?: number; compressed_size?: number }>>([]);
    const [desktopImages, setDesktopImages] = useState<Array<{ id: number; url: string; name: string; size?: number; compressed_size?: number }>>([]);
    const [productId, setProductId] = useState<number | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        categories: [] as number[],
        unit_types: unitTypes,
        misc_options: miscOptions
    });

    // Sync unitTypes and miscOptions with form data
    useEffect(() => {
        setData('unit_types', unitTypes);
    }, [unitTypes, setData]);

    useEffect(() => {
        setData('misc_options', miscOptions);
    }, [miscOptions, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create FormData for proper file upload handling
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);

        // Add categories
        data.categories.forEach((categoryId, index) => {
            formData.append(`categories[${index}]`, categoryId.toString());
        });

        // Add unit types
        unitTypes.forEach((unitType, index) => {
            formData.append(`unit_types[${index}][label]`, unitType.label);
            formData.append(`unit_types[${index}][price]`, unitType.price);
            formData.append(`unit_types[${index}][is_default]`, unitType.is_default ? '1' : '0');
        });

        // Add misc options
        miscOptions.forEach((miscOption, index) => {
            formData.append(`misc_options[${index}][label]`, miscOption.label);
            formData.append(`misc_options[${index}][value]`, miscOption.value);
            formData.append(`misc_options[${index}][is_default]`, miscOption.is_default ? '1' : '0');
        });

        // Use fetch for better control over the response
        fetch('/dashboard/products', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
        .then(async response => {
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (data.success) {
                    console.log('Product created successfully!');
                    setProductId(data.product.id);
                    alert('Product created successfully! You can now upload images.');
                } else {
                    console.error('Product creation failed:', data);
                    alert('Product creation failed: ' + (data.message || 'Please check the form for errors.'));
                }
            } else {
                // Handle redirect or HTML response (validation errors)
                const text = await response.text();
                console.log('Non-JSON response received:', response.status, text.substring(0, 200));

                if (response.status === 422) {
                    alert('Validation errors occurred. Please check the form and try again.');
                } else if (response.status === 302 || response.status === 200) {
                    // Might be a redirect, check if product was created
                    alert('Form submitted, but response format was unexpected. Please check if the product was created.');
                } else {
                    alert('An error occurred while creating the product. Status: ' + response.status);
                }
            }
        })
        .catch(error => {
            console.error('Error creating product:', error);
            alert('An error occurred while creating the product: ' + error.message);
        });
    };

    const addUnitType = () => {
        setUnitTypes([...unitTypes, { label: '', price: '', is_default: false }]);
    };

    const removeUnitType = (index: number) => {
        if (unitTypes.length > 1) {
            const newUnitTypes = unitTypes.filter((_, i) => i !== index);
            setUnitTypes(newUnitTypes);
        }
    };

    const updateUnitType = (index: number, field: keyof UnitType, value: string | boolean) => {
        const newUnitTypes = [...unitTypes];
        if (field === 'is_default' && value === true) {
            // Only one can be default
            newUnitTypes.forEach((ut, i) => {
                ut.is_default = i === index;
            });
        } else {
            newUnitTypes[index] = { ...newUnitTypes[index], [field]: value };
        }
        setUnitTypes(newUnitTypes);
    };

    const addMiscOption = () => {
        setMiscOptions([...miscOptions, { label: '', value: '', is_default: false }]);
    };

    const removeMiscOption = (index: number) => {
        const newMiscOptions = miscOptions.filter((_, i) => i !== index);
        setMiscOptions(newMiscOptions);
    };

    const updateMiscOption = (index: number, field: keyof MiscOption, value: string | boolean) => {
        const newMiscOptions = [...miscOptions];
        newMiscOptions[index] = { ...newMiscOptions[index], [field]: value };
        setMiscOptions(newMiscOptions);
    };

    const handleCategoryChange = (value: string) => {
        if (value && !data.categories.includes(parseInt(value))) {
            setData('categories', [...data.categories, parseInt(value)]);
            setSelectedCategory('');
        }
    };

    const removeCategoryFromSelection = (categoryId: number) => {
        setData('categories', data.categories.filter(id => id !== categoryId));
    };

    // Handle mobile image upload
    const handleMobileUpload = async (files: FileList, compressionLevel: string = 'lossless') => {
        if (!productId) {
            console.error('Product must be created first before uploading images');
            return;
        }

        const formData = new FormData();
        formData.append('product_id', productId.toString());
        formData.append('device_type', 'mobile');
        formData.append('image_type', 'gallery');
        formData.append('compression_level', compressionLevel);

        Array.from(files).forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });

        try {
            const response = await fetch('/dashboard/images/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            if (result.success) {
                // Update mobile images state
                const newImages = result.data.uploaded_images.map((img: any) => ({
                    id: img.id,
                    url: `/storage/${img.image_path}`,
                    name: img.alt_text,
                    size: img.image_dimensions?.original_size,
                    compressed_size: img.image_dimensions?.compressed_size,
                }));
                setMobileImages(prev => [...prev, ...newImages]);
            }
        } catch (error) {
            console.error('Mobile image upload failed:', error);
        }
    };

    // Handle desktop image upload
    const handleDesktopUpload = async (files: FileList, compressionLevel: string = 'lossless') => {
        if (!productId) {
            console.error('Product must be created first before uploading images');
            return;
        }

        const formData = new FormData();
        formData.append('product_id', productId.toString());
        formData.append('device_type', 'desktop');
        formData.append('image_type', 'gallery');
        formData.append('compression_level', compressionLevel);

        Array.from(files).forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });

        try {
            const response = await fetch('/dashboard/images/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            if (result.success) {
                // Update desktop images state
                const newImages = result.data.uploaded_images.map((img: any) => ({
                    id: img.id,
                    url: `/storage/${img.image_path}`,
                    name: img.alt_text,
                    size: img.image_dimensions?.original_size,
                    compressed_size: img.image_dimensions?.compressed_size,
                }));
                setDesktopImages(prev => [...prev, ...newImages]);
            }
        } catch (error) {
            console.error('Desktop image upload failed:', error);
        }
    };

    // Handle image removal
    const handleRemoveImage = async (imageId: number, deviceType: 'mobile' | 'desktop') => {
        try {
            const response = await fetch('/dashboard/images/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ image_id: imageId }),
            });

            if (response.ok) {
                if (deviceType === 'mobile') {
                    setMobileImages(prev => prev.filter(img => img.id !== imageId));
                } else {
                    setDesktopImages(prev => prev.filter(img => img.id !== imageId));
                }
            }
        } catch (error) {
            console.error('Image removal failed:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Create Product</h1>
                        <p className="text-muted-foreground">
                            Add a new product to your catalog.
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
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter product name"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
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
                                            .filter(category => !data.categories.includes(category.id))
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
                            {data.categories.length > 0 && (
                                <div>
                                    <Label>Selected Categories</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {data.categories.map((categoryId) => {
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

                    {/* Unit Types */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Unit Types & Pricing</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addUnitType}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Unit Type
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {unitTypes.map((unitType, index) => (
                                <div key={index} className="flex items-end space-x-4 p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <Label htmlFor={`unit-label-${index}`}>Label</Label>
                                        <Input
                                            id={`unit-label-${index}`}
                                            value={unitType.label}
                                            onChange={(e) => updateUnitType(index, 'label', e.target.value)}
                                            placeholder="e.g., 2.4x2.7m"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor={`unit-price-${index}`}>Price (IDR)</Label>
                                        <Input
                                            id={`unit-price-${index}`}
                                            type="number"
                                            value={unitType.price}
                                            onChange={(e) => updateUnitType(index, 'price', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`unit-default-${index}`}
                                            checked={unitType.is_default}
                                            onCheckedChange={(checked) =>
                                                updateUnitType(index, 'is_default', checked as boolean)
                                            }
                                        />
                                        <Label htmlFor={`unit-default-${index}`} className="text-sm">Default</Label>
                                    </div>
                                    {unitTypes.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeUnitType(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {errors.unit_types && <p className="text-sm text-red-600">{errors.unit_types}</p>}
                        </CardContent>
                    </Card>

                    {/* Misc Options */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Misc Options (Colors, Themes, etc.)</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addMiscOption}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Option
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {miscOptions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No misc options added yet.</p>
                            ) : (
                                miscOptions.map((miscOption, index) => (
                                    <div key={index} className="flex items-end space-x-4 p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <Label htmlFor={`misc-label-${index}`}>Label</Label>
                                            <Input
                                                id={`misc-label-${index}`}
                                                value={miscOption.label}
                                                onChange={(e) => updateMiscOption(index, 'label', e.target.value)}
                                                placeholder="e.g., Warna"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor={`misc-value-${index}`}>Value</Label>
                                            <Input
                                                id={`misc-value-${index}`}
                                                value={miscOption.value}
                                                onChange={(e) => updateMiscOption(index, 'value', e.target.value)}
                                                placeholder="e.g., Hitam"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`misc-default-${index}`}
                                                checked={miscOption.is_default}
                                                onCheckedChange={(checked) =>
                                                    updateMiscOption(index, 'is_default', checked as boolean)
                                                }
                                            />
                                            <Label htmlFor={`misc-default-${index}`} className="text-sm">Default</Label>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeMiscOption(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Images</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Upload separate images for mobile (4:5 ratio) and desktop (16:9 ratio) devices.
                                Images will be automatically validated and compressed.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!productId ? (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        Please create the product first by filling out the form above and clicking "Create Product".
                                        Then you can upload images for mobile and desktop devices.
                                    </p>
                                </div>
                            ) : (
                                <DeviceImageUpload
                                    onMobileUpload={handleMobileUpload}
                                    onDesktopUpload={handleDesktopUpload}
                                    mobileImages={mobileImages}
                                    desktopImages={desktopImages}
                                    onRemoveImage={handleRemoveImage}
                                    maxFiles={10}
                                    disabled={processing}
                                    showCompressionOptions={true}
                                    defaultCompressionLevel="lossless"
                                />
                            )}
                            {errors.images && <p className="text-sm text-red-600 mt-1">{errors.images}</p>}
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/products">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}