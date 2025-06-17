import React from 'react';
import { Link } from '@inertiajs/react';
import { Video, Plus, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Video overview interface
 */
interface VideoOverview {
    total_videos: number;
    active_videos: number;
    featured_video?: {
        id: number;
        title: string;
        youtube_id: string;
        thumbnail_url: string;
        is_active: boolean;
    };
    recent_videos: Array<{
        id: number;
        title: string;
        youtube_id: string;
        thumbnail_url: string;
        is_active: boolean;
        created_at: string;
    }>;
}

/**
 * Props interface
 */
interface VideosOverviewProps {
    data: VideoOverview;
    className?: string;
}

/**
 * VideosOverview Component
 * 
 * Dashboard widget showing video statistics and recent videos
 */
export const VideosOverview: React.FC<VideosOverviewProps> = ({ 
    data, 
    className = '' 
}) => {
    return (
        <div className={`bg-white rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <Video className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Videos
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage homepage videos
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/videos/create">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Video
                    </Button>
                </Link>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {data.total_videos}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Videos
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {data.active_videos}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Active
                    </div>
                </div>
            </div>

            {/* Featured Video */}
            {data.featured_video && (
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Featured Video
                    </h4>
                    <div className="relative">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={data.featured_video.thumbnail_url}
                                alt={data.featured_video.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <div className="p-3 bg-white bg-opacity-90 rounded-full">
                                    <Play className="w-6 h-6 text-gray-900" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {data.featured_video.title}
                            </p>
                            <div className="flex items-center mt-1">
                                {data.featured_video.is_active ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Play className="w-3 h-3 mr-1" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        <Pause className="w-3 h-3 mr-1" />
                                        Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Videos */}
            <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Recent Videos
                </h4>
                <div className="space-y-3">
                    {data.recent_videos.slice(0, 3).map((video) => (
                        <div key={video.id} className="flex items-center space-x-3">
                            <div className="w-12 h-8 bg-gray-100 rounded overflow-hidden">
                                <img
                                    src={video.thumbnail_url}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {video.title}
                                </p>
                                <div className="flex items-center space-x-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(video.created_at).toLocaleDateString()}
                                    </p>
                                    {video.is_active ? (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* View All Link */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                    href="/dashboard/videos"
                    className="flex items-center justify-center text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    <Video className="w-4 h-4 mr-2" />
                    Manage All Videos
                </Link>
            </div>
        </div>
    );
};

export default VideosOverview;
