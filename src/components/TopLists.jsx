import React from "react";
import GenreIcon from "./GenreIcon";

const TopLists = ({ title, movies, setSelectedMovie, limit = 10 }) => {
  return (
    <div className="px-12 mt-10">
      <h2 className="text-white text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {movies.slice(0, limit).map((m, idx) => (
          <div key={m.id} className="bg-[#0f0f0f] rounded-lg overflow-hidden p-2 cursor-pointer" onClick={()=>setSelectedMovie(m)}>
            <img src={m.image} alt={m.title} className="w-full h-44 object-cover rounded-md" />
            <div className="mt-2 flex items-center justify-between">
              <div>
                <h3 className="text-white text-sm font-semibold">{m.title}</h3>
                <div className="text-gray-400 text-xs">{m.year} • {m.ageRating}</div>
              </div>
              <div className="ml-2">
                <GenreIcon genres={m.genres} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopLists;
