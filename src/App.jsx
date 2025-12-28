import React, { useState, useRef, useEffect } from 'react';
import { Play, Search } from 'lucide-react';
import YouTube from 'react-youtube';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PremiumSubscription from './components/PremiumSubscription';
import { moviesData, seriesData } from './data/content';
import MovieRow from './components/MovieRow';
import MovieDetailModal from './components/MovieDetailModal';
import useStore from './store';

const App = () => {
  // Zustand Store
  const { 
    user, 
    currentPage, 
    setUser, 
    setCurrentPage
  } = useStore();

  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { 
    const t = setTimeout(() => setHeroVisible(true), 120); 
    return () => clearTimeout(t); 
  }, []);
  
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [myList, setMyList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');

  const HERO_TRAILER_ID = 'kZ5i8NyA4P4';
  const ytPlayerRef = useRef(null);
  const heroRef = useRef(null);
  const [heroMuted, setHeroMuted] = useState(true);
  const [ytReady, setYtReady] = useState(false);
  const [isHeroPlaying, setIsHeroPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const VISIBILITY_THRESHOLD = 0.5;
  
  const allGenres = [
    'All', 'Aksi', 'Drama', 'Komedi', 'Thriller', 'Fantasi Ilmiah', 
    'Horror', 'Romantis', 'Petualangan', 'Anime', 'Kejahatan', 'Anak-anak',
    'Sains & Alam', 'Britania', 'KDrama', 'Perang', 'Fantasi Ilmiah & Fantasi'
  ];

  const ytOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1, 
      controls: 0, 
      rel: 0, 
      modestbranding: 1, 
      playsinline: 1, 
      loop: 1, 
      playlist: HERO_TRAILER_ID,
    },
  };

  const debounceRef = useRef(null);
  const debouncedToggle = (shouldPlay) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setIsHeroPlaying(shouldPlay);
      try {
        if (ytPlayerRef.current) {
          if (shouldPlay) ytPlayerRef.current.playVideo?.();
          else ytPlayerRef.current.pauseVideo?.();
        }
      } catch {}
    }, 140);
  };

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const ratio = entry.intersectionRatio;
            if (ratio >= VISIBILITY_THRESHOLD) debouncedToggle(true);
            else debouncedToggle(false);
          });
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      io.observe(heroEl);
      return () => {
        io.disconnect();
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    } else {
      const onScroll = () => {
        const rect = heroEl.getBoundingClientRect();
        const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
        const ratio = visibleHeight / rect.height;
        if (ratio >= VISIBILITY_THRESHOLD) debouncedToggle(true);
        else debouncedToggle(false);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => {
        window.removeEventListener('scroll', onScroll);
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }
  }, []);

  useEffect(() => {
    if (!ytReady) return;
    try {
      if (isHeroPlaying) ytPlayerRef.current?.playVideo();
      else ytPlayerRef.current?.pauseVideo();
    } catch {}
  }, [ytReady]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const searchResultsRef = useRef(null);

  useEffect(() => {
    if (!searchQuery) return;
    const t = setTimeout(() => {
      if (searchResultsRef.current) {
        searchResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 120);
    return () => clearTimeout(t);
  }, [searchQuery, showSearch]);

  const toggleMyList = (movie) => {
    setMyList(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) return prev.filter(m => m.id !== movie.id);
      return [...prev, movie];
    });
  };
  
  const isInMyList = (movieId) => myList.some(m => m.id === movieId);

  const filterContent = (content) => {
    let filtered = content;
    if (selectedGenre !== 'All') {
      filtered = filtered.filter(item => item.genres.includes(selectedGenre));
    }
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return filtered;
  };

  const handleYtStateChange = (e) => {
    const YT = window.YT;
    if (!YT) return;
    const state = e.data;
    if (state === YT.PlayerState.BUFFERING) {
      setIsBuffering(true);
    } else {
      setIsBuffering(false);
    }
    if (state === YT.PlayerState.PLAYING) setIsHeroPlaying(true);
    if (state === YT.PlayerState.PAUSED) setIsHeroPlaying(false);
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    if (currentPage !== 'series' && currentPage !== 'film') {
      setCurrentPage('film');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHelpClick = (pageName) => {
    alert(`Maaf, halaman "${pageName}" belum tersedia saat ini.`);
  };

  const FooterGenreButton = ({ name }) => (
    <button 
      onClick={() => handleGenreClick(name)}
      className="text-gray-300 hover:text-white transition-colors text-left text-sm"
    >
      {name}
    </button>
  );

  const FooterHelpButton = ({ name }) => (
    <button 
      onClick={() => handleHelpClick(name)}
      className="text-sm text-gray-300 hover:text-white transition-colors text-left"
    >
      {name}
    </button>
  );

  // Debug logging
  useEffect(() => {
    console.log('Current Page:', currentPage);
    console.log('User:', user);
  }, [currentPage, user]);

  // Render Login Page
  if (currentPage === 'login') {
    return <Login />;
  }
  
  // Render Register Page
  if (currentPage === 'register') {
    return <Register />;
  }
  
  // Render Premium Page
  if (currentPage === 'premium') {
    return (
      <>
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSelectedGenre={setSelectedGenre}
          user={user}
          setUser={setUser}
        />
        <PremiumSubscription 
          user={user}
          setUser={setUser}
          setShowPremiumModal={() => {}}
          isModal={false}
          closeModal={() => setCurrentPage('home')}
        />
      </>
    );
  }
  
  // Render Profile Page
  if (currentPage === 'profile') {
    return (
      <>
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSelectedGenre={setSelectedGenre}
          user={user}
          setUser={setUser}
        />
        <Profile 
          user={user}
          setUser={setUser}
          myList={myList}
          toggleMyList={toggleMyList}
          setShowPremiumModal={() => setCurrentPage('premium')}
          setCurrentPage={setCurrentPage}
          movies={[...moviesData, ...seriesData]}
        />
      </>
    );
  }

  // Main App Content
  return (
    <>
      <div className="bg-black min-h-screen">
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSelectedGenre={setSelectedGenre}
          user={user}
          setUser={setUser}
        />

        {/* Mobile Search Overlay */}
        {showSearch && (
          <div className="fixed top-16 left-0 right-0 z-40">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setShowSearch(false)}
              aria-hidden="true"
            />
            <div className="relative z-50 p-4">
              <div className="relative max-w-3xl mx-auto">
                <input
                  type="text"
                  placeholder="Cari film, series, atau genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-full pl-10 pr-4 py-2 text-base outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div 
          ref={heroRef} 
          className={`relative w-full overflow-hidden transition-all duration-700 ease-out ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 ${
            isHeroPlaying ? 'opacity-100' : 'opacity-70'
          }`}>
            <YouTube
              videoId={HERO_TRAILER_ID}
              opts={ytOpts}
              iframeClassName="absolute inset-0 w-full h-full object-cover"
              onReady={(event) => {
                ytPlayerRef.current = event.target;
                try {
                  if (heroMuted) event.target.mute();
                  else event.target.unMute();
                  if (isHeroPlaying) event.target.playVideo();
                } catch {}
                setYtReady(true);
              }}
              onStateChange={handleYtStateChange}
              onError={() => setYtReady(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/95 pointer-events-none" />
          </div>

          <img 
            src="poster/Rectangle 9.png" 
            alt="Hero Poster" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              ytReady ? "opacity-0 pointer-events-none" : "opacity-100"
            }`} 
          />
          
          <div className="relative z-20 px-6 pt-20 pb-8 lg:pt-50 lg:pb-28 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-12">
              <div className="flex-1 lg:max-w-2xl">
                <h2 className="text-white font-extrabold leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-7xl xl:text-8xl tracking-tight">
                  Duty After School
                </h2>

                <div className="hidden lg:flex items-center gap-3 flex-wrap mt-4 lg:mt-6">
                  <span className="text-xs bg-black/60 text-white px-3 py-1 rounded-full">Fantasi Ilmiah</span>
                  <span className="text-xs bg-black/60 text-white px-3 py-1 rounded-full">Drama</span>
                  <span className="text-xs bg-black/60 text-white px-3 py-1 rounded-full">Thriller</span>
                  <span className="ml-2 text-sm text-yellow-300">★ 4.4/5</span>
                  <span className="text-sm text-gray-300 ml-2">│ 2023</span>
                </div>
                
                <p className="text-gray-200 mt-5 text-xs sm:text-sm max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-3">
                  Sebuah benda tak dikenal mengambil alih dunia. Departemen Pertahanan merekrut siswa jadi pejuang.
                </p>
              </div>

              <div className="w-full lg:w-auto flex flex-row lg:flex-col items-start lg:items-end gap-2 sm:gap-2 mt-10 lg:mt-0">
                <div className="flex gap-1 sm:gap-3 flex-wrap lg:flex-col lg:items-end items-center">
                  <button
                    onClick={() => setCurrentPage('premium')}
                    className="bg-[#2563EB] text-white px-4 py-2 rounded-full text-xs sm:text-sm flex items-center gap-2 sm:gap-3 font-semibold transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg lg:shadow-none"
                    aria-label="Mulai"
                    style={{ boxShadow: '0 8px 20px rgba(37,99,235,0.18)' }}
                  >
                    <Play size={10} /> Mulai
                  </button>

                  <button
                    onClick={() => setSelectedMovie(seriesData.find(s => s.id === 31))}
                    className="bg-transparent border border-white/20 text-white px-4 py-2 rounded-full text-xs sm:text-sm transition-transform duration-200 hover:scale-102 active:scale-95"
                    aria-label="Selengkapnya"
                  >
                    Selengkapnya
                  </button>

                  <div className="flex items-center gap-50 sm:gap-50 mt-0.5 lg:mt-4">
                    <span className="text-sm bg-gray-900/60 text-white px-3 py-1 rounded-full">18+</span>
                    <button
                      onClick={() => {
                        setHeroMuted(prev => {
                          const next = !prev;
                          try {
                            next ? ytPlayerRef.current.mute() : ytPlayerRef.current.unMute();
                          } catch {}
                          return next;
                        });
                      }}
                      className="bg-black/40 text-white px-3 py-2 rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
                      title={heroMuted ? 'Unmute' : 'Mute'}
                      aria-label="Toggle mute"
                    >
                      {heroMuted ? "🔇" : "🔊"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isBuffering && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="relative z-10 mt-0 pb-20">
          {/* Genre Filter */}
          {(currentPage === 'film' || currentPage === 'series') && (
            <div className="px-12 mb-8">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
                {allGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      selectedGenre === genre
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            (() => {
              const results = filterContent([...moviesData, ...seriesData]);
              const hasResults = results.length > 0;

              return (
                <div
                  ref={searchResultsRef}
                  className="px-6 md:px-12 mt-6 z-50 relative"
                  style={{ scrollMarginTop: '100px' }}
                >
                  <h2 className="text-white text-2xl font-semibold mb-6">
                    Hasil Pencarian: "{searchQuery}"
                  </h2>

                  {hasResults ? (
                    <MovieRow
                      title={`Hasil: ${results.length} hasil`}
                      movies={results}
                      setSelectedMovie={setSelectedMovie}
                      toggleMyList={toggleMyList}
                      isInMyList={isInMyList}
                      thumbnailClass="w-56 h-80 md:w-64 md:h-96"
                    />
                  ) : (
                    <p className="text-gray-400 text-center py-10">
                      Tidak ada hasil ditemukan
                    </p>
                  )}
                </div>
              );
            })()
          )}

          {/* Home Page Content */}
          {currentPage === 'home' && (
            <>
              <MovieRow
                title="Trending Minggu Ini"
                movies={[...moviesData.filter(m => m.top), ...seriesData.filter(s => s.top)].slice(0, 10)}
                setSelectedMovie={setSelectedMovie}
                toggleMyList={toggleMyList}
                isInMyList={isInMyList}
                showNumbers={true}
                isTrending={true}
              />
              <MovieRow 
                title="Film Populer" 
                movies={moviesData.slice(0, 10)} 
                setSelectedMovie={setSelectedMovie} 
                toggleMyList={toggleMyList} 
                isInMyList={isInMyList} 
              />
              <MovieRow 
                title="Series Populer" 
                movies={seriesData.slice(0, 10)} 
                setSelectedMovie={setSelectedMovie} 
                toggleMyList={toggleMyList} 
                isInMyList={isInMyList} 
              />
              <MovieRow 
                title="Rilis Terbaru" 
                movies={[...moviesData, ...seriesData].filter(item => item.isNew).slice(0, 10)} 
                setSelectedMovie={setSelectedMovie} 
                toggleMyList={toggleMyList} 
                isInMyList={isInMyList} 
              />
              <MovieRow 
                title="Action & Thriller" 
                movies={[...moviesData, ...seriesData].filter(item => 
                  item.genres.includes('Aksi') || item.genres.includes('Thriller')
                ).slice(0, 10)} 
                setSelectedMovie={setSelectedMovie} 
                toggleMyList={toggleMyList} 
                isInMyList={isInMyList} 
              />
              <MovieRow 
                title="Drama Terbaik" 
                movies={[...moviesData, ...seriesData].filter(item => 
                  item.genres.includes('Drama')
                ).slice(0, 10)} 
                setSelectedMovie={setSelectedMovie} 
                toggleMyList={toggleMyList} 
                isInMyList={isInMyList} 
              />
            </>
          )}

          {/* Series Page Content */}
          {currentPage === 'series' && (
            <>
              <MovieRow 
                title={selectedGenre === 'All' ? "Semua Series" : `Series ${selectedGenre}`} 
                movies={filterContent(seriesData)} 
                setSelectedMovie={setSelectedMovie} 
                toggleMyList={toggleMyList} 
                isInMyList={isInMyList} 
              />
              {selectedGenre === 'All' && (
                <>
                  <MovieRow 
                    title="Top Rating Series" 
                    movies={seriesData.filter(s => parseFloat(s.rating) >= 4.7)} 
                    setSelectedMovie={setSelectedMovie} 
                    toggleMyList={toggleMyList} 
                    isInMyList={isInMyList} 
                  />
                  <MovieRow 
                    title="Series Baru" 
                    movies={seriesData.filter(s => s.isNew)} 
                    setSelectedMovie={setSelectedMovie} 
                    toggleMyList={toggleMyList} 
                    isInMyList={isInMyList} 
                  />
                </>
              )}
            </>
          )}

          {/* Film Page Content */}
          {currentPage === 'film' && (
            <>
              <MovieRow 
                title={selectedGenre === 'All' ? "Semua Film" : `Film ${selectedGenre}`} 
                movies={filterContent(moviesData)} 
                setSelectedMovie={setSelectedMovie} 
                toggleMyList={toggleMyList} 
                isInMyList={isInMyList} 
              />
              {selectedGenre === 'All' && (
                <>
                  <MovieRow 
                    title="Top Rating Film" 
                    movies={moviesData.filter(m => parseFloat(m.rating) >= 4.7)} 
                    setSelectedMovie={setSelectedMovie} 
                    toggleMyList={toggleMyList} 
                    isInMyList={isInMyList} 
                  />
                  <MovieRow 
                    title="Film Baru" 
                    movies={moviesData.filter(m => m.isNew)} 
                    setSelectedMovie={setSelectedMovie} 
                    toggleMyList={toggleMyList} 
                    isInMyList={isInMyList} 
                  />
                </>
              )}
            </>
          )}

          {/* My List Page Content */}
          {currentPage === 'mylist' && (
            <div className="px-12">
              <h2 className="text-white text-3xl font-bold mb-8">Daftar Saya</h2>
              {myList.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg mb-4">Belum ada konten di daftar Anda</p>
                  <button 
                    onClick={() => setCurrentPage('home')} 
                    className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                  >
                    Jelajahi Konten
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {myList.map(movie => (
                    <div 
                      key={movie.id} 
                      className="relative flex-shrink-0 w-full cursor-pointer" 
                      onClick={() => setSelectedMovie(movie)}
                    >
                      <img 
                        src={movie.image} 
                        alt={movie.title} 
                        className="w-full h-48 object-cover rounded-lg hover:opacity-80 transition-opacity" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-[#0a0a0a] border-t border-gray-800 pt-16 pb-12 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            
            {/* Mobile View */}
            <div className="lg:hidden">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <img src="/icons/logo-chill.png" alt="Logo Chill" className="w-8 h-8" />
                  <h3 className="text-white font-bold text-2xl">CHILL</h3>
                </div>
                <p className="text-sm text-gray-400">@2023 Chill All Rights Reserved.</p>
              </div>

              <details className="border-b border-gray-800 py-4">
                <summary className="flex items-center justify-between cursor-pointer text-white text-lg font-semibold">
                  Genre
                  <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                  {['Aksi', 'Drama', 'Komedi', 'Sains & Alam', 'Anak-anak', 'Fantasi Ilmiah & Fantasi', 
                    'Petualangan', 'Thriller', 'Anime', 'Kejahatan', 'Perang', 'Britania', 'KDrama', 'Romantis'].map(genre => (
                     <FooterGenreButton key={genre} name={genre} />
                  ))}
                </div>
              </details>

              <details className="border-b border-gray-800 py-4">
                <summary className="flex items-center justify-between cursor-pointer text-white text-lg font-semibold">
                  Bantuan
                  <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
                <div className="mt-4 flex flex-col gap-3">
                  {['FAQ', 'Kontak Kami', 'Privasi', 'Syarat & Ketentuan'].map(item => (
                    <FooterHelpButton key={item} name={item} />
                  ))}
                </div>
              </details>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:flex justify-between items-start">
              <div className="mb-8 max-w-xs">
                <div className="flex items-center gap-3 mb-6">
                  <img src="/icons/logo-chill.png" alt="Logo Chill" className="w-10 h-auto" />
                  <h3 className="text-white font-bold text-3xl tracking-wide">CHILL</h3>
                </div>
                <p className="text-sm text-gray-400">@2023 Chill All Rights Reserved.</p>
              </div>

              <div className="flex gap-16 xl:gap-24">
                <div>
                  <h4 className="text-white text-lg font-bold mb-6">Genre</h4>
                  <div className="grid grid-cols-4 gap-x-8 gap-y-4 text-sm">
                    <div className="flex flex-col gap-4">
                        <FooterGenreButton name="Aksi" />
                        <FooterGenreButton name="Anak-anak" />
                        <FooterGenreButton name="Anime" />
                        <FooterGenreButton name="Britania" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <FooterGenreButton name="Drama" />
                        <FooterGenreButton name="Fantasi Ilmiah & Fantasi" />
                        <FooterGenreButton name="Kejahatan" />
                        <FooterGenreButton name="KDrama" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <FooterGenreButton name="Komedi" />
                        <FooterGenreButton name="Petualangan" />
                        <FooterGenreButton name="Perang" />
                        <FooterGenreButton name="Romantis" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <FooterGenreButton name="Sains & Alam" />
                        <FooterGenreButton name="Thriller" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white text-lg font-bold mb-6">Bantuan</h4>
                  <div className="flex flex-col gap-4 text-sm">
                    <FooterHelpButton name="FAQ" />
                    <FooterHelpButton name="Kontak Kami" />
                    <FooterHelpButton name="Privasi" />
                    <FooterHelpButton name="Syarat & Ketentuan" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </footer>

        {/* Movie Detail Modal */}
        {selectedMovie && (
          <MovieDetailModal
            selectedMovie={selectedMovie}
            closeModal={() => setSelectedMovie(null)}
            toggleMyList={toggleMyList}
            isInMyList={isInMyList}
            movies={[...moviesData, ...seriesData]}
            openMovie={(movie) => setSelectedMovie(movie)}
          />
        )}
      </div>
    </>
  );
};

export default App;