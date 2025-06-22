import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

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
    videos: {
        data: Video[];
        links: any[];
        meta: any;
    };
}

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

export default function VideosIndex({ videos }: Props) {
    const handleDelete = (videoId: number) => {
        if (confirm('Are you sure you want to delete this video?')) {
            router.delete(`/dashboard/videos/${videoId}`);
        }
    };

    const toggleActive = (videoId: number) => {
        router.post(`/dashboard/videos/${videoId}/toggle-active`);
    };

    const getYouTubeThumbnail = (youtubeId: string) => {
        return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    };

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

                {videos.data.length === 0 ? (
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
                ) : (
                    <div className="grid gap-6">
                        {videos.data.map((video) => (
                            <Card key={video.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden">
                                                <img
                                                    src={getYouTubeThumbnail(video.youtube_id)}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{video.title}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {video.description ?
                                                        (video.description.length > 100 ?
                                                            video.description.substring(0, 100) + '...' :
                                                            video.description
                                                        ) :
                                                        'No description'
                                                    }
                                                </p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Badge variant={video.is_active ? "default" : "secondary"}>
                                                        {video.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        Order: {video.sort_order}
                                                    </span>
                                                    {video.autoplay && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Autoplay
                                                        </Badge>
                                                    )}
                                                    {video.loop && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Loop
                                                        </Badge>
                                                    )}
                                                    {video.muted && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Muted
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={video.is_active}
                                                    onCheckedChange={() => toggleActive(video.id)}
                                                />
                                                <span className="text-sm text-muted-foreground">Active</span>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/videos/${video.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/videos/${video.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(video.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
