// The app's one rule for "is this title NSFW?":
// - anime: rated Rx (hentai), or tagged Hentai / Erotica
// - manga: tagged Hentai / Erotica (manga have no age rating)
// R+ (mild nudity) and Ecchi titles are not NSFW here.
//
// Tenrai's own `&sfw` flag is NOT used: it also hides every R+ title (Berserk,
// Akira, Code Geass...). API lists use SFW_QUERY instead, and `withoutNsfw`
// catches the handful of Rx titles that aren't tagged Hentai.
const EXPLICIT_GENRE_IDS = [12, 49]; // Hentai, Erotica
const EXPLICIT_GENRES = new Set(EXPLICIT_GENRE_IDS);

export function isNsfw(item, type) {
  if (!item) return false;
  const genres = [...(item.genres || []), ...(item.explicit_genres || [])];
  if (genres.some((genre) => EXPLICIT_GENRES.has(genre.mal_id))) {
    return true;
  }
  if (type === "anime" && typeof item.rating === "string") {
    return /^Rx/.test(item.rating);
  }
  return false;
}

// Query string to add to Tenrai list/search requests while NSFW is off.
export const SFW_QUERY = `&genres_exclude=${EXPLICIT_GENRE_IDS.join(",")}`;

// The navbar switch's saved value (App's `allowNSFW` state mirrors it).
export function nsfwAllowed() {
  try {
    // eslint-disable-next-line eqeqeq
    return sessionStorage.getItem("sfw") == 1;
  } catch (error) {
    return false;
  }
}

export const sfwQuery = (allowNSFW = nsfwAllowed()) => (allowNSFW ? "" : SFW_QUERY);

// Drops NSFW items from an API list while NSFW is off.
export const withoutNsfw = (items, type, allowNSFW = nsfwAllowed()) =>
  allowNSFW ? items || [] : (items || []).filter((item) => !isNsfw(item, type));

// the landing page a user is sent to when an NSFW title is hidden
export const homeFor = (type) => (type === "manga" ? "/manga" : "/");
