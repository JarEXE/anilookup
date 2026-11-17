import React from "react";
import { API_URL, apiClient } from "../config/api";

// Full records (score, members, year, genres, rating...) for a list of anime
// or manga ids, looked up 100 at a time with Tenrai's `?ids=` search and kept
// for the session. Used where an endpoint only gives id/title/cover, such as a
// person's works.
const cache = { anime: new Map(), manga: new Map() };
const BATCH = 100;
const MAX_IDS = 600; // at most 6 requests for very prolific people

export default function useTitleInfo(type, ids) {
  const idKey = (ids || []).slice(0, MAX_IDS).join(",");
  // bumped as each batch arrives; include it in memo deps that use `get`
  const [version, setVersion] = React.useState(0);
  const [status, setStatus] = React.useState("idle");

  React.useEffect(() => {
    if (!idKey) {
      setStatus("ready");
      return;
    }
    const missing = idKey
      .split(",")
      .map(Number)
      .filter((id) => !cache[type].has(id));
    if (!missing.length) {
      setStatus("ready");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        for (let start = 0; start < missing.length; start += BATCH) {
          const batch = missing.slice(start, start + BATCH);
          const response = await apiClient.get(
            `${API_URL}/${type}?ids=${batch.join(",")}&limit=${BATCH}`,
          );
          const found = new Set();
          (response.data.data || []).forEach((item) => {
            found.add(item.mal_id);
            cache[type].set(item.mal_id, item);
          });
          // removed entries: remember they have no record
          batch.forEach((id) => !found.has(id) && cache[type].set(id, null));
          if (!cancelled) setVersion((v) => v + 1);
        }
        if (!cancelled) setStatus("ready");
      } catch (error) {
        console.error(`Error looking up ${type} details:`, error);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, idKey]);

  // id -> record (null when the API has none, undefined while unknown)
  const get = React.useCallback((id) => cache[type].get(id), [type]);
  return { get, status, version };
}
