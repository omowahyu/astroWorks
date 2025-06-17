import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export function LazyImage({ 
    src, 
    alt, 
    className, 
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiNjY2MiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
    onLoad,
    onError 
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {/* Placeholder */}
            {!isLoaded && !hasError && (
                <img
                    src={placeholder}
                    alt=""
                    className={cn("absolute inset-0 w-full h-full object-cover", className)}
                />
            )}
            
            {/* Actual image */}
            <img
                ref={imgRef}
                src={isInView ? src : placeholder}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0",
                    className
                )}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
            />
            
            {/* Error state */}
            {hasError && (
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400",
                    className
                )}>
                    <div className="text-center">
                        <div className="text-2xl mb-2">📷</div>
                        <div className="text-sm">Image not available</div>
                    </div>
                </div>
            )}
        </div>
    );
}
