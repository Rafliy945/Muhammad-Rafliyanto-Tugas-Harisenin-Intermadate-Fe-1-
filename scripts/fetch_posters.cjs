// scripts/fetch_posters_better.cjs
// Usage:
//   node .\\scripts\\fetch_posters_better.cjs YOUR_TMDB_API_KEY [optional inputPath]
// Example:
//   node .\\scripts\\fetch_posters_better.cjs 55d7dcdce158d14d4b29f1d580f89ea9 ".\\src\\data\\content.js"

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const fetch = global.fetch || require("node-fetch");

const API_KEY = process.env.TMDB_API_KEY || process.argv[2];
if (!API_KEY) {
  console.error("ERROR: TMDB API key required as env var or first arg.");
  process.exit(1);
}

const argInput = process.argv[3];
const guessPaths = [
  argInput,
  "./src/data/content.js",
  "./src/data/content.updated.js",
  "./content.updated.js",
  "./content.js",
].filter(Boolean);

async function findExistingPath(candidates) {
  for (const p of candidates) {
    if (!p) continue;
    const resolved = path.resolve(p);
    try {
      await fsp.access(resolved, fs.constants.R_OK);
      return resolved;
    } catch (e) {}
  }
  return null;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
  }
  return res.json();
}

// simple levenshtein distance for similarity
function levenshtein(a, b) {
  a = (a||"").toLowerCase();
  b = (b||"").toLowerCase();
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d = Array.from({length: m+1}, ()=>Array(n+1).fill(0));
  for (let i=0;i<=m;i++) d[i][0]=i;
  for (let j=0;j<=n;j++) d[0][j]=j;
  for (let i=1;i<=m;i++){
    for (let j=1;j<=n;j++){
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+cost);
    }
  }
  return d[m][n];
}
function similarityScore(a,b){
  if(!a && !b) return 0;
  const dist = levenshtein(a,b);
  const maxLen = Math.max((a||"").length, (b||"").length);
  if (maxLen === 0) return 1;
  return 1 - (dist / maxLen); // 1 = identical, 0 = totally different
}

async function searchCandidates(title) {
  const q = encodeURIComponent(title);
  const results = [];
  // search tv
  try {
    const tv = await fetchJson(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${q}&page=1`);
    if (tv && tv.results) results.push(...tv.results.map(r => ({...r, type:"tv"})));
  } catch(e){}
  // search movie
  try {
    const mv = await fetchJson(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}&page=1`);
    if (mv && mv.results) results.push(...mv.results.map(r => ({...r, type:"movie"})));
  } catch(e){}
  return results.slice(0, 20); // top 20 combined
}

(async ()=>{
  try {
    const inputPath = await findExistingPath(guessPaths);
    if (!inputPath) {
      console.error("ERROR: content file not found. Tried:", guessPaths);
      process.exit(1);
    }
    console.log("Using input:", inputPath);
    let raw = await fsp.readFile(inputPath, "utf-8");

    // parse objects simple way
    const objRegex = /\{([^{}]*?title\s*:\s*"([^"]+)"[^{}]*?image\s*:\s*"([^"]+)"[^{}]*?)\}/gs;
    const matches = [...raw.matchAll(objRegex)];
    const entries = matches.map(m => ({ full: m[0], inner: m[1], title: m[2], image: m[3] }));
    console.log("Total objects:", entries.length);

    const toReplace = entries.filter(e => e.image.includes("images.unsplash.com"));
    console.log("Unsplash entries:", toReplace.length);

    const log = [];
    const candidatesLog = [];

    for (let idx=0; idx<toReplace.length; idx++){
      const e = toReplace[idx];
      console.log(`(${idx+1}/${toReplace.length}) ${e.title}`);
      let foundPoster = null;
      try {
        const candidates = await searchCandidates(e.title);
        // compute similarity against multiple fields
        const scored = candidates.map(c => {
          const nameFields = [c.name || c.title || c.original_name || c.original_title || ""];
          const bestName = nameFields[0];
          const score = Math.max(
            similarityScore(e.title, c.name || ""),
            similarityScore(e.title, c.title || ""),
            similarityScore(e.title, c.original_name || ""),
            similarityScore(e.title, c.original_title || "")
          );
          return { candidate: c, score };
        }).sort((a,b)=>b.score - a.score);

        // if best candidate has poster_path and score >= 0.6 pick it
        if (scored.length > 0 && scored[0].candidate.poster_path && scored[0].score >= 0.5) {
          foundPoster = { path: scored[0].candidate.poster_path, id: scored[0].candidate.id, type: scored[0].candidate.type, titleMatched: scored[0].candidate.name||scored[0].candidate.title };
        } else {
          // prepare candidate list for manual review
          const top = scored.slice(0,8).map(s => ({
            id: s.candidate.id,
            type: s.candidate.type,
            name: s.candidate.name || s.candidate.title || s.candidate.original_name || s.candidate.original_title || "",
            poster_path: s.candidate.poster_path || null,
            score: Number((s.score).toFixed(3))
          }));
          candidatesLog.push({ title: e.title, oldImage: e.image, candidates: top });
          log.push({ title: e.title, old: e.image, new: null, status: "NEEDS_REVIEW" });
        }
      } catch(err){
        console.warn("  search error:", err.message);
        log.push({ title: e.title, old: e.image, new: null, status: "ERROR", error: String(err) });
      }

      if (foundPoster) {
        const newUrl = "https://image.tmdb.org/t/p/w500" + foundPoster.path;
        const updatedObj = e.full.replace(e.image, newUrl);
        raw = raw.replace(e.full, updatedObj);
        log.push({ title: e.title, old: e.image, new: newUrl, tmdbId: foundPoster.id, tmdbType: foundPoster.type, matchedTitle: foundPoster.titleMatched, status: "OK" });
        console.log("  -> auto replaced with", newUrl);
      }

      // polite delay
      await new Promise(r => setTimeout(r, 300));
    }

    // write output
    const outPath = path.join(path.dirname(inputPath), "content.final.js");
    await fsp.writeFile(outPath, raw, "utf-8");
    const logPath = path.resolve("./posters-replaced.json");
    const candPath = path.resolve("./posters-candidates.json");
    await fsp.writeFile(logPath, JSON.stringify(log, null, 2), "utf-8");
    await fsp.writeFile(candPath, JSON.stringify(candidatesLog, null, 2), "utf-8");

    console.log("Done. Output:", outPath);
    console.log("Log:", logPath);
    console.log("Candidates for manual review:", candPath);
    console.log("Summary:", log.filter(x => x.status === "OK").length, "auto replaced.");
  } catch (e) {
    console.error("Fatal:", e && e.message ? e.message : e);
    process.exit(1);
  }
})();
