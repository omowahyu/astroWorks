import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

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
    const { data, setData, put, processing, errors } = useForm({
        title: video.title || '',
        description: video.description || '',
        youtube_url: video.youtube_url || '',
        is_active: video.is_active || false,
        autoplay: video.autoplay || false,
        loop: video.loop || false,
        muted: video.muted || true,
        sort_order: video.sort_order || 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/videos/${video.id}`, {
            onSuccess: () => {
                toast.success('Video updated successfully', {
                    description: `"${data.title}" has been updated`
                });
            },
            onError: (errors) => {
                toast.error('Failed to update video', {
                    description: 'Please check the form and try again'
                });
                console.error('Video update errors:', errors);
            }
        });
    };

    const getYouTubeThumbnail = (youtubeId: string) => {
        return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    };

    // Extract YouTube ID from various URL formats
    const extractYouTubeId = (url: string): string | null => {
        if (!url) return null;

        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/embed\/([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
            /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    };

    // Get current YouTube ID from form data or existing video
    const getCurrentYouTubeId = (): string | null => {
        // First try to extract from current form data
        const formYouTubeId = extractYouTubeId(data.youtube_url);
        if (formYouTubeId) return formYouTubeId;

        // Fallback to existing video ID
        return video.youtube_id || null;
    };

    const currentYouTubeId = getCurrentYouTubeId();

    const getYouTubeEmbedUrl = (youtubeId: string) => {
        return `https://www.youtube.com/embed/${youtubeId}`;
    };

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

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Video Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Video Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter video title"
                                />
                                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter video description"
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                            </div>

                            <div>
                                <Label htmlFor="youtube_url">YouTube URL</Label>
                                <Input
                                    id="youtube_url"
                                    value={data.youtube_url}
                                    onChange={(e) => setData('youtube_url', e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
                                />
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        Supported formats:
                                    </p>
                                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                                        <li>• Regular video: https://www.youtube.com/watch?v=VIDEO_ID</li>
                                        <li>• Embed URL: https://www.youtube.com/embed/VIDEO_ID</li>
                                        <li>• Playlist: https://www.youtube.com/playlist?list=PLAYLIST_ID</li>
                                        <li>• Embed playlist: https://www.youtube.com/embed/videoseries?list=PLAYLIST_ID</li>
                                    </ul>
                                    <p className="text-xs text-blue-600 mt-2">
                                        💡 Tip: Embed URLs are recommended for ads as they provide better control and fewer distractions.
                                    </p>
                                </div>
                                {errors.youtube_url && <p className="text-sm text-red-600 mt-1">{errors.youtube_url}</p>}
                            </div>

                            <div>
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Lower numbers appear first. Use 0 for default order.
                                </p>
                                {errors.sort_order && <p className="text-sm text-red-600 mt-1">{errors.sort_order}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Video Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Video Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active">Active (show on homepage)</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="autoplay"
                                    checked={data.autoplay}
                                    onCheckedChange={(checked) => setData('autoplay', checked as boolean)}
                                />
                                <Label htmlFor="autoplay">Autoplay</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="loop"
                                    checked={data.loop}
                                    onCheckedChange={(checked) => setData('loop', checked as boolean)}
                                />
                                <Label htmlFor="loop">Loop</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="muted"
                                    checked={data.muted}
                                    onCheckedChange={(checked) => setData('muted', checked as boolean)}
                                />
                                <Label htmlFor="muted">Muted (recommended for autoplay)</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Video Preview */}
                    {currentYouTubeId && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {data.youtube_url !== video.youtube_url ? 'New Video Preview' : 'Current Video Preview'}
                                </CardTitle>
                                {data.youtube_url !== video.youtube_url && (
                                    <p className="text-sm text-muted-foreground">
                                        Preview will update when you save the changes
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Thumbnail */}
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Thumbnail</h4>
                                        <div className="relative">
                                            <img
                                                src={getYouTubeThumbnail(currentYouTubeId)}
                                                alt={data.title || video.title}
                                                className="w-full h-32 object-cover rounded-lg border"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/placeholder-video.jpg'; // Fallback image
                                                }}
                                            />
                                            {data.youtube_url !== video.youtube_url && (
                                                <div className="absolute top-2 right-2">
                                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                        New
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Video Info */}
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Video Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="font-medium">YouTube ID:</span>
                                                <span className={data.youtube_url !== video.youtube_url ? 'text-blue-600 font-medium' : ''}>
                                                    {currentYouTubeId}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    {data.youtube_url !== video.youtube_url ? 'New URL:' : 'Current URL:'}
                                                </span>
                                                <a
                                                    href={data.youtube_url || video.youtube_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center"
                                                >
                                                    View on YouTube
                                                    <ExternalLink className="ml-1 h-3 w-3" />
                                                </a>
                                            </div>
                                            {data.youtube_url !== video.youtube_url && (
                                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                                    <span className="font-medium text-blue-800">Note:</span>
                                                    <span className="text-blue-700"> URL has been changed. Save to apply changes.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* No Preview Message */}
                    {!currentYouTubeId && data.youtube_url && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Video Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <div className="text-muted-foreground">
                                        <p className="text-sm">Unable to extract YouTube ID from the provided URL.</p>
                                        <p className="text-xs mt-1">Please check the URL format and try again.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/videos">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Video'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}