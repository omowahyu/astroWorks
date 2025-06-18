import React, { type PropsWithChildren } from 'react';
import HomeDefaultLayout from '@/layouts/home/home-default-layout';
import ProductLayout from '@/layouts/home/product-layout';

// Main layout wrapper that can be used for both homepage and product pages
interface HomeLayoutProps {
    variant?: 'default' | 'product';
    title?: string;
    description?: string;
    productName?: string;
    productPrice?: string;
    productImage?: string;
    className?: string;
    showFooter?: boolean;
    showBreadcrumb?: boolean;
    breadcrumbItems?: Array<{ label: string; href?: string }>;
    containerClass?: string;
    mainClass?: string;
}

export default function HomeLayout({
    variant = 'default',
    children,
    ...props
}: PropsWithChildren<HomeLayoutProps>) {

    if (variant === 'product') {
        return (
            <ProductLayout {...props}>
                {children}
            </ProductLayout>
        );
    }

    return (
        <HomeDefaultLayout {...props}>
            {children}
        </HomeDefaultLayout>
    );
}

// Export individual layouts for direct use
export { default as HomeDefaultLayout } from '@/layouts/home/home-default-layout';
export { default as ProductLayout } from '@/layouts/home/product-layout';
