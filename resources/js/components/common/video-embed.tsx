interface Video {
    id: number;
    title: string;
    description?: string;
    youtube_id: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    embed_url: string;
}

interface VideoEmbedProps {
    video?: Video;
    videoId?: string;
    width?: string;
    height?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    allowInteraction?: boolean;
}

const VideoEmbed = ({
    video,
    videoId,
    width = '100%',
    height = '360',
    autoplay = true,
    loop = true,
    muted = true,
    controls = false,
    allowInteraction = false
}: VideoEmbedProps) => {
    // Use video data if provided, otherwise fall back to props
    const finalVideoId = video?.youtube_id || videoId;
    const finalAutoplay = video?.autoplay ?? autoplay;
    const finalLoop = video?.loop ?? loop;
    const finalMuted = video?.muted ?? muted;

    if (!finalVideoId) {
        return (
            <div className="relative h-full overflow-hidden bg-gray-200 flex items-center justify-center" style={{ width, height }}>
                <p className="text-gray-500">No video available</p>
            </div>
        );
    }

    // Build embed URL with parameters
    const params = new URLSearchParams();

    if (finalAutoplay) params.append('autoplay', '1');
    if (finalLoop) {
        params.append('loop', '1');
        params.append('playlist', finalVideoId);
    }
    if (finalMuted) params.append('mute', '1');
    if (!controls) {
        params.append('controls', '0');
        params.append('showinfo', '0');
        params.append('modestbranding', '1');
        params.append('iv_load_policy', '3');
        params.append('disablekb', '1');
        params.append('fs', '0');
        params.append('cc_load_policy', '0');
    }

    params.append('rel', '0');
    params.append('playsinline', '1');
    params.append('enablejsapi', '1');
    params.append('origin', window.location.origin);

    const embedUrl = `https://www.youtube.com/embed/${finalVideoId}?${params.toString()}`;

    return (
        <div className="relative h-full overflow-hidden" style={{ width, height }}>
            <iframe
                src={embedUrl}
                title={video?.title || "YouTube video player"}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full -translate-y-2 scale-110"
                style={{
                    pointerEvents: allowInteraction ? 'auto' : 'none',
                    border: 'none',
                }}
            />
            {/* Optional overlay to block interaction */}
            {!allowInteraction && (
                <div className="pointer-events-none absolute inset-0" />
            )}
        </div>
    );
};

export default VideoEmbed;
