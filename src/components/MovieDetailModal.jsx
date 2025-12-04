// /src/components/MovieDetailModal.jsx
import React, { useState, useMemo, useRef } from "react";
import YouTube from "react-youtube";
import { X, Play, Plus, Check, ThumbsUp, Share2, Volume2, VolumeX } from "lucide-react";

/**
 * MovieDetailModal with react-youtube support + html5 video fallback and youtube embed error handling
 *
 * Props:
 * - selectedMovie
 * - closeModal
 * - toggleMyList
 * - isInMyList
 * - movies (array)
 * - openMovie (function)
 */
const MovieDetailModal = ({ selectedMovie, closeModal, toggleMyList, isInMyList, movies = [], openMovie }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [ytPlayer, setYtPlayer] = useState(null);
  const [youtubeError, setYoutubeError] = useState(false);
  const videoRef = useRef(null);

  if (!selectedMovie) return null;

  // Backdrop click closes modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  // Compute similar movies by genre (max 6)
  const similarMovies = useMemo(() => {
    try {
      const baseGenres = Array.isArray(selectedMovie.genres)
        ? selectedMovie.genres.map(g => g.toString().toLowerCase())
        : (selectedMovie.genres ? [selectedMovie.genres.toString().toLowerCase()] : []);

      if (!baseGenres.length) return movies.filter(m => m.id !== selectedMovie.id).slice(0, 6);

      const matches = movies
        .filter(m => m.id !== selectedMovie.id)
        .map(m => {
          const g = Array.isArray(m.genres) ? m.genres.map(x => x.toString().toLowerCase()) : (m.genres ? [m.genres.toString().toLowerCase()] : []);
          const common = g.filter(x => baseGenres.includes(x));
          return { movie: m, commonCount: common.length };
        })
        .filter(x => x.commonCount > 0)
        .sort((a, b) => b.commonCount - a.commonCount)
        .map(x => x.movie);

      if (matches.length < 6) {
        const extras = movies.filter(m => m.id !== selectedMovie.id && !matches.some(mm => mm.id === m.id));
        return [...matches, ...extras].slice(0, 6);
      }

      return matches.slice(0, 6);
    } catch {
      return movies.filter(m => m.id !== selectedMovie.id).slice(0, 6);
    }
  }, [selectedMovie, movies]);

  // Helper: detect youtube url and extract id
  const getYouTubeId = (url) => {
    if (!url) return null;
    try {
      const t = url.toString();
      if (t.includes("youtu.be/")) {
        return t.split("youtu.be/")[1].split(/[?&]/)[0];
      }
      if (t.includes("youtube.com")) {
        const parsed = new URL(t);
        const v = parsed.searchParams.get("v");
        if (v) return v;
        // possible /embed/VIDEOID
        const parts = parsed.pathname.split("/");
        return parts[parts.length - 1] || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const ytId = getYouTubeId(selectedMovie.trailer);

  // YouTube options
  const ytOpts = {
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      controls: 1,
      iv_load_policy: 3
    }
  };

  // When YouTube player ready: mute if requested and try autoplay
  const onYtReady = (event) => {
    const player = event.target;
    setYtPlayer(player);
    try {
      if (isMuted) {
        player.mute();
      } else {
        player.unMute();
      }
      player.playVideo?.();
    } catch (e) {
      // ignore
    }
  };

  // Handle youtube embed error
  const onYtError = () => {
    // set flag so we show fallback UI
    setYoutubeError(true);
  };

  // Toggle mute for both youtube and html5 video
  const toggleMute = () => {
    setIsMuted(prev => {
      const now = !prev;
      // handle youtube
      if (ytPlayer && typeof ytPlayer[ now ? "mute" : "unMute" ] === "function") {
        try {
          now ? ytPlayer.mute() : ytPlayer.unMute();
        } catch {}
      }
      // handle html5 video
      if (videoRef.current) {
        try {
          videoRef.current.muted = now;
          if (!now) {
            // try to play when unmuted
            videoRef.current.play().catch(()=>{});
          }
        } catch {}
      }
      return now;
    });
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute left-0 right-0 bottom-0 top-0 flex items-end sm:items-center justify-center p-0 sm:p-6">
        <div
          className="bg-[#060606] text-white w-full sm:max-w-5xl sm:rounded-xl sm:shadow-xl transform transition-transform duration-200 max-h-full overflow-y-auto flex flex-col"
          style={{ maxHeight: "96vh" }}
        >
          {/* HEADER */}
          <div className="sticky top-0 z-40 bg-gradient-to-b from-[#060606]/95 to-transparent px-4 sm:px-6 py-3 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-3">
              <button
                onClick={closeModal}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60"
                aria-label="Tutup"
                title="Tutup"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col">
                <h3 className="text-base sm:text-xl font-semibold">{selectedMovie.title}</h3>
                <div className="text-xs text-gray-400">
                  {selectedMovie.year} {selectedMovie.duration ? `• ${selectedMovie.duration}` : ""}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="bg-red-600 px-3 py-2 rounded-md text-sm font-medium hidden sm:inline-flex items-center gap-2" aria-label="Putar">
                <Play size={16} />
                Putar
              </button>
              <button onClick={() => toggleMyList(selectedMovie)} className="p-2 rounded-md bg-black/40 hover:bg-black/60" aria-pressed={isInMyList(selectedMovie.id)} title="Tambah ke daftar">
                {isInMyList(selectedMovie.id) ? <Check size={16} /> : <Plus size={16} />}
              </button>
            </div>
          </div>

          {/* MAIN */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
            {/* HERO: if youtube -> react-youtube iframe (with error handling), else if trailer -> html5 video, else fallback image */}
            <div className="w-full rounded overflow-hidden shadow-lg relative">
              <div className="w-full bg-black" style={{ aspectRatio: "16/9", maxHeight: "60vh" }}>
                {ytId && !youtubeError ? (
                  <YouTube
                    videoId={ytId}
                    opts={ytOpts}
                    onReady={onYtReady}
                    onError={onYtError}
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                  />
                ) : youtubeError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-center p-6">
                    <p className="text-gray-300 mb-3">Video tidak tersedia untuk diputar di sini (embed diblokir atau tidak diizinkan).</p>
                    {selectedMovie.trailer ? (
                      <a
                        href={selectedMovie.trailer}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-red-600 px-4 py-2 rounded text-white"
                      >
                        Buka di YouTube
                      </a>
                    ) : (
                      <p className="text-gray-400">Tidak ada tautan video.</p>
                    )}
                  </div>
                ) : selectedMovie.trailer ? (
                  // HTML5 video file
                  <video
                    id={`movie-trailer-video-${selectedMovie.id}`}
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    src={selectedMovie.trailer}
                    poster={selectedMovie.image || ""}
                    controls
                    playsInline
                    muted={isMuted}
                    autoPlay
                  />
                ) : (
                  // poster fallback
                  <img src={selectedMovie.image} alt={selectedMovie.title} className="w-full h-full object-cover" />
                )}
              </div>

              {/* gradient overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#060606] via-transparent to-transparent" />

              {/* mute toggle (works for both) */}
              <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 m-4 bg-black/60 border border-white/20 p-2 rounded-full"
                aria-label={isMuted ? "Unmute" : "Mute"}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

            {/* INFO */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 px-2 py-1 rounded text-xs"> {selectedMovie.rating || "—"} </div>
                <div className="text-xs text-gray-300">{Array.isArray(selectedMovie.genres) ? selectedMovie.genres.join(" • ") : selectedMovie.genres}</div>
              </div>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                {selectedMovie.description}
              </p>

              <div className="text-sm text-gray-400">
                <div><span className="text-gray-500">Sutradara:</span> {selectedMovie.director || "-"}</div>
                <div><span className="text-gray-500">Pemain:</span> {Array.isArray(selectedMovie.cast) ? selectedMovie.cast.join(", ") : selectedMovie.cast || "-"}</div>
              </div>

              <div className="flex gap-3 flex-wrap mt-1">
                <button className="flex-1 bg-red-600 text-white py-3 rounded-md flex items-center justify-center gap-2">
                  <Play size={18} />
                  Putar
                </button>

                <button onClick={() => toggleMyList(selectedMovie)} className="px-4 py-3 rounded-md border border-gray-700 bg-black/40 flex items-center gap-2">
                  {isInMyList(selectedMovie.id) ? <Check size={16} /> : <Plus size={16} />}
                  <span className="text-sm">Daftar</span>
                </button>

                <button className="px-3 py-3 rounded-md border border-gray-700 bg-black/40 flex items-center gap-2">
                  <ThumbsUp size={16} />
                </button>

                <button className="px-3 py-3 rounded-md border border-gray-700 bg-black/40 flex items-center gap-2">
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* SIMILAR */}
            <div className="mt-2">
              <h4 className="text-sm sm:text-lg font-semibold mb-3">Similar</h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {similarMovies.length > 0 ? similarMovies.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (typeof openMovie === "function") {
                        openMovie(m);
                      } else {
                        closeModal();
                        setTimeout(() => openMovie && openMovie(m), 120);
                      }
                    }}
                    className="group flex flex-col items-start gap-2 bg-[#0f0f0f] rounded overflow-hidden focus:outline-none"
                  >
                    <div className="w-full h-28 sm:h-32 md:h-36 overflow-hidden">
                      <img src={m.image} alt={m.title} className="w-full h-full object-cover group-hover:brightness-90" />
                    </div>

                    <div className="px-2 pb-3">
                      <div className="text-sm font-medium truncate w-36 sm:w-40 md:w-44">{m.title}</div>
                      <div className="text-xs text-gray-400 mt-1">{Array.isArray(m.genres) ? m.genres.slice(0,2).join(", ") : m.genres}</div>
                    </div>
                  </button>
                )) : (
                  <div className="text-gray-400">Tidak ada film serupa.</div>
                )}
              </div>
            </div>

            <div className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailModal;
