// src/components/MovieDetailModal.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import { X, Play, Plus, Check, Volume2, VolumeX, ChevronLeft, ChevronRight, List, Home, User, Search } from "lucide-react";

const MovieDetailModal = ({ selectedMovie, closeModal, toggleMyList, isInMyList, movies = [], openMovie }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [ytPlayer, setYtPlayer] = useState(null);
  const [youtubeError, setYoutubeError] = useState(false);
  const [showMyListSection, setShowMyListSection] = useState(false);
  const [userMyList, setUserMyList] = useState([]);
  const videoRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => {
    // Load user's myList from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.myList) {
      setUserMyList(currentUser.myList);
    }
  }, []);

  if (!selectedMovie) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    try {
      const t = url.toString();
      if (t.includes("youtu.be/")) return t.split("youtu.be/")[1].split(/[?&]/)[0];
      if (t.includes("youtube.com")) {
        const parsed = new URL(t);
        const v = parsed.searchParams.get("v");
        if (v) return v;
        const parts = parsed.pathname.split("/");
        return parts[parts.length - 1] || null;
      }
      return null;
    } catch { return null; }
  };

  const ytId = getYouTubeId(selectedMovie.trailer);

  const similarMovies = useMemo(() => {
    try {
      const base = Array.isArray(selectedMovie.genres) ? selectedMovie.genres.map(g => g.toLowerCase()) : [];
      const cand = movies.filter(m => m.id !== selectedMovie.id);
      const matched = cand.filter(m => {
        const g = Array.isArray(m.genres) ? m.genres.map(x => x.toLowerCase()) : [];
        return g.some(x => base.includes(x));
      });
      return (matched.length ? matched : cand).slice(0, 8);
    } catch { return movies.filter(m => m.id !== selectedMovie.id).slice(0,8); }
  }, [selectedMovie, movies]);

  const myListMovies = useMemo(() => {
    return userMyList.slice(0, 6);
  }, [userMyList]);

  const ytOpts = { playerVars: { autoplay: 1, modestbranding: 1, playsinline: 1, rel: 0, controls: 1 } };

  const onYtReady = (e) => {
    setYtPlayer(e.target);
    try { if (isMuted) e.target.mute(); else e.target.unMute(); e.target.playVideo?.(); } catch {}
  };
  const onYtError = () => setYoutubeError(true);

  const toggleMute = () => {
    setIsMuted(prev => {
      const nxt = !prev;
      if (ytPlayer) try { nxt ? ytPlayer.mute() : ytPlayer.unMute(); } catch {}
      if (videoRef.current) try { videoRef.current.muted = nxt; if (!nxt) videoRef.current.play().catch(()=>{}); } catch {}
      return nxt;
    });
  };

  const scrollRecommendations = (dir) => {
    const el = recRef.current;
    if (!el) return;
    const card = el.querySelector('[data-rec-card]');
    const amount = card ? card.getBoundingClientRect().width + 16 : 180;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const rootStyle = { fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm" onClick={handleBackdropClick} style={rootStyle}>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full sm:w-[950px] bg-[#0b0b0b] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh]">
          {/* Mobile Navigation Bar - Only shown on mobile */}
          <div className="sm:hidden flex items-center justify-between px-4 py-3 bg-[#111111] border-b border-gray-800">
            <button onClick={closeModal} className="text-white">
              <X size={20} />
            </button>
            <h3 className="text-sm font-medium text-white truncate">{selectedMovie.title}</h3>
            <button 
              onClick={() => setShowMyListSection(!showMyListSection)}
              className={`p-1 rounded ${showMyListSection ? 'bg-blue-600' : 'bg-gray-800'}`}
            >
              <List size={18} className="text-white" />
            </button>
          </div>

          {/* close */}
          <div className="relative hidden sm:block">
            <button onClick={closeModal} className="absolute right-4 top-4 z-50 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-black shadow">
              <X size={18} />
            </button>
          </div>

          {/* hero */}
          <div className="relative w-full" style={{ aspectRatio: "16/9", maxHeight: "50vh" }}>
            <img src={selectedMovie.image} alt={selectedMovie.title} className="w-full h-full object-cover brightness-75" />
            <div className="absolute left-6 bottom-6 z-40 text-white">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold leading-tight">{selectedMovie.title}</h2>
              <div className="text-[10px] sm:text-xs text-gray-200 mt-1">{selectedMovie.year} • {selectedMovie.duration || ""}</div>

              {/* compact play button */}
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                <button
                  className="flex items-center gap-1.5 sm:gap-2 bg-[#2f5cff] hover:bg-[#244de6] text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Play size={12} className="sm:hidden" />
                    <Play size={14} className="hidden sm:block" />
                  </div>
                  <span className="text-xs sm:text-sm">Putar</span>
                </button>

                <button onClick={() => toggleMyList(selectedMovie)} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-white/20 bg-black/50 flex items-center justify-center">
                  {isInMyList(selectedMovie.id) ? (
                    <>
                      <Check size={12} className="sm:hidden" />
                      <Check size={14} className="hidden sm:block" />
                    </>
                  ) : (
                    <>
                      <Plus size={12} className="sm:hidden" />
                      <Plus size={14} className="hidden sm:block" />
                    </>
                  )}
                </button>

                <button onClick={toggleMute} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/50 flex items-center justify-center border border-white/10" title={isMuted ? "Unmute" : "Mute"}>
                  {isMuted ? (
                    <>
                      <VolumeX size={12} className="sm:hidden"/>
                      <VolumeX size={14} className="hidden sm:block"/>
                    </>
                  ) : (
                    <>
                      <Volume2 size={12} className="sm:hidden"/>
                      <Volume2 size={14} className="hidden sm:block"/>
                    </>
                  )}
                </button>
              </div>
            </div>

            {ytId && !youtubeError && (
              <div className="absolute inset-0 z-30">
                <YouTube videoId={ytId} opts={{ width: "100%", height: "100%", playerVars: { autoplay: 1, rel: 0 } }} onReady={onYtReady} onError={onYtError} className="w-full h-full" iframeClassName="w-full h-full" />
              </div>
            )}
          </div>

          {/* My List Section - Mobile Only */}
          {showMyListSection && (
            <div className="sm:hidden px-4 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold mb-3 text-white">Daftar Saya</h3>
              {myListMovies.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm">Belum ada film di daftar Anda.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {myListMovies.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => {
                        closeModal();
                        openMovie(movie);
                      }}
                      className="relative overflow-hidden rounded-lg"
                      style={{ aspectRatio: '9/14' }}
                    >
                      <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-xs text-white truncate">{movie.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* body */}
          <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "40vh", msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {/* metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-xs bg-white/10 px-2 py-1 rounded">{selectedMovie.rating || "–"}</div>
                  <div className="text-xs text-gray-300">{Array.isArray(selectedMovie.genres) ? selectedMovie.genres.join(" • ") : selectedMovie.genres}</div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">{selectedMovie.description}</p>

                <div className="mt-4 text-sm text-gray-400">
                  <div><span className="text-gray-500">Sutradara: </span>{selectedMovie.director || "-"}</div>
                  <div className="mt-1"><span className="text-gray-500">Pemain: </span>{Array.isArray(selectedMovie.cast) ? selectedMovie.cast.join(", ") : selectedMovie.cast || "-"}</div>
                </div>
              </div>

              <div className="sm:col-span-1">
                <div className="bg-[#070707] border border-gray-800 rounded-lg p-3">
                  <div className="text-sm text-gray-400"><span className="text-gray-500">Tahun:</span> {selectedMovie.year || "-"}</div>
                  <div className="text-sm text-gray-400 mt-2"><span className="text-gray-500">Genre:</span> {Array.isArray(selectedMovie.genres) ? selectedMovie.genres.join(", ") : selectedMovie.genres || "-"}</div>
                  <div className="text-sm text-gray-400 mt-2"><span className="text-gray-500">Durasi:</span> {selectedMovie.duration || "-"}</div>
                </div>
              </div>
            </div>

            {/* RECOMMENDATIONS */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Rekomendasi Serupa</h3>

              <div className="relative">
                {/* left arrow */}
                <button
                  onClick={() => scrollRecommendations('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-opacity"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* cards container */}
                <div
                  ref={recRef}
                  className="flex gap-4 overflow-x-auto scroll-smooth px-12 py-2"
                  style={{
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                  }}
                >
                  {similarMovies.map(m => (
                    <button
                      key={m.id}
                      data-rec-card
                      onClick={() => openMovie ? openMovie(m) : null}
                      className="min-w-[140px] sm:min-w-[160px] flex-shrink-0 rounded overflow-hidden bg-[#0d0d0d] shadow hover:scale-105 transition-transform"
                      style={{ width: 160 }}
                    >
                      <div className="w-full overflow-hidden" style={{ aspectRatio: '2/3' }}>
                        <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2">
                        <div className="text-sm font-medium text-white truncate">{m.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{Array.isArray(m.genres) ? m.genres.slice(0,2).join(", ") : m.genres}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* right arrow */}
                <button
                  onClick={() => scrollRecommendations('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-opacity"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="h-6" />
          </div>
        </div>
      </div>

      {/* Hide scrollbars */}
      <style>{`
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .overflow-x-auto::-webkit-scrollbar { display: none; height: 8px; }
        .overflow-y-auto::-webkit-scrollbar { display: none; width: 8px; }
      `}</style>
    </div>
  );
};

export default MovieDetailModal;