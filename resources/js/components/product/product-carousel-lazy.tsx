import { lazy, Suspense } from 'react';

// Lazy load the heavy ProductCarousel component
const ProductCarousel = lazy(() => import('./product-carousel'));

interface Category {
    id: number;
    name: string;
    is_accessory: boolean;
    products: unknown[];
}

interface ProductCarouselLazyProps {
    className?: string;
    categoriesWithProducts?: Category[];
}

// Loading skeleton component
const ProductCarouselSkeleton = () => (
    <div className="w-full mx-auto px-4 py-8">
        {[1, 2, 3].map((categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
                {/* Category title skeleton */}
                <div className="flex items-center justify-between mb-6">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="flex space-x-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Products skeleton */}
                <div className="flex space-x-4 overflow-hidden">
                    {[1, 2, 3, 4].map((productIndex) => (
                        <div key={productIndex} className="flex-shrink-0 w-[calc(25%-12px)]">
                            <div className="aspect-[4/5] bg-gray-200 rounded-xl mb-3 animate-pulse"></div>
                            <div className="px-1">
                                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export default function ProductCarouselLazy(props: ProductCarouselLazyProps) {
    return (
        <Suspense fallback={<ProductCarouselSkeleton />}>
            <ProductCarousel {...props} />
        </Suspense>
    );
}
