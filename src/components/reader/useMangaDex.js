import React from "react";
import { fetchChapters, lookupManga } from "./mangadex";

// Looks the manga up on MangaDex (or takes the result the details page
// already found). Returns { status: "loading" | "ready" | "error", result, retry }.
export function useLookup(manga, known) {
  const [state, setState] = React.useState(() =>
    known ? { status: "ready", result: known } : { status: "loading", result: null },
  );
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (known || !manga) return;
    let cancelled = false;
    setState({ status: "loading", result: null });
    lookupManga(manga)
      .then((result) => !cancelled && setState({ status: "ready", result }))
      .catch((error) => {
        if (cancelled) return;
        console.error("MangaDex lookup failed:", error);
        setState({ status: "error", result: null });
      });
    return () => {
      cancelled = true;
    };
  }, [manga, known, reloadKey]);

  return { ...state, retry: () => setReloadKey((k) => k + 1) };
}

// The chapters of one language. { status, chapters, truncated, retry }
export function useChapters(mangaId, language, nsfw) {
  const [state, setState] = React.useState({ key: null, status: "loading", data: null });
  const [reloadKey, setReloadKey] = React.useState(0);
  const key = `${mangaId}|${language}|${nsfw}`;

  React.useEffect(() => {
    if (!mangaId) return;
    let cancelled = false;
    setState({ key, status: "loading", data: null });
    fetchChapters(mangaId, language, nsfw)
      .then((data) => !cancelled && setState({ key, status: "ready", data }))
      .catch((error) => {
        if (cancelled) return;
        console.error("MangaDex chapters failed:", error);
        setState({ key, status: "error", data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [key, mangaId, language, nsfw, reloadKey]);

  const current = state.key === key ? state : { status: "loading", data: null };
  return {
    status: current.status,
    chapters: current.data ? current.data.chapters : [],
    truncated: Boolean(current.data && current.data.truncated),
    retry: () => setReloadKey((k) => k + 1),
  };
}
