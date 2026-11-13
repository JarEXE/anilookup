// Shared bits for the search box and the search results page.

export const SORT_OPTIONS = [
  { value: "popular", label: "Most popular", params: "&order_by=members&sort=desc" },
  { value: "relevance", label: "Best match", params: "" },
  { value: "score", label: "Highest rated", params: "&order_by=score&sort=desc" },
  { value: "newest", label: "Newest", params: "&order_by=start_date&sort=desc" },
];

export const TYPE_OPTIONS = {
  anime: [
    { value: "", label: "All types" },
    { value: "tv", label: "TV" },
    { value: "movie", label: "Movie" },
    { value: "ova", label: "OVA" },
    { value: "ona", label: "ONA" },
    { value: "special", label: "Special" },
    { value: "tv_special", label: "TV Special" },
    { value: "music", label: "Music" },
  ],
  manga: [
    { value: "", label: "All types" },
    { value: "manga", label: "Manga" },
    { value: "manhwa", label: "Manhwa" },
    { value: "manhua", label: "Manhua" },
    { value: "novel", label: "Novel" },
    { value: "lightnovel", label: "Light Novel" },
    { value: "oneshot", label: "One-shot" },
  ],
};


export function releaseYear(item) {
  if (item.year) return item.year;
  const dates = item.aired || item.published;
  return (dates && dates.prop && dates.prop.from && dates.prop.from.year) || null;
}

// Short facts shown under a title, e.g. ["TV", "220 episodes", "2002"].
export function itemFacts(item, type) {
  const facts = [];
  if (item.type) facts.push(item.type);
  if (type === "anime") {
    if (item.episodes) {
      facts.push(`${item.episodes} ${item.episodes === 1 ? "episode" : "episodes"}`);
    }
  } else if (item.chapters) {
    facts.push(`${item.chapters} ${item.chapters === 1 ? "chapter" : "chapters"}`);
  } else if (item.volumes) {
    facts.push(`${item.volumes} ${item.volumes === 1 ? "volume" : "volumes"}`);
  }
  const year = releaseYear(item);
  if (year) facts.push(String(year));
  return facts;
}

// All the names a title is known by, main title first.
export function allTitles(item) {
  const titles = [item.title, item.title_english];
  (item.titles || []).forEach((t) => titles.push(t.title));
  (item.title_synonyms || []).forEach((t) => titles.push(t));
  return [...new Set(titles.filter(Boolean))];
}

// The best inline completion for what the user typed: the first suggestion
// (they're ordered by popularity) with a name that starts with the query.
// Returns the full name, or null when nothing starts with the query.
export function bestCompletion(query, suggestions) {
  const typed = query.trimStart();
  if (typed.length < 2) return null;
  const lower = typed.toLowerCase();

  for (const item of suggestions) {
    const match = allTitles(item).find(
      (title) =>
        title.toLowerCase().startsWith(lower) && title.length > typed.length,
    );
    if (match) return match;
  }
  return null;
}
