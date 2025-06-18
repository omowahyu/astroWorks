import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, X } from 'lucide-react';

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
    // Removed unused state variables
    const [imagesPreviews, setImagesPreviews] = useState<ImagePreview[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        description: product.description || '',
        categories: product.categories.map(cat => cat.id) || [],
        unit_types: unitTypes,
        misc_options: miscOptions,
        images: [] as File[],
        existing_images: product.images || []
    });

    // Initialize existing images
    useEffect(() => {
        const existingPreviews: ImagePreview[] = product.images.map(img => ({
            url: img.image_url,
            id: `existing-${img.id}`,
            existing_id: img.id,
            alt_text: img.alt_text
        }));
        setImagesPreviews(existingPreviews);
    }, [product.images]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('_method', 'PUT');

        data.categories.forEach((categoryId, index) => {
            formData.append(`categories[${index}]`, categoryId.toString());
        });

        unitTypes.forEach((unitType, index) => {
            if (unitType.id) {
                formData.append(`unit_types[${index}][id]`, unitType.id.toString());
            }
            formData.append(`unit_types[${index}][label]`, unitType.label);
            formData.append(`unit_types[${index}][price]`, unitType.price);
            formData.append(`unit_types[${index}][is_default]`, unitType.is_default ? '1' : '0');
        });

        miscOptions.forEach((miscOption, index) => {
            if (miscOption.id) {
                formData.append(`misc_options[${index}][id]`, miscOption.id.toString());
            }
            formData.append(`misc_options[${index}][label]`, miscOption.label);
            formData.append(`misc_options[${index}][value]`, miscOption.value);
            formData.append(`misc_options[${index}][is_default]`, miscOption.is_default ? '1' : '0');
        });

        data.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });

        // Send existing images order
        imagesPreviews.forEach((preview, index) => {
            if (preview.existing_id) {
                formData.append(`existing_images_order[${index}]`, preview.existing_id.toString());
            }
        });

        put(`/dashboard/products/${product.id}`, {
            data: formData,
            forceFormData: true,
        });
    };

    // Removed unused functions - these are not used in the current form

    const handleCategoryChange = (value: string) => {
        if (value && !data.categories.includes(parseInt(value))) {
            setData('categories', [...data.categories, parseInt(value)]);
            setSelectedCategory('');
        }
    };

    const removeCategoryFromSelection = (categoryId: number) => {
        setData('categories', data.categories.filter(id => id !== categoryId));
    };

    // Removed unused image handling functions - these are not used in the current form

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            imagesPreviews.forEach(image => {
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