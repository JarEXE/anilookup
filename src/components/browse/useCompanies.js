import React from "react";
import { API_URL, apiFetch } from "../../config/api";

const PER_PAGE = 24;
// pages kept for the session, so "Show more" and coming back are free
const cache = new Map();

async function getPage(path) {
  if (cache.has(path)) return cache.get(path);
  const response = await apiFetch(`${API_URL}${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  cache.set(path, json);
  return json;
}

// Studios & producers (anime) or magazines (manga), optionally matching a
// name, PER_PAGE at a time. `order` is the API's order_by.
//
// Returns { items, total, hasNext, status, loadMore, retry }.
export default function useCompanies(type, query, order) {
  const key = `${type}|${query}|${order}`;
  const [shown, setShown] = React.useState({ key, pages: 1 });
  const pages = shown.key === key ? shown.pages : 1;
  const [state, setState] = React.useState({ key: null, items: [], total: null, hasNext: false, status: "loading" });
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    // keep what is already shown while the next page loads; a new search or
    // order starts empty
    setState((s) =>
      s.key === key
        ? { ...s, status: "loading" }
        : { key, items: [], total: null, hasNext: false, status: "loading" },
    );

    const endpoint = type === "anime" ? "producers" : "magazines";
    const direction = order === "name" ? "asc" : "desc";
    const q = query ? `&q=${encodeURIComponent(query)}` : "";

    (async () => {
      try {
        const items = [];
        let pagination = null;
        // earlier pages come from the cache
        for (let page = 1; page <= pages; page++) {
          const json = await getPage(
            `/${endpoint}?order_by=${order}&sort=${direction}&limit=${PER_PAGE}&page=${page}${q}`,
          );
          if (cancelled) return;
          items.push(...(json.data || []));
          pagination = json.pagination;
        }
        setState({
          key,
          items,
          total: pagination && pagination.items ? pagination.items.total : items.length,
          hasNext: Boolean(pagination && pagination.has_next_page),
          status: "ready",
        });
      } catch (error) {
        if (cancelled) return;
        console.error(`Error loading ${endpoint}:`, error);
        setState((s) => ({ ...s, key, status: "error" }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, type, query, order, pages, reloadKey]);

  const loadMore = () => setShown({ key, pages: pages + 1 });
  const retry = () => setReloadKey((k) => k + 1);
  const current = state.key === key ? state : { items: [], total: null, hasNext: false, status: "loading" };
  return { ...current, loadMore, retry };
}

// the name a producer goes by ("Default" title), or a magazine's name
export function companyName(company) {
  if (company.name) return company.name;
  const titles = company.titles || [];
  const main = titles.find((t) => t.type === "Default") || titles[0];
  return main ? main.title : "Unknown";
}
