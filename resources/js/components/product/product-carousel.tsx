import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- React project imports ---
import DynamicImageSingle from '../image/dynamic-image-single'; // TSX component with new database schema

// --- Type Definitions ---
interface ProductImageData {
    id: number;
    image_type: 'thumbnail' | 'gallery' | 'hero';
    sort_order: number;
    alt_text: string;
    image_url: string;
    variants: any;
}

interface ProductImages {
    thumbnails: ProductImageData[];
    gallery: ProductImageData[];
    hero: ProductImageData[];
    main_thumbnail: ProductImageData | null;
}

interface Product {
    id: string;
    name: string;
    description: string;
    slug?: string;
    primary_image_url?: string;
    image_variants?: any;
    images: ProductImages;
    default_unit?: {
        label: string;
        price: string;
    };
}

interface Category {
    id: number;
    name: string;
    is_accessory: boolean;
    products: Product[];
}

interface Props {
    className?: string;
    categoriesWithProducts?: Category[];
}

// --- Helper Functions (can be defined outside the component) ---
const getBadgeForProduct = (product: any): string | null => {
    if (product.is_featured) return 'BEST';
    if (product.is_new) return 'NEW';
    if (product.is_popular) return 'HOT';
    return null;
};

const getBadgeColor = (badge: string | null): string => {
    switch (badge) {
        case 'NEW': return 'bg-green-500';
        case 'BEST': return 'bg-blue-500';
        case 'HOT': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
};

const getItemsPerView = (): number => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
};

const formatPrice = (price: number): string => {
    if (!price || price === 0) return 'Contact for Price';
    return `Rp ${parseInt(String(price), 10).toLocaleString('id-ID')}`;
};


// --- React Component ---
const ProductCarousel: React.FC<Props> = ({ className = "", categoriesWithProducts = [] }) => {
    // --- State Management with React Hooks ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for carousel positions and interactions
    const [currentSlides, setCurrentSlides] = useState<Record<number, number>>({});
    const [isDragging, setIsDragging] = useState<Record<number, boolean>>({});

    // Refs for DOM elements and drag state that doesn't trigger re-renders
    const carouselContainerRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const dragStartInfo = useRef({ startX: 0, scrollLeft: 0 });

    // --- Process Categories from Props ---
    const processCategories = useCallback(() => {
        try {
            setLoading(true);
            setError(null);

            if (!categoriesWithProducts || categoriesWithProducts.length === 0) {
                setCategories([]);
                setLoading(false);
                return;
            }

            // Filter out categories without products and transform data
            const processedCategories = categoriesWithProducts
                .filter(category => category.products && category.products.length > 0)
                .map(category => ({
                    ...category,
                    products: category.products.map(product => ({
                        ...product,
                        // Add any additional transformations if needed
                        badge: getBadgeForProduct(product),
                        price: product.default_unit?.price ? parseFloat(product.default_unit.price) : 0
                    }))
                }));

            setCategories(processedCategories);

            // Initialize carousel state
            const initialSlides: Record<number, number> = {};
            processedCategories.forEach(category => {
                initialSlides[category.id] = 0;
            });
            setCurrentSlides(initialSlides);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process categories');
            console.error('Error processing categories:', err);
        } finally {
            setLoading(false);
        }
    }, [categoriesWithProducts]);

    // --- Lifecycle: Process data when props change ---
    useEffect(() => {
        processCategories();
    }, [processCategories]);

    // --- Side Effect: Scroll carousel on slide change ---
    // Replaces Svelte's $effect
    useEffect(() => {
        for (const categoryId in currentSlides) {
            const container = carouselContainerRefs.current[categoryId];
            if (!container) continue;

            const itemWidth = (container.children[0] as HTMLElement)?.offsetWidth || 0;
            const gap = 16; // Corresponds to space-x-4
            const scrollPosition = currentSlides[categoryId] * (itemWidth + gap);

            container.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
    }, [currentSlides]);

    // --- Carousel Logic ---
    const nextSlide = (categoryId: number) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        const itemsPerView = getItemsPerView();
        const maxSlide = Math.max(0, category.products.length - itemsPerView);

        setCurrentSlides(prev => ({
            ...prev,
            [categoryId]: Math.min(prev[categoryId] + 1, maxSlide)
        }));
    };

    const prevSlide = (categoryId: number) => {
        setCurrentSlides(prev => ({
            ...prev,
            [categoryId]: Math.max(prev[categoryId] - 1, 0)
        }));
    };

    // --- Drag Handlers ---
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, categoryId: number) => {
        const container = carouselContainerRefs.current[categoryId];
        if (!container) return;
        setIsDragging(prev => ({ ...prev, [categoryId]: true }));
        dragStartInfo.current = {
            startX: e.pageX - container.offsetLeft,
            scrollLeft: container.scrollLeft
        };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, categoryId: number) => {
        if (!isDragging[categoryId]) return;
        e.preventDefault();
        const container = carouselContainerRefs.current[categoryId];
        if (!container) return;
        const x = e.pageX - container.offsetLeft;
        const walk = (x - dragStartInfo.current.startX) * 2; // Drag multiplier
        container.scrollLeft = dragStartInfo.current.scrollLeft - walk;
    };

    const handleMouseUp = (categoryId: number) => {
        setIsDragging(prev => ({ ...prev, [categoryId]: false }));
    };

    // --- JSX Rendering ---
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Products</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={processCategories}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Available</h3>
                <p className="text-gray-600">Check back later for new products.</p>
            </div>
        );
    }

    return (
        <div className={`w-full mx-auto px-4 py-8 ${className}`}>
            {categories.map((category, categoryIndex) => {
                if (category.products.length === 0) return null;

                const itemsPerView = getItemsPerView();
                const currentSlide = currentSlides[category.id] || 0;
                const maxSlide = Math.max(0, category.products.length - itemsPerView);
                const canGoPrev = currentSlide > 0;
                const canGoNext = currentSlide < maxSlide;

                return (
                    <motion.div
                        key={category.id}
                        className="mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 id={`${category.id}-title`} className="text-xl md:text-2xl font-semibold text-gray-700">
                                {category.name}
                            </h3>
                            {category.products.length > itemsPerView && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => prevSlide(category.id)}
                                        disabled={!canGoPrev}
                                        className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                                        aria-label={`Previous products in ${category.title}`}
                                    >
                                        <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button
                                        onClick={() => nextSlide(category.id)}
                                        disabled={!canGoNext}
                                        className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                                        aria-label={`Next products in ${category.title}`}
                                    >
                                        <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div role="region" aria-labelledby={`${category.id}-title`} className="relative">
                            <div
                                ref={(el) => (carouselContainerRefs.current[category.id] = el)}
                                className={`flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth ${isDragging[category.id] ? 'cursor-grabbing' : 'cursor-grab'}`}
                                onMouseDown={(e) => handleMouseDown(e, category.id)}
                                onMouseMove={(e) => handleMouseMove(e, category.id)}
                                onMouseUp={() => handleMouseUp(category.id)}
                                onMouseLeave={() => handleMouseUp(category.id)}
                                // Touch events would be added here similarly if needed
                            >
                                {category.products.map((product, productIndex) => (
                                    <motion.a
                                        key={product.id}
                                        href={`/product/${product.slug || product.id}`}
                                        className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] group select-none"
                                        aria-label={`View details for ${product.name}`}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: productIndex * 0.05 }}
                                    >
                                        <div className="relative overflow-hidden rounded-xl mb-3 bg-gray-100 aspect-[4/5] md:aspect-[16/9]">
                                            {/* Product Badge */}
                                            {product.badge && (
                                                <div className={`absolute top-2 left-2 z-10 px-2 py-1 text-xs font-medium text-white rounded ${getBadgeColor(product.badge)}`}>
                                                    {product.badge}
                                                </div>
                                            )}

                                            {/* Product Images - Using DynamicImageSingle Component */}
                                            <DynamicImageSingle
                                                productId={product.id}
                                                alt={product.name}
                                                className="w-full h-full"
                                                mobileRounded="xl"
                                                desktopRounded="xl"
                                                useDatabase={true}
                                                preferThumbnail={true}
                                                imageType="thumbnail"
                                                productImages={product.images}
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="px-1">
                                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                                                {product.name}
                                            </h4>
                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {category.products.length > itemsPerView && (
                            <div className="mt-4 flex justify-center">
                                <div className="flex space-x-2">
                                    {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentSlides(prev => ({...prev, [category.id]: i}))}
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                i === currentSlide
                                                    ? 'bg-blue-600 w-6'
                                                    : 'bg-gray-300 w-2 hover:bg-gray-400'
                                            }`}
                                            aria-label={`Go to slide ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

export default ProductCarousel;
