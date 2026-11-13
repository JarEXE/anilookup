import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_URL, apiClient } from "../../config/api";
import { listUrl } from "./listStatuses";

const DAY_MS = 24 * 60 * 60 * 1000;

// List dates are stored as e.g. "2023-11-05T14:22:10-0300". Some browsers
// (Safari) can't parse an offset without a colon, so add one.
function parseListDate(value) {
  if (!value) return null;
  const normalised = String(value).replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const date = new Date(normalised);
  return Number.isNaN(date.getTime()) ? null : date;
}

const malIdOf = (item) =>
  String(item.id || (item.itemId || "").split("/").pop());

const byNewest = (a, b) =>
  (parseListDate(b.date)?.getTime() || 0) -
  (parseListDate(a.date)?.getTime() || 0);

// ---------- current season (anime only) ----------

const SEASON_CACHE_KEY = "seasonNowIds";
const SEASON_CACHE_MS = 6 * 60 * 60 * 1000;
const SEASON_MAX_PAGES = 10;

function readSeasonCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(SEASON_CACHE_KEY));
    if (cached && Date.now() - cached.fetchedAt < SEASON_CACHE_MS) {
      return cached.ids;
    }
  } catch (error) {
    // ignore - refetch
  }
  return null;
}

// MAL ids of everything airing this season. Several pages, fetched one after
// another (the API rate-limits bursts) and cached for the session.
async function fetchSeasonIds() {
  const ids = [];
  for (let page = 1; page <= SEASON_MAX_PAGES; page++) {
    const response = await apiClient.get(
      `${API_URL}/seasons/now?page=${page}&limit=25`,
    );
    (response.data.data || []).forEach((anime) => ids.push(anime.mal_id));
    if (!response.data.pagination || !response.data.pagination.has_next_page) {
      break;
    }
  }
  try {
    sessionStorage.setItem(
      SEASON_CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), ids }),
    );
  } catch (error) {
    // in-memory result is enough
  }
  return ids;
}

function useSeasonIds() {
  const [ids, setIds] = React.useState(readSeasonCache);
  const [failed, setFailed] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (ids !== null) return;
    let cancelled = false;
    setFailed(false);

    fetchSeasonIds()
      .then((result) => {
        if (!cancelled) setIds(result);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error loading this season's anime:", error);
        setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ids, reloadKey]);

  return {
    ids,
    failed,
    retry: () => {
      setIds(null);
      setReloadKey((key) => key + 1);
    },
  };
}

// ---------- pieces ----------

function StatTile({ label, value, hint }) {
  return (
    <div className="list-stats__tile">
      <span className="list-stats__tile-label">{label}</span>
      <span className="list-stats__tile-value">{value}</span>
      {hint ? <span className="list-stats__tile-hint">{hint}</span> : null}
    </div>
  );
}

// Horizontal row of small covers linking to each title's page.
function CoverRow({ type, items, statusByKey }) {
  return (
    <ul className="list-stats__covers">
      {items.map((item) => {
        const status = statusByKey ? statusByKey[item.currentList] : null;
        return (
          <li key={malIdOf(item)}>
            <Link
              to={`/${type}/${malIdOf(item)}`}
              className="list-stats__cover"
              title={item.title}
            >
              <span className="list-stats__cover-image">
                <img
                  src={item.image}
                  alt=""
                  width="72"
                  height="104"
                  loading="lazy"
                />
                {status ? (
                  <span
                    className="list-stats__cover-badge"
                    title={status.label}
                  >
                    <FontAwesomeIcon
                      icon={status.icon}
                      style={{ color: `var(${status.colorVar})` }}
                      aria-hidden="true"
                    />
                    <span className="visually-hidden">{status.label}</span>
                  </span>
                ) : null}
              </span>
              <span className="list-stats__cover-title">{item.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// One bar per format (TV, Movie, Manhwa, ...), largest first. Single series,
// so a single colour; values are printed so nothing relies on bar length.
function FormatBars({ items }) {
  const counts = {};
  items.forEach((item) => {
    const format = item.type || "Unknown";
    counts[format] = (counts[format] || 0) + 1;
  });

  let rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  // fold the long tail into "Other" so the list stays short
  if (rows.length > 6) {
    const otherCount = rows.slice(5).reduce((sum, [, n]) => sum + n, 0);
    rows = [...rows.slice(0, 5), ["Other", otherCount]];
  }
  const max = Math.max(...rows.map(([, n]) => n));

  return (
    <table className="list-stats__formats">
      <caption className="visually-hidden">Titles by format</caption>
      <thead className="visually-hidden">
        <tr>
          <th scope="col">Format</th>
          <th scope="col">Share</th>
          <th scope="col">Titles</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([format, count]) => (
          <tr key={format}>
            <th scope="row">{format}</th>
            <td className="list-stats__format-track" aria-hidden="true">
              <span
                className="list-stats__format-bar"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </td>
            <td className="list-stats__format-count">{count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AiringThisSeason({ items, statusByKey }) {
  const { ids, failed, retry } = useSeasonIds();

  let content;
  if (failed) {
    content = (
      <div className="list-stats__inline-message" role="alert">
        Couldn't load this season's anime.{" "}
        <button type="button" className="list-stats__link-button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  } else if (ids === null) {
    content = (
      <div className="list-stats__inline-message" role="status" aria-busy="true">
        Checking this season's schedule…
      </div>
    );
  } else {
    const seasonIds = new Set(ids.map(String));
    const airing = items
      .filter(
        (item) =>
          seasonIds.has(malIdOf(item)) && item.currentList !== "dropped",
      )
      .sort(byNewest);

    content =
      airing.length > 0 ? (
        <CoverRow type="anime" items={airing} statusByKey={statusByKey} />
      ) : (
        <div className="list-stats__inline-message">
          Nothing on your list is airing this season.
        </div>
      );
  }

  return (
    <div className="list-stats__group">
      <h3 className="list-stats__subtitle">On your list &amp; airing now</h3>
      {content}
    </div>
  );
}

// ---------- panel ----------

function ListStatsDetails({ type, items, statuses }) {
  const isAnime = type === "anime";
  const statusByKey = Object.fromEntries(statuses.map((s) => [s.key, s]));
  const activeStatus = statuses[0];

  const completed = items.filter((i) => i.currentList === "completed").length;
  const started = items.filter((i) => i.currentList !== "planned").length;
  const completionRate =
    started > 0 ? `${Math.round((completed / started) * 100)}%` : "–";

  const now = Date.now();
  const addedRecently = items.filter((item) => {
    const date = parseListDate(item.date);
    return date && now - date.getTime() <= 30 * DAY_MS;
  }).length;

  const formatCounts = {};
  items.forEach((item) => {
    const format = item.type || "Unknown";
    formatCounts[format] = (formatCounts[format] || 0) + 1;
  });
  const topFormat = Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0];

  const inProgress = items
    .filter((item) => item.currentList === activeStatus.key)
    .sort(byNewest)
    .slice(0, 12);

  return (
    <>
      <div className="list-stats__tiles">
        <StatTile
          label="Completion rate"
          value={completionRate}
          hint={`${completed} of ${started} started`}
        />
        <StatTile
          label="Added in 30 days"
          value={addedRecently}
          hint={addedRecently === 1 ? "title" : "titles"}
        />
        <StatTile
          label="Top format"
          value={topFormat ? topFormat[0] : "–"}
          hint={
            topFormat
              ? `${topFormat[1]} ${topFormat[1] === 1 ? "title" : "titles"}`
              : null
          }
        />
      </div>

      <div className="list-stats__group">
        <div className="list-stats__group-header">
          <h3 className="list-stats__subtitle">
            Continue {isAnime ? "watching" : "reading"}
          </h3>
          {inProgress.length > 0 ? (
            <Link to={listUrl(type, activeStatus.key)} className="list-stats__see-all">
              See all
            </Link>
          ) : null}
        </div>
        {inProgress.length > 0 ? (
          <CoverRow type={type} items={inProgress} />
        ) : (
          <div className="list-stats__inline-message">
            Nothing in {activeStatus.label} right now.
          </div>
        )}
      </div>

      {isAnime ? (
        <AiringThisSeason items={items} statusByKey={statusByKey} />
      ) : null}

      <div className="list-stats__group">
        <h3 className="list-stats__subtitle">By format</h3>
        <FormatBars items={items} />
      </div>
    </>
  );
}

export default ListStatsDetails;
