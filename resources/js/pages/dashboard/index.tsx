import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ProductsOverview } from '@/components/dashboard/products-overview';
import { VideosOverview } from '@/components/dashboard/videos-overview';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardPageProps extends PageProps {
    productsOverview?: any;
    videosOverview?: any;
}

export default function Dashboard() {
    const { productsOverview, videosOverview } = usePage<DashboardPageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome to your dashboard. Here's an overview of your content.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {productsOverview && (
                        <ProductsOverview data={productsOverview} />
                    )}
                    
                    {videosOverview && (
                        <VideosOverview data={videosOverview} />
                    )}
                </div>

                {!productsOverview && !videosOverview && (
                    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <PlaceholderPattern />
                            <h3 className="mt-4 text-lg font-semibold">No data available</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                Dashboard data is being loaded. Please check back later.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
