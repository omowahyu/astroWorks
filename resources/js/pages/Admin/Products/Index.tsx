import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

/**
 * Product interface for admin listing
 */
interface AdminProduct {
    id: number;
    name: string;
    description: string;
    primary_image?: {
        image_url: string;
        alt_text: string;
    };
    categories: Array<{
        id: number;
        name: string;
    }>;
    default_unit?: {
        price: string;
        label: string;
    };
    created_at: string;
    updated_at: string;
}

/**
 * Pagination interface
 */
interface PaginationData {
    data: AdminProduct[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

/**
 * Page props interface
 */
interface PageProps {
    products: PaginationData;
    [key: string]: any;
}

/**
 * Admin Products Index Page
 * 
 * Displays a list of all products with CRUD operations
 */
export default function AdminProductsIndex() {
    const { products } = usePage<PageProps>().props;

    /**
     * Format price to Indonesian Rupiah
     */
    const formatPrice = (price: string | number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(typeof price === 'string' ? parseFloat(price) : price);
    };

    /**
     * Get product image URL with fallback
     */
    const getProductImageUrl = (product: AdminProduct): string => {
        if (product.primary_image?.image_url) {
            return product.primary_image.image_url;
        }
        return `/storage/images/product_${product.id}_image_1.jpg`;
    };

    /**
     * Handle product deletion
     */
    const handleDelete = (productId: number, productName: string) => {
        if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            // In a real app, you'd use Inertia.delete here
            console.log('Delete product:', productId);
        }
    };

    return (
        <>
            <Head title="Admin - Products" />

            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                            <p className="text-gray-600 mt-2">Manage your product catalog</p>
                        </div>
                        <Link href="/admin/products/create">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Product
                            </Button>
                        </Link>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.data.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Product Image */}
                                <div className="aspect-square bg-gray-100">
                                    <img
                                        src={getProductImageUrl(product)}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://picsum.photos/seed/${product.id}/300/300`;
                                        }}
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    
                                    {product.description && (
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}

                                    {/* Categories */}
                                    {product.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {product.categories.map((category) => (
                                                <span
                                                    key={category.id}
                                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                >
                                                    {category.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Price */}
                                    {product.default_unit && (
                                        <div className="mb-4">
                                            <span className="text-lg font-bold text-green-600">
                                                {formatPrice(product.default_unit.price)}
                                            </span>
                                            <span className="text-gray-500 text-sm ml-2">
                                                ({product.default_unit.label})
                                            </span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex space-x-2">
                                            <Link href={`/admin/products/${product.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(product.id, product.name)}
                                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {products.data.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📦</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-600 mb-6">Get started by creating your first product.</p>
                            <Link href="/admin/products/create">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Product
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {products.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="flex space-x-2">
                                {products.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
