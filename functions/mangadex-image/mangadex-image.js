// One chapter page image from MangaDex, passed through.
//
// GET ?src=https://<node>.mangadex.network/data/<hash>/<file>
//
// MangaDex's image servers don't serve other websites' readers: a browser
// request from another site gets a "read this on MangaDex" picture (or a
// 404) instead of the page. Requests from here get the real image.
//
// One image per call keeps every response far below Netlify's ~6 MB limit
// (the old proxy sent a whole chapter at once). Images that would still be
// too big are refused with 413, and the reader falls back to the smaller
// data-saver copy of that page.
const axios = require("axios");

// base64 grows the body by a third; stay under Netlify's 6 MB response cap
const MAX_BYTES = 4.2 * 1024 * 1024;
const FALLBACK_HOST = "https://uploads.mangadex.org";
const PATH = /^\/(data|data-saver)\/[0-9a-f]{32}\/[\w.-]{1,200}$/i;

const error = (statusCode, message) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify({ error: message }),
});

// only MangaDex's own image hosts, only image paths
function parseSource(src) {
  let url;
  try {
    url = new URL(src);
  } catch (e) {
    return null;
  }
  const hostOk =
    url.protocol === "https:" &&
    (url.hostname.endsWith(".mangadex.network") || url.hostname === "uploads.mangadex.org");
  return hostOk && PATH.test(url.pathname) ? url : null;
}

const get = (url) =>
  axios.get(url, {
    responseType: "arraybuffer",
    timeout: 8000,
    maxContentLength: MAX_BYTES * 2,
    headers: { "User-Agent": "AniLookup/1.0" },
    validateStatus: () => true,
  });

const handler = async function (event) {
  const src = (event.queryStringParameters || {}).src;
  const url = parseSource(src);
  if (!url) return error(400, "Not a MangaDex image");

  try {
    let response = await get(url.toString());
    // a busy or broken image node: MangaDex's own host has every image too
    if (response.status !== 200 && url.hostname !== "uploads.mangadex.org") {
      console.warn(`Image node answered ${response.status}, trying ${FALLBACK_HOST}`);
      response = await get(`${FALLBACK_HOST}${url.pathname}`);
    }
    if (response.status !== 200) return error(response.status === 404 ? 404 : 502, "Image unavailable");

    const body = Buffer.from(response.data);
    if (body.length > MAX_BYTES) return error(413, "Image too large, use the data-saver copy");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": response.headers["content-type"] || "image/jpeg",
        // a page's address includes its hash, so it never changes
        "Cache-Control": "public, max-age=604800, immutable",
      },
      body: body.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (e) {
    console.error("MangaDex image failed:", e.message);
    return error(502, "MangaDex didn't answer");
  }
};

module.exports = { handler };
