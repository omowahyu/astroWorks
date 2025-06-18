import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    is_accessory: boolean;
    products_count: number;
    created_at: string;
    updated_at: string;
    products?: Array<{
        id: number;
        name: string;
    }>;
}

interface Props {
    category: Category;
}

const breadcrumbs = (categoryId: number): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Categories',
        href: '/dashboard/categories',
    },
    {
        title: 'Edit',
        href: `/dashboard/categories/${categoryId}/edit`,
    },
];

export default function CategoryEdit({ category }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        is_accessory: category.is_accessory || false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/categories/${category.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(category.id)}>
            <Head title={`Edit Category - ${category.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Edit Category</h1>
                        <p className="text-muted-foreground">
                            Update category information and settings.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/categories">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="name">Category Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter category name"
                                        />
                                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_accessory"
                                                checked={data.is_accessory}
                                                onCheckedChange={(checked) => setData('is_accessory', checked as boolean)}
                                            />
                                            <Label htmlFor="is_accessory">
                                                This is an accessory category
                                            </Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground ml-6">
                                            Accessory categories are used for additional items that complement main products (e.g., handles, hinges, accessories).
                                        </p>
                                        {errors.is_accessory && <p className="text-sm text-red-600">{errors.is_accessory}</p>}
                                    </div>

                                    <div className="flex items-center justify-end space-x-4">
                                        <Button variant="outline" asChild>
                                            <Link href="/dashboard/categories">Cancel</Link>
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Updating...' : 'Update Category'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Category Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Products</span>
                                    <span className="font-medium">{category.products_count}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Category Type</span>
                                    <span className="font-medium">
                                        {category.is_accessory ? 'Accessory' : 'Main Category'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="font-medium text-sm">
                                        {new Date(category.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Last Updated</span>
                                    <span className="font-medium text-sm">
                                        {new Date(category.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Associated Products */}
                        {category.products && category.products.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Associated Products</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {category.products.slice(0, 5).map((product) => (
                                            <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                <span className="text-sm">{product.name}</span>
                                                <Link
                                                    href={`/dashboard/products/${product.id}/edit`}
                                                    className="text-xs text-blue-600 hover:text-blue-700"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        ))}
                                        {category.products.length > 5 && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                And {category.products.length - 5} more products...
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Warning for deletion */}
                        {category.products_count > 0 && (
                            <Card className="border-orange-200 bg-orange-50">
                                <CardHeader>
                                    <CardTitle className="text-orange-800">Deletion Warning</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-orange-700">
                                        This category cannot be deleted because it has {category.products_count} associated product{category.products_count !== 1 ? 's' : ''}.
                                        Please move or delete the products first.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}