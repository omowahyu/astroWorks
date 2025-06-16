import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Play, Pause } from 'lucide-react';

/**
 * Video interface for admin listing
 */
interface AdminVideo {
    id: number;
    title: string;
    description: string;
    youtube_url: string;
    youtube_id: string;
    thumbnail_url: string;
    is_active: boolean;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

/**
 * Pagination interface
 */
interface PaginationData {
    data: AdminVideo[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

/**
 * Page props interface
 */
interface PageProps {
    videos: PaginationData;
    [key: string]: any;
}

/**
 * Admin Videos Index Page
 * 
 * Displays a list of all videos with CRUD operations
 */
export default function AdminVideosIndex() {
    const { videos } = usePage<PageProps>().props;

    /**
     * Handle video deletion
     */
    const handleDelete = (videoId: number, videoTitle: string) => {
        if (confirm(`Are you sure you want to delete "${videoTitle}"? This action cannot be undone.`)) {
            // In a real app, you'd use Inertia.delete here
            console.log('Delete video:', videoId);
        }
    };

    /**
     * Handle toggle active status
     */
    const handleToggleActive = (videoId: number) => {
        // In a real app, you'd use Inertia.patch here
        console.log('Toggle active status for video:', videoId);
    };

    return (
        <>
            <Head title="Admin - Videos" />

            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Homepage Videos</h1>
                            <p className="text-gray-600 mt-2">Manage videos displayed on the homepage</p>
                        </div>
                        <Link href="/admin/videos/create">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Video
                            </Button>
                        </Link>
                    </div>

                    {/* Videos List */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Video
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Settings
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {videos.data.map((video) => (
                                        <tr key={video.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-16 w-24">
                                                        <img
                                                            className="h-16 w-24 object-cover rounded-md"
                                                            src={video.thumbnail_url}
                                                            alt={video.title}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                            {video.title}
                                                        </div>
                                                        {video.description && (
                                                            <div className="text-sm text-gray-500 line-clamp-1">
                                                                {video.description}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            ID: {video.youtube_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {video.autoplay && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Autoplay
                                                        </span>
                                                    )}
                                                    {video.loop && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Loop
                                                        </span>
                                                    )}
                                                    {video.muted && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            Muted
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(video.id)}
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                        video.is_active
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {video.is_active ? (
                                                        <>
                                                            <Play className="w-3 h-3 mr-1" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Pause className="w-3 h-3 mr-1" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {video.sort_order}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link href={`/admin/videos/${video.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/videos/${video.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(video.id, video.title)}
                                                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Empty State */}
                    {videos.data.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🎥</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
                            <p className="text-gray-600 mb-6">Get started by adding your first video.</p>
                            <Link href="/admin/videos/create">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Video
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {videos.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="flex space-x-2">
                                {videos.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
