import React from "react";
import { API_URL, apiClient } from "../../config/api";
import { sfwQuery, withoutNsfw } from "../../utils/nsfw";

const DEBOUNCE_MS = 300;
const MIN_LENGTH = 2;
const LIMIT = 6;

// query results cached for the page session, so typing back over the same
// text (or switching sections) doesn't refetch
const cache = new Map();

// Debounced title suggestions for the search box, most popular first.
// Returns { suggestions, status } with status "idle" | "loading" | "ready" |
// "error".
export default function useSuggestions(type, query) {
  const trimmed = query.trim();
  const key = `${type}|${sfwQuery()}|${trimmed.toLowerCase()}`;
  const cached = cache.get(key);

  const [state, setState] = React.useState({ key: null, suggestions: [], status: "idle" });
  // last successful list, kept on screen while the next query loads so the
  // dropdown doesn't flicker empty on every keystroke
  const lastReady = React.useRef([]);

  React.useEffect(() => {
    if (trimmed.length < MIN_LENGTH || cache.has(key)) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    // wait until typing pauses (also keeps us well under the API rate limit)
    const timer = setTimeout(() => {
      setState({ key, suggestions: [], status: "loading" });

      apiClient
        .get(
          `${API_URL}/${type}?q=${encodeURIComponent(trimmed)}&limit=${LIMIT}` +
            `&order_by=members&sort=desc${sfwQuery()}`,
          { signal: controller.signal },
        )
        .then((response) => {
          const suggestions = withoutNsfw(response.data.data, type);
          cache.set(key, suggestions);
          if (!cancelled) setState({ key, suggestions, status: "ready" });
        })
        .catch((error) => {
          if (cancelled) return;
          console.error("Error fetching suggestions:", error);
          setState({ key, suggestions: [], status: "error" });
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, trimmed, type]);

  if (trimmed.length < MIN_LENGTH) {
    lastReady.current = [];
    return { suggestions: [], status: "idle" };
  }
  if (cached) {
    lastReady.current = cached;
    return { suggestions: cached, status: "ready" };
  }
  if (state.key === key && state.status === "error") {
    return { suggestions: [], status: "error" };
  }
  // typing / waiting for the API: keep showing the previous results
  return { suggestions: lastReady.current, status: "loading" };
}
