import React, { useState, useEffect, useRef, useCallback } from 'react';
import DynamicImageSingle from './dynamic-image-single';

interface ImageVariants {
  original: string;
  mobile_portrait: string | null;
  mobile_square: string | null;
  desktop_landscape: string | null;
}

interface GalleryImageData {
  id: number;
  image_type: 'thumbnail' | 'gallery' | 'hero';
  is_thumbnail: boolean;
  is_primary: boolean;
  display_order: number;
  alt_text: string;
  image_url: string;
  variants: ImageVariants;
}

interface DynamicImageGalleryProps {
  /** Product UUID for database lookup and file naming */
  productId: string;
  /** Product name for alt text */
  name: string;
  /** Additional CSS classes */
  className?: string;
  /** Number of images to show in gallery (fallback) */
  imageCount?: number;
  /** Enable auto-advance */
  autoAdvance?: boolean;
  /** Auto-advance interval in milliseconds */
  autoAdvanceInterval?: number;
  /** Border radius for all images in gallery */
  rounded?: string;
  /** Use database as primary source */
  useDatabase?: boolean;
  /** Enable debug logging */
  debug?: boolean;
  /** Product images data passed from Inertia */
  productImages?: {
    thumbnails: GalleryImageData[];
    gallery: GalleryImageData[];
    hero: GalleryImageData[];
    main_thumbnail: GalleryImageData | null;
  };
}

const DynamicImageGallery: React.FC<DynamicImageGalleryProps> = ({
  productId,
  name,
  className = '',
  imageCount = 3,
  autoAdvance = false,
  autoAdvanceInterval = 5000,
  rounded = '2xl',
  useDatabase = true,
  debug = false,
  productImages
}) => {
  // Gallery state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Touch/swipe state
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  // Refs
  const galleryContainer = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const autoAdvanceTimer = useRef<number | null>(null);

  // Derived state
  const hasMultipleImages = galleryImages.length > 1;

  /**
   * Load gallery images from Inertia props
   */
  const loadGalleryImages = useCallback((): void => {
    if (!productId || !productImages) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (debug) {
        console.log('🖼️ DynamicImageGallery: Loading from props:', productImages);
      }

      if (productImages.gallery && productImages.gallery.length > 0) {
        setGalleryImages(productImages.gallery);
      } else {
        // Fallback: create placeholder images based on imageCount
        const placeholderImages: GalleryImageData[] = [];
        for (let i = 1; i <= imageCount; i++) {
          placeholderImages.push({
            id: i,
            image_type: 'gallery',
            is_thumbnail: false,
            is_primary: i === 1,
            display_order: i,
            alt_text: `${name} - Image ${i}`,
            image_url: '',
            variants: {
              original: '',
              mobile_portrait: null,
              mobile_square: null,
              desktop_landscape: null
            }
          });
        }
        setGalleryImages(placeholderImages);
      }

    } catch (error) {
      if (debug) {
        console.error('🖼️ DynamicImageGallery: Failed to load gallery from props:', error);
      }
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  }, [productId, imageCount, name, debug, productImages]);

  /**
   * Setup Intersection Observer for lazy loading
   */
  const setupIntersectionObserver = useCallback((): void => {
    if (typeof window === 'undefined' || !galleryContainer.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            if (!hasLoadedOnce) {
              setHasLoadedOnce(true);
              loadGalleryImages();
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

    observerRef.current.observe(galleryContainer.current);
  }, [hasLoadedOnce, loadGalleryImages]);

  // Load gallery immediately if productImages are available
  useEffect(() => {
    if (productId && productImages && !hasLoadedOnce) {
      setHasLoadedOnce(true);
      loadGalleryImages();
    }
  }, [productId, productImages, hasLoadedOnce, loadGalleryImages]);

  /**
   * Navigate to specific image
   */
  const goToImage = useCallback((index: number): void => {
    if (isTransitioning || index === currentIndex || index < 0 || index >= galleryImages.length) return;

    setIsTransitioning(true);
    setCurrentIndex(index);

    // Reset auto-advance timer
    resetAutoAdvance();

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, currentIndex, galleryImages.length]);

  /**
   * Navigate to previous image
   */
  const previousImage = useCallback((): void => {
    const newIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    goToImage(newIndex);
  }, [currentIndex, galleryImages.length, goToImage]);

  /**
   * Navigate to next image
   */
  const nextImage = useCallback((): void => {
    const newIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    goToImage(newIndex);
  }, [currentIndex, galleryImages.length, goToImage]);

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((event: React.TouchEvent): void => {
    setTouchStartX(event.touches[0].clientX);
  }, []);

  /**
   * Handle touch end and detect swipe
   */
  const handleTouchEnd = useCallback((event: React.TouchEvent): void => {
    setTouchEndX(event.changedTouches[0].clientX);
    
    const swipeThreshold = 50;
    const swipeDistance = touchStartX - event.changedTouches[0].clientX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        nextImage(); // Swipe left - next image
      } else {
        previousImage(); // Swipe right - previous image
      }
    }
  }, [touchStartX, nextImage, previousImage]);

  /**
   * Handle keyboard navigation
   */
  const handleKeydown = useCallback((event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        previousImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextImage();
        break;
    }
  }, [previousImage, nextImage]);

  /**
   * Start auto-advance timer
   */
  const startAutoAdvance = useCallback((): void => {
    if (!autoAdvance || galleryImages.length <= 1) return;
    
    autoAdvanceTimer.current = window.setInterval(() => {
      if (!isTransitioning) {
        nextImage();
      }
    }, autoAdvanceInterval);
  }, [autoAdvance, galleryImages.length, isTransitioning, nextImage, autoAdvanceInterval]);

  /**
   * Stop auto-advance timer
   */
  const stopAutoAdvance = useCallback((): void => {
    if (autoAdvanceTimer.current) {
      clearInterval(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  /**
   * Reset auto-advance timer
   */
  const resetAutoAdvance = useCallback((): void => {
    stopAutoAdvance();
    startAutoAdvance();
  }, [stopAutoAdvance, startAutoAdvance]);

  // Setup intersection observer on mount
  useEffect(() => {
    setupIntersectionObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupIntersectionObserver]);

  // Setup keyboard listeners
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
    }
  }, [handleKeydown]);

  // Setup auto-advance
  useEffect(() => {
    if (galleryImages.length > 1) {
      startAutoAdvance();
    }

    return () => {
      stopAutoAdvance();
    };
  }, [galleryImages.length, startAutoAdvance, stopAutoAdvance]);

  // Generate border radius classes
  const getRoundedClasses = (): string => {
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
  };

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className={`relative w-full aspect-[4/5] md:aspect-[16/9] bg-gray-100 ${getRoundedClasses()} overflow-hidden mb-4`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Main Image Display Area */}
      <div
        ref={galleryContainer}
        className={`relative w-full aspect-[4/5] md:aspect-[16/9] bg-gray-100 ${getRoundedClasses()} overflow-hidden group mb-4`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label="Product image gallery"
      >
        {/* Image Stack */}
        <div className="relative w-full h-full">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                index === currentIndex
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-105 z-0'
              }`}
            >
              <DynamicImageSingle
                productId={productId}
                index={image.display_order}
                alt={image.alt_text}
                className="w-full h-full"
                rounded={rounded}
                useDatabase={useDatabase}
                imageType="gallery"
                debug={debug}
                productImages={productImages}
              />
            </div>
          ))}

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 z-20 opacity-0 group-hover:opacity-100"
                onClick={previousImage}
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 z-20 opacity-0 group-hover:opacity-100"
                onClick={nextImage}
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-20">
              {currentIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 ${getRoundedClasses()} overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                index === currentIndex
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => goToImage(index)}
              aria-label={`View image ${index + 1}`}
            >
              <DynamicImageSingle
                productId={productId}
                index={image.display_order}
                alt={image.alt_text}
                className="w-full h-full"
                rounded="none"
                useDatabase={useDatabase}
                imageType="gallery"
                preferThumbnail={true}
                productImages={productImages}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicImageGallery;
