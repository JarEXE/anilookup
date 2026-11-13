import React from "react";
import { API_URL, apiFetch } from "../../config/api";

// responses kept for the page session, so switching tabs or coming back to a
// title doesn't refetch (and stays well under the API rate limit)
const cache = new Map();

// Fetches `${API_URL}${path}` once `enabled` is true.
// Returns { data, status: "idle" | "loading" | "ready" | "error", retry }.
export default function useApiResource(path, enabled = true) {
  const [state, setState] = React.useState(() =>
    cache.has(path)
      ? { data: cache.get(path), status: "ready" }
      : { data: null, status: "idle" },
  );
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!enabled || !path) return;
    if (cache.has(path)) {
      setState({ data: cache.get(path), status: "ready" });
      return;
    }

    let cancelled = false;
    setState({ data: null, status: "loading" });

    apiFetch(`${API_URL}${path}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((json) => {
        cache.set(path, json.data);
        if (!cancelled) setState({ data: json.data, status: "ready" });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(`Error loading ${path}:`, error);
        setState({ data: null, status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [path, enabled, reloadKey]);

  const retry = React.useCallback(() => setReloadKey((key) => key + 1), []);
  return { ...state, retry };
}

// ---------- episodes (paged: 100 per page) ----------

const MAX_EPISODE_PAGES = 10; // first 1000 episodes; plenty for nearly every show
const episodeCache = new Map();

// Loads episode pages one after another, updating as each page arrives.
// Shared by the Stats and Episodes tabs through the cache.
export function useEpisodes(animeId, enabled) {
  const cached = episodeCache.get(animeId);
  const [state, setState] = React.useState(
    cached || { episodes: [], lastPage: null, done: false, error: false },
  );
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) return;
    const existing = episodeCache.get(animeId);
    if (existing && existing.done) {
      setState(existing);
      return;
    }

    let cancelled = false;

    (async () => {
      let episodes = [];
      let lastPage = null;
      try {
        for (let page = 1; page <= MAX_EPISODE_PAGES; page++) {
          const response = await apiFetch(
            `${API_URL}/anime/${animeId}/episodes?page=${page}`,
          );
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const json = await response.json();
          if (cancelled) return;
          episodes = episodes.concat(json.data || []);
          lastPage = (json.pagination && json.pagination.last_visible_page) || 1;
          const done = !(json.pagination && json.pagination.has_next_page);
          const next = {
            episodes,
            lastPage,
            done: done || page === MAX_EPISODE_PAGES,
            truncated: !done && page === MAX_EPISODE_PAGES,
            error: false,
          };
          setState(next);
          if (next.done) {
            episodeCache.set(animeId, next);
            break;
          }
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading episodes:", error);
        setState({ episodes, lastPage, done: true, error: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [animeId, enabled, reloadKey]);

  const retry = React.useCallback(() => setReloadKey((key) => key + 1), []);
  return { ...state, retry };
}

// Fires once when the element scrolls near the viewport.
export function useNearViewport(ref, rootMargin = "300px") {
  const [near, setNear] = React.useState(false);
  React.useEffect(() => {
    if (near || !ref.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, near, rootMargin]);
  return near;
}
