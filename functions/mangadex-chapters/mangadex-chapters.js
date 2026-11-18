// A MangaDex manga's chapters in one language, newest first.
//
// POST { mangaId, language: "en", nsfw: false }
// -> 200 { chapters: [...], total, truncated }
//
// MangaDex returns at most 500 chapters per request, so this pages through
// the whole feed. Official chapters hosted elsewhere (MANGA Plus...) are
// kept, with their externalUrl, instead of being dropped.
const axios = require("axios");

const mangadex = axios.create({
  baseURL: "https://api.mangadex.org",
  timeout: 8000,
  headers: { "User-Agent": "AniLookup/1.0" },
});

const PAGE = 500;
// 4,000 chapters in at most 8 requests keeps well inside the function's time
// limit and MangaDex's 5 requests per second
const MAX_PAGES = 8;

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LANGUAGE = /^[a-z]{2,3}(-[a-z]{2,4})?$/i;

const handler = async function (event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON" });
  }
  const { mangaId, language = "en", nsfw = false } = body;
  if (!UUID.test(String(mangaId || ""))) return json(400, { error: "Invalid mangaId" });
  if (!LANGUAGE.test(String(language))) return json(400, { error: "Invalid language" });

  // the app's NSFW switch: pornographic chapters only when it is on
  const contentRating = ["safe", "suggestive", "erotica", ...(nsfw ? ["pornographic"] : [])];

  try {
    const chapters = [];
    let total = 0;
    let page = 0;
    for (; page < MAX_PAGES; page++) {
      const response = await mangadex.get(`/manga/${mangaId}/feed`, {
        params: {
          translatedLanguage: [language],
          contentRating,
          limit: PAGE,
          offset: page * PAGE,
          order: { volume: "desc", chapter: "desc" },
          includes: ["scanlation_group"],
          includeFuturePublishAt: 0,
        },
      });
      const { data = [], total: count = 0 } = response.data;
      total = count;
      data.forEach((item) => {
        const a = item.attributes;
        // nothing to read: no pages here and no link elsewhere
        if (!a.pages && !a.externalUrl) return;
        chapters.push({
          id: item.id,
          chapter: a.chapter,
          volume: a.volume,
          title: a.title,
          pages: a.pages,
          externalUrl: a.externalUrl || null,
          readableAt: a.readableAt || a.publishAt,
          groups: (item.relationships || [])
            .filter((r) => r.type === "scanlation_group" && r.attributes)
            .map((r) => r.attributes.name),
        });
      });
      if ((page + 1) * PAGE >= total) break;
    }
    return json(200, { chapters, total, truncated: (page + 1) * PAGE < total });
  } catch (error) {
    const status = error.response ? error.response.status : 0;
    console.error("MangaDex chapters failed:", status || error.message);
    if (status === 404) return json(404, { error: "Manga not found" });
    if (status === 429) return json(429, { error: "MangaDex is rate limiting, try again shortly" });
    return json(502, { error: "MangaDex didn't answer" });
  }
};

module.exports = { handler };
