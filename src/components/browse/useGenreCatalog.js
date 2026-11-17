import React from "react";
import useApiResource from "../details/useApiResource";
import { isNsfwGenre } from "../../utils/nsfw";

// MAL's tag groups, in MAL's order. All of them are "genres" to the API, so
// any of them can be passed as ?genres= when searching.
export const GENRE_GROUPS = [
  { key: "genres", label: "Genres" },
  { key: "themes", label: "Themes" },
  { key: "demographics", label: "Demographics" },
  { key: "explicit_genres", label: "Explicit genres" },
];

// Every genre, theme, demographic and explicit genre for anime or manga,
// grouped. Each group is one request, cached for the session (the global
// throttle spaces them out). Hentai and Erotica are left out while NSFW is
// off; Ecchi stays, as everywhere else in the app.
//
// Returns { groups: [{ key, label, items }], nameFor(id), status, retry }.
export default function useGenreCatalog(type, allowNSFW, enabled = true) {
  const genres = useApiResource(`/genres/${type}?filter=genres`, enabled);
  const themes = useApiResource(`/genres/${type}?filter=themes`, enabled);
  const demographics = useApiResource(`/genres/${type}?filter=demographics`, enabled);
  const explicit = useApiResource(`/genres/${type}?filter=explicit_genres`, enabled);
  const resources = [genres, themes, demographics, explicit];

  const status = resources.some((r) => r.status === "error")
    ? "error"
    : resources.every((r) => r.status === "ready")
      ? "ready"
      : "loading";

  const data = resources.map((r) => r.data);
  const groups = React.useMemo(
    () =>
      GENRE_GROUPS.map((group, index) => ({
        ...group,
        items: (data[index] || []).filter((g) => allowNSFW || !isNsfwGenre(g.mal_id)),
      })),
    // the four arrays are stable between renders (cached responses)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowNSFW, ...data],
  );

  // names include the hidden NSFW genres, so a URL naming one still reads right
  const names = React.useMemo(() => {
    const map = new Map();
    data.forEach((list) => (list || []).forEach((g) => map.set(String(g.mal_id), g.name)));
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, data);
  const nameFor = React.useCallback((id) => names.get(String(id)) || null, [names]);

  const retry = () => resources.forEach((r) => r.status === "error" && r.retry());

  return { groups, nameFor, status, retry };
}
