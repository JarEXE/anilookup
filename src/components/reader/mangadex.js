// The reader's link to MangaDex, through the Netlify functions in /functions
// (MangaDex's API refuses requests made from other websites' pages).

async function post(name, body) {
  const response = await fetch(`/.netlify/functions/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

// session cache (lookups and chapter lists change rarely; page addresses
// expire, so they are never cached)
function readCache(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch (error) {
    return null;
  }
}
function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // full or blocked storage: just don't cache
  }
}

// The names worth searching MangaDex for: main, English, Japanese, synonyms.
function searchTitles(manga) {
  const titles = [manga.title, manga.title_english];
  (manga.titles || []).forEach((t) => titles.push(t.title));
  (manga.title_synonyms || []).forEach((t) => titles.push(t));
  return [...new Set(titles.filter(Boolean))].slice(0, 4);
}

// { found: true, id, title, languages } or { found: false } for a MAL manga
export async function lookupManga(manga) {
  const key = `mangadex:lookup:${manga.mal_id}`;
  const cached = readCache(key);
  if (cached) return cached;
  const result = await post("mangadex-lookup", {
    malId: manga.mal_id,
    titles: searchTitles(manga),
  });
  writeCache(key, result);
  return result;
}

// { chapters, total, truncated } for one language
export async function fetchChapters(mangaId, language, nsfw) {
  const key = `mangadex:chapters:${mangaId}:${language}:${nsfw ? 1 : 0}`;
  const cached = readCache(key);
  if (cached) return cached;
  const result = await post("mangadex-chapters", { mangaId, language, nsfw });
  writeCache(key, result);
  return result;
}

// { chapter, server: { baseUrl, hash, data, dataSaver } | null }
export const fetchPages = (chapterId) => post("mangadex-pages", { chapterId });

// Each page's image addresses, best first: the chosen quality, then the
// data-saver copy as a fallback. They go through the mangadex-image function,
// since MangaDex's image servers don't serve other websites' pages.
const proxied = (server, folder, file) =>
  `/.netlify/functions/mangadex-image?src=${encodeURIComponent(
    `${server.baseUrl}/${folder}/${server.hash}/${file}`,
  )}`;

export const pageSources = (server, highQuality) =>
  server
    ? server.dataSaver.map((saverFile, index) => {
        const saver = proxied(server, "data-saver", saverFile);
        const full = server.data[index] ? proxied(server, "data", server.data[index]) : null;
        return highQuality && full ? [full, saver] : [saver];
      })
    : [];

// ---- presentation ----

// MangaDex's own codes that aren't standard language tags
const LANGUAGE_NAMES = {
  "es-la": "Spanish (Latin America)",
  "pt-br": "Portuguese (Brazil)",
  "ja-ro": "Japanese (romanized)",
  "ko-ro": "Korean (romanized)",
  "zh-ro": "Chinese (romanized)",
  "zh-hk": "Chinese (traditional)",
};
let displayNames = null;
export function languageName(code) {
  if (LANGUAGE_NAMES[code]) return LANGUAGE_NAMES[code];
  try {
    displayNames = displayNames || new Intl.DisplayNames(["en"], { type: "language" });
    return displayNames.of(code) || code;
  } catch (error) {
    return code;
  }
}

// English first, then A–Z by name; English is always offered, since official
// English chapters (MANGA Plus...) don't count as "available" on MangaDex
export function languageOptions(languages) {
  const others = [...new Set(languages || [])].filter((code) => code !== "en");
  others.sort((a, b) => languageName(a).localeCompare(languageName(b)));
  return ["en", ...others];
}

export const chapterLabel = (chapter) =>
  chapter.chapter ? `Chapter ${chapter.chapter}` : "Oneshot";

// One entry per chapter number, with every translation of it ("versions").
// Keeps MangaDex's order (newest first). Chapters without a number (oneshots)
// stay separate.
export function groupChapters(chapters) {
  const groups = [];
  const byNumber = new Map();
  (chapters || []).forEach((version) => {
    const key = version.chapter ? `n${version.chapter}` : `id${version.id}`;
    let group = byNumber.get(key);
    if (!group) {
      group = { key, chapter: version.chapter, volume: version.volume, title: version.title, versions: [] };
      byNumber.set(key, group);
      groups.push(group);
    }
    if (!group.title && version.title) group.title = version.title;
    group.versions.push(version);
  });
  return groups;
}

// The version to open for a chapter: the same translators as the chapter just
// read when they have it, otherwise the first one with pages here, otherwise
// the official link.
export function preferredVersion(group, groupsBefore = []) {
  const hosted = group.versions.filter((v) => !v.externalUrl);
  const same = hosted.find(
    (v) => v.groups.length && v.groups.join("|") === groupsBefore.join("|"),
  );
  return same || hosted[0] || group.versions[0];
}

// "mangaplus.shueisha.co.jp" -> "mangaplus.shueisha.co.jp" minus "www."
export const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (error) {
    return url;
  }
};
