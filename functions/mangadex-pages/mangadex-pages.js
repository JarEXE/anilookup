// One chapter: its details and where its page images are.
//
// POST { chapterId }
// -> 200 { chapter: {...}, server: { baseUrl, hash, data, dataSaver } | null }
//
// Only the image addresses are returned; the browser loads the images
// straight from MangaDex's image servers (they allow it). The old proxy
// downloaded every page and sent them back base64-encoded in one response,
// which ran into Netlify's response size and time limits on most chapters.
// `server` is null when MangaDex lists the chapter but can't serve its pages.
const axios = require("axios");

const mangadex = axios.create({
  baseURL: "https://api.mangadex.org",
  timeout: 8000,
  headers: { "User-Agent": "AniLookup/1.0" },
});

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const handler = async function (event) {
  let chapterId;
  try {
    ({ chapterId } = JSON.parse(event.body || "{}"));
  } catch (error) {
    return json(400, { error: "Invalid JSON" });
  }
  if (!UUID.test(String(chapterId || ""))) return json(400, { error: "Invalid chapterId" });

  try {
    const [chapterResult, serverResult] = await Promise.allSettled([
      mangadex.get(`/chapter/${chapterId}`, {
        params: { includes: ["scanlation_group"] },
      }),
      mangadex.get(`/at-home/server/${chapterId}`),
    ]);

    if (chapterResult.status === "rejected") throw chapterResult.reason;
    const item = chapterResult.value.data.data;
    const a = item.attributes;
    const manga = (item.relationships || []).find((r) => r.type === "manga");

    const chapter = {
      id: item.id,
      chapter: a.chapter,
      volume: a.volume,
      title: a.title,
      language: a.translatedLanguage,
      pages: a.pages,
      externalUrl: a.externalUrl || null,
      mangaId: manga ? manga.id : null,
      groups: (item.relationships || [])
        .filter((r) => r.type === "scanlation_group" && r.attributes)
        .map((r) => r.attributes.name),
    };

    let server = null;
    if (serverResult.status === "fulfilled") {
      const { baseUrl, chapter: files } = serverResult.value.data;
      if (baseUrl && files && files.data && files.data.length) {
        server = {
          baseUrl,
          hash: files.hash,
          data: files.data,
          dataSaver: files.dataSaver,
        };
      }
    } else {
      const status = serverResult.reason.response ? serverResult.reason.response.status : 0;
      if (status === 429) return json(429, { error: "MangaDex is rate limiting, try again shortly" });
      console.error("MangaDex image server lookup failed:", status || serverResult.reason.message);
    }

    return json(200, { chapter, server });
  } catch (error) {
    const status = error.response ? error.response.status : 0;
    console.error("MangaDex chapter failed:", status || error.message);
    if (status === 404) return json(404, { error: "Chapter not found" });
    if (status === 429) return json(429, { error: "MangaDex is rate limiting, try again shortly" });
    return json(502, { error: "MangaDex didn't answer" });
  }
};

module.exports = { handler };
