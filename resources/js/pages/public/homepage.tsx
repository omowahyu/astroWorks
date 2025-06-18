import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

import VideoEmbed from '@/components/common/video-embed';

// Lazy load heavy components for better performance
import ProductCarouselLazy from '@/components/product/product-carousel-lazy';
import HomeDefaultLayout from '@/layouts/home/home-default-layout';

// Define the type for the props
interface PageProps extends SharedData {
    featuredVideo?: any;
    categories?: any[];
}

// React functional component
export default function Welcome() {
    const { auth, featuredVideo, categories } = usePage<PageProps>().props;

    return (
        <HomeDefaultLayout
            title="AstroWorks - Furniture & Interior Design"
            description="Solusi furniture dan interior design terpercaya untuk rumah dan kantor Anda. Kualitas terbaik dengan harga terjangkau."
            showFooter={false}
        >
            <div className="px-4 lg:px-6">
                <div className="h-46 w-full overflow-hidden rounded-3xl lg:h-[520px]">
                    <VideoEmbed
                        video={featuredVideo}
                        videoId={featuredVideo?.youtube_id || "dsTXcSeAZq8"}
                    />
                </div>
            </div>

            {/* Product Carousel with Lazy Loading */}
            <ProductCarouselLazy categoriesWithProducts={categories} />
        </HomeDefaultLayout>
    );
};
