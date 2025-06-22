import React from 'react';
import { Link } from '@inertiajs/react';
import { Package, Plus, TrendingUp } from 'lucide-react';
import DynamicImageSingle from '@/components/image/dynamic-image-single';
import { Button } from '@/components/ui/button';

/**
 * Product overview interface
 */
interface ProductOverview {
    total_products: number;
    active_products: number;
    categories_count: number;
    recent_products: Array<{
        id: number;
        name: string;
        created_at: string;
        primary_image_url?: string;
    }>;
}

/**
 * Props interface
 */
interface ProductsOverviewProps {
    data: ProductOverview;
    className?: string;
}

/**
 * ProductsOverview Component
 * 
 * Dashboard widget showing product statistics and recent products
 */
export const ProductsOverview: React.FC<ProductsOverviewProps> = ({ 
    data, 
    className = '' 
}) => {
    return (
        <div className={`bg-card text-card-foreground rounded-xl border border-border p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Products
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Manage your product catalog
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/products/create">
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                        {data.total_products}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Total Products
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-chart-1">
                        {data.active_products}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Active
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-chart-2">
                        {data.categories_count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Categories
                    </div>
                </div>
            </div>

            {/* Recent Products */}
            <div>
                <h4 className="text-sm font-medium text-foreground mb-3">
                    Recent Products
                </h4>
                <div className="space-y-3">
                    {data.recent_products.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                                <DynamicImageSingle
                                    productId={product.id.toString()}
                                    alt={product.name}
                                    className="w-full h-full"
                                    rounded="lg"
                                    productImages={product.images}
                                    preferThumbnail={true}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(product.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* View All Link */}
            <div className="mt-6 pt-4 border-t border-border">
                <Link
                    href="/dashboard/products"
                    className="flex items-center justify-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View All Products
                </Link>
            </div>
        </div>
    );
};

export default ProductsOverview;
