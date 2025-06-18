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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Categories',
        href: '/dashboard/categories',
    },
    {
        title: 'Create',
        href: '/dashboard/categories/create',
    },
];

export default function CategoryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        is_accessory: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/categories');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Create Category</h1>
                        <p className="text-muted-foreground">
                            Add a new category to organize your products.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/categories">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
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
                                    {processing ? 'Creating...' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}