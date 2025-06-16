import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

/**
 * Category interface
 */
interface Category {
    id: number;
    name: string;
    is_accessory: boolean;
}

/**
 * Unit type form data
 */
interface UnitTypeForm {
    label: string;
    price: string;
    is_default: boolean;
}

/**
 * Misc option form data
 */
interface MiscOptionForm {
    label: string;
    value: string;
    is_default: boolean;
}

/**
 * Page props interface
 */
interface PageProps {
    categories: Category[];
    [key: string]: any;
}

/**
 * Admin Product Create Page
 * 
 * Form for creating new products with all related data
 */
export default function AdminProductCreate() {
    const { categories } = usePage<PageProps>().props;
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        categories: [] as number[],
        unit_types: [{ label: '', price: '', is_default: true }] as UnitTypeForm[],
        misc_options: [] as MiscOptionForm[],
        images: [] as File[]
    });

    const [imagePreview, setImagePreview] = useState<string[]>([]);

    /**
     * Handle form submission
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        
        data.categories.forEach((categoryId, index) => {
            formData.append(`categories[${index}]`, categoryId.toString());
        });
        
        data.unit_types.forEach((unitType, index) => {
            formData.append(`unit_types[${index}][label]`, unitType.label);
            formData.append(`unit_types[${index}][price]`, unitType.price);
            formData.append(`unit_types[${index}][is_default]`, unitType.is_default ? '1' : '0');
        });
        
        data.misc_options.forEach((miscOption, index) => {
            formData.append(`misc_options[${index}][label]`, miscOption.label);
            formData.append(`misc_options[${index}][value]`, miscOption.value);
            formData.append(`misc_options[${index}][is_default]`, miscOption.is_default ? '1' : '0');
        });
        
        data.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });

        post('/admin/products', {
            data: formData,
            forceFormData: true
        });
    };

    /**
     * Add new unit type
     */
    const addUnitType = () => {
        setData('unit_types', [...data.unit_types, { label: '', price: '', is_default: false }]);
    };

    /**
     * Remove unit type
     */
    const removeUnitType = (index: number) => {
        const newUnitTypes = data.unit_types.filter((_, i) => i !== index);
        setData('unit_types', newUnitTypes);
    };

    /**
     * Update unit type
     */
    const updateUnitType = (index: number, field: keyof UnitTypeForm, value: string | boolean) => {
        const newUnitTypes = [...data.unit_types];
        newUnitTypes[index] = { ...newUnitTypes[index], [field]: value };
        
        // If setting as default, unset others
        if (field === 'is_default' && value === true) {
            newUnitTypes.forEach((ut, i) => {
                if (i !== index) ut.is_default = false;
            });
        }
        
        setData('unit_types', newUnitTypes);
    };

    /**
     * Add new misc option
     */
    const addMiscOption = () => {
        setData('misc_options', [...data.misc_options, { label: '', value: '', is_default: false }]);
    };

    /**
     * Remove misc option
     */
    const removeMiscOption = (index: number) => {
        const newMiscOptions = data.misc_options.filter((_, i) => i !== index);
        setData('misc_options', newMiscOptions);
    };

    /**
     * Update misc option
     */
    const updateMiscOption = (index: number, field: keyof MiscOptionForm, value: string | boolean) => {
        const newMiscOptions = [...data.misc_options];
        newMiscOptions[index] = { ...newMiscOptions[index], [field]: value };
        setData('misc_options', newMiscOptions);
    };

    /**
     * Handle image upload
     */
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setData('images', [...data.images, ...files]);
        
        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreview(prev => [...prev, ...newPreviews]);
    };

    /**
     * Remove image
     */
    const removeImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreview.filter((_, i) => i !== index);
        
        setData('images', newImages);
        setImagePreview(newPreviews);
    };

    return (
        <>
            <Head title="Admin - Create Product" />

            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center mb-8">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="mr-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
                            <p className="text-gray-600 mt-2">Add a new product to your catalog</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="max-w-4xl">
                        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Categories
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {categories.map((category) => (
                                            <label key={category.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={data.categories.includes(category.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setData('categories', [...data.categories, category.id]);
                                                        } else {
                                                            setData('categories', data.categories.filter(id => id !== category.id));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{category.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Unit Types */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900">Unit Types & Pricing</h2>
                                    <Button type="button" onClick={addUnitType} variant="outline" size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Unit Type
                                    </Button>
                                </div>

                                {data.unit_types.map((unitType, index) => (
                                    <div key={index} className="border border-gray-200 rounded-md p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-medium text-gray-900">Unit Type {index + 1}</h3>
                                            {data.unit_types.length > 1 && (
                                                <Button
                                                    type="button"
                                                    onClick={() => removeUnitType(index)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Label (e.g., "2x3m")
                                                </label>
                                                <input
                                                    type="text"
                                                    value={unitType.label}
                                                    onChange={(e) => updateUnitType(index, 'label', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Price (IDR)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={unitType.price}
                                                    onChange={(e) => updateUnitType(index, 'price', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>

                                            <div className="flex items-center">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={unitType.is_default}
                                                        onChange={(e) => updateUnitType(index, 'is_default', e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">Default</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {processing ? 'Creating...' : 'Create Product'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
