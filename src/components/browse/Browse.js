import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import useUrlParams from "../../hooks/useUrlParams";
import { fullNumber } from "../details/format";
import { SectionError } from "../landing/LandingSection";
import useGenreCatalog from "./useGenreCatalog";
import useCompanies, { companyName } from "./useCompanies";

const TAG_ORDERS = [
  { value: "name", label: "A–Z" },
  { value: "count", label: "Most titles" },
];

const COMPANY_ORDERS = {
  anime: [
    { value: "favorites", label: "Most favorited" },
    { value: "count", label: "Most titles" },
  ],
  manga: [
    { value: "count", label: "Most series" },
    { value: "name", label: "A–Z" },
  ],
};

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const plural = (n, one, many) => `${fullNumber(n)} ${n === 1 ? one : many}`;

// One group of tags (Genres, Themes...) as pills with their title counts.
function TagGroup({ group, type, items, status }) {
  const headingId = `browse-${group.key}-heading`;
  return (
    <section
      className="browse-section"
      id={group.key}
      aria-labelledby={headingId}
    >
      <h2 className="browse-section__title" id={headingId}>
        {group.label}
        {status === "ready" ? (
          <span className="entity-works__count">{items.length}</span>
        ) : null}
      </h2>
      <ul className="landing-pills browse-tags" aria-busy={status !== "ready"}>
        {items.map((tag) => (
          <li key={tag.mal_id}>
            <Link to={`/${type}/search?genre=${tag.mal_id}`}>
              {tag.name}
              <span className="landing-pills__count">
                <span className="visually-hidden">, </span>
                {fullNumber(tag.count)}
                <span className="visually-hidden"> titles</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Studios & producers (anime) or magazines (manga), as a grid of links to
// all of their titles.
function Companies({ type, query, order, onOrder }) {
  const { items, total, hasNext, status, loadMore, retry } = useCompanies(
    type,
    query,
    order,
  );
  const noun = type === "anime" ? "studios" : "magazines";
  const headingId = "browse-companies-heading";
  const firstLoad = status === "loading" && !items.length;

  return (
    <section className="browse-section" id={noun} aria-labelledby={headingId}>
      <div className="browse-section__head">
        <h2 className="browse-section__title" id={headingId}>
          {type === "anime" ? "Studios & producers" : "Magazines"}
          {total !== null ? (
            <span className="entity-works__count">{fullNumber(total)}</span>
          ) : null}
        </h2>
        <label className="search-page__filter browse-section__order">
          <span>Order by</span>
          <select
            value={order}
            onChange={(event) => onOrder(event.target.value)}
          >
            {COMPANY_ORDERS[type].map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {status === "error" && !items.length ? (
        <SectionError what={noun} onRetry={retry} />
      ) : firstLoad ? (
        <ul className="browse-companies" aria-busy="true">
          {Array.from({ length: 9 }, (_, i) => (
            <li key={i} className="browse-company browse-company--skeleton" />
          ))}
        </ul>
      ) : !items.length ? (
        <p className="details-muted">
          No {noun} match “{query}”.
        </p>
      ) : (
        <>
          <ul className="browse-companies">
            {items.map((company) => {
              const name = companyName(company);
              const logo =
                company.images &&
                company.images.jpg &&
                company.images.jpg.image_url;
              return (
                <li key={company.mal_id}>
                  <Link
                    className="browse-company"
                    to={
                      type === "anime"
                        ? `/anime/search?studio=${company.mal_id}`
                        : `/manga/search?magazine=${company.mal_id}`
                    }
                  >
                    {type === "anime" ? (
                      <span className="browse-company__logo" aria-hidden="true">
                        {logo ? (
                          <img
                            src={logo}
                            alt=""
                            width="40"
                            height="40"
                            loading="lazy"
                            // a missing logo leaves the initial behind it
                            onError={(event) => {
                              event.currentTarget.hidden = true;
                            }}
                          />
                        ) : null}
                        {name.charAt(0)}
                      </span>
                    ) : null}
                    <span className="browse-company__text">
                      <span className="browse-company__name">{name}</span>
                      <span className="search__facts browse-company__facts">
                        <span>
                          {plural(
                            company.count || 0,
                            type === "anime" ? "title" : "series",
                            type === "anime" ? "titles" : "series",
                          )}
                        </span>
                        {company.favorites ? (
                          <span>
                            {plural(company.favorites, "favorite", "favorites")}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {status === "error" ? (
            <SectionError what={`more ${noun}`} onRetry={retry} />
          ) : hasNext ? (
            <button
              type="button"
              className="details-more-button"
              onClick={loadMore}
              disabled={status === "loading"}
              aria-busy={status === "loading"}
            >
              {status === "loading"
                ? "Loading…"
                : `Show more (${fullNumber(total - items.length)} left)`}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}

// Rendered at /anime/browse and /manga/browse with ?q=...&tags=...&by=...
function Browse({ type, allowNSFW }) {
  const [params, updateUrlParams] = useUrlParams({
    q: "",
    tags: "name",
    by: COMPANY_ORDERS[type][0].value,
  });
  const query = params.q || "";
  const tagOrder = TAG_ORDERS.some((o) => o.value === params.tags)
    ? params.tags
    : "name";
  const companyOrder = COMPANY_ORDERS[type].some((o) => o.value === params.by)
    ? params.by
    : COMPANY_ORDERS[type][0].value;
  const companyQuery = useDebounced(query.trim());

  const catalog = useGenreCatalog(type, allowNSFW);
  const needle = query.trim().toLowerCase();
  const groups = catalog.groups.map((group) => ({
    ...group,
    items: group.items
      .filter((tag) => !needle || tag.name.toLowerCase().includes(needle))
      .sort(
        (a, b) =>
          (tagOrder === "count" ? b.count - a.count : 0) ||
          a.name.localeCompare(b.name),
      ),
  }));
  // while filtering, groups with no match step aside
  // (and once loaded, a group with nothing in it isn't shown at all)
  const shownGroups =
    catalog.status === "ready" ? groups.filter((g) => g.items.length) : groups;
  const companies = type === "anime" ? "studios" : "magazines";

  // arriving with #magazines (or #themes...): scroll there once the tags
  // above it have loaded and the layout has settled
  const { hash } = useLocation();
  const scrolled = React.useRef(false);
  React.useEffect(() => {
    if (scrolled.current || !hash || catalog.status === "loading") return;
    scrolled.current = true;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) target.scrollIntoView();
  }, [hash, catalog.status]);

  return (
    <div className="browse-page">
      <div className="lists-page__header">
        <h1 className="lists-page__title">Browse {type}</h1>
        <nav className="search__switch" aria-label="Browse anime or manga">
          {["anime", "manga"].map((t) => (
            <Link
              key={t}
              to={`/${t}/browse`}
              className="search__switch-option"
              aria-current={type === t ? "page" : undefined}
            >
              {t === "anime" ? "Anime" : "Manga"}
            </Link>
          ))}
        </nav>
      </div>

      <div className="lists-page__tools browse-page__tools">
        <label className="lists-page__search">
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <span className="visually-hidden">Filter by name</span>
          <input
            type="search"
            placeholder={`Filter genres, themes and ${companies}`}
            value={query}
            onChange={(event) =>
              updateUrlParams(
                { q: event.target.value || null },
                { replace: true },
              )
            }
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear the filter"
              onClick={() => updateUrlParams({ q: null }, { replace: true })}
            >
              <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            </button>
          ) : null}
        </label>
        <label className="search-page__filter">
          <span>Order tags</span>
          <select
            value={tagOrder}
            onChange={(event) =>
              updateUrlParams({ tags: event.target.value }, { replace: true })
            }
          >
            {TAG_ORDERS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="browse-page__jump" aria-label="Sections">
        <ul>
          {shownGroups.map((group) => (
            <li key={group.key}>
              <a href={`#${group.key}`}>{group.label}</a>
            </li>
          ))}
          <li>
            <a href={`#${companies}`}>
              {type === "anime" ? "Studios" : "Magazines"}
            </a>
          </li>
        </ul>
      </nav>

      {catalog.status === "error" ? (
        <SectionError what="genres" onRetry={catalog.retry} />
      ) : needle && catalog.status === "ready" && !shownGroups.length ? (
        <p className="details-muted browse-page__none" role="status">
          No genres, themes or demographics match “{query.trim()}”.
        </p>
      ) : (
        shownGroups.map((group) => (
          <TagGroup
            key={group.key}
            group={group}
            type={type}
            items={group.items}
            status={catalog.status}
          />
        ))
      )}

      <Companies
        type={type}
        query={companyQuery}
        order={companyOrder}
        onOrder={(value) => updateUrlParams({ by: value }, { replace: true })}
      />
    </div>
  );
}

export default Browse;
