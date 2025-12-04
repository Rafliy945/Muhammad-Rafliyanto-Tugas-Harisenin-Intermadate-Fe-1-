// debug script: prints raw TMDB search results for one title
// Usage: node .\scripts\tmdb_debug.cjs YOUR_API_KEY "Stranger Things"
const fetch = global.fetch || require("node-fetch");
const API_KEY = process.argv[2];
const title = process.argv[3] || "Stranger Things";
if (!API_KEY) {
  console.error("Usage: node tmdb_debug.cjs YOUR_API_KEY \"Title\"");
  process.exit(1);
}
(async () => {
  try {
    const q = encodeURIComponent(title);
    console.log("Searching TMDB for:", title);
    const tvUrl = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${q}`;
    const mvUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}`;
    const tvRes = await (await fetch(tvUrl)).text();
    const mvRes = await (await fetch(mvUrl)).text();
    console.log("\n--- TV search raw response ---\n");
    console.log(tvRes);
    console.log("\n--- MOVIE search raw response ---\n");
    console.log(mvRes);
  } catch (e) {
    console.error("ERROR:", e && e.message ? e.message : e);
  }
})();
