// scripts/fetch_posters_better.cjs
// Usage:
//   node .\\scripts\\fetch_posters_better.cjs YOUR_TMDB_API_KEY [path/to/content.js]
// Example:
//   node .\\scripts\\fetch_posters_better.cjs 55d7dcdce158d14d4b29f1d580f89ea9
//   node .\\scripts\\fetch_posters_better.cjs 55d7... ".\\src\\data\\content.js"

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const fetch = global.fetch || require("node-fetch");

// ================================
// CONFIG
// ================================
const API_KEY = process.env.TMDB_API_KEY || process.argv[2];
if (!API_KEY) {
  console.error("❌ ERROR: API key belum diisi!");
  console.error("Jalankan:");
  console.error('node .\\scripts\\fetch_posters_better.cjs YOUR_API_KEY');
  process.exit(1);
}

const inputArg = process.argv[3];

// file kemungkinan ada di beberapa lokasi -> cek semua
const guessPaths = [
  inputArg,
  "./src/data/content.js",
  "./src/data/content.updated.js",
  "./data/content.js",
  "./content.js",
  "./content.updated.js",
].filter(Boolean);

// mencari file yang bener-bener ada
async function findPath(list) {
  for (const p of list) {
    try {
      const resolved = path.resolve(p);
      await fsp.access(resolved, fs.constants.R_OK);
      return resolved;
    } catch (_) {}
  }
  return null;
}

// ================================
// Helper TMDB
// ================================
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
  }
  return res.json();
}

// levenshtein for similarity
function levenshtein(a, b) {
  a = (a || "").toLowerCase();
  b = (b || "").toLowerCase();
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

function similarity(a, b) {
  const dist = levenshtein(a, b);
  const maxLen = Math.max((a || "").length, (b || "").length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

// search TMDB TV + Movie
async function searchCandidates(title) {
  const q = encodeURIComponent(title);
  const all = [];

  // TV
  try {
    const tv = await fetchJson(
      `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${q}`
    );
    if (tv?.results) all.push(...tv.results.map((r) => ({ ...r, type: "tv" })));
  } catch (_) {}

  // Movie
  try {
    const mv = await fetchJson(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}`
    );
    if (mv?.results) all.push(...mv.results.map((r) => ({ ...r, type: "movie" })));
  } catch (_) {}

  return all.slice(0, 20);
}

// ================================
// MAIN
// ================================
(async () => {
  try {
    const inputPath = await findPath(guessPaths);
    if (!inputPath) {
      console.error("❌ content.js tidak ditemukan. Dicek:");
      guessPaths.forEach((x) => console.error(" -", x));
      process.exit(1);
    }

    console.log("📄 Input:", inputPath);

    let raw = await fsp.readFile(inputPath, "utf-8");

    // ambil object seperti { id:..., title:"...", image:"..." }
    const regex =
      /\{([^{}]*?title\s*:\s*"([^"]+)"[^{}]*?image\s*:\s*"([^"]+)"[^{}]*?)\}/gs;
    const matches = [...raw.matchAll(regex)];
    console.log("🔍 Total objek ditemukan:", matches.length);

    const entries = matches.map((m) => ({
      full: m[0],
      inner: m[1],
      title: m[2],
      image: m[3],
    }));

    const toReplace = entries.filter((e) =>
      e.image.includes("images.unsplash.com")
    );
    console.log("🖼️ Butuh diganti:", toReplace.length);

    const log = [];
    const manualCandidates = [];

    for (let i = 0; i < toReplace.length; i++) {
      const e = toReplace[i];
      console.log(`\n(${i + 1}/${toReplace.length}) 🔎 Cari poster:`, e.title);

      let foundPoster = null;

      try {
        const results = await searchCandidates(e.title);

        const scored = results
          .map((c) => {
            const sc = Math.max(
              similarity(e.title, c.name || ""),
              similarity(e.title, c.title || ""),
              similarity(e.title, c.original_name || ""),
              similarity(e.title, c.original_title || "")
            );
            return { candidate: c, score: sc };
          })
          .sort((a, b) => b.score - a.score);

        if (
          scored.length > 0 &&
          scored[0].candidate.poster_path &&
          scored[0].score >= 0.5
        ) {
          foundPoster = {
            path: scored[0].candidate.poster_path,
            id: scored[0].candidate.id,
            type: scored[0].candidate.type,
            matched: scored[0].candidate.name || scored[0].candidate.title,
          };
        } else {
          // kandidat untuk review manual
          const top8 = scored.slice(0, 8).map((s) => ({
            id: s.candidate.id,
            type: s.candidate.type,
            name:
              s.candidate.name ||
              s.candidate.title ||
              s.candidate.original_name ||
              s.candidate.original_title,
            score: Number(s.score.toFixed(3)),
            poster_path: s.candidate.poster_path,
          }));

          manualCandidates.push({
            title: e.title,
            oldImage: e.image,
            candidates: top8,
          });

          log.push({
            title: e.title,
            old: e.image,
            new: null,
            status: "NEEDS_REVIEW",
          });
        }
      } catch (err) {
        console.error("❌ Error cari TMDB:", err.message);
        log.push({
          title: e.title,
          old: e.image,
          new: null,
          status: "ERROR",
          error: err.message,
        });
      }

      if (foundPoster) {
        const newUrl = "https://image.tmdb.org/t/p/w500" + foundPoster.path;
        console.log("✅ Pakai poster:", newUrl);

        const updated = e.full.replace(e.image, newUrl);
        raw = raw.replace(e.full, updated);

        log.push({
          title: e.title,
          old: e.image,
          new: newUrl,
          tmdbId: foundPoster.id,
          tmdbType: foundPoster.type,
          matched: foundPoster.matched,
          status: "OK",
        });
      }

      await new Promise((r) => setTimeout(r, 350));
    }

    const outPath = path.join(path.dirname(inputPath), "content.final.js");
    await fsp.writeFile(outPath, raw, "utf-8");

    await fsp.writeFile(
      "./posters-replaced.json",
      JSON.stringify(log, null, 2),
      "utf-8"
    );
    await fsp.writeFile(
      "./posters-candidates.json",
      JSON.stringify(manualCandidates, null, 2),
      "utf-8"
    );

    console.log("\n==============================");
    console.log("🎉 DONE!");
    console.log("📂 Output file     :", outPath);
    console.log("📂 Log replaced    : posters-replaced.json");
    console.log("📂 Manual review   : posters-candidates.json");
    console.log(
      "📊 Auto replaced   :",
      log.filter((x) => x.status === "OK").length
    );
    console.log("==============================\n");
  } catch (e) {
    console.error("FATAL:", e.message || e);
    process.exit(1);
  }
})();
