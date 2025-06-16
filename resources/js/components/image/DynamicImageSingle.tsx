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
  /** Use database as primary source */
  useDatabase?: boolean;
  /** Prefer any available thumbnail over device-specific logic */
  preferThumbnail?: boolean;
  /** Image type to load (thumbnail, gallery, hero) */
  imageType?: 'thumbnail' | 'gallery' | 'hero';
  /** Product images data passed from Inertia */
  productImages?: {
    thumbnails: ProductImageData[];
    gallery: ProductImageData[];
    hero: ProductImageData[];
    main_thumbnail: ProductImageData | null;
  };
}

const DynamicImageSingle: React.FC<DynamicImageSingleProps> = ({
  productId,
  index = 1,
  alt,
  className = '',
  style = {},
  debug = false,
  rounded = '',
  useDatabase = true,
  preferThumbnail = false,
  imageType = 'thumbnail',
  productImages
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

  // DOM references
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mobileImgRef = useRef<HTMLImageElement>(null);
  const desktopImgRef = useRef<HTMLImageElement>(null);

  // Fallback placeholder
  const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4Ni4xOSAxNTAgMTc1IDE2MS4xOSAxNzUgMTc1QzE3NSAxODguODEgMTg2LjE5IDIwMCAyMDAgMjAwQzIxMy44MSAyMDAgMjI1IDE4OC44MSAyMjUgMTc1QzIyNSAxNjEuMTkgMjEzLjgxIDE1MCAyMDAgMTUwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTI1IDI1MEgzMDBWMjc1SDEyNVYyNTBaIiBmaWxsPSIjOUNBM0FGIi8+CjwvdXZnPgo=';

  // Generate border radius classes
  const getRoundedClasses = useCallback((): string => {
    if (!rounded) return '';
    const baseClass = 'rounded';
    if (rounded === 'none') return '';
    if (rounded === 'sm') return `${baseClass}-sm`;
    if (rounded === 'md') return `${baseClass}-md`;
    if (rounded === 'lg') return `${baseClass}-lg`;
    if (rounded === 'xl') return `${baseClass}-xl`;
    if (rounded === '2xl') return `${baseClass}-2xl`;
    if (rounded === '3xl') return `${baseClass}-3xl`;
    if (rounded === 'full') return `${baseClass}-full`;
    return `${baseClass}-[${rounded}]`;
  }, [rounded]);

  /**
   * Load image data from Inertia props
   */
  const loadImageFromProps = useCallback((): void => {
    if (!productId || !productImages) {
      setLoading(false);
      setMobileImageUrl(placeholderSvg);
      setDesktopImageUrl(placeholderSvg);
      return;
    }

    try {
      setLoading(true);

      if (debug) {
        console.log('🖼️ DynamicImageSingle: Loading from props:', { productId, imageType, preferThumbnail, productImages });
      }

      let selectedImage: ProductImageData | null = null;

      // DynamicImageSingle ONLY uses thumbnails or placeholder
      if (productImages.main_thumbnail) {
        selectedImage = productImages.main_thumbnail;
      } else if (productImages.thumbnails && productImages.thumbnails.length > 0) {
        // Get thumbnail by index or first available
        const targetIndex = Math.min(index - 1, productImages.thumbnails.length - 1);
        selectedImage = productImages.thumbnails[targetIndex];
      }
      // If no thumbnails available, selectedImage remains null and placeholder will be used

      if (selectedImage) {
        // Set responsive URLs based on variants
        const variants = selectedImage.variants;
        const mobileUrl = variants.mobile_portrait || variants.mobile_square || variants.original;
        const desktopUrl = variants.desktop_landscape || variants.original;

        setMobileImageUrl(mobileUrl);
        setDesktopImageUrl(desktopUrl);

        // Preload both images for smooth transitions
        preloadImage(mobileUrl);
        preloadImage(desktopUrl);

        if (debug) {
          console.log('🖼️ DynamicImageSingle: Selected image:', selectedImage);
          console.log('🖼️ DynamicImageSingle: URLs:', { mobileUrl, desktopUrl });
        }
      } else {
        // No image found, use placeholder
        if (debug) {
          console.warn('🖼️ DynamicImageSingle: No image found, using placeholder');
        }
        setMobileImageUrl(placeholderSvg);
        setDesktopImageUrl(placeholderSvg);
      }

    } catch (error) {
      if (debug) {
        console.error('🖼️ DynamicImageSingle: Failed to load image from props:', error);
      }
      setImageError(true);
      setMobileImageUrl(placeholderSvg);
      setDesktopImageUrl(placeholderSvg);
    } finally {
      setLoading(false);
    }
  }, [productId, imageType, preferThumbnail, index, debug, placeholderSvg, productImages]);

  /**
   * Preload image to reduce delay and ensure smooth transitions
   */
  const preloadImage = useCallback((url: string): void => {
    if (typeof window !== 'undefined' && url && url !== placeholderSvg) {
      const img = new Image();
      img.src = url;
    }
  }, [placeholderSvg]);

  /**
   * Setup Intersection Observer for efficient lazy loading
   */
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
        rootMargin: '50px', // Load 50px before entering viewport
        threshold: 0.1
      }
    );

    observerRef.current.observe(containerRef.current);
  }, [hasLoadedOnce, loadImageFromProps]);

  /**
   * Handle mobile image load success
   */
  const handleMobileImageLoad = useCallback((): void => {
    if (debug) console.log('🖼️ Mobile image loaded for:', productId);
    setMobileImageLoaded(true);
    setImageError(false);
  }, [debug, productId]);

  /**
   * Handle desktop image load success
   */
  const handleDesktopImageLoad = useCallback((): void => {
    if (debug) console.log('🖼️ Desktop image loaded for:', productId);
    setDesktopImageLoaded(true);
    setImageError(false);
  }, [debug, productId]);

  /**
   * Handle image load error
   */
  const handleImageError = useCallback((): void => {
    if (debug) console.warn('🖼️ Image failed to load for:', productId);
    setImageError(true);
    // Don't reset loaded states - let the fallback placeholder show
  }, [debug, productId]);

  // Setup intersection observer on mount
  useEffect(() => {
    setupIntersectionObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupIntersectionObserver]);

  // Load image when component becomes visible or when productImages prop changes
  useEffect(() => {
    if (productId && productImages && isIntersecting && !hasLoadedOnce) {
      setHasLoadedOnce(true);
      loadImageFromProps();
    }
  }, [productId, productImages, isIntersecting, hasLoadedOnce, loadImageFromProps]);

  // Load image immediately if productImages are available (no need to wait for intersection)
  useEffect(() => {
    if (productId && productImages && !hasLoadedOnce) {
      setHasLoadedOnce(true);
      loadImageFromProps();
    }
  }, [productId, productImages, hasLoadedOnce, loadImageFromProps]);

  // Reset loading states when URLs change
  useEffect(() => {
    setMobileImageLoaded(false);
  }, [mobileImageUrl]);

  useEffect(() => {
    setDesktopImageLoaded(false);
  }, [desktopImageUrl]);



  return (
    <div
      ref={containerRef}
      className={`dynamic-image-single ${getRoundedClasses()} ${className}`}
      style={style}
    >
      {/* Mobile Image (4:5) - Only visible on mobile */}
      <img
        ref={mobileImgRef}
        src={mobileImageUrl || placeholderSvg}
        alt={alt}
        className={`
          absolute inset-0 w-full h-full object-cover
          transition-opacity duration-300 ease-out
          ${getRoundedClasses()}
          ${mobileImageLoaded && mobileImageUrl ? 'opacity-100' : 'opacity-0'}
          ${imageError ? 'grayscale' : ''}
          block md:hidden
        `}
        onLoad={handleMobileImageLoad}
        onError={handleImageError}
        loading="lazy"
        style={{ willChange: 'opacity' }}
      />

      {/* Desktop Image (16:9) - Only visible on desktop */}
      <img
        ref={desktopImgRef}
        src={desktopImageUrl || placeholderSvg}
        alt={alt}
        className={`
          absolute inset-0 w-full h-full object-cover
          transition-opacity duration-300 ease-out
          ${getRoundedClasses()}
          ${desktopImageLoaded && desktopImageUrl ? 'opacity-100' : 'opacity-0'}
          ${imageError ? 'grayscale' : ''}
          hidden md:block
        `}
        onLoad={handleDesktopImageLoad}
        onError={handleImageError}
        loading="lazy"
        style={{ willChange: 'opacity' }}
      />

      {/* Loading placeholder - shown when loading or no images */}
      {(loading || (!mobileImageUrl && !desktopImageUrl)) && (
        <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="animate-pulse">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      <style jsx>{`
        .dynamic-image-single {
          position: relative;
          overflow: hidden;
          background-color: #f3f4f6;
        }

        /* Responsive aspect ratios - CRITICAL for seamless transitions */
        @media (max-width: 767px) {
          .dynamic-image-single {
            aspect-ratio: 4 / 5;
          }
        }

        @media (min-width: 768px) {
          .dynamic-image-single {
            aspect-ratio: 16 / 9;
          }
        }

        /* Optimize for smooth transitions */
        .dynamic-image-single img {
          transform: translateZ(0); /* Force GPU acceleration */
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default DynamicImageSingle;
