import React from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faXmark } from "@fortawesome/free-solid-svg-icons";
import { API_URL, apiClient } from "../../config/api";
import useUrlParams, { parsePage } from "../../hooks/useUrlParams";
import LoadError from "../plugins/LoadError";
import SearchBox from "./SearchBox";
import { SORT_OPTIONS, TYPE_OPTIONS, itemFacts } from "./searchUtils";
import { sfwQuery, withoutNsfw } from "../../utils/nsfw";

const PER_PAGE = 20;

// genre/theme/demographic names, fetched once per section per session
const genreNameCache = {};
function useGenreName(type, genreId) {
  const [names, setNames] = React.useState(genreNameCache[type] || null);
  React.useEffect(() => {
    if (!genreId || genreNameCache[type]) {
      if (genreNameCache[type]) setNames(genreNameCache[type]);
      return;
    }
    let cancelled = false;
    apiClient
      .get(`${API_URL}/genres/${type}`)
      .then((response) => {
        const map = {};
        (response.data.data || []).forEach((g) => {
          map[g.mal_id] = g.name;
        });
        genreNameCache[type] = map;
        if (!cancelled) setNames(map);
      })
      .catch((error) => console.error("Error loading genres:", error));
    return () => {
      cancelled = true;
    };
  }, [type, genreId]);
  return genreId && names ? names[genreId] || null : null;
}

// MAL synopses often end with a credit line like "[Written by MAL Rewrite]"
const cleanSynopsis = (text) =>
  (text || "").replace(/\s*\[Written by[^\]]*\]\s*$/i, "").trim();

function ResultRow({ item, type }) {
  const facts = itemFacts(item, type);
  const english =
    item.title_english && item.title_english !== item.title
      ? item.title_english
      : null;
  const genres = (item.genres || []).slice(0, 3).map((g) => g.name);
  const synopsis = cleanSynopsis(item.synopsis);

  return (
    <li className="result">
      <img
        className="result__cover"
        src={item.images.jpg.image_url}
        alt=""
        width="96"
        height="136"
        loading="lazy"
      />
      <div className="result__body">
        <h2 className="result__title">
          {/* stretched link: the whole row is clickable, but only the title is
              announced as the link */}
          <Link to={`/${type}/${item.mal_id}`} className="stretched-link">
            {item.title}
          </Link>
        </h2>
        {english ? <p className="result__english">{english}</p> : null}
        <p className="search__facts result__facts">
          {facts.map((fact) => (
            <span key={fact}>{fact}</span>
          ))}
          {item.status ? <span>{item.status}</span> : null}
        </p>
        <p className="result__meta">
          {item.score ? (
            <span className="result__score">
              <FontAwesomeIcon icon={faStar} aria-hidden="true" />
              <span className="visually-hidden">Score </span>
              {item.score.toFixed(2)}
            </span>
          ) : (
            <span className="result__score result__score--none">No score yet</span>
          )}
          {genres.length ? (
            <span className="result__genres">{genres.join(", ")}</span>
          ) : null}
        </p>
        {synopsis ? <p className="result__synopsis">{synopsis}</p> : null}
      </div>
    </li>
  );
}

function SkeletonRows() {
  return (
    <ol className="results" aria-busy="true">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index} className="result result--skeleton">
          <span className="result__cover" />
          <span className="result__body">
            <span className="skeleton-line skeleton-line--title" />
            <span className="skeleton-line skeleton-line--short" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
          </span>
        </li>
      ))}
    </ol>
  );
}

// Rendered at /anime/search and /manga/search with ?q=...&type=...&sort=...&page=...
function SearchResults({ type, isDarkMode, allowNSFW }) {
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("q") || "").trim();
  // genre / theme / demographic id, from the chips on details pages
  const genreParam = searchParams.get("genre");
  const genreId = /^\d+$/.test(genreParam || "") ? genreParam : null;
  const genreName = useGenreName(type, genreId);
  const [urlParams, updateUrlParams] = useUrlParams({
    type: "",
    sort: "popular",
    page: "1",
  });
  const typeOptions = TYPE_OPTIONS[type];
  const typeFilter = typeOptions.some((o) => o.value === urlParams.type)
    ? urlParams.type
    : "";
  const sort =
    SORT_OPTIONS.find((o) => o.value === urlParams.sort) || SORT_OPTIONS[0];
  const page = parsePage(urlParams.page);

  const [results, setResults] = React.useState([]);
  const [pagination, setPagination] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!searchQuery && !genreId) return;

    // ignore results for a search/page the user already moved away from
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    apiClient
      .get(
        `${API_URL}/${type}?q=${encodeURIComponent(searchQuery)}` +
          `${genreId ? `&genres=${genreId}` : ""}` +
          `&page=${page}&limit=${PER_PAGE}${sort.params}` +
          `${typeFilter ? `&type=${typeFilter}` : ""}${sfwQuery(allowNSFW)}`,
      )
      .then((response) => {
        if (cancelled) return;
        setResults(withoutNsfw(response.data.data, type, allowNSFW));
        setPagination(response.data.pagination || null);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error fetching search results:", error);
        setLoading(false);
        setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, genreId, type, page, sort.params, typeFilter, allowNSFW, reloadKey]);

  // nothing to search for - go to that section's home
  if (!searchQuery && !genreId) {
    return <Navigate to={type === "manga" ? "/manga" : "/"} replace />;
  }

  const otherType = type === "anime" ? "manga" : "anime";
  const total = pagination && pagination.items ? pagination.items.total : 0;
  const lastPage = (pagination && pagination.last_visible_page) || 1;

  const pageUrl = (target) => {
    const next = new URLSearchParams(searchParams);
    if (target > 1) next.set("page", String(target));
    else next.delete("page");
    return `?${next.toString()}`;
  };
  const scrollToTop = () => window.scrollTo(0, 0);

  let content;
  if (loading) {
    content = <SkeletonRows />;
  } else if (loadError) {
    content = (
      <LoadError
        isDarkMode={isDarkMode}
        message="Couldn't load search results."
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    );
  } else if (results.length === 0) {
    content = (
      <div className="search-page__empty">
        <p>
          No {type} found
          {searchQuery ? ` for “${searchQuery}”` : ""}
          {genreId && genreName ? ` in ${genreName}` : ""}
          {typeFilter
            ? ` with type ${typeOptions.find((o) => o.value === typeFilter).label}`
            : ""}
          .
        </p>
        {searchQuery ? (
          <p>
            Check the spelling, try the English or Japanese title
            {typeFilter ? (
              <>
                ,{" "}
                <button
                  type="button"
                  className="search-page__text-button"
                  onClick={() => updateUrlParams({ type: null, page: null })}
                >
                  search all types
                </button>
              </>
            ) : null}
            , or{" "}
            <Link to={`/${otherType}/search?q=${encodeURIComponent(searchQuery)}`}>
              search {otherType} instead
            </Link>
            .
          </p>
        ) : typeFilter ? (
          <p>
            <button
              type="button"
              className="search-page__text-button"
              onClick={() => updateUrlParams({ type: null, page: null })}
            >
              Show all types
            </button>
          </p>
        ) : null}
      </div>
    );
  } else {
    content = (
      <ol className="results" start={(page - 1) * PER_PAGE + 1}>
        {results.map((item) => (
          <ResultRow key={item.mal_id} item={item} type={type} />
        ))}
      </ol>
    );
  }

  return (
    <div className="search-page">
      <SearchBox type={type} initialQuery={searchQuery} variant="bar" />

      <div className="search-page__header">
        <h1 className="search-page__title">
          {genreId
            ? `${genreName || "Genre"} ${type}${
                searchQuery ? ` matching “${searchQuery}”` : ""
              }`
            : `${type === "anime" ? "Anime" : "Manga"} results for “${searchQuery}”`}
        </h1>
        <p className="search-page__count" role="status">
          {loading
            ? "Searching…"
            : loadError
              ? ""
              : `${total} ${total === 1 ? "title" : "titles"}${
                  lastPage > 1 ? `, page ${page} of ${lastPage}` : ""
                }`}
        </p>
      </div>

      {genreId ? (
        <div className="search-page__active-filters">
          <Link
            className="search-page__chip"
            to={
              searchQuery
                ? `/${type}/search?q=${encodeURIComponent(searchQuery)}`
                : type === "manga"
                  ? "/manga"
                  : "/"
            }
            aria-label={`Remove genre filter ${genreName || ""}`}
          >
            {genreName || "Genre"}
            <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
          </Link>
        </div>
      ) : null}

      <div className="search-page__filters">
        <label className="search-page__filter">
          <span>Type</span>
          <select
            value={typeFilter}
            onChange={(event) =>
              updateUrlParams({ type: event.target.value || null, page: null })
            }
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="search-page__filter">
          <span>Sort by</span>
          <select
            value={sort.value}
            onChange={(event) =>
              updateUrlParams({ sort: event.target.value, page: null })
            }
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {content}

      {!loading && !loadError && lastPage > 1 ? (
        <nav className="search-page__pages" aria-label="Search result pages">
          {page > 1 ? (
            <Link to={pageUrl(page - 1)} onClick={scrollToTop} rel="prev">
              Previous
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          <span className="search-page__page-number">
            Page {page} of {lastPage}
          </span>
          {pagination && pagination.has_next_page ? (
            <Link to={pageUrl(page + 1)} onClick={scrollToTop} rel="next">
              Next
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      ) : null}
    </div>
  );
}

export default SearchResults;
