import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Video {
    id: number;
    title: string;
    description: string | null;
    youtube_url: string;
    youtube_id: string;
    is_active: boolean;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    video: Video;
}

const breadcrumbs = (videoId: number): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Videos',
        href: '/dashboard/videos',
    },
    {
        title: 'Edit',
        href: `/dashboard/videos/${videoId}/edit`,
    },
];

export default function VideoEdit({ video }: Props) {
    // Removed unused form variables - form is not implemented yet
    // const { data, setData, put, processing, errors } = useForm({
    //     title: video.title || '',
    //     description: video.description || '',
    //     youtube_url: video.youtube_url || '',
    //     is_active: video.is_active || false,
    //     autoplay: video.autoplay || false,
    //     loop: video.loop || false,
    //     muted: video.muted || true,
    //     sort_order: video.sort_order || 0
    // });

    // Removed unused functions - form is not implemented yet
    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     put(`/dashboard/videos/${video.id}`);
    // };

    // const getYouTubeThumbnail = (youtubeId: string) => {
    //     return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    // };

    // const getYouTubeEmbedUrl = (youtubeId: string) => {
    //     return `https://www.youtube.com/embed/${youtubeId}`;
    // };

    return (
        <AppLayout breadcrumbs={breadcrumbs(video.id)}>
            <Head title={`Edit Video - ${video.title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Edit Video</h1>
                        <p className="text-muted-foreground">
                            Update video information and settings.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/videos">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Videos
                        </Link>
                    </Button>
                </div>

                {/* TODO: Add video edit form here */}
                <div className="bg-white p-6 rounded-lg border">
                    <p className="text-gray-500">Video edit form will be implemented here.</p>
                </div>
            </div>
        </AppLayout>
    );
}