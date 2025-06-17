import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Videos',
        href: '/dashboard/videos',
    },
];

export default function VideosIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Videos" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Videos</h1>
                        <p className="text-muted-foreground">
                            Manage your homepage videos.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/videos/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Video
                        </Link>
                    </Button>
                </div>

                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <PlaceholderPattern />
                        <h3 className="mt-4 text-lg font-semibold">No videos yet</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                            You haven't created any videos yet. Start by creating your first video.
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/videos/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Video
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
