import { Head, Link } from '@inertiajs/react';
import React, { type PropsWithChildren } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

interface ProductLayoutProps {
    title?: string;
    description?: string;
    productName?: string;
    productPrice?: string;
    productImage?: string;
    className?: string;
    showBreadcrumb?: boolean;
    breadcrumbItems?: Array<{ label: string; href?: string }>;
}

export default function ProductLayout({ 
    children, 
    title = "Product - AstroWorks", 
    description = "Quality furniture and interior design solutions",
    productName,
    productPrice,
    productImage,
    className = "",
    showBreadcrumb = true,
    breadcrumbItems = []
}: PropsWithChildren<ProductLayoutProps>) {
    
    // Generate structured data for SEO
    const structuredData = productName ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": productName,
        "description": description,
        "image": productImage,
        "brand": {
            "@type": "Brand",
            "name": "AstroWorks"
        },
        "offers": {
            "@type": "Offer",
            "price": productPrice,
            "priceCurrency": "IDR",
            "availability": "https://schema.org/InStock"
        }
    } : null;

    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                
                {/* Open Graph Meta Tags */}
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="product" />
                {productImage && <meta property="og:image" content={productImage} />}
                
                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                {productImage && <meta name="twitter:image" content={productImage} />}
                
                {/* Structured Data */}
                {structuredData && (
                    <script type="application/ld+json">
                        {JSON.stringify(structuredData)}
                    </script>
                )}
                
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className={`bg-[#5F44F0] md:bg-white ${className}`}>
                <Header />

                {/* Breadcrumb */}
                {showBreadcrumb && breadcrumbItems.length > 0 && (
                    <div className="bg-white">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <nav className="flex" aria-label="Breadcrumb">
                                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                    <li className="inline-flex items-center">
                                        <Link 
                                            href="/" 
                                            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                                        >
                                            <svg className="w-3 h-3 mr-2.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                                            </svg>
                                            Home
                                        </Link>
                                    </li>
                                    {breadcrumbItems.map((item, index) => (
                                        <li key={index}>
                                            <div className="flex items-center">
                                                <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                                </svg>
                                                {item.href ? (
                                                    <Link 
                                                        href={item.href} 
                                                        className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ) : (
                                                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                                                        {item.label}
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        </div>
                    </div>
                )}

                <main className="min-h-screen bg-gray-50 lg:px-8 py-0 lg:py-16 mx-auto lg:mt-8 flex flex-col overflow-hidden lg:overflow-x-visible">
                    {children}
                </main>

                <Footer />
            </div>
        </>
    );
}
