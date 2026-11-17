import React from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faXmark } from "@fortawesome/free-solid-svg-icons";
import { API_URL, apiClient } from "../../config/api";
import useUrlParams, { parsePage } from "../../hooks/useUrlParams";
import LoadError from "../plugins/LoadError";
import { fullNumber } from "../details/format";
import SearchBox from "./SearchBox";
import { SORT_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS, itemFacts } from "./searchUtils";
import { NSFW_GENRE_NAMES, isNsfwGenre, sfwQuery, withoutNsfw } from "../../utils/nsfw";
import useApiResource from "../details/useApiResource";
import useGenreCatalog from "../browse/useGenreCatalog";
import { companyName } from "../browse/useCompanies";

const PER_PAGE = 20;
// more than this many tags at once almost never matches anything
const MAX_GENRES = 6;

// "1,62,1,x" -> ["1", "62"]
const parseIds = (value) =>
  [...new Set((value || "").split(",").filter((id) => /^\d+$/.test(id)))].slice(0, MAX_GENRES);

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


// Rendered at /anime/search and /manga/search with
// ?q=...&genre=1,62&studio=4 (anime)&magazine=83 (manga)&type=...&status=...&sort=...&page=...
// Every filter is optional, but at least one of q / genre / studio / magazine
// is needed.
function SearchResults({ type, isDarkMode, allowNSFW }) {
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("q") || "").trim();
  // genres / themes / demographics, from the browse page or details pages;
  // several at once must all match
  const genreIds = parseIds(searchParams.get("genre"));
  const genreKey = genreIds.join(",");
  // studio or producer id (anime only), from the browse page
  const studioParam = searchParams.get("studio");
  const studioId = type === "anime" && /^\d+$/.test(studioParam || "") ? studioParam : null;
  // magazine id (manga only), from the browse page or "Browse by magazine"
  const magazineParam = searchParams.get("magazine");
  const magazineId =
    type === "manga" && /^\d+$/.test(magazineParam || "") ? magazineParam : null;
  const [urlParams, updateUrlParams] = useUrlParams({
    type: "",
    status: "",
    sort: "popular",
    page: "1",
  });
  const typeOptions = TYPE_OPTIONS[type];
  const typeFilter = typeOptions.some((o) => o.value === urlParams.type)
    ? urlParams.type
    : "";
  const statusOptions = STATUS_OPTIONS[type];
  const statusFilter = statusOptions.some((o) => o.value === urlParams.status)
    ? urlParams.status
    : "";
  // "Best match" only means something when there is text to match
  const sortOptions = SORT_OPTIONS.filter((o) => searchQuery || o.value !== "relevance");
  const sort = sortOptions.find((o) => o.value === urlParams.sort) || sortOptions[0];
  const page = parsePage(urlParams.page);

  const hasFilter = Boolean(searchQuery || genreIds.length || studioId || magazineId);
  // an explicit genre in the URL while NSFW is off: nothing to show
  const blockedGenres = allowNSFW ? [] : genreIds.filter(isNsfwGenre);

  const catalog = useGenreCatalog(type, allowNSFW, hasFilter);
  const studio = useApiResource(studioId ? `/producers/${studioId}` : null);
  const studioName = studioId && studio.data ? companyName(studio.data) : null;

  const [results, setResults] = React.useState([]);
  const [pagination, setPagination] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!hasFilter || blockedGenres.length) return;

    // ignore results for a search/page the user already moved away from
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    apiClient
      .get(
        `${API_URL}/${type}?q=${encodeURIComponent(searchQuery)}` +
          `${genreKey ? `&genres=${genreKey}` : ""}` +
          `${studioId ? `&producers=${studioId}` : ""}` +
          `${magazineId ? `&magazines=${magazineId}` : ""}` +
          `${statusFilter ? `&status=${statusFilter}` : ""}` +
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
    // blockedGenres is derived from genreKey and allowNSFW
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, genreKey, studioId, magazineId, statusFilter, type, page, sort.params, typeFilter, allowNSFW, reloadKey]);

  // The API has no magazine lookup by id, but every result names its
  // magazines, so the name comes from there.
  const magazineName = React.useMemo(() => {
    if (!magazineId) return null;
    for (const item of results) {
      const match = (item.serializations || []).find(
        (mag) => String(mag.mal_id) === magazineId,
      );
      if (match) return match.name;
    }
    return null;
  }, [results, magazineId]);
  const [lastMagazineName, setLastMagazineName] = React.useState(null);
  React.useEffect(() => {
    if (magazineName) setLastMagazineName(magazineName);
  }, [magazineName]);
  const shownMagazineName = magazineName || lastMagazineName;

  // nothing to search for - go to that section's home
  if (!hasFilter) {
    return <Navigate to={type === "manga" ? "/manga" : "/"} replace />;
  }

  const otherType = type === "anime" ? "manga" : "anime";
  const total = pagination && pagination.items ? pagination.items.total : 0;
  const lastPage = (pagination && pagination.last_visible_page) || 1;
  const genreName = (id) => catalog.nameFor(id) || NSFW_GENRE_NAMES[id] || "Genre";

  const pageUrl = (target) => {
    const next = new URLSearchParams(searchParams);
    if (target > 1) next.set("page", String(target));
    else next.delete("page");
    return `?${next.toString()}`;
  };
  const scrollToTop = () => window.scrollTo(0, 0);

  // the same search with one filter changed; with nothing left to search
  // for, the section's home
  const urlWith = (param, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(param, value);
    else next.delete(param);
    next.delete("page");
    const remaining = ["q", "genre", "studio", "magazine"].some((key) => next.get(key));
    if (!remaining) return type === "manga" ? "/manga" : "/";
    return `/${type}/search?${next.toString()}`;
  };
  const withoutGenre = (id) => urlWith("genre", genreIds.filter((g) => g !== id).join(","));

  const addGenre = (id) => {
    if (!id) return;
    updateUrlParams({ genre: [...genreIds, id].join(","), page: null });
  };
  const addable = catalog.groups
    .map((group) => ({ ...group, items: group.items.filter((g) => !genreIds.includes(String(g.mal_id))) }))
    .filter((group) => group.items.length);

  // "Action + Isekai anime by Bones matching “x”"
  const filtered = genreIds.length || studioId || magazineId;
  const heading = filtered
    ? `${genreIds.length ? `${genreIds.map(genreName).join(" + ")} ${type}` : type === "anime" ? "Anime" : "Manga"}${
        studioId ? ` by ${studioName || "this studio"}` : ""
      }${magazineId ? ` from ${shownMagazineName || "this magazine"}` : ""}${
        searchQuery ? ` matching “${searchQuery}”` : ""
      }`
    : `${type === "anime" ? "Anime" : "Manga"} results for “${searchQuery}”`;

  const resetFilters = () => updateUrlParams({ type: null, status: null, page: null });

  let content;
  if (blockedGenres.length) {
    content = (
      <div className="search-page__empty">
        <p>
          {blockedGenres.map(genreName).join(" and ")} {blockedGenres.length === 1 ? "is" : "are"} hidden while
          NSFW content is off.
        </p>
        <p>
          Turn on the 🔞 switch in the menu to see {blockedGenres.length === 1 ? "it" : "them"}, or{" "}
          <Link to={`/${type}/browse`}>browse other genres</Link>.
        </p>
      </div>
    );
  } else if (loading) {
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
    const narrowed = typeFilter || statusFilter;
    content = (
      <div className="search-page__empty">
        <p>
          No {type} found
          {searchQuery ? ` for “${searchQuery}”` : ""}
          {genreIds.length ? ` in ${genreIds.map(genreName).join(" + ")}` : ""}
          {studioId && studioName ? ` by ${studioName}` : ""}
          {magazineId && shownMagazineName ? ` from ${shownMagazineName}` : ""}
          {typeFilter
            ? ` with type ${typeOptions.find((o) => o.value === typeFilter).label}`
            : ""}
          {statusFilter
            ? ` (${statusOptions.find((o) => o.value === statusFilter).label.toLowerCase()})`
            : ""}
          .
        </p>
        {searchQuery ? (
          <p>
            Check the spelling, try the English or Japanese title
            {narrowed ? (
              <>
                ,{" "}
                <button type="button" className="search-page__text-button" onClick={resetFilters}>
                  search all types and statuses
                </button>
              </>
            ) : null}
            , or{" "}
            <Link to={`/${otherType}/search?q=${encodeURIComponent(searchQuery)}`}>
              search {otherType} instead
            </Link>
            .
          </p>
        ) : narrowed ? (
          <p>
            <button type="button" className="search-page__text-button" onClick={resetFilters}>
              Show all types and statuses
            </button>
          </p>
        ) : genreIds.length > 1 ? (
          <p>Every tag has to match, so try removing one.</p>
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

  const chips = [
    ...genreIds.map((id) => ({ key: `genre-${id}`, kind: "genre", name: genreName(id), to: withoutGenre(id) })),
    studioId && { key: "studio", kind: "studio", name: studioName || "Studio", to: urlWith("studio", null) },
    magazineId && {
      key: "magazine",
      kind: "magazine",
      name: shownMagazineName || "Magazine",
      to: urlWith("magazine", null),
    },
  ].filter(Boolean);

  return (
    <div className="search-page">
      <SearchBox type={type} initialQuery={searchQuery} variant="bar" />

      <div className="search-page__header">
        <h1 className="search-page__title">{heading}</h1>
        <p className="search-page__count" role="status">
          {blockedGenres.length
            ? ""
            : loading
              ? "Searching…"
              : loadError
                ? ""
                : `${fullNumber(total)} ${total === 1 ? "title" : "titles"}${
                    lastPage > 1 ? `, page ${page} of ${lastPage}` : ""
                  }`}
        </p>
      </div>

      {chips.length ? (
        <ul className="search-page__active-filters" aria-label="Active filters">
          {chips.map((chip) => (
            <li key={chip.key}>
              <Link
                className="search-page__chip"
                to={chip.to}
                aria-label={`Remove ${chip.kind} filter ${chip.name}`}
              >
                {chip.name}
                <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
              </Link>
            </li>
          ))}
          {studioId ? (
            <li>
              <Link className="search-page__chip-link" to={`/studio/${studioId}`}>
                About {studioName || "this studio"}
              </Link>
            </li>
          ) : null}
        </ul>
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
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              updateUrlParams({ status: event.target.value || null, page: null })
            }
          >
            {statusOptions.map((option) => (
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
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="search-page__filter">
          <span>{genreIds.length ? "Also must have" : "Genre or theme"}</span>
          <select
            value=""
            disabled={catalog.status !== "ready" || genreIds.length >= MAX_GENRES}
            onChange={(event) => addGenre(event.target.value)}
          >
            <option value="">
              {catalog.status === "ready"
                ? genreIds.length >= MAX_GENRES
                  ? "That's the most at once"
                  : "Add a tag…"
                : catalog.status === "error"
                  ? "Couldn't load tags"
                  : "Loading tags…"}
            </option>
            {addable.map((group) => (
              <optgroup key={group.key} label={group.label}>
                {[...group.items]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((g) => (
                    <option key={g.mal_id} value={g.mal_id}>
                      {g.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>
      <p className="search-page__browse">
        <Link to={`/${type}/browse`}>
          See every genre, theme and {type === "anime" ? "studio" : "magazine"}
        </Link>
      </p>

      {content}

      {!blockedGenres.length && !loading && !loadError && lastPage > 1 ? (
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
