import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DynamicImageSingle from '@/components/image/dynamic-image-single';

interface ProductImage {
    id: number;
    image_type: 'thumbnail' | 'gallery' | 'hero';
    is_thumbnail: boolean;
    is_primary: boolean;
    display_order: number;
    alt_text: string;
    image_url: string;
    variants: {
        original: string;
        mobile_portrait: string | null;
        mobile_square: string | null;
        desktop_landscape: string | null;
    };
}

interface Product {
    id: number;
    name: string;
    description: string;
    slug: string;
    created_at: string;
    updated_at: string;
    categories: Array<{
        id: number;
        name: string;
        is_accessory: boolean;
    }>;
    primary_image_url: string | null;
    thumbnail_image: {
        id: number;
        image_url: string;
        alt_text: string;
    } | null;
    default_unit: {
        id: number;
        label: string;
        price: string;
    } | null;
    images: {
        thumbnails: ProductImage[];
        gallery: ProductImage[];
        hero: ProductImage[];
        main_thumbnail: ProductImage | null;
    };
}

interface Props {
    products: {
        data: Product[];
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
        title: 'Products',
        href: '/dashboard/products',
    },
];

export default function ProductsIndex({ products }: Props) {
    const handleDelete = (productId: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/dashboard/products/${productId}`);
        }
    };

    const formatPrice = (price: string): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(parseFloat(price));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
                        <p className="text-muted-foreground">
                            Manage your product catalog.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/products/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                </div>

                {products.data.length === 0 ? (
                    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <PlaceholderPattern />
                            <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                You haven't created any products yet. Start by creating your first product.
                            </p>
                            <Button asChild>
                                <Link href="/dashboard/products/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Product
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {products.data.map((product) => (
                            <Card key={product.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                                <DynamicImageSingle
                                                    productId={product.id.toString()}
                                                    alt={product.name}
                                                    className="w-full h-full"
                                                    rounded="lg"
                                                    useDatabase={true}
                                                    preferThumbnail={true}
                                                    imageType="thumbnail"
                                                    productImages={product.images}
                                                    debug={false}
                                                />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{product.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {product.description ?
                                                        (product.description.length > 100 ?
                                                            product.description.substring(0, 100) + '...' :
                                                            product.description
                                                        ) :
                                                        'No description'
                                                    }
                                                </p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    {product.categories.map((category) => (
                                                        <Badge
                                                            key={category.id}
                                                            variant={category.is_accessory ? "secondary" : "default"}
                                                        >
                                                            {category.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                {product.default_unit && (
                                                    <p className="text-sm font-medium text-green-600 mt-1">
                                                        {formatPrice(product.default_unit.price)} - {product.default_unit.label}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/products/${product.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/products/${product.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-700"
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
