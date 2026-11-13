import React from "react";
import { API_URL, apiClient } from "../config/api";
import { isNsfw } from "../utils/nsfw";

// Some lists (recommendations, related works, an author's works) only give an
// id, title and cover, which isn't enough to tell whether a title is NSFW.
// While NSFW content is off, this looks the ids up in batches with Tenrai's
// `?ids=` search and remembers each verdict for the rest of the session, so
// toggling back and forth doesn't refetch.
const verdicts = { anime: new Map(), manga: new Map() }; // id -> true if NSFW
const BATCH_SIZE = 25;

async function classify(type, ids) {
  for (let start = 0; start < ids.length; start += BATCH_SIZE) {
    const batch = ids.slice(start, start + BATCH_SIZE);
    const response = await apiClient.get(
      `${API_URL}/${type}?ids=${batch.join(",")}&limit=${BATCH_SIZE}`,
    );
    const found = new Set();
    (response.data.data || []).forEach((item) => {
      found.add(item.mal_id);
      verdicts[type].set(item.mal_id, isNsfw(item, type));
    });
    // ids the API no longer knows (removed entries) can't be NSFW-checked;
    // they're ordinary dead links, so keep them visible
    batch.forEach((id) => {
      if (!found.has(id)) verdicts[type].set(id, false);
    });
  }
}

// Returns { isHidden(id), pending, failed }.
// - allowNSFW: nothing is hidden and nothing is fetched.
// - otherwise: titles are hidden until they're confirmed safe, so nothing
//   NSFW flashes on screen while the check runs (or if it fails).
export default function useNsfwFilter(type, ids, allowNSFW) {
  const idKey = (ids || []).join(",");
  // bumped when a batch of verdicts arrives, to re-render with them
  const [, setVersion] = React.useState(0);
  const [failedKey, setFailedKey] = React.useState(null);
  const failed = !allowNSFW && failedKey === `${type}|${idKey}`;

  const needsCheck =
    !allowNSFW &&
    (ids || []).some((id) => !verdicts[type].has(id));

  React.useEffect(() => {
    if (!needsCheck) return;
    let cancelled = false;
    const unknown = idKey
      .split(",")
      .map(Number)
      .filter((id) => !verdicts[type].has(id));
    classify(type, unknown)
      .then(() => {
        if (!cancelled) setVersion((v) => v + 1);
      })
      .catch((error) => {
        console.error("Error checking titles for NSFW content:", error);
        if (!cancelled) setFailedKey(`${type}|${idKey}`);
      });
    return () => {
      cancelled = true;
    };
  }, [type, idKey, needsCheck]);

  const isHidden = (id) => !allowNSFW && verdicts[type].get(id) !== false;

  return { isHidden, pending: needsCheck && !failed, failed };
}
