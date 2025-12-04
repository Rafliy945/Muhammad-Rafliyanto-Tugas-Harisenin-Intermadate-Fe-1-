import React from "react";

const colorMap = {
  Action: "bg-red-500",
  Drama: "bg-yellow-600",
  Comedy: "bg-green-500",
  "Sci-Fi": "bg-blue-500",
  Horror: "bg-purple-600",
  Adventure: "bg-indigo-500",
  Romance: "bg-pink-500",
  default: "bg-gray-500",
};

const GenreIcon = ({ genres = [] }) => {
  const genre = genres[0] || "default";
  const cls = colorMap[genre] || colorMap.default;
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cls} text-white text-xs`}>
      {genre.slice(0,2).toUpperCase()}
    </div>
  );
};

export default GenreIcon;
