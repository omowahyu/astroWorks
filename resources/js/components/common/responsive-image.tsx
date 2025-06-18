import React, { useState, useEffect } from 'react';

/**
 * Image variants interface
 */
interface ImageVariants {
    original: string;
    mobile_portrait?: string;
    mobile_square?: string;
    desktop_landscape?: string;
}

/**
 * Props interface
 */
interface ResponsiveImageProps {
    variants: ImageVariants;
    alt: string;
    className?: string;
    mobileFormat?: 'portrait' | 'square';
    fallbackSrc?: string;
    onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    loading?: 'lazy' | 'eager';
    sizes?: string;
}

/**
 * ResponsiveImage Component
 * 
 * Automatically serves the appropriate image format based on device type and screen size
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
    variants,
    alt,
    className = '',
    mobileFormat = 'portrait',
    fallbackSrc,
    onError,
    loading = 'lazy',
    sizes
}) => {
    const [currentSrc, setCurrentSrc] = useState<string>('');
    const [hasError, setHasError] = useState<boolean>(false);

    /**
     * Detect if device is mobile based on screen width
     */
    const isMobile = () => {
        return window.innerWidth < 768; // Tailwind's md breakpoint
    };

    /**
     * Get the appropriate image source based on device and format
     * Mobile: 4:5 portrait only, Desktop: 16:9 landscape only
     */
    const getImageSource = useCallback((): string => {
        if (isMobile()) {
            // Mobile device - use 4:5 portrait format exclusively
            if (variants.mobile_portrait) {
                return variants.mobile_portrait;
            }
        } else {
            // Desktop device - use 16:9 landscape format exclusively
            if (variants.desktop_landscape) {
                return variants.desktop_landscape;
            }
        }

        // Fallback to original image
        return variants.original;
    }, [variants]);

    /**
     * Update image source on mount and window resize
     */
    useEffect(() => {
        const updateImageSource = () => {
            setCurrentSrc(getImageSource());
        };

        updateImageSource();

        const handleResize = () => {
            updateImageSource();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [variants, mobileFormat, getImageSource]);

    /**
     * Handle image load error
     */
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (!hasError) {
            setHasError(true);
            
            // Try fallback sources in order
            if (currentSrc !== variants.original) {
                setCurrentSrc(variants.original);
            } else if (fallbackSrc && currentSrc !== fallbackSrc) {
                setCurrentSrc(fallbackSrc);
            }
        }
        
        if (onError) {
            onError(e);
        }
    };

    /**
     * Generate srcSet for responsive images
     * Mobile: 4:5 portrait only, Desktop: 16:9 landscape only
     */
    const generateSrcSet = (): string => {
        const srcSet: string[] = [];

        // Add mobile portrait variant (4:5 aspect ratio)
        if (variants.mobile_portrait) {
            srcSet.push(`${variants.mobile_portrait} 480w`);
        }

        // Add desktop landscape variant (16:9 aspect ratio)
        if (variants.desktop_landscape) {
            srcSet.push(`${variants.desktop_landscape} 1024w`);
        }

        // Add original as fallback
        srcSet.push(`${variants.original} 1920w`);

        return srcSet.join(', ');
    };

    return (
        <img
            src={currentSrc}
            srcSet={generateSrcSet()}
            sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
            alt={alt}
            className={className}
            onError={handleError}
            loading={loading}
        />
    );
};

/**
 * Hook for getting responsive image URL
 */
export const useResponsiveImage = (
    variants: ImageVariants, 
    mobileFormat: 'portrait' | 'square' = 'portrait'
): string => {
    const [imageSrc, setImageSrc] = useState<string>(variants.original);

    useEffect(() => {
        const updateImageSrc = () => {
            const isMobile = window.innerWidth < 768;
            
            if (isMobile) {
                if (mobileFormat === 'square' && variants.mobile_square) {
                    setImageSrc(variants.mobile_square);
                } else if (variants.mobile_portrait) {
                    setImageSrc(variants.mobile_portrait);
                } else {
                    setImageSrc(variants.original);
                }
            } else {
                if (variants.desktop_landscape) {
                    setImageSrc(variants.desktop_landscape);
                } else {
                    setImageSrc(variants.original);
                }
            }
        };

        updateImageSrc();

        const handleResize = () => {
            updateImageSrc();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [variants, mobileFormat]);

    return imageSrc;
};

/**
 * Picture element component for more advanced responsive images
 */
export const ResponsivePicture: React.FC<ResponsiveImageProps> = ({
    variants,
    alt,
    className = '',
    mobileFormat = 'portrait',
    fallbackSrc,
    onError,
    loading = 'lazy'
}) => {
    const [hasError, setHasError] = useState<boolean>(false);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setHasError(true);
        if (onError) {
            onError(e);
        }
    };

    return (
        <picture>
            {/* Desktop landscape */}
            {variants.desktop_landscape && (
                <source
                    media="(min-width: 768px)"
                    srcSet={variants.desktop_landscape}
                />
            )}
            
            {/* Mobile square */}
            {mobileFormat === 'square' && variants.mobile_square && (
                <source
                    media="(max-width: 767px)"
                    srcSet={variants.mobile_square}
                />
            )}
            
            {/* Mobile portrait */}
            {mobileFormat === 'portrait' && variants.mobile_portrait && (
                <source
                    media="(max-width: 767px)"
                    srcSet={variants.mobile_portrait}
                />
            )}
            
            {/* Fallback image */}
            <img
                src={hasError && fallbackSrc ? fallbackSrc : variants.original}
                alt={alt}
                className={className}
                onError={handleError}
                loading={loading}
            />
        </picture>
    );
};

export default ResponsiveImage;
