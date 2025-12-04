
import React, { useState, useRef, useEffect } from 'react';
import { MovieCard, HoverModal } from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MovieRow = ({
  title,
  movies = [],
  setSelectedMovie,
  toggleMyList,
  isInMyList,
  showNumbers = false,
}) => {
  const rowId = `row-${title.replace(/\s+/g, '-')}`;
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef(null);
  const cardRefs = useRef({});
  const isOverModal = useRef(false);
  const isOverCard = useRef(false);

  // responsive width watcher (ensure isMobile always defined)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMobile = windowWidth < 768;

  const isTrending = title?.toLowerCase().includes('trending');

  // poster sizing: desktop vs mobile
  const desktopSizes = {
    trending: { w: 160, small: true }, 
    normal: { w: 220, small: false }, 
  };
  const mobileSizes = {
    trending: { w: 120, small: true },
    normal: { w: 120, small:true }, 
  };

  const selectedSize = isTrending
    ? (isMobile ? mobileSizes.trending : desktopSizes.trending)
    : (isMobile ? mobileSizes.normal : desktopSizes.normal);

  const rowGapClass = isTrending
  ? 'gap-20 sm:gap-16 md:gap-20 lg:gap-24'
  : 'gap-10 sm:gap-5 md:gap-6 lg:gap-6';


  const scroll = (dir) => {
    const container = document.getElementById(rowId);
    if (!container) return;
    const amount = selectedSize.w * 2;
    container.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const calculateModalPosition = (el) => {
    const rect = el.getBoundingClientRect();
    const modalW = 384;
    const modalH = 400;
    const gap = 10;

    let x = rect.right + gap;
    let y = rect.top;

    if (x + modalW > window.innerWidth) x = rect.left - modalW - gap;
    if (x < 0) x = 20;
    if (y + modalH > window.innerHeight) y = window.innerHeight - modalH - 20;
    if (y < 0) y = 20;

    return { x, y };
  };

  const handleMouseEnter = (movie) => {
    isOverCard.current = true;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = setTimeout(() => {
      const el = cardRefs.current[movie.id];
      if (el && isOverCard.current) {
        const pos = calculateModalPosition(el);
        setModalPosition(pos);
        setHoveredMovie(movie);
      }
    }, 400); 
  };

  const handleMouseLeave = () => {
    isOverCard.current = false;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    setTimeout(() => {
      if (!isOverModal.current && !isOverCard.current) setHoveredMovie(null);
    }, 120);
  };

  const modalEnter = () => (isOverModal.current = true);
  const modalLeave = () => {
    isOverModal.current = false;
    setTimeout(() => {
      if (!isOverCard.current) setHoveredMovie(null);
    }, 120);
  };

  return (
    <div className="mb-8">
      <h2 className="text-white text-2xl font-semibold mb-4 px-12">{title}</h2>

      <div className="relative group">
        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white p-2 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        {/* ROW */}
        <div
          id={rowId}
          className={`flex ${rowGapClass} overflow-x-auto scrollbar-hide px-12 scroll-smooth`}
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="relative flex-shrink-0"
              style={{ width: selectedSize.w }}
            >
              {/* Ranking number for trending */}
              {isTrending && showNumbers && (
                <span className="ranking-premium">{index + 1}</span>
              )}

              <div style={{ position: 'relative', zIndex: 20 }}>
                <MovieCard
                  movie={movie}
                  onClick={setSelectedMovie}
                  toggleMyList={toggleMyList}
                  isInMyList={isInMyList}
                  cardRef={(el) => (cardRefs.current[movie.id] = el)}
                  // disable hover handlers on mobile
                  onHoverStart={!isMobile ? () => handleMouseEnter(movie) : undefined}
                  onHoverEnd={!isMobile ? handleMouseLeave : undefined}
                  onExpand={(m) => setSelectedMovie(m)}
                  small={selectedSize.small}
                />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white p-2 rounded-l opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Hover modal only on desktop */}
      {hoveredMovie && !isMobile && (
        <HoverModal
          movie={hoveredMovie}
          position={modalPosition}
          toggleMyList={toggleMyList}
          isInMyList={isInMyList}
          onMouseEnter={modalEnter}
          onMouseLeave={modalLeave}
          onExpand={(m) => setSelectedMovie(m)}
        />
      )}

      {/* Ranking premium style (kept but safe) */}
      <style>{`
        .ranking-premium {
          position: absolute;
          bottom: 8px;
          left: -35px;
          z-index: 10;
          pointer-events: none;
          user-select: none;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -3px;
          background: linear-gradient(180deg, #ffffff 0%, #ffe9a9 45%, #d4a84c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 3px rgba(0,0,0,0.9);
          text-shadow:
            0 0 6px rgba(255, 215, 160, 0.9),
            0 0 16px rgba(255, 200, 120, 0.7),
            0 4px 18px rgba(0,0,0, 0.9);
          font-size: clamp(30px, 5vw, 70px);
        }
        @media (min-width: 640px) {
          .ranking-premium { bottom: 4px; left: -45px; font-size: clamp(34px, 4.5vw, 80px); }
        }
        @media (min-width: 768px) {
          .ranking-premium { bottom: 2px; left: -55px; font-size: clamp(38px, 4vw, 90px); }
        }
        @media (min-width: 1024px) {
          .ranking-premium { bottom: 0px; left: -65px; font-size: clamp(42px, 3.2vw, 100px); }
        }
        @media (min-width: 1280px) {
          .ranking-premium { bottom: 4px; left: -40px; font-size: clamp(46px, 3vw, 110px); }
        }
      `}</style>
    </div>
  );
};

export default MovieRow;
