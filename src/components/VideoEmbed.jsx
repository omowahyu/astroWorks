const CleanVideoEmbed = ({ videoId, width = "100%", height = "315" }) => {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0&autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;
    
    return (
      <div className="relative overflow-hidden h-full" style={{ width, height }}>
        <iframe
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full scale-110 -translate-y-2"
          style={{
            pointerEvents: 'none', // Prevents any interaction
            border: 'none'
          }}
        />
        {/* Optional overlay to block any remaining UI */}
        <div className="absolute inset-0 pointer-events-none" />
      </div>
    );
};

export default CleanVideoEmbed;