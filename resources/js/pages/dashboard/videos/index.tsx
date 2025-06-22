import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Play, Pause, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SortableVideoCardProps {
    video: Video;
    onDelete: (videoId: number) => void;
    onToggleActive: (videoId: number) => void;
    getYouTubeThumbnail: (youtubeId: string) => string;
}

function SortableVideoCard({ video, onDelete, onToggleActive, getYouTubeThumbnail }: SortableVideoCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: video.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`${isDragging ? 'opacity-50 shadow-lg' : ''} transition-all duration-200`}
        >
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        {/* Drag Handle */}
                        <div
                            {...attributes}
                            {...listeners}
                            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-2 transition-colors duration-200"
                            title="Drag to reorder"
                        >
                            <GripVertical className="h-5 w-5" />
                        </div>

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
                                onCheckedChange={() => onToggleActive(video.id)}
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
                            onClick={() => onDelete(video.id)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
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
    const [videoList, setVideoList] = useState<Video[]>(videos.data);
    const [isUpdating, setIsUpdating] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDelete = (videoId: number) => {
        const video = videoList.find(v => v.id === videoId);

        if (confirm(`Are you sure you want to delete "${video?.title}"? This action cannot be undone.`)) {
            // Optimistically remove from UI
            setVideoList(prevVideos => prevVideos.filter(v => v.id !== videoId));

            router.delete(`/dashboard/videos/${videoId}`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Video deleted successfully', {
                        description: `"${video?.title}" has been removed from your videos`
                    });
                },
                onError: (errors) => {
                    // Revert the optimistic update on error
                    setVideoList(videos.data);
                    toast.error('Failed to delete video', {
                        description: 'Please try again or refresh the page'
                    });
                    console.error('Failed to delete video:', errors);
                }
            });
        }
    };

    const toggleActive = (videoId: number) => {
        // Optimistically update the UI
        setVideoList(prevVideos =>
            prevVideos.map(video =>
                video.id === videoId
                    ? { ...video, is_active: !video.is_active }
                    : video
            )
        );

        // Get the video to show appropriate message
        const video = videoList.find(v => v.id === videoId);
        const newStatus = !video?.is_active;

        router.patch(`/dashboard/videos/${videoId}/toggle-active`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Show success toast
                toast.success(
                    `Video "${video?.title}" has been ${newStatus ? 'activated' : 'deactivated'}`,
                    {
                        description: newStatus
                            ? 'This video will now be displayed on the homepage'
                            : 'This video will no longer be displayed on the homepage'
                    }
                );
            },
            onError: (errors) => {
                // Revert the optimistic update on error
                setVideoList(prevVideos =>
                    prevVideos.map(v =>
                        v.id === videoId
                            ? { ...v, is_active: !newStatus }
                            : v
                    )
                );

                toast.error('Failed to update video status', {
                    description: 'Please try again or refresh the page'
                });
                console.error('Failed to toggle video active status:', errors);
            }
        });
    };

    const getYouTubeThumbnail = (youtubeId: string) => {
        return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setVideoList((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update sort_order for all items
                const updatedItems = newItems.map((item, index) => ({
                    ...item,
                    sort_order: index
                }));

                // Send update to server
                updateVideoOrder(updatedItems);

                return updatedItems;
            });
        }
    };

    const updateVideoOrder = async (updatedVideos: Video[]) => {
        setIsUpdating(true);
        try {
            const videoData = updatedVideos.map((video, index) => ({
                id: video.id,
                sort_order: index
            }));

            router.post('/dashboard/videos/update-order', {
                videos: videoData
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Update successful - videoList is already updated
                    toast.success('Video order updated successfully', {
                        description: 'The new video order has been saved'
                    });
                },
                onError: (errors) => {
                    console.error('Failed to update video order:', errors);
                    // Revert to original order on error
                    setVideoList(videos.data);
                    toast.error('Failed to update video order', {
                        description: 'Please try again or refresh the page'
                    });
                },
                onFinish: () => {
                    setIsUpdating(false);
                }
            });
        } catch (error) {
            console.error('Error updating video order:', error);
            // Revert to original order on error
            setVideoList(videos.data);
            toast.error('An error occurred while updating video order', {
                description: 'Please check your connection and try again'
            });
            setIsUpdating(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Videos" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Videos</h1>
                        <p className="text-muted-foreground">
                            Manage your homepage videos. Drag and drop to reorder.
                        </p>
                        {isUpdating && (
                            <p className="text-sm text-blue-600 mt-1">
                                Updating video order...
                            </p>
                        )}
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/videos/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Video
                        </Link>
                    </Button>
                </div>

                {videoList.length === 0 ? (
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
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={videoList.map(video => video.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="grid gap-6">
                                {videoList.map((video) => (
                                    <SortableVideoCard
                                        key={video.id}
                                        video={video}
                                        onDelete={handleDelete}
                                        onToggleActive={toggleActive}
                                        getYouTubeThumbnail={getYouTubeThumbnail}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </AppLayout>
    );
}
