import { Head } from '@inertiajs/react';
import React, { type PropsWithChildren } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

interface HomeLayoutProps {
    title?: string;
    description?: string;
    className?: string;
    showFooter?: boolean;
    containerClass?: string;
    mainClass?: string;
}

export default function HomeDefaultLayout({
    children,
    title = "AstroWorks",
    description = "Furniture & Interior Design Solutions",
    className = "",
    showFooter = true,
    containerClass = "",
    mainClass = ""
}: PropsWithChildren<HomeLayoutProps>) {
    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className={`bg-[#5F44F0] md:bg-white ${className}`}>
                <Header />

                <main className={`min-h-screen bg-white rounded-t-3xl lg:px-8 py-5 lg:py-16 mx-auto lg:mt-8 flex flex-col overflow-hidden lg:overflow-x-visible ${mainClass}`}>
                    <div className={`${containerClass}`}>
                        {children}
                    </div>
                </main>

                {showFooter && <Footer />}
            </div>
        </>
    );
}
