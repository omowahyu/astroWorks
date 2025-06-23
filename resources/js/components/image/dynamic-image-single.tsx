import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ImageVariants {
    original: string;
    mobile_portrait: string | null;
    mobile_square: string | null;
    desktop_landscape: string | null;
}

interface ProductImageData {
    id: number;
    image_type: 'thumbnail' | 'gallery' | 'hero';
    is_thumbnail: boolean;
    is_primary: boolean;
    display_order: number;
    alt_text: string;
    image_url: string;
    variants: ImageVariants;
}

interface DynamicImageSingleProps {
    /** Product UUID for database lookup and file naming */
    productId: string;
    /** Image index (default: 1) */
    index?: number;
    /** Alt text for accessibility */
    alt: string;
    /** Additional CSS classes */
    className?: string;
    /** Inline styles */
    style?: React.CSSProperties;
    /** Enable debug logging */
    debug?: boolean;
    /** Border radius for image (e.g., 'xl', '2xl', '3xl', 'full') */
    rounded?: string;
    /** Border radius for mobile devices */
    mobileRounded?: string;
    /** Border radius for desktop devices */
    desktopRounded?: string;
    /** Use database as primary source */
    useDatabase?: boolean;
    /** Prefer any available thumbnail over device-specific logic */
    preferThumbnail?: boolean;
    /** Image type to load (thumbnail, gallery, hero) */
    imageType?: 'thumbnail' | 'gallery' | 'hero';
    /** Device type preference (auto-detects if not specified) */
    deviceType?: 'mobile' | 'desktop' | 'auto';
    /** Product images data passed from Inertia */
    productImages?: {
        thumbnails: ProductImageData[];
        gallery: ProductImageData[];
        hero: ProductImageData[];
        main_thumbnail: ProductImageData | null;
    };
    /** Specific image to display (overrides index-based selection) */
    specificImage?: ProductImageData;
}

const DynamicImageSingle: React.FC<DynamicImageSingleProps> = ({
                                                                   productId,
                                                                   index = 1,
                                                                   alt,
                                                                   className = '',
                                                                   style = {},
                                                                   debug = false,
                                                                   rounded = '',
                                                                   mobileRounded,
                                                                   desktopRounded,
                                                                   preferThumbnail = false,
                                                                   imageType = 'thumbnail',
                                                                   productImages,
                                                                   specificImage
                                                               }) => {
    // Component state
    const [mobileImageUrl, setMobileImageUrl] = useState<string>('');
    const [desktopImageUrl, setDesktopImageUrl] = useState<string>('');
    const [mobileImageLoaded, setMobileImageLoaded] = useState(false);
    const [desktopImageLoaded, setDesktopImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentDeviceType, setCurrentDeviceType] = useState<'mobile' | 'desktop'>('desktop');

    // DOM references
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const mobileImgRef = useRef<HTMLImageElement>(null);
    const desktopImgRef = useRef<HTMLImageElement>(null);

    // SVG placeholder with "Image Tidak Tersedia" message
    const placeholderSvg = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" style="background: #f3f4f6;">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <circle cx="200" cy="120" r="30" fill="#e5e7eb"/>
      <path d="M170 120 L200 90 L230 120 L220 110 L200 130 L180 110 Z" fill="#9ca3af"/>
      <path d="M180 130 L220 130 L210 140 L190 140 Z" fill="#9ca3af"/>
      <text x="200" y="180" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#374151">Image Tidak Tersedia</text>
      <text x="200" y="200" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#6b7280">Gambar produk belum diupload</text>
    </svg>
  `)}`;

    // Generate border radius classes
    const getRoundedClasses = useCallback((): string => {
        // Determine which rounded value to use based on device type and available props
        let activeRounded: string | undefined;

        if (currentDeviceType === 'mobile') {
            activeRounded = mobileRounded || rounded;
        } else if (currentDeviceType === 'desktop') {
            activeRounded = desktopRounded || rounded;
        } else {
            activeRounded = rounded;
        }

        if (!activeRounded || activeRounded === 'none') return '';

        const roundedMap: Record<string, string> = {
            'sm': 'rounded-sm',
            'md': 'rounded-md',
            'lg': 'rounded-lg',
            'xl': 'rounded-xl',
            '2xl': 'rounded-2xl',
            '3xl': 'rounded-3xl',
            'full': 'rounded-full'
        };
        return roundedMap[activeRounded] || `rounded-[${activeRounded}]`;
    }, [rounded, mobileRounded, desktopRounded, currentDeviceType]);

    // Filter images by device type
    const filterImagesByDevice = useCallback((images: ProductImageData[] | undefined | null, targetDevice: string) => {
        if (!images || !Array.isArray(images)) return [];
        return images.filter(img => {
            const imgDeviceType = (img as ProductImageData & { device_type?: string }).device_type || 'desktop';
            return imgDeviceType === targetDevice;
        });
    }, []);

    // Load image data from API when useDatabase is true but productImages is null
    const loadImageFromAPI = useCallback(async (): Promise<void> => {
        if (debug) {
            console.log('🖼️ DynamicImageSingle: Starting loadImageFromAPI for product:', productId);
        }
        setLoading(true);

        try {
            const response = await fetch(`/api/products/${productId}/images`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiProductImages = await response.json();

            if (debug) {
                console.log('🖼️ DynamicImageSingle: API response for product:', productId, apiProductImages);
            }

            // Use the API data to load images
            if (apiProductImages && (apiProductImages.thumbnails?.length > 0 || apiProductImages.gallery?.length > 0 || apiProductImages.hero?.length > 0 || apiProductImages.main_thumbnail)) {
                // Temporarily set productImages and call loadImageFromProps
                const tempProductImages = apiProductImages;

                // Get device-specific images
                const mobileImages = {
                    thumbnails: filterImagesByDevice(tempProductImages.thumbnails, 'mobile'),
                    gallery: filterImagesByDevice(tempProductImages.gallery, 'mobile'),
                    hero: filterImagesByDevice(tempProductImages.hero, 'mobile')
                };

                const desktopImages = {
                    thumbnails: filterImagesByDevice(tempProductImages.thumbnails, 'desktop'),
                    gallery: filterImagesByDevice(tempProductImages.gallery, 'desktop'),
                    hero: filterImagesByDevice(tempProductImages.hero, 'desktop')
                };

                // Select mobile image
                let mobileImage: ProductImageData | null = null;
                if (preferThumbnail && tempProductImages.main_thumbnail && (tempProductImages.main_thumbnail as ProductImageData & { device_type?: string }).device_type === 'mobile') {
                    mobileImage = tempProductImages.main_thumbnail;
                } else if (imageType === 'thumbnail' && mobileImages.thumbnails.length > 0) {
                    mobileImage = mobileImages.thumbnails[0];
                } else if (imageType === 'gallery' && mobileImages.gallery.length > 0) {
                    mobileImage = mobileImages.gallery[Math.min(index - 1, mobileImages.gallery.length - 1)];
                } else if (imageType === 'hero' && mobileImages.hero.length > 0) {
                    mobileImage = mobileImages.hero[0];
                }

                // Select desktop image
                let desktopImage: ProductImageData | null = null;
                if (preferThumbnail && tempProductImages.main_thumbnail && (tempProductImages.main_thumbnail as ProductImageData & { device_type?: string }).device_type === 'desktop') {
                    desktopImage = tempProductImages.main_thumbnail;
                } else if (imageType === 'thumbnail' && desktopImages.thumbnails.length > 0) {
                    desktopImage = desktopImages.thumbnails[0];
                } else if (imageType === 'gallery' && desktopImages.gallery.length > 0) {
                    desktopImage = desktopImages.gallery[Math.min(index - 1, desktopImages.gallery.length - 1)];
                } else if (imageType === 'hero' && desktopImages.hero.length > 0) {
                    desktopImage = desktopImages.hero[0];
                }

                // Fallback logic (same as loadImageFromProps)
                if (!mobileImage && !desktopImage) {
                    if (tempProductImages.main_thumbnail && tempProductImages.main_thumbnail.image_url?.trim()) {
                        const mainThumbDeviceType = (tempProductImages.main_thumbnail as ProductImageData & { device_type?: string }).device_type || 'desktop';
                        if (mainThumbDeviceType === 'mobile') {
                            mobileImage = tempProductImages.main_thumbnail;
                        } else {
                            desktopImage = tempProductImages.main_thumbnail;
                        }
                    }

                    if (!mobileImage && !desktopImage) {
                        const allImages = [
                            ...(tempProductImages.thumbnails || []),
                            ...(tempProductImages.gallery || []),
                            ...(tempProductImages.hero || [])
                        ].filter(img => img?.image_url?.trim());

                        if (allImages.length > 0) {
                            const firstImage = allImages[Math.min(index - 1, allImages.length - 1)] || allImages[0];
                            const imageDeviceType = (firstImage as ProductImageData & { device_type?: string }).device_type || 'desktop';
                            if (imageDeviceType === 'mobile') {
                                mobileImage = firstImage;
                            } else {
                                desktopImage = firstImage;
                            }
                        }
                    }
                }

                // Set image URLs
                setMobileImageUrl(mobileImage?.image_url || '');
                setDesktopImageUrl(desktopImage?.image_url || '');

                // Set error state only if no images are available for either device
                const hasAnyImage = mobileImage || desktopImage;
                setImageError(!hasAnyImage);

                if (debug) {
                    console.log('🖼️ API Image loading complete:', {
                        productId,
                        mobileImage: mobileImage?.image_url,
                        desktopImage: desktopImage?.image_url,
                        hasAnyImage
                    });
                }
            } else {
                if (debug) console.log('🖼️ No images found in API response for product:', productId);
                setImageError(true);
            }
        } catch (error) {
            if (debug) console.error('🖼️ Error loading image from API for product:', productId, error);
            setImageError(true);
        } finally {
            setLoading(false);
        }
    }, [productId, imageType, preferThumbnail, index, debug, filterImagesByDevice]);

    // Load device-specific image data from Inertia props
    const loadImageFromProps = useCallback((): void => {
        if (debug) {
            console.log('🖼️ DynamicImageSingle: Starting loadImageFromProps for product:', productId);
        }
        setLoading(true);

        if (debug) {
            console.log('🖼️ DynamicImageSingle: Loading image for product:', productId, productImages);
            console.log('🖼️ Specific image provided:', specificImage);
        }

        // If specificImage is provided, use it directly
        if (specificImage) {
            const deviceType = (specificImage as ProductImageData & { device_type?: string }).device_type || 'desktop';

            if (deviceType === 'mobile') {
                setMobileImageUrl(specificImage.image_url);
                setDesktopImageUrl('');
            } else {
                setDesktopImageUrl(specificImage.image_url);
                setMobileImageUrl('');
            }

            setImageError(false);
            setLoading(false);

            if (debug) {
                console.log('🖼️ Using specific image:', specificImage.image_url, 'for device:', deviceType);
            }
            return;
        }

        // If no productImages data, show fallback
        if (!productImages) {
            if (debug) console.log('🖼️ No productImages data, showing fallback');
            setLoading(false);
            setImageError(true);
            return;
        }

        // Get device-specific images
        const mobileImages = {
            thumbnails: filterImagesByDevice(productImages.thumbnails, 'mobile'),
            gallery: filterImagesByDevice(productImages.gallery, 'mobile'),
            hero: filterImagesByDevice(productImages.hero, 'mobile')
        };

        const desktopImages = {
            thumbnails: filterImagesByDevice(productImages.thumbnails, 'desktop'),
            gallery: filterImagesByDevice(productImages.gallery, 'desktop'),
            hero: filterImagesByDevice(productImages.hero, 'desktop')
        };

        // Select mobile image
        let mobileImage: ProductImageData | null = null;
        if (preferThumbnail && productImages.main_thumbnail && (productImages.main_thumbnail as ProductImageData & { device_type?: string }).device_type === 'mobile') {
            mobileImage = productImages.main_thumbnail;
        } else if (imageType === 'thumbnail' && mobileImages.thumbnails.length > 0) {
            mobileImage = mobileImages.thumbnails[0];
        } else if (imageType === 'gallery' && mobileImages.gallery.length > 0) {
            mobileImage = mobileImages.gallery[Math.min(index - 1, mobileImages.gallery.length - 1)];
        } else if (imageType === 'hero' && mobileImages.hero.length > 0) {
            mobileImage = mobileImages.hero[0];
        }

        // Select desktop image
        let desktopImage: ProductImageData | null = null;
        if (preferThumbnail && productImages.main_thumbnail && (productImages.main_thumbnail as ProductImageData & { device_type?: string }).device_type === 'desktop') {
            desktopImage = productImages.main_thumbnail;
        } else if (imageType === 'thumbnail' && desktopImages.thumbnails.length > 0) {
            desktopImage = desktopImages.thumbnails[0];
        } else if (imageType === 'gallery' && desktopImages.gallery.length > 0) {
            desktopImage = desktopImages.gallery[Math.min(index - 1, desktopImages.gallery.length - 1)];
        } else if (imageType === 'hero' && desktopImages.hero.length > 0) {
            desktopImage = desktopImages.hero[0];
        }

        // Fallback: If no device-specific images found, use any available image
        if (!mobileImage && !desktopImage) {
            if (debug) {
                console.log('🖼️ No device-specific images found, applying fallback logic for product:', productId);
            }

            // Try main_thumbnail regardless of device_type
            if (productImages.main_thumbnail && productImages.main_thumbnail.image_url?.trim()) {
                const mainThumbDeviceType = (productImages.main_thumbnail as ProductImageData & { device_type?: string }).device_type || 'desktop';
                if (debug) {
                    console.log('🖼️ Using main_thumbnail as fallback, device_type:', mainThumbDeviceType);
                }
                if (mainThumbDeviceType === 'mobile') {
                    mobileImage = productImages.main_thumbnail;
                } else {
                    desktopImage = productImages.main_thumbnail;
                }
            }

            // If still no images, try any available image from any type
            if (!mobileImage && !desktopImage) {
                if (debug) {
                    console.log('🖼️ No main_thumbnail available, trying any available image');
                }
                const allImages = [
                    ...(productImages.thumbnails || []),
                    ...(productImages.gallery || []),
                    ...(productImages.hero || [])
                ].filter(img => img?.image_url?.trim());

                if (debug) {
                    console.log('🖼️ Available images for fallback:', allImages.map(img => ({
                        id: img.id,
                        device_type: (img as ProductImageData & { device_type?: string }).device_type || 'desktop',
                        image_type: img.image_type
                    })));
                }

                if (allImages.length > 0) {
                    const firstImage = allImages[Math.min(index - 1, allImages.length - 1)] || allImages[0];
                    const imageDeviceType = (firstImage as ProductImageData & { device_type?: string }).device_type || 'desktop';
                    if (debug) {
                        console.log('🖼️ Using first available image as fallback, device_type:', imageDeviceType, 'image:', firstImage);
                    }
                    if (imageDeviceType === 'mobile') {
                        mobileImage = firstImage;
                    } else {
                        desktopImage = firstImage;
                    }
                }
            }
        }

        // Set image URLs
        setMobileImageUrl(mobileImage?.image_url || '');
        setDesktopImageUrl(desktopImage?.image_url || '');

        // Set error state only if no images are available for either device
        const hasAnyImage = mobileImage || desktopImage;
        setImageError(!hasAnyImage);
        setLoading(false);

        if (debug) {
            console.log('🖼️ Image loading complete:', {
                productId,
                imageType,
                preferThumbnail,
                index,
                mobileImage: mobileImage?.image_url,
                desktopImage: desktopImage?.image_url,
                hasAnyImage,
                mobileImagesCount: mobileImages.thumbnails.length + mobileImages.gallery.length + mobileImages.hero.length,
                desktopImagesCount: desktopImages.thumbnails.length + desktopImages.gallery.length + desktopImages.hero.length,
                mainThumbnailDeviceType: productImages.main_thumbnail ? (productImages.main_thumbnail as ProductImageData & { device_type?: string }).device_type || 'desktop' : 'none'
            });
        }
    }, [productId, imageType, preferThumbnail, index, debug, productImages, specificImage, filterImagesByDevice]);

    // Setup Intersection Observer for efficient lazy loading
    const setupIntersectionObserver = useCallback((): void => {
        if (typeof window === 'undefined' || !containerRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsIntersecting(true);
                        if (!hasLoadedOnce) {
                            setHasLoadedOnce(true);
                            loadImageFromProps();
                        }
                    } else {
                        setIsIntersecting(false);
                    }
                });
            },
            {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            }
        );

        observerRef.current.observe(containerRef.current);
    }, [hasLoadedOnce, loadImageFromProps]);

    // Handle image load success
    const handleMobileImageLoad = useCallback((): void => {
        if (debug) console.log('🖼️ Mobile image loaded for:', productId);
        setMobileImageLoaded(true);
        setImageError(false);
    }, [debug, productId]);

    const handleDesktopImageLoad = useCallback((): void => {
        if (debug) console.log('🖼️ Desktop image loaded for:', productId);
        setDesktopImageLoaded(true);
        setImageError(false);
    }, [debug, productId]);

    // Handle image load error
    const handleImageError = useCallback((): void => {
        if (debug) console.warn('🖼️ Image failed to load for:', productId);
        setImageError(true);
    }, [debug, productId]);

    // Device detection
    useEffect(() => {
        const checkDevice = () => {
            const newDeviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';
            if (newDeviceType !== currentDeviceType) {
                setCurrentDeviceType(newDeviceType);
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, [currentDeviceType]);

    // Setup intersection observer on mount
    useEffect(() => {
        setupIntersectionObserver();
        return () => observerRef.current?.disconnect();
    }, [setupIntersectionObserver]);

    // Load image immediately when productImages are available OR when useDatabase is true (no lazy loading for better performance)
    useEffect(() => {
        if (productId && !hasLoadedOnce) {
            if (productImages) {
                if (debug) {
                    console.log('🖼️ DynamicImageSingle: Loading image immediately from props for product:', productId);
                }
                setHasLoadedOnce(true);
                loadImageFromProps();
            } else if (useDatabase) {
                if (debug) {
                    console.log('🖼️ DynamicImageSingle: Loading image from API for product:', productId);
                }
                setHasLoadedOnce(true);
                loadImageFromAPI();
            }
        }
    }, [productId, productImages, useDatabase, hasLoadedOnce, loadImageFromProps, loadImageFromAPI, debug]);

    // Reset loading states when URLs change
    useEffect(() => setMobileImageLoaded(false), [mobileImageUrl]);
    useEffect(() => setDesktopImageLoaded(false), [desktopImageUrl]);

    const shouldShowPlaceholder = loading || imageError || (!mobileImageLoaded && !desktopImageLoaded);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden bg-gray-100 aspect-[4/5] md:aspect-[16/9] ${getRoundedClasses()} ${className}`}
            style={style}
        >
            {/* Mobile Image (4:5) - Only visible on mobile */}
            <img
                ref={mobileImgRef}
                src={mobileImageUrl || placeholderSvg}
                alt={alt}
                className={`
          absolute inset-0 w-full h-full object-contain
          transition-opacity duration-300 ease-out
          ${getRoundedClasses()}
          ${mobileImageLoaded && mobileImageUrl ? 'opacity-100' : 'opacity-0'}
          ${imageError ? 'grayscale' : ''}
          block md:hidden
        `}
                onLoad={handleMobileImageLoad}
                onError={handleImageError}
                loading="eager"
                style={{ willChange: 'opacity' }}
            />

            {/* Desktop Image (16:9) - Only visible on desktop */}
            <img
                ref={desktopImgRef}
                src={desktopImageUrl || placeholderSvg}
                alt={alt}
                className={`
          absolute inset-0 w-full h-full object-contain
          transition-opacity duration-300 ease-out
          ${getRoundedClasses()}
          ${desktopImageLoaded && desktopImageUrl ? 'opacity-100' : 'opacity-0'}
          ${imageError ? 'grayscale' : ''}
          hidden md:block
        `}
                onLoad={handleDesktopImageLoad}
                onError={handleImageError}
                loading="eager"
                style={{ willChange: 'opacity' }}
            />

            {/* Fallback placeholder */}
            {shouldShowPlaceholder && (
                <div className="absolute inset-0 w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 mb-1">Image Tidak Tersedia</p>
                        <p className="text-xs text-gray-500">Gambar produk belum diupload</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DynamicImageSingle;
