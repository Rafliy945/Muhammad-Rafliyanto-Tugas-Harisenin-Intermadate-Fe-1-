// /src/components/MovieCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, Check, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import useStore from '../store';

// HoverModal Component with Video Autoplay + iframe error fallback
const HoverModal = ({ movie, position, onMouseEnter, onMouseLeave, onExpand }) => {
  // Zustand store
  const { toggleFavorite, isFavorite } = useStore();
  
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  
  if (!movie) return null;

  // Extract YouTube ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    try {
      const urlStr = url.toString();
      if (urlStr.includes("youtu.be/")) {
        return urlStr.split("youtu.be/")[1].split(/[?&]/)[0];
      }
      if (urlStr.includes("youtube.com")) {
        const parsed = new URL(urlStr);
        const videoId = parsed.searchParams.get("v");
        if (videoId) return videoId;
        // Handle /embed/ format
        const pathParts = parsed.pathname.split("/");
        if (pathParts.includes("embed")) {
          return pathParts[pathParts.indexOf("embed") + 1];
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const youtubeId = getYouTubeId(movie.trailer);

  // Auto show video after delay
  useEffect(() => {
    setIframeError(false);
    const timer = setTimeout(() => {
      setShowVideo(true);
      if (videoRef.current && !youtubeId) {
        videoRef.current.volume = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 800);
    
    return () => {
      clearTimeout(timer);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };
  }, [movie, youtubeId]);

  // Toggle mute for both YouTube and HTML5 video
  const handleToggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(prev => {
      const newMuted = !prev;
      
      if (videoRef.current) {
        try {
          videoRef.current.muted = newMuted;
          if (!newMuted) {
            videoRef.current.volume = 0.7;
            videoRef.current.play().catch(() => {});
          }
        } catch {}
      }
      
      if (iframeRef.current && youtubeId && iframeRef.current.contentWindow) {
        const iframe = iframeRef.current;
        if (newMuted) {
          iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
        } else {
          iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
          iframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[70]}', '*');
        }
      }
      
      return newMuted;
    });
  };

  return (
    <div
      className="fixed z-50 w-96 bg-[#181818] rounded-lg shadow-2xl overflow-hidden transform transition-all duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        animation: "hoverModalIn 0.25s ease-out",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative h-56 bg-black">
        {/* YouTube Video */}
        {showVideo && youtubeId && !iframeError ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${youtubeId}&enablejsapi=1`}
            className="w-full h-full object-cover"
            allow="autoplay; encrypted-media"
            frameBorder="0"
            title={movie.title}
            onError={() => setIframeError(true)}
          />
        ) : showVideo && movie.trailer && !youtubeId ? (
          <video
            ref={videoRef}
            src={movie.trailer}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
          />
        ) : (
          <img
            src={movie.image}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        )}

        {iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 z-30">
            <div className="text-center">
              <p className="text-white mb-3">Video tidak tersedia untuk di-embed.</p>
              {movie.trailer ? (
                <a
                  href={movie.trailer}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-red-600 px-4 py-2 rounded text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  Buka di YouTube
                </a>
              ) : (
                <span className="text-gray-300">Tidak ada tautan video.</span>
              )}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

        <button 
          onClick={handleToggleMute}
          className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 border border-white/50 text-white rounded-full p-2.5 transition-all shadow-lg hover:scale-110 active:scale-95"
          title={isMuted ? "Unmute (Nyalakan Suara)" : "Mute (Matikan Suara)"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <div className="absolute bottom-4 left-4 right-16">
          <h3 className="text-white font-bold text-lg drop-shadow-lg line-clamp-2">
            {movie.title}
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 bg-white hover:bg-white/90 text-black rounded-full p-2.5 transition-all shadow-lg"
            title="Putar"
          >
            <Play size={18} fill="currentColor" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(movie);
            }}
            className="flex-shrink-0 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-gray-600 text-white rounded-full p-2.5 transition-all"
            title="Tambah ke daftar"
          >
            {isFavorite(movie.id) ? <Check size={18} /> : <Plus size={18} />}
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onExpand(movie);
            }}
            className="flex-shrink-0 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-gray-600 text-white rounded-full p-2.5 transition-all ml-auto"
            title="Detail"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="border border-gray-500 px-1.5 py-0.5 text-xs text-gray-300">
            {movie.rating || '18+'}
          </span>
          <span className="text-gray-300">{movie.year || '2024'}</span>
          {movie.duration && <span className="text-gray-300">• {movie.duration}</span>}
        </div>

        <div className="flex flex-wrap gap-1.5 text-sm text-gray-300">
          {movie.genres?.map((genre, i) => (
            <React.Fragment key={i}>
              <span>{genre}</span>
              {i < movie.genres.length - 1 && <span className="text-gray-600">•</span>}
            </React.Fragment>
          ))}

          {movie.subgenres && (
            <div className="flex gap-1 flex-wrap mt-2">
              {movie.subgenres.map((sub, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 bg-gray-800 rounded-full text-xs"
                >
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes hoverModalIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// MovieCard Component
const MovieCard = ({ movie, onClick, onHoverStart, onHoverEnd, cardRef, onExpand, small = false }) => {
  // Zustand store
  const { toggleFavorite, isFavorite } = useStore();
  
  return (
    <div
      ref={cardRef}
      className={`relative flex-shrink-0 cursor-pointer group transition-transform duration-300 hover:scale-105 ${small ? '' : ''}`}
      onClick={() => onClick(movie)}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={{ width: '100%' }}
    >
      {small ? (
        <div className="w-[150px] h-[220px] rounded-lg overflow-hidden">
          <img
            src={movie.image}
            alt={movie.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: "center" }}
          />
        </div>
      ) : (
        <img
          src={movie.image}
          alt={movie.title}
          className="w-[220px] h-[330px] object-cover rounded-lg"
        />
      )}

      {movie.tag && <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">{movie.tag}</div>}
      {movie.top && <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">{movie.top}</div>}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-4">
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{movie.title}</h3>

        <div className="flex gap-2">
          <button className="bg-white text-black rounded-full p-2 hover:bg-gray-200">
            <Play size={16} fill="black" />
          </button>

          <button 
            className="bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(movie);
            }}
            title="Tambah ke daftar"
          >
            {isFavorite(movie.id) ? <Check size={16} /> : <Plus size={16} />}
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onExpand(movie);
            }}
            className="bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700 ml-auto"
            title="Detail"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export { MovieCard, HoverModal };
export default MovieCard;