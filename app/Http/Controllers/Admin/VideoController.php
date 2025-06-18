<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Admin Video Controller
 *
 * Handles CRUD operations for homepage videos
 */
class VideoController extends Controller
{
    /**
     * Display a listing of videos
     */
    public function index()
    {
        $videos = Video::ordered()->paginate(10);

        return Inertia::render('dashboard/videos/index', [
            'videos' => $videos
        ]);
    }

    /**
     * Show the form for creating a new video
     */
    public function create()
    {
        return Inertia::render('dashboard/videos/create');
    }

    /**
     * Store a newly created video
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'youtube_url' => 'required|url',
            'is_active' => 'boolean',
            'autoplay' => 'boolean',
            'loop' => 'boolean',
            'muted' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        // Extract YouTube ID
        $youtubeId = Video::extractYouTubeId($validated['youtube_url']);

        if (!$youtubeId) {
            return back()->withErrors(['youtube_url' => 'Invalid YouTube URL']);
        }

        $validated['youtube_id'] = $youtubeId;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['autoplay'] = $validated['autoplay'] ?? false;
        $validated['loop'] = $validated['loop'] ?? false;
        $validated['muted'] = $validated['muted'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        Video::create($validated);

        return redirect()->route('dashboard.videos.index')
            ->with('success', 'Video created successfully.');
    }

    /**
     * Display the specified video
     */
    public function show(Video $video)
    {
        return Inertia::render('dashboard/videos/show', [
            'video' => $video
        ]);
    }

    /**
     * Show the form for editing the specified video
     */
    public function edit(Video $video)
    {
        return Inertia::render('dashboard/videos/edit', [
            'video' => $video
        ]);
    }

    /**
     * Update the specified video
     */
    public function update(Request $request, Video $video)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'youtube_url' => 'required|url',
            'is_active' => 'boolean',
            'autoplay' => 'boolean',
            'loop' => 'boolean',
            'muted' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        // Extract YouTube ID if URL changed
        if ($validated['youtube_url'] !== $video->youtube_url) {
            $youtubeId = Video::extractYouTubeId($validated['youtube_url']);

            if (!$youtubeId) {
                return back()->withErrors(['youtube_url' => 'Invalid YouTube URL']);
            }

            $validated['youtube_id'] = $youtubeId;
        }

        $video->update($validated);

        return redirect()->route('dashboard.videos.index')
            ->with('success', 'Video updated successfully.');
    }

    /**
     * Remove the specified video
     */
    public function destroy(Video $video)
    {
        $video->delete();

        return redirect()->route('dashboard.videos.index')
            ->with('success', 'Video deleted successfully.');
    }

    /**
     * Toggle video active status
     */
    public function toggleActive(Video $video)
    {
        $video->update(['is_active' => !$video->is_active]);

        return back()->with('success', 'Video status updated successfully.');
    }

    /**
     * Update video sort order
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'videos' => 'required|array',
            'videos.*.id' => 'required|exists:videos,id',
            'videos.*.sort_order' => 'required|integer|min:0'
        ]);

        foreach ($validated['videos'] as $videoData) {
            Video::where('id', $videoData['id'])
                ->update(['sort_order' => $videoData['sort_order']]);
        }

        return back()->with('success', 'Video order updated successfully.');
    }
}
