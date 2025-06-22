import React from 'react';
import DynamicImageGallery from '@/components/image/dynamic-image-gallery';
import DynamicImageSingle from '@/components/image/dynamic-image-single';

// Demo component untuk menunjukkan fitur responsive rounded
const ResponsiveRoundedDemo: React.FC = () => {
    // Mock product data
    const mockProductImages = {
        thumbnails: [
            {
                id: 1,
                image_type: 'thumbnail' as const,
                sort_order: 1,
                alt_text: 'Product thumbnail',
                image_url: '/images/products/product-1-thumb.jpg',
                device_type: 'mobile' as const
            }
        ],
        gallery: [
            {
                id: 2,
                image_type: 'gallery' as const,
                sort_order: 1,
                alt_text: 'Product gallery 1',
                image_url: '/images/products/product-1-gallery-1.jpg',
                device_type: 'mobile' as const
            },
            {
                id: 3,
                image_type: 'gallery' as const,
                sort_order: 2,
                alt_text: 'Product gallery 2',
                image_url: '/images/products/product-1-gallery-2.jpg',
                device_type: 'desktop' as const
            }
        ],
        hero: [],
        main_thumbnail: null
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-12">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Responsive Rounded Images Demo
                </h1>
                <p className="text-gray-600">
                    Resize browser window atau gunakan developer tools untuk melihat perubahan rounded
                </p>
            </div>

            {/* Example 1: Gallery dengan rounded berbeda */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    1. Gallery - Mobile: 3xl, Desktop: lg
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <DynamicImageGallery
                        productId="demo-1"
                        name="Demo Product 1"
                        className="w-full max-w-md mx-auto"
                        mobileRounded="3xl"
                        desktopRounded="lg"
                        useDatabase={true}
                        productImages={mockProductImages}
                    />
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    <strong>Mobile:</strong> rounded-3xl (24px) - Sangat rounded untuk tampilan mobile yang friendly<br/>
                    <strong>Desktop:</strong> rounded-lg (8px) - Lebih subtle untuk tampilan desktop yang professional
                </div>
            </section>

            {/* Example 2: Gallery dengan efek dramatis */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    2. Gallery - Mobile: full (circle), Desktop: 2xl
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <DynamicImageGallery
                        productId="demo-2"
                        name="Demo Product 2"
                        className="w-full max-w-md mx-auto"
                        mobileRounded="full"
                        desktopRounded="2xl"
                        useDatabase={true}
                        productImages={mockProductImages}
                    />
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    <strong>Mobile:</strong> rounded-full (50%) - Efek lingkaran penuh untuk highlight mobile<br/>
                    <strong>Desktop:</strong> rounded-2xl (16px) - Rounded sedang untuk keseimbangan visual
                </div>
            </section>

            {/* Example 3: Single Image */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    3. Single Image - Mobile: 2xl, Desktop: md
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <DynamicImageSingle
                        productId="demo-3"
                        alt="Demo Single Image"
                        className="w-full max-w-sm mx-auto"
                        mobileRounded="2xl"
                        desktopRounded="md"
                        useDatabase={true}
                        imageType="gallery"
                        productImages={mockProductImages}
                    />
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    <strong>Mobile:</strong> rounded-2xl (16px) - Rounded yang nyaman untuk touch interface<br/>
                    <strong>Desktop:</strong> rounded-md (6px) - Minimal rounded untuk tampilan clean
                </div>
            </section>

            {/* Example 4: Thumbnail grid */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    4. Thumbnail Grid - Konsisten vs Responsive
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    {/* Konsisten */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Konsisten (lg)</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[1, 2, 3, 4].map(i => (
                                <DynamicImageSingle
                                    key={i}
                                    productId={`thumb-${i}`}
                                    alt={`Thumbnail ${i}`}
                                    className="w-full aspect-square"
                                    rounded="lg"
                                    useDatabase={true}
                                    imageType="thumbnail"
                                    productImages={mockProductImages}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Responsive */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Responsive</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[1, 2, 3, 4].map(i => (
                                <DynamicImageSingle
                                    key={i}
                                    productId={`thumb-resp-${i}`}
                                    alt={`Responsive Thumbnail ${i}`}
                                    className="w-full aspect-square"
                                    mobileRounded="xl"
                                    desktopRounded="sm"
                                    useDatabase={true}
                                    imageType="thumbnail"
                                    productImages={mockProductImages}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    <strong>Kiri:</strong> Semua thumbnail menggunakan rounded-lg<br/>
                    <strong>Kanan:</strong> Mobile: rounded-xl, Desktop: rounded-sm
                </div>
            </section>

            {/* Breakpoint indicator */}
            <section className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Current Breakpoint
                </h3>
                <p className="text-yellow-700">
                    <span className="inline md:hidden font-medium">📱 Mobile Mode</span>
                    <span className="hidden md:inline font-medium">🖥️ Desktop Mode</span>
                    <span className="ml-2 text-sm">
                        (Breakpoint: 768px)
                    </span>
                </p>
            </section>

            {/* Usage code examples */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Code Examples
                </h2>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
{`// Recommended: Direct responsive rounded
<DynamicImageGallery
    productId="123"
    name="Product Name"
    mobileRounded="3xl"    // mobile: 24px
    desktopRounded="lg"    // desktop: 8px
    useDatabase={true}
    productImages={productImages}
/>

// Dramatic effect
<DynamicImageGallery
    productId="123"
    name="Product Name"
    mobileRounded="full"   // mobile: circle
    desktopRounded="xl"    // desktop: 12px
    useDatabase={true}
    productImages={productImages}
/>

// With fallback (optional)
<DynamicImageGallery
    productId="123"
    name="Product Name"
    rounded="xl"           // fallback
    mobileRounded="3xl"    // mobile: 24px
    desktopRounded="lg"    // desktop: 8px
    useDatabase={true}
    productImages={productImages}
/>`}
                    </pre>
                </div>
            </section>
        </div>
    );
};

export default ResponsiveRoundedDemo;`
