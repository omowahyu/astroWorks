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

  // SVG placeholder dengan pesan "Image Tidak Tersedia"
  const placeholderSvg = `/images/placeholder-product.svg`;

  // Fallback image paths to try - ALWAYS use placeholder for missing data
  const getFallbackPaths = useCallback((productId: string, index: number): string[] => {
    return [placeholderSvg];
  }, [placeholderSvg]);

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
   * Load image data from Inertia props - ALWAYS use placeholder for now
   */
  const loadImageFromProps = useCallback((): void => {
    // For now, ALWAYS use placeholder to avoid 403 errors
    setLoading(false);
    setMobileImageUrl(placeholderSvg);
    setDesktopImageUrl(placeholderSvg);
    setMobileImageLoaded(true);
    setDesktopImageLoaded(true);
    setImageError(false);

    if (debug) {
      console.log('🖼️ DynamicImageSingle: Using placeholder for product:', productId);
    }
    return;

    // Simplified - just use placeholder for now
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
   * Try fallback images when primary image fails
   */
  const tryFallbackImage = useCallback(async (isMobile: boolean): Promise<void> => {
    const fallbackPaths = getFallbackPaths(productId, index);

    for (const path of fallbackPaths) {
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = path;
        });

        // If we get here, the image loaded successfully
        if (isMobile) {
          setMobileImageUrl(path);
          setMobileImageLoaded(true);
        } else {
          setDesktopImageUrl(path);
          setDesktopImageLoaded(true);
        }
        setImageError(false);

        if (debug) console.log(`🖼️ Fallback image loaded: ${path}`);
        return;
      } catch {
        // Continue to next fallback
        continue;
      }
    }

    // All fallbacks failed, use placeholder
    if (debug) console.warn('🖼️ All fallback images failed for:', productId);
    setImageError(true);
  }, [productId, index, getFallbackPaths, debug]);

  /**
   * Handle image load error with fallback logic
   */
  const handleImageError = useCallback((isMobile: boolean = false): void => {
    if (debug) console.warn('🖼️ Image failed to load for:', productId);
    tryFallbackImage(isMobile);
  }, [debug, productId, tryFallbackImage]);

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
      className={`relative overflow-hidden bg-gray-100 aspect-[4/5] md:aspect-[16/9] ${getRoundedClasses()} ${className}`}
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
        onError={() => handleImageError(true)}
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
        onError={() => handleImageError(false)}
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


    </div>
  );
};

export default DynamicImageSingle;
