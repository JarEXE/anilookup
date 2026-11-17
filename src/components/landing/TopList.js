import React from "react";
import CoverCard from "../plugins/CoverCard";
import LoadError from "../plugins/LoadError";
import { API_URL, apiClient } from "../../config/api";
import useUrlParams, { parsePage } from "../../hooks/useUrlParams";
import { sfwQuery, withoutNsfw } from "../../utils/nsfw";
import { displayName } from "../details/format";
import { LandingSection, CoverSkeletons } from "./LandingSection";
import Pager from "./Pager";

const PER_PAGE = 24; // divides evenly into 6, 4, 3 and 2 columns
const PHONE_FIRST = 12;

// studio for anime, author for manga
const maker = (item, type) => {
  if (type === "anime") return item.studios && item.studios[0] ? item.studios[0].name : null;
  return item.authors && item.authors[0] ? displayName(item.authors[0].name) : null;
};

// The ranked Top list with its category switch. `options` are
// { value, label, query } where query is the part of /top/{type}?... that
// selects the category.
function TopList({ type, title, options, selected, onSelect, allowNSFW, listItems, isDarkMode }) {
  const [{ page: pageParam }, updateUrlParams] = useUrlParams({ page: "1" });
  const page = parsePage(pageParam);
  const option = options.find((o) => o.value === selected) || options[0];

  const [state, setState] = React.useState({ items: [], pagination: null, status: "loading" });
  const [reloadKey, setReloadKey] = React.useState(0);
  // phones show half a page first (a page is 12 rows there)
  const [expanded, setExpanded] = React.useState(false);
  const headingRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    setExpanded(false);
    setState((prev) => ({ ...prev, status: "loading" }));
    apiClient
      .get(`${API_URL}/top/${type}?${option.query}&limit=${PER_PAGE}&page=${page}${sfwQuery(allowNSFW)}`)
      .then((response) => {
        if (cancelled) return;
        setState({
          items: withoutNsfw(response.data.data, type, allowNSFW),
          pagination: response.data.pagination || null,
          status: "ready",
        });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error fetching the top list:", error);
        setState({ items: [], pagination: null, status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [type, option.query, page, allowNSFW, reloadKey]);

  const goToPage = (target) => {
    updateUrlParams({ page: target > 1 ? target : null });
    // keep the list in view rather than the bottom of the previous page
    if (headingRef.current) headingRef.current.scrollIntoView({ block: "start" });
  };

  const statusFor = (id) => {
    if (!listItems) return null;
    const entry = listItems.find((item) => parseInt(item.id, 10) === id);
    return entry ? entry.currentList : null;
  };

  const lastPage = (state.pagination && state.pagination.last_visible_page) || 1;

  let body;
  if (state.status === "error") {
    body = (
      <LoadError
        isDarkMode={isDarkMode}
        message="Couldn't load this list right now."
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    );
  } else if (state.status === "loading") {
    body = <CoverSkeletons count={12} className="cover-grid landing-top__grid" />;
  } else if (!state.items.length) {
    body = <p className="landing-message">Nothing in this list right now.</p>;
  } else {
    body = (
      <>
        <ol className={`cover-grid landing-top__grid${expanded ? "" : " landing-top__grid--clipped"}`}>
          {state.items.map((item) => (
            <CoverCard
              key={item.mal_id}
              to={`/${type}/${item.mal_id}`}
              image={item.images.jpg.large_image_url || item.images.jpg.image_url}
              title={item.title}
              rank={item.rank}
              listStatus={statusFor(item.mal_id)}
              meta={
                <>
                  {typeof item.score === "number" ? <span>★ {item.score.toFixed(2)}</span> : null}
                  {maker(item, type) ? <span>{maker(item, type)}</span> : null}
                </>
              }
            />
          ))}
        </ol>
        {!expanded && state.items.length > PHONE_FIRST ? (
          <button
            type="button"
            className="landing-pager__button landing-top__more"
            onClick={() => setExpanded(true)}
          >
            Show {state.items.length - PHONE_FIRST} more
          </button>
        ) : null}
        {lastPage > 1 ? (
          <Pager
            id="top-page"
            label="Top list pages"
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
    <LandingSection
      ref={headingRef}
      id={`top-${type}-heading`}
      title={title}
      className="landing-top"
      action={
        <div className="landing-tabs" role="group" aria-label={`${title} category`}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className="landing-tabs__button"
              aria-pressed={o.value === option.value}
              onClick={() => onSelect(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      }
    >
      {body}
    </LandingSection>
  );
}

export default TopList;
