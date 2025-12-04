import React from "react";

const TrendingRow = ({ title, movies, setSelectedMovie }) => {
  return (
    <div className="px-12 mt-8">
      <h2 className="text-white text-3xl font-bold mb-6">{title}</h2>

      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            onClick={() => setSelectedMovie(movie)}
            className="relative cursor-pointer flex-shrink-0"
          >
            {/* Number ranking */}
            <div className="absolute -left-12 top-1/2 -translate-y-1/2">
              <span className="text-white text-7xl font-bold drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)]">
                {index + 1}
              </span>
            </div>

            {/* Poster */}
            <img
              src={movie.image}
              alt={movie.title}
              className="w-48 h-72 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingRow;
