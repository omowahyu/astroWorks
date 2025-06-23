import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
// Pastikan path ke komponen DynamicImageSingle sudah benar
// import DynamicImageSingle from './dynamic-image-single';

// ==================== MOCK COMPONENT FOR DEMO ====================
// Hapus atau ganti ini dengan komponen asli Anda
const DynamicImageSingle = ({ alt, specificImage, className, rounded }) => (
    <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${className}`}>
        {specificImage && specificImage.image_url ? (
            <img src={specificImage.image_url} alt={alt} className={`w-full h-full object-cover ${rounded}`} />
        ) : (
            <div className="text-xs text-gray-500">Invalid Image</div>
        )}
    </div>
);
// ===============================================================


// ==================== TYPES ====================

interface ImageVariants {
    original: string;
    mobile_portrait: string | null;
    mobile_square: string | null;
    desktop_landscape: string | null;
}

interface GalleryImageData {
    id: number;
    image_type: 'thumbnail' | 'gallery' | 'hero';
    sort_order?: number;
    display_order?: number;
    alt_text: string;
    image_url: string;
    device_type?: 'mobile' | 'desktop';
    aspect_ratio?: number;
    variants?: ImageVariants;
}

interface DynamicImageGalleryProps {
    /** Product UUID for database lookup and file naming */
    productId: string;
    /** Product name for alt text */
    name: string;
    /** Additional CSS classes */
    className?: string;
    /** Enable auto-advance */
    autoAdvance?: boolean;
    /** Auto-advance interval in milliseconds */
    autoAdvanceInterval?: number;
    /** Border radius for all images in gallery */
    rounded?: string;
    /** Border radius for mobile devices */
    mobileRounded?: string;
    /** Border radius for desktop devices */
    desktopRounded?: string;
    /** Use database as primary source */
    useDatabase?: boolean;
    /** Enable debug logging */
    debug?: boolean;
    /** Filter images by device type */
    deviceTypeFilter?: 'mobile' | 'desktop' | 'all';
    /** Product images data passed from Inertia */
    productImages?: {
        thumbnails: GalleryImageData[];
        gallery: GalleryImageData[];
        hero: GalleryImageData[];
        main_thumbnail: GalleryImageData | null;
    };
}

// ==================== MAIN COMPONENT ====================

const DynamicImageGallery: React.FC<DynamicImageGalleryProps> = ({
                                                                     productId,
                                                                     className = '',
                                                                     autoAdvance = false,
                                                                     autoAdvanceInterval = 5000,
                                                                     rounded = '2xl',
                                                                     mobileRounded,
                                                                     desktopRounded,
                                                                     useDatabase = true,
                                                                     debug = false,
                                                                     deviceTypeFilter = 'all',
                                                                     productImages
                                                                 }) => {
    // ==================== STATE ====================

    const [currentDeviceType, setCurrentDeviceType] = useState<'mobile' | 'desktop'>('desktop');
    const [deviceTypeChanged, setDeviceTypeChanged] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [galleryImages, setGalleryImages] = useState<GalleryImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDraggingThumbnails, setIsDraggingThumbnails] = useState(false);
    const [touchStartX, setTouchStartX] = useState(0);

    // ==================== REFS ====================

    const galleryContainer = useRef<HTMLDivElement>(null);
    const thumbnailContainer = useRef<HTMLDivElement>(null);
    const autoAdvanceTimer = useRef<number | null>(null);
    const thumbnailDragStart = useRef({ startX: 0, scrollLeft: 0 });

    // [FIXED] Ref untuk melacak apakah pengguna melakukan drag, untuk mencegah 'klik' yang tidak disengaja.
    const didDrag = useRef(false);

    // ==================== DERIVED STATE ====================

    const hasMultipleImages = galleryImages.length > 1;

    // ==================== UTILITY FUNCTIONS ====================

    const debugLog = useCallback((message: string, ...args: unknown[]) => {
        if (debug) {
            console.log(`🖼️ ${message}`, ...args);
        }
    }, [debug]);

    const getRoundedClasses = useCallback((): string => {
        let activeRounded: string | undefined;
        if (currentDeviceType === 'mobile') {
            activeRounded = mobileRounded || rounded;
        } else {
            activeRounded = desktopRounded || rounded;
        }
        if (!activeRounded || activeRounded === 'none') return '';
        const roundedMap: Record<string, string> = {
            'sm': 'rounded-sm', 'md': 'rounded-md', 'lg': 'rounded-lg', 'xl': 'rounded-xl',
            '2xl': 'rounded-2xl', '3xl': 'rounded-3xl', 'full': 'rounded-full'
        };
        return roundedMap[activeRounded] || `rounded-[${activeRounded}]`;
    }, [rounded, mobileRounded, desktopRounded, currentDeviceType]);

    // ==================== IMAGE PROCESSING ====================

    const filterImagesByDeviceType = useCallback((images: GalleryImageData[]) => {
        if (deviceTypeFilter === 'all') return images;
        const targetDeviceType = deviceTypeFilter || currentDeviceType;
        return images.filter(img => (img.device_type || 'desktop') === targetDeviceType);
    }, [deviceTypeFilter, currentDeviceType]);

    // [REFACTORED] Logika pemrosesan gambar yang lebih kuat dan sederhana
    const processGalleryImages = useCallback(() => {
        if (!productId || !productImages) {
            setGalleryImages([]);
            setLoading(false);
            return;
        }
        try {
            // 1. Gabungkan semua jenis gambar dan filter yang tidak valid
            const allImagesRaw = [
                ...(productImages.main_thumbnail ? [productImages.main_thumbnail] : []),
                ...(productImages.thumbnails || []),
                ...(productImages.gallery || []),
                ...(productImages.hero || [])
            ].filter(img => img && img.image_url && img.image_url.trim());

            // 2. Buat daftar gambar unik berdasarkan ID untuk menghindari duplikat
            const uniqueImages = Array.from(new Map(allImagesRaw.map(img => [img.id, img])).values());

            // 3. Filter berdasarkan tipe perangkat
            let finalImages = filterImagesByDeviceType(uniqueImages);

            // 4. Fallback: Jika setelah difilter tidak ada gambar, gunakan semua gambar unik
            if (finalImages.length === 0 && uniqueImages.length > 0) {
                debugLog('Tidak ada gambar untuk perangkat saat ini, menampilkan semua gambar sebagai fallback.');
                finalImages = uniqueImages;
            }

            // 5. Urutkan daftar akhir dengan prioritas
            const mainThumbnailId = productImages.main_thumbnail?.id;
            finalImages.sort((a, b) => {
                // Prioritas #1: main_thumbnail selalu di depan
                if (mainThumbnailId) {
                    if (a.id === mainThumbnailId) return -1;
                    if (b.id === mainThumbnailId) return 1;
                }

                // Prioritas #2: tipe 'thumbnail'
                if (a.image_type === 'thumbnail' && b.image_type !== 'thumbnail') return -1;
                if (b.image_type === 'thumbnail' && a.image_type !== 'thumbnail') return 1;

                // Prioritas #3: urutan asli (sort_order)
                return (a.sort_order || 0) - (b.sort_order || 0);
            });

            debugLog('Gambar galeri diproses:', { total: finalImages.length, images: finalImages.map(i => i.id) });
            setGalleryImages(finalImages);

        } catch (error) {
            console.error('🖼️ Terjadi error saat memproses gambar:', error);
            setGalleryImages([]);
        } finally {
            setLoading(false);
        }
    }, [productId, productImages, filterImagesByDeviceType, debugLog, currentDeviceType]);


    // ==================== DEVICE DETECTION ====================

    useEffect(() => {
        const checkDevice = () => {
            const newDeviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';
            if (newDeviceType !== currentDeviceType) {
                debugLog('Tipe perangkat berubah:', currentDeviceType, '→', newDeviceType);
                setCurrentDeviceType(newDeviceType);
                setDeviceTypeChanged(true);
                setLoading(true);
                setCurrentIndex(0);
                setTimeout(() => setDeviceTypeChanged(false), 100);
            }
        };
        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, [currentDeviceType, debugLog]);

    // ==================== IMAGE LOADING ====================

    useEffect(() => {
        processGalleryImages();
    }, [processGalleryImages]);

    useEffect(() => {
        if (deviceTypeChanged) {
            debugLog('Memuat ulang galeri karena perubahan tipe perangkat:', currentDeviceType);
            processGalleryImages();
        }
    }, [deviceTypeChanged, processGalleryImages, currentDeviceType, debugLog]);

    // ==================== NAVIGATION ====================

    const scrollToActiveThumbnail = useCallback((index: number) => {
        const container = thumbnailContainer.current;
        if (!container) return;

        const activeThumbnail = container.children[index] as HTMLElement;
        if (!activeThumbnail) return;

        const containerWidth = container.clientWidth;
        const thumbnailOffsetLeft = activeThumbnail.offsetLeft;
        const thumbnailWidth = activeThumbnail.offsetWidth;

        const desiredScrollLeft = thumbnailOffsetLeft - (containerWidth / 2) + (thumbnailWidth / 2);

        const maxScroll = container.scrollWidth - containerWidth;
        const finalPosition = Math.max(0, Math.min(desiredScrollLeft, maxScroll));

        container.scrollTo({
            left: finalPosition,
            behavior: 'smooth'
        });
    }, []);

    const goToImage = useCallback((index: number) => {
        if (isTransitioning || index === currentIndex || index < 0 || index >= galleryImages.length) {
            return;
        }
        setIsTransitioning(true);
        setCurrentIndex(index);

        if (autoAdvanceTimer.current) {
            clearInterval(autoAdvanceTimer.current);
            autoAdvanceTimer.current = null;
        }

        setTimeout(() => setIsTransitioning(false), 300);
    }, [isTransitioning, currentIndex, galleryImages.length]);

    const previousImage = useCallback(() => {
        const newIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
        goToImage(newIndex);
    }, [currentIndex, galleryImages.length, goToImage]);

    const nextImage = useCallback(() => {
        const newIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
        goToImage(newIndex);
    }, [currentIndex, galleryImages.length, goToImage]);

    // ==================== EVENT HANDLERS ====================

    const handleTouchStart = useCallback((event: React.TouchEvent) => {
        setTouchStartX(event.touches[0].clientX);
    }, []);

    const handleTouchEnd = useCallback((event: React.TouchEvent) => {
        const touchEndX = event.changedTouches[0].clientX;
        const swipeDistance = touchStartX - touchEndX;
        const swipeThreshold = 50;
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) nextImage(); else previousImage();
        }
    }, [touchStartX, nextImage, previousImage]);

    const handleDragStart = useCallback((clientX: number) => {
        const container = thumbnailContainer.current;
        if (!container) return;
        setIsDraggingThumbnails(true);
        didDrag.current = false;
        thumbnailDragStart.current = {
            startX: clientX - container.offsetLeft,
            scrollLeft: container.scrollLeft
        };
    }, []);

    const handleDragMove = useCallback((clientX: number) => {
        if (!isDraggingThumbnails) return;
        didDrag.current = true;

        const container = thumbnailContainer.current;
        if (!container) return;

        const x = clientX - container.offsetLeft;
        const walk = (x - thumbnailDragStart.current.startX) * 2;
        container.scrollLeft = thumbnailDragStart.current.scrollLeft - walk;
    }, [isDraggingThumbnails]);

    const handleDragEnd = useCallback(() => {
        setIsDraggingThumbnails(false);
    }, []);

    // ==================== KEYBOARD NAVIGATION ====================

    const handleKeydown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            previousImage();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            nextImage();
        }
    }, [previousImage, nextImage]);

    // ==================== AUTO-ADVANCE ====================

    const startAutoAdvance = useCallback(() => {
        if (!autoAdvance || !hasMultipleImages) return;
        stopAutoAdvance();
        autoAdvanceTimer.current = window.setInterval(() => {
            if (!isTransitioning) nextImage();
        }, autoAdvanceInterval);
    }, [autoAdvance, hasMultipleImages, isTransitioning, nextImage, autoAdvanceInterval]);

    const stopAutoAdvance = useCallback(() => {
        if (autoAdvanceTimer.current) {
            clearInterval(autoAdvanceTimer.current);
            autoAdvanceTimer.current = null;
        }
    }, []);

    // ==================== EFFECTS ====================

    useEffect(() => {
        if (hasMultipleImages && !isTransitioning) {
            scrollToActiveThumbnail(currentIndex);
        }
    }, [currentIndex, hasMultipleImages, isTransitioning, scrollToActiveThumbnail]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [handleKeydown]);

    useEffect(() => {
        if (autoAdvance && hasMultipleImages) {
            startAutoAdvance();
        }
        return stopAutoAdvance;
    }, [autoAdvance, hasMultipleImages, startAutoAdvance, stopAutoAdvance]);

    // ==================== RENDER HELPERS ====================

    const renderLoadingState = () => (
        <div className={`w-full ${className}`}>
            <div className={`relative w-full aspect-[4/5] md:aspect-[16/9] bg-gray-100 ${getRoundedClasses()} overflow-hidden mb-4 animate-pulse`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
            </div>
        </div>
    );

    const renderEmptyState = () => (
        <div className={`w-full ${className}`}>
            <div className={`relative w-full aspect-[4/5] md:aspect-[16/9] bg-gray-100 ${getRoundedClasses()} overflow-hidden flex flex-col items-center justify-center`}>
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4"><svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                <div className="text-center"><h3 className="text-lg font-medium text-gray-900 mb-1">Gambar Tidak Tersedia</h3><p className="text-sm text-gray-500">Gambar produk belum diunggah.</p></div>
            </div>
        </div>
    );

    const renderNavigationArrows = () => (
        <>
            <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={previousImage} aria-label="Previous image"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={nextImage} aria-label="Next image"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
        </>
    );

    const renderImageCounter = () => (
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-20 pointer-events-none">
            {currentIndex + 1} / {galleryImages.length}
        </div>
    );

    const renderThumbnails = () => (
        <motion.div className="relative" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <div
                ref={thumbnailContainer}
                className={`flex space-x-2 overflow-x-auto scrollbar-hide scroll-smooth pb-2 ${isDraggingThumbnails ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
                onTouchCancel={handleDragEnd}
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {galleryImages.map((image, index) => (
                    <motion.button
                        key={image.id}
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 ${getRoundedClasses()} overflow-hidden border-2 select-none transition-all ${index === currentIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-400'}`}
                        onClick={() => {
                            if (!didDrag.current) {
                                goToImage(index);
                            }
                        }}
                        aria-label={`View image ${index + 1}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <DynamicImageSingle
                            productId={productId}
                            alt={image.alt_text}
                            className="w-full lg:w-auto lg:h-full"
                            useDatabase={useDatabase}
                            productImages={productImages}
                            specificImage={image}
                        />
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );

    // ==================== MAIN RENDER ====================

    if (loading) return renderLoadingState();
    if (galleryImages.length === 0) return renderEmptyState();

    return (
        <motion.div className={`w-full ${className}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div
                ref={galleryContainer}
                className={`relative w-full aspect-[4/5] md:aspect-[16/9] bg-gray-100 ${getRoundedClasses()} overflow-hidden group mb-4`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                role="region"
                aria-label="Product image gallery"
            >
                <div className="relative w-full h-full">
                    {galleryImages.map((image, index) => (
                        <div
                            key={image.id}
                            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            aria-hidden={index !== currentIndex}
                        >
                            <DynamicImageSingle
                                productId={productId}
                                alt={image.alt_text}
                                className="w-full h-full"
                                rounded="none"
                                useDatabase={useDatabase}
                                debug={debug}
                                productImages={productImages}
                                specificImage={image}
                            />
                        </div>
                    ))}
                    {hasMultipleImages && renderNavigationArrows()}
                    {hasMultipleImages && renderImageCounter()}
                </div>
            </div>
            {hasMultipleImages && renderThumbnails()}
        </motion.div>
    );
};

export default DynamicImageGallery;
