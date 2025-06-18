import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Category {
    id: number;
    name: string;
    is_accessory: boolean;
    products_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    categories: {
        data: Category[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Categories',
        href: '/dashboard/categories',
    },
];

export default function CategoriesIndex({ categories }: Props) {
    const handleDelete = (categoryId: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/dashboard/categories/${categoryId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
                        <p className="text-muted-foreground">
                            Manage your product categories.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/categories/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Link>
                    </Button>
                </div>

                {categories.data.length === 0 ? (
                    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <PlaceholderPattern />
                            <h3 className="mt-4 text-lg font-semibold">No categories yet</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                You haven't created any categories yet. Start by creating your first category.
                            </p>
                            <Button asChild>
                                <Link href="/dashboard/categories/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Category
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {categories.data.map((category) => (
                            <Card key={category.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Badge variant={category.is_accessory ? "secondary" : "default"}>
                                                        {category.is_accessory ? "Accessory" : "Main Category"}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {category.products_count} product{category.products_count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/categories/${category.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(category.id)}
                                                className="text-red-600 hover:text-red-700"
                                                disabled={category.products_count > 0}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
