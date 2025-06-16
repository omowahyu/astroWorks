import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

import Header from '@/components/Header';
import VideoEmbed from '@/components/video-embed';

import React from 'react';
import { Helmet } from 'react-helmet-async'; // A popular library for managing the document head

// Assuming these are converted React components
import ProductCarousel from '@/components/product/ProductCarousel';

// Define the type for the props, similar to the Svelte interface
interface Props {
    data: {
        categories?: any[];
        products?: any[];
        error?: string | null;
    };
}

// React functional component
export default function Welcome() {
    const { auth, featuredVideo, categoriesWithProducts } = usePage<PageProps>().props;

    return (
        <>
        <Head title="Welcome">
            <link rel="preconnect" href="https://fonts.bunny.net" />
            <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        </Head>

            <div className="bg-[#5F44F0] md:bg-white">
                <Header />

                <main className="min-h-screen bg-white rounded-t-3xl lg:px-8 py-5 lg:py-16 mx-auto lg:mt-8 flex flex-col overflow-hidden lg:overflow-x-visible">

                    <div className="px-4 lg:px-6">
                        <div className="h-46 w-full overflow-hidden rounded-3xl lg:h-[520px]">
                            <VideoEmbed
                                video={featuredVideo}
                                videoId={featuredVideo?.youtube_id || "dsTXcSeAZq8"}
                            />
                        </div>
                    </div>

                    {/* Product Carousel */}
                    <ProductCarousel categoriesWithProducts={categoriesWithProducts} />
                </main>
            </div>
        </>
    );
};
