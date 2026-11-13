import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import ListStatsDetails from "./ListStatsDetails";
import { getStatuses, listUrl } from "./listStatuses";

const percent = (count, total) =>
  total > 0 ? Math.round((count / total) * 100) : 0;

function readExpanded(type) {
  try {
    return sessionStorage.getItem(`statsExpanded:${type}`) === "1";
  } catch (error) {
    return false;
  }
}

// Compact list summary for the landing pages: total, a segmented status bar
// and one link per status into the Lists page. Everything else sits behind
// "More stats" so the Top cards stay the focus of the page.
function ListStats({ type, items, status, onRetry }) {
  const [expanded, setExpanded] = React.useState(() => readExpanded(type));
  const statuses = getStatuses(type);
  const noun = type === "anime" ? "Anime" : "Manga";
  const titleId = `list-stats-title-${type}`;
  const panelId = `list-stats-more-${type}`;

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    try {
      sessionStorage.setItem(`statsExpanded:${type}`, next ? "1" : "0");
    } catch (error) {
      // per-session convenience only
    }
  };

  const list = items || [];
  const total = list.length;
  const counts = Object.fromEntries(
    statuses.map((s) => [
      s.key,
      list.filter((item) => item.currentList === s.key).length,
    ]),
  );
  const visibleSegments = statuses.filter((s) => counts[s.key] > 0);

  let body;

  if (items === null && status === "loading") {
    body = (
      <div className="list-stats__skeleton" role="status" aria-busy="true">
        <span className="visually-hidden">Loading your stats…</span>
        <div className="list-stats__skeleton-bar" />
        <div className="list-stats__skeleton-chips">
          {statuses.map((s) => (
            <div key={s.key} className="list-stats__skeleton-chip" />
          ))}
        </div>
      </div>
    );
  } else if (items === null && status === "error") {
    body = (
      <div className="list-stats__message" role="alert">
        <p>Couldn't load your {type} list.</p>
        <button type="button" className="list-stats__button" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  } else if (total === 0) {
    body = (
      <div className="list-stats__message">
        <p>
          Your {type === "anime" ? "watch" : "reading"} list is empty. Open any{" "}
          {type} below and use <strong>Add to List</strong> to start tracking.
        </p>
      </div>
    );
  } else {
    body = (
      <>
        {/* Visual summary only - the status links below carry the same
            numbers for keyboard and screen-reader users. */}
        <div className="list-stats__bar" aria-hidden="true">
          {visibleSegments.map((s, index) => (
            <Link
              key={s.key}
              to={listUrl(type, s.key)}
              tabIndex={-1}
              className={`list-stats__segment${
                index === 0
                  ? " list-stats__segment--first"
                  : index === visibleSegments.length - 1
                    ? " list-stats__segment--last"
                    : ""
              }`}
              style={{
                flexGrow: counts[s.key],
                background: `var(${s.colorVar})`,
              }}
              data-tip={`${s.label}: ${counts[s.key]} (${percent(
                counts[s.key],
                total,
              )}%)`}
              aria-label={`${s.label}: ${counts[s.key]}`}
            />
          ))}
        </div>

        <ul className="list-stats__chips">
          {statuses.map((s) => (
            <li key={s.key}>
              <Link
                to={listUrl(type, s.key)}
                className={`list-stats__chip${
                  counts[s.key] === 0 ? " list-stats__chip--empty" : ""
                }`}
                aria-label={`${s.label}: ${counts[s.key]} ${
                  counts[s.key] === 1 ? "title" : "titles"
                }, ${percent(counts[s.key], total)}% of your list. View list`}
              >
                <span className="list-stats__chip-top">
                  <FontAwesomeIcon
                    icon={s.icon}
                    className="list-stats__chip-icon"
                    style={{ color: `var(${s.colorVar})` }}
                    aria-hidden="true"
                  />
                  <span className="list-stats__chip-count">
                    {counts[s.key]}
                  </span>
                  <span className="list-stats__chip-percent">
                    {percent(counts[s.key], total)}%
                  </span>
                </span>
                <span className="list-stats__chip-label">{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="list-stats__toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={toggleExpanded}
        >
          {expanded ? "Fewer stats" : "More stats"}
          <FontAwesomeIcon
            icon={faChevronDown}
            className="list-stats__toggle-icon"
            aria-hidden="true"
          />
        </button>

        {expanded ? (
          <div id={panelId} className="list-stats__more">
            <ListStatsDetails type={type} items={list} statuses={statuses} />
          </div>
        ) : null}
      </>
    );
  }

  return (
    <section className="list-stats" aria-labelledby={titleId}>
      <div className="list-stats__header">
        <h2 className="list-stats__title" id={titleId}>
          Your {noun} Stats
        </h2>
        {total > 0 ? (
          <Link to={listUrl(type)} className="list-stats__total">
            <strong>{total}</strong> {total === 1 ? "title" : "titles"}
            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {body}
    </section>
  );
}

export default ListStats;
