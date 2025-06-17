import React from 'react';
import { Link } from '@inertiajs/react';
import ResponsiveImage from '../common/responsive-image';

/**
 * Product interface for category display
 */
interface CategoryProduct {
    id: number;
    name: string;
    description: string;
    primary_image_url?: string;
    image_variants?: {
        original: string;
        mobile_portrait?: string;
        desktop_landscape?: string;
    };
    default_unit?: {
        label: string;
        price: string;
    };
}

/**
 * Category interface
 */
interface ProductCategory {
    id: number;
    name: string;
    is_accessory: boolean;
    products: CategoryProduct[];
}

/**
 * Props interface
 */
interface CategoryProductSectionProps {
    category: ProductCategory;
    className?: string;
}

/**
 * CategoryProductSection Component
 *
 * Displays products in a horizontal scrolling layout with simplified design
 */
export const CategoryProductSection: React.FC<CategoryProductSectionProps> = ({
    category,
    className = ''
}) => {
    // Don't render if no products
    if (!category.products || category.products.length === 0) {
        return null;
    }

    /**
     * Get image variants for ResponsiveImage component
     */
    const getImageVariants = (product: CategoryProduct) => {
        if (product.image_variants) {
            return product.image_variants;
        }

        // Fallback to primary_image_url if no variants
        return {
            original: product.primary_image_url || '/images/placeholder.jpg',
            mobile_portrait: product.primary_image_url || '/images/placeholder.jpg',
            desktop_landscape: product.primary_image_url || '/images/placeholder.jpg'
        };
    };

    return (
        <section className={`py-8 ${className}`}>
            <div className="container mx-auto px-4">
                {/* Category Header */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {category.name}
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                </div>

                {/* Horizontal Scrolling Products */}
                <div className="relative">
                    <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
                        {category.products.map((product) => (
                            <div
                                key={product.id}
                                className="flex-none w-56 md:w-72 group snap-start"
                            >
                                <Link
                                    href={`/product/${product.id}/purchase`}
                                    className="block"
                                >
                                    {/* Product Image */}
                                    <div className="relative overflow-hidden rounded-lg bg-gray-100 mb-3">
                                        <ResponsiveImage
                                            variants={getImageVariants(product)}
                                            alt={product.name}
                                            className="w-full h-44 md:h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Product Name */}
                                    <div className="px-1">
                                        <h3 className="text-sm md:text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                            {product.name}
                                        </h3>
                                    </div>
                                </Link>
                            </div>
                        ))}

                        {/* View More Card */}
                        {category.products.length > 4 && (
                            <div className="flex-none w-56 md:w-72 snap-start">
                                <Link
                                    href={`/category/${category.id}`}
                                    className="block"
                                >
                                    <div className="h-44 md:h-52 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 mb-3">
                                        <div className="text-center">
                                            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                            <span className="text-sm font-medium">View All</span>
                                            <p className="text-xs opacity-90 mt-1">{category.name}</p>
                                        </div>
                                    </div>
                                    <div className="px-1">
                                        <h3 className="text-sm md:text-base font-medium text-gray-600 text-center">
                                            Explore More
                                        </h3>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryProductSection;
