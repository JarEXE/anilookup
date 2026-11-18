// Finds the MangaDex entry for a MAL manga.
//
// POST { malId, titles: [main title, English title, ...] }
// -> 200 { found: true, id, title, languages } | { found: false }
//
// MangaDex stores each manga's MAL id in attributes.links.mal, so a title
// search is only used to get candidates: the one whose MAL id matches wins.
// (Taking the first search result picked the wrong series for many titles,
// e.g. "One Piece" -> "One Piece - Vivi no Bouken".)
const axios = require("axios");

const mangadex = axios.create({
  baseURL: "https://api.mangadex.org",
  timeout: 8000,
  // MangaDex asks API clients to identify themselves
  headers: { "User-Agent": "AniLookup/1.0" },
});

const ALL_RATINGS = ["safe", "suggestive", "erotica", "pornographic"];
const MAX_TITLES = 4;

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// "Kaguya-sama: Love is War" -> "kaguya sama love is war"
const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const allTitles = (manga) => {
  const { title = {}, altTitles = [] } = manga.attributes;
  return [...Object.values(title), ...altTitles.flatMap((t) => Object.values(t))];
};

const summary = (manga) => ({
  found: true,
  id: manga.id,
  title:
    manga.attributes.title.en || Object.values(manga.attributes.title)[0] || "",
  // languages with chapters hosted on MangaDex (official external chapters,
  // e.g. MANGA Plus, aren't counted here)
  languages: manga.attributes.availableTranslatedLanguages || [],
});

const handler = async function (event) {
  let malId;
  let titles;
  try {
    ({ malId, titles } = JSON.parse(event.body || "{}"));
  } catch (error) {
    return json(400, { error: "Invalid JSON" });
  }
  if (!/^\d+$/.test(String(malId || ""))) {
    return json(400, { error: "Missing or invalid malId" });
  }
  const searches = [
    ...new Set(
      (Array.isArray(titles) ? titles : [])
        .filter((t) => typeof t === "string" && t.trim())
        .map((t) => t.trim().slice(0, 200)),
    ),
  ].slice(0, MAX_TITLES);
  if (!searches.length) return json(400, { error: "Missing titles" });

  const wanted = new Set(searches.map(normalize));
  let sameName = null;

  try {
    for (const title of searches) {
      const response = await mangadex.get("/manga", {
        params: {
          title,
          limit: 25,
          contentRating: ALL_RATINGS,
          order: { relevance: "desc" },
        },
      });
      const results = response.data.data || [];

      const exact = results.find(
        (manga) => manga.attributes.links && String(manga.attributes.links.mal) === String(malId),
      );
      if (exact) return json(200, summary(exact));

      // Some entries have no MAL link at all. Accept one only when one of its
      // names is exactly one of ours, and keep looking for a real match first.
      if (!sameName) {
        sameName =
          results.find(
            (manga) =>
              !(manga.attributes.links && manga.attributes.links.mal) &&
              allTitles(manga).some((name) => wanted.has(normalize(name))),
          ) || null;
      }
    }
    return json(200, sameName ? summary(sameName) : { found: false });
  } catch (error) {
    const status = error.response ? error.response.status : 0;
    console.error("MangaDex lookup failed:", status || error.message);
    if (status === 429) return json(429, { error: "MangaDex is rate limiting, try again shortly" });
    return json(502, { error: "MangaDex didn't answer" });
  }
};

module.exports = { handler };
