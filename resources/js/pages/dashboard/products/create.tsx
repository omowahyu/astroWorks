import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
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

interface ProductFormData {
    name: string;
    description: string;
    categories: number[];
    unit_types: UnitType[];
    misc_options: MiscOption[];
    mobile_images: File[];
    desktop_images: File[];
    [key: string]: any;
}

const breadcrumbs = [
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



export default function ProductCreate({ categories }: Props) {
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([
        { label: '', price: '', is_default: true }
    ]);
    const [miscOptions, setMiscOptions] = useState<MiscOption[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        categories: [] as number[],
        unit_types: unitTypes as any,
        misc_options: miscOptions as any,
        mobile_images: [] as File[],
        desktop_images: [] as File[]
    });

    // Sync unitTypes and miscOptions with form data
    useEffect(() => {
        setData('unit_types', unitTypes as any);
    }, [unitTypes]);

    useEffect(() => {
        setData('misc_options', miscOptions as any);
    }, [miscOptions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate unit types before submission
        const hasEmptyUnitTypes = unitTypes.some(ut => !ut.label.trim() || !ut.price.trim());
        if (hasEmptyUnitTypes) {
            alert('Please fill in all unit type labels and prices before submitting.');
            return;
        }

        // Update data with current state before submission
        const submissionData = {
            ...data,
            unit_types: unitTypes,
            misc_options: miscOptions
        };

        post('/dashboard/products', submissionData);
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
        if (value && data.categories && !(data.categories as number[]).includes(parseInt(value))) {
            setData('categories', [...(data.categories as number[]), parseInt(value)]);
            setSelectedCategory('');
        }
    };

    const removeCategoryFromSelection = (categoryId: number) => {
        if (data.categories) {
            setData('categories', (data.categories as number[]).filter((id: number) => id !== categoryId));
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
                            .filter(category => !(data.categories as number[])?.includes(category.id))
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
                            {data.categories && (data.categories as number[]).length > 0 && (
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
                                                            <span className="ml-1 text-xs opacity-75">(Accessory)</span>
                                                        )}
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

                    {/* Images Upload */}
                    <div className="space-y-6">
                        <DeviceImageUpload
                            onMobileUpload={(files: FileList) => {
                                const fileArray = Array.from(files);
                                setData('mobile_images', [...(data.mobile_images as File[]), ...fileArray]);
                            }}
                            onDesktopUpload={(files: FileList) => {
                                const fileArray = Array.from(files);
                                setData('desktop_images', [...(data.desktop_images as File[]), ...fileArray]);
                            }}
                            mobileImages={(data.mobile_images as File[]).map((file, index) => ({
                                id: index,
                                url: URL.createObjectURL(file),
                                name: file.name,
                                size: file.size,
                                compressed_size: file.size
                            }))}
                            desktopImages={(data.desktop_images as File[]).map((file, index) => ({
                                id: index,
                                url: URL.createObjectURL(file),
                                name: file.name,
                                size: file.size,
                                compressed_size: file.size
                            }))}
                            onRemoveImage={(imageId: number, deviceType: 'mobile' | 'desktop') => {
                                if (deviceType === 'mobile') {
                                    const newImages = (data.mobile_images as File[]).filter((_, index) => index !== imageId);
                                    setData('mobile_images', newImages);
                                } else {
                                    const newImages = (data.desktop_images as File[]).filter((_, index) => index !== imageId);
                                    setData('desktop_images', newImages);
                                }
                            }}
                        />
                    </div>

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