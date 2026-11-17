import React from "react";
import CoverCard from "../plugins/CoverCard";
import LoadError from "../plugins/LoadError";
import { API_URL, apiClient } from "../../config/api";
import useUrlParams, { parsePage } from "../../hooks/useUrlParams";
import { sfwQuery, withoutNsfw } from "../../utils/nsfw";
import Pager from "../landing/Pager";
import { CoverSkeletons } from "../landing/LandingSection";

const PER_PAGE = 24;

export const TYPE_OPTIONS = [
  { value: "all", label: "All", query: "" },
  { value: "tv", label: "TV", query: "&type=tv" },
  { value: "movie", label: "Movies", query: "&type=movie" },
  { value: "ona", label: "ONA", query: "&type=ona" },
  { value: "ova", label: "OVA", query: "&type=ova" },
  { value: "other", label: "Specials", query: "&type=special" },
];

export const SORT_OPTIONS = [
  { value: "start_date", label: "Newest", query: "&order_by=start_date&sort=desc" },
  { value: "members", label: "Most popular", query: "&order_by=members&sort=desc" },
  { value: "score", label: "Highest rated", query: "&order_by=score&sort=desc" },
  // was sorted descending (Z to A) before
  { value: "title", label: "Title (A–Z)", query: "&order_by=title&sort=asc" },
];

// What this studio did for the given anime: animation studio, licensor or
// producer (in that order of precedence).
function studioRole(anime, studioId) {
  const has = (list) => (list || []).some((item) => String(item.mal_id) === String(studioId));
  if (has(anime.studios)) return "Studio";
  if (has(anime.licensors)) return "Licensor";
  if (has(anime.producers)) return "Producer";
  return null;
}

// Every anime the studio is credited on, filterable by type and sortable,
// with the same pager as the Top lists. All of it lives in the URL.
function StudioWorks({ studioId, allowNSFW, isDarkMode }) {
  const [params, updateUrlParams] = useUrlParams({ type: "all", sort: "start_date", page: "1" });
  const typeOption = TYPE_OPTIONS.find((o) => o.value === params.type) || TYPE_OPTIONS[0];
  const sortOption = SORT_OPTIONS.find((o) => o.value === params.sort) || SORT_OPTIONS[0];
  const page = parsePage(params.page);

  const [state, setState] = React.useState({ items: [], pagination: null, status: "loading" });
  const [reloadKey, setReloadKey] = React.useState(0);
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, status: "loading" }));
    apiClient
      .get(
        `${API_URL}/anime?producers=${studioId}${typeOption.query}${sortOption.query}` +
          `&limit=${PER_PAGE}&page=${page}${sfwQuery(allowNSFW)}`,
      )
      .then((response) => {
        if (cancelled) return;
        setState({
          items: withoutNsfw(response.data.data, "anime", allowNSFW),
          pagination: response.data.pagination || null,
          status: "ready",
        });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error loading studio works:", error);
        setState({ items: [], pagination: null, status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [studioId, typeOption.query, sortOption.query, page, allowNSFW, reloadKey]);

  const goToPage = (target) => {
    updateUrlParams({ page: target > 1 ? target : null });
    if (sectionRef.current) sectionRef.current.scrollIntoView({ block: "start" });
  };

  const total = state.pagination && state.pagination.items ? state.pagination.items.total : null;
  const lastPage = (state.pagination && state.pagination.last_visible_page) || 1;

  let body;
  if (state.status === "error") {
    body = (
      <LoadError
        isDarkMode={isDarkMode}
        message="Couldn't load these works right now."
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    );
  } else if (state.status === "loading") {
    body = <CoverSkeletons count={12} className="cover-grid entity-works__grid" />;
  } else if (!state.items.length) {
    body = <p className="details-muted">No {typeOption.value === "all" ? "" : `${typeOption.label} `}works listed.</p>;
  } else {
    body = (
      <>
        <ul className="cover-grid entity-works__grid">
          {state.items.map((anime) => {
            const role = studioRole(anime, studioId);
            const year = anime.aired && anime.aired.prop && anime.aired.prop.from && anime.aired.prop.from.year;
            return (
              <CoverCard
                key={anime.mal_id}
                to={`/anime/${anime.mal_id}`}
                image={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                title={anime.title}
                subtitle={role && role !== "Studio" ? `As ${role.toLowerCase()}` : null}
                meta={
                  <>
                    {typeof anime.score === "number" ? <span>★ {anime.score.toFixed(2)}</span> : null}
                    {anime.type ? <span>{anime.type}</span> : null}
                    {year ? <span>{year}</span> : null}
                  </>
                }
              />
            );
          })}
        </ul>
        {lastPage > 1 ? (
          <Pager
            id="studio-page"
            label="Studio works pages"
            page={page}
            lastPage={lastPage}
            hasNext={Boolean(state.pagination && state.pagination.has_next_page)}
            onPage={goToPage}
          />
        ) : null}
      </>
    );
  }

  return (
    <section className="entity-works" aria-labelledby="studio-works-heading" ref={sectionRef}>
      <div className="entity-works__header">
        <h2 className="details-heading" id="studio-works-heading">
          All works
        </h2>
        {total !== null && state.status === "ready" ? (
          <span className="details-muted entity-works__total">
            {fullCount(total)} {total === 1 ? "title" : "titles"}
          </span>
        ) : null}
      </div>
      <div className="entity-works__bar">
        <div className="landing-tabs" role="group" aria-label="Type">
          {TYPE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className="landing-tabs__button"
              aria-pressed={o.value === typeOption.value}
              onClick={() => updateUrlParams({ type: o.value, page: null })}
            >
              {o.label}
            </button>
          ))}
        </div>
        <label className="search-page__filter">
          <span>Sort by</span>
          <select
            value={sortOption.value}
            onChange={(event) => updateUrlParams({ sort: event.target.value, page: null })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {body}
    </section>
  );
}

const fullCount = (n) => new Intl.NumberFormat("en").format(n);

export default StudioWorks;
