import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { useCallback, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';

// Define types
interface Product {
    id: number;
    name: string;
}

interface ProductCardProps {
    item: Product;
}

interface ProductFlexProps {
    title?: string;
}

// Product card component
const ProductCard = ({ item }: ProductCardProps) => (
    <div className="keen-slider__slide">
        <Link href={route('product.purchase', item.id)} className="block">
            <div className="overflow-hidden rounded-xl shadow/5 hover:shadow-lg transition-shadow">
                <img
                    src={`https://picsum.photos/seed/${item.id}/600/400`}
                    alt={item.name}
                    className="no-dragable hidden h-full w-full min-w-[400px] object-cover lg:block"
                    draggable={false}
                />

                <img
                    src={`https://picsum.photos/seed/${item.id}/300/460`}
                    alt={item.name}
                    className="h-60 w-full object-cover lg:hidden"
                    draggable={false}
                />
            </div>
            <div className="w-full p-2 text-center text-sm font-medium lg:text-xl dark:text-white hover:text-blue-600 transition-colors">{item.name}</div>
        </Link>
    </div>
);

export default function ProductFlex({ title }: ProductFlexProps) {
    const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const products: Product[] = [
        { name: 'SORA', id: 1 },
        { name: 'Fantasy Pantry Cabinet', id: 2 },
        { name: 'Modern Kitchen Set', id: 3 },
        { name: 'Elegant Dining Table', id: 4 },
        { name: 'Luxury Sofa Collection', id: 5 },
        { name: 'Contemporary Bookshelf', id: 6 },
        { name: 'Designer Coffee Table', id: 7 },
    ];

    const [sliderRef, instanceRef] = useKeenSlider(
        {
            initial: 0,
            loop: false,
            mode: 'free-snap',
            slides: {
                perView: 'auto',
                spacing: 15,
            },
            breakpoints: {
                '(min-width: 400px)': {
                    slides: { perView: 'auto', spacing: 15 },
                },
                '(min-width: 768px)': {
                    slides: { perView: 'auto', spacing: 20 },
                },
                '(min-width: 1024px)': {
                    slides: { perView: 'auto', spacing: 25 },
                },
            },
        },
        [
            // Auto-play plugin with slow speed
            (slider) => {
                let timeout: ReturnType<typeof setTimeout>;
                let mouseOver = false;

                function clearNextTimeout() {
                    clearTimeout(timeout);
                }

                function nextTimeout() {
                    clearTimeout(timeout);
                    if (mouseOver) return;
                    timeout = setTimeout(() => {
                        if (slider.track.details.rel < slider.track.details.slides.length - 1) {
                            slider.next();
                        } else {
                            slider.moveToIdx(0);
                        }
                    }, 4000); // 4 second delay for slow auto-play
                }

                slider.on('created', () => {
                    slider.container.addEventListener('mouseover', () => {
                        mouseOver = true;
                        clearNextTimeout();
                    });
                    slider.container.addEventListener('mouseout', () => {
                        mouseOver = false;
                        nextTimeout();
                    });
                    nextTimeout();
                });

                slider.on('dragStarted', clearNextTimeout);
                slider.on('animationEnded', nextTimeout);
                slider.on('updated', nextTimeout);
            },
        ],
    );

    // Handle wheel events for desktop scrolling
    const handleWheel = useCallback(
        (event: WheelEvent) => {
            // Only handle wheel events on desktop
            if (window.innerWidth < 768) return;

            event.preventDefault();

            // Clear existing timeout
            if (wheelTimeoutRef.current) {
                clearTimeout(wheelTimeoutRef.current);
            }

            // Debounce wheel events
            wheelTimeoutRef.current = setTimeout(() => {
                const deltaY = event.deltaY;
                const threshold = 30;

                if (Math.abs(deltaY) > threshold && instanceRef.current) {
                    if (deltaY > 0) {
                        instanceRef.current.next();
                    } else {
                        instanceRef.current.prev();
                    }
                }
            }, 50);
        },
        [instanceRef],
    );

    // Add wheel event listener
    useEffect(() => {
        const slider = instanceRef.current;
        if (slider && slider.container) {
            const sliderElement = slider.container;
            sliderElement.addEventListener('wheel', handleWheel, { passive: false });
            return () => {
                sliderElement.removeEventListener('wheel', handleWheel);
                if (wheelTimeoutRef.current) {
                    clearTimeout(wheelTimeoutRef.current);
                }
            };
        }
    }, [handleWheel, instanceRef]);

    return (
        <section className="">
            {title && <h2 className="mb-6 px-4 text-xl font-semibold md:px-6 lg:text-3xl">{title}</h2>}

            <div className="overflow-hidden px-4 md:px-6">
                <div ref={sliderRef} className="keen-slider">
                    {products.map((product) => (
                        <ProductCard key={product.id} item={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
