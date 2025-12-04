// scripts/update_posters_all.cjs
// Usage:
//   node .\\scripts\\update_posters_all.cjs YOUR_TMDB_API_KEY [path/to/content.js]
// Examples:
//   node .\\scripts\\update_posters_all.cjs 55d7dcdce158d14d4b29f1d580f89ea9
//   node .\\scripts\\update_posters_all.cjs 55d7... ".\\src\\data\\content.js"

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const fetch = global.fetch || require("node-fetch");

const API_KEY = process.env.TMDB_API_KEY || process.argv[2];
if (!API_KEY) {
  console.error("ERROR: TMDB API key required as env var or first arg.");
  console.error("Usage: node .\\scripts\\update_posters_all.cjs YOUR_TMDB_API_KEY [inputPath]");
  process.exit(1);
}

const argInput = process.argv[3];
const guessPaths = [
  argInput,
  "./src/data/content.js",
  "./src/data/content.updated.js",
  "./src/data/content.final.js",
  "./data/content.js",
  "./content.js",
].filter(Boolean);

async function findExistingPath(candidates) {
  for (const p of candidates) {
    try {
      const resolved = path.resolve(p);
      await fsp.access(resolved, fs.constants.R_OK);
      return resolved;
    } catch (e) {
      // not found
    }
  }
  return null;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
  }
  return res.json();
}

async function tmdbSearchTv(title) {
  const q = encodeURIComponent(title);
  const url = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${q}&page=1`;
  return await fetchJson(url);
}

async function tmdbSearchMovie(title) {
  const q = encodeURIComponent(title);
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}&page=1`;
  return await fetchJson(url);
}

async function tmdbGetVideos(type, id) {
  // type: 'movie' or 'tv'
  const url = `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${API_KEY}`;
  return await fetchJson(url);
}

/** Choose best YouTube trailer key (prefer official Trailer/Teaser) */
function pickYoutubeKey(videos) {
  if (!videos || !videos.results) return null;
  // prioritize official + Trailer
  const prefer = videos.results.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser") && (v.official === true || !("official" in v))
  );
  if (prefer) return prefer.key;
  // fallback to any YouTube
  const any = videos.results.find((v) => v.site === "YouTube");
  return any ? any.key : null;
}

/** Throttle helper */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  try {
    const inputPath = await findExistingPath(guessPaths);
    if (!inputPath) {
      console.error("ERROR: Could not find content file. Tried:");
      guessPaths.forEach((p) => console.error(" -", p));
      process.exit(1);
    }

    console.log("Using input file:", inputPath);
    const inputDir = path.dirname(inputPath);
    const outPath = path.join(inputDir, "content.final.js");
    const logPath = path.resolve("./posters-updated.json");

    let raw = await fsp.readFile(inputPath, "utf-8");

    // Find objects like { ... title: "Name", ... image: "URL", ... trailer: "..." }
    const objRegex = /\{([^{}]*?title\s*:\s*"([^"]+)"[^{}]*?image\s*:\s*"([^"]*)"(?:[^{}]*?trailer\s*:\s*"([^"]*)")?[^{}]*?)\}/gs;
    const matches = [...raw.matchAll(objRegex)];
    console.log("Found objects:", matches.length);

    const entries = matches.map((m) => ({
      full: m[0],
      inner: m[1],
      title: m[2],
      image: m[3] || "",
      trailer: m[4] || null,
    }));

    console.log("Entries parsed:", entries.length);

    const log = [];

    // Process sequentially to be polite; adjust concurrency if you want
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const title = e.title;
      const oldImage = e.image;
      const oldTrailer = e.trailer;

      console.log(`\n[${i + 1}/${entries.length}] ${title}`);

      let chosenPoster = null;
      let chosenType = null;
      let chosenId = null;
      let chosenTrailerUrl = null;

      // 1) Try TV search (preferable for series)
      try {
        const tvRes = await tmdbSearchTv(title);
        if (tvRes && tvRes.results && tvRes.results.length > 0) {
          // try to match exact-ish name (case-insensitive)
          const exact = tvRes.results.find((r) => (r.name && r.name.toLowerCase() === title.toLowerCase()) || (r.original_name && r.original_name.toLowerCase() === title.toLowerCase()));
          const candidate = exact || tvRes.results[0];
          if (candidate && candidate.poster_path) {
            chosenPoster = candidate.poster_path;
            chosenType = "tv";
            chosenId = candidate.id;
          }
        }
      } catch (e) {
        console.warn("TV search error for", title, e.message || e);
      }

      // 2) If not found, try movie search
      if (!chosenPoster) {
        try {
          const mvRes = await tmdbSearchMovie(title);
          if (mvRes && mvRes.results && mvRes.results.length > 0) {
            const exact = mvRes.results.find((r) => (r.title && r.title.toLowerCase() === title.toLowerCase()) || (r.original_title && r.original_title.toLowerCase() === title.toLowerCase()));
            const candidate = exact || mvRes.results[0];
            if (candidate && candidate.poster_path) {
              chosenPoster = candidate.poster_path;
              chosenType = "movie";
              chosenId = candidate.id;
            }
          }
        } catch (e) {
          console.warn("Movie search error for", title, e.message || e);
        }
      }

      // 3) If we found a poster via candidate, fetch trailer videos (optional)
      if (chosenPoster && chosenType && chosenId) {
        try {
          const vids = await tmdbGetVideos(chosenType, chosenId);
          const key = pickYoutubeKey(vids);
          if (key) chosenTrailerUrl = `https://www.youtube.com/watch?v=${key}`;
        } catch (e) {
          console.warn("Videos fetch error for", title, e.message || e);
        }
      }

      // 4) Prepare replacements in raw text - replace image and trailer fields
      let newImageUrl = chosenPoster ? `https://image.tmdb.org/t/p/w500${chosenPoster}` : null;

      // Update image: replace first occurrence of image: "OLD" within the object
      let updatedFull = e.full;
      if (newImageUrl) {
        // replace value (string) inside quotes
        updatedFull = updatedFull.replace(new RegExp(e.image.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")), newImageUrl);
      }

      // Update trailer: if chosenTrailerUrl exists, either replace existing trailer value or add trailer field
      if (chosenTrailerUrl) {
        if (/trailer\s*:\s*"/.test(updatedFull)) {
          // has trailer field — replace value
          updatedFull = updatedFull.replace(/trailer\s*:\s*"[^"]*"/, `trailer: "${chosenTrailerUrl}"`);
        } else {
          // no trailer field — inject before closing brace of object inner part
          // find position before the last closing of object inner (we have 'full' string)
          // simple approach: insert before final '}'
          updatedFull = updatedFull.replace(/\}$/, `, trailer: "${chosenTrailerUrl}"}`);
        }
      }

      if (newImageUrl || chosenTrailerUrl) {
        raw = raw.replace(e.full, updatedFull);
      }

      log.push({
        title,
        oldImage,
        newImage: newImageUrl,
        oldTrailer,
        newTrailer: chosenTrailerUrl,
        tmdbId: chosenId,
        tmdbType: chosenType,
        timestamp: new Date().toISOString(),
      });

      // polite delay to avoid rate-limit
      await sleep(350);
    }

    // Write outputs
    await fsp.writeFile(outPath, raw, "utf-8");
    await fsp.writeFile(logPath, JSON.stringify(log, null, 2), "utf-8");

    console.log("\nFinished. Wrote:", outPath);
    console.log("Log:", logPath);
    console.log("Summary: updated", log.filter((x) => x.newImage).length, "posters; updated trailers for", log.filter((x) => x.newTrailer).length);
  } catch (err) {
    console.error("Fatal:", err && err.message ? err.message : err);
    process.exit(1);
  }
})();
