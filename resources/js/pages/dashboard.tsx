import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import ProductsOverview from '@/components/dashboard/ProductsOverview';
import VideosOverview from '@/components/dashboard/VideosOverview';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardPageProps {
    productsOverview: any;
    videosOverview: any;
}

export default function Dashboard() {
    const { productsOverview, videosOverview } = usePage<DashboardPageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Products Overview */}
                    <ProductsOverview data={productsOverview} />

                    {/* Videos Overview */}
                    <VideosOverview data={videosOverview} />

                    {/* Quick Stats */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border bg-white p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <PlaceholderPattern className="w-5 h-5 stroke-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Quick Stats
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    System overview
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Products</span>
                                <span className="text-sm font-medium">{productsOverview.total_products}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Active Videos</span>
                                <span className="text-sm font-medium">{videosOverview.active_videos}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Categories</span>
                                <span className="text-sm font-medium">{productsOverview.categories_count}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min bg-white p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {productsOverview.recent_products.slice(0, 5).map((product: any, index: number) => (
                            <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                                    {product.primary_image_url ? (
                                        <img
                                            src={product.primary_image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <PlaceholderPattern className="w-4 h-4 stroke-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        New product: {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(product.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
