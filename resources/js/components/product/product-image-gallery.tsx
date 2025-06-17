import React, { useState, useCallback } from 'react';
import { Product } from '@/types/product';
import DynamicImageSingle from '../image/DynamicImageSingle';

/**
 * Props for the ProductImageGallery component
 */
interface ProductImageGalleryProps {
    /** The product containing image data */
    product: Product;
    /** Additional CSS classes */
    className?: string;
}

/**
 * ProductImageGallery Component
 * 
 * Displays a main product image with thumbnail navigation.
 * Handles image selection and provides fallback for missing images.
 * 
 * @param props - Component props
 * @returns JSX element containing the image gallery
 */
export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ 
    product, 
    className = '' 
}) => {
    // ALWAYS use placeholder to avoid 403 errors
    const getImageUrls = () => {
        return [
            `/images/placeholder-product.svg`,
            `/images/placeholder-product.svg`,
            `/images/placeholder-product.svg`,
            `/images/placeholder-product.svg`,
            `/images/placeholder-product.svg`,
            `/images/placeholder-product.svg`,
        ];
    };

    const imageUrls = getImageUrls();

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageLoadError, setImageLoadError] = useState<Record<number, boolean>>({});

    /**
     * Handle thumbnail click to change main image
     */
    const handleThumbnailClick = useCallback((index: number) => {
        setSelectedImageIndex(index);
    }, []);

    /**
     * Handle image load error
     */
    const handleImageError = useCallback((index: number) => {
        setImageLoadError(prev => ({ ...prev, [index]: true }));
    }, []);

    /**
     * Get fallback image URL for failed loads
     */
    const getFallbackImageUrl = useCallback((index: number) => {
        return `https://picsum.photos/seed/${product.id + index}/800/600`;
    }, [product.id]);

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Main Image */}
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <DynamicImageSingle
                    productId={product.id.toString()}
                    alt={product.name}
                    className="w-full h-full"
                    rounded="lg"
                    preferThumbnail={true}
                />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                    <div 
                        key={i} 
                        className={`aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-75 border-2 transition-all duration-200 ${
                            selectedImageIndex === i 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-transparent hover:border-blue-300'
                        }`}
                        onClick={() => handleThumbnailClick(i)}
                    >
                        {i < 3 ? (
                            <DynamicImageSingle
                                productId={product.id.toString()}
                                index={i + 1}
                                alt={`${product.name} view ${i + 1}`}
                                className="w-full h-full"
                                rounded="lg"
                                preferThumbnail={true}
                            />
                        ) : (
                            // Technical drawings/blueprints for last 3 thumbnails or missing images
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <svg 
                                    className="w-8 h-8 text-gray-400" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={1} 
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductImageGallery;
