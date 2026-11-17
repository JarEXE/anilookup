import React from "react";
import { Link } from "react-router-dom";
import { LandingSection, SectionError } from "./LandingSection";
import { shortDate } from "./landingUtils";

const SHOWN = 8;

// Manga serializations that started most recently (already NSFW-filtered by
// the caller). Dates in the future are announcements, not new series.
function NewSeries({ items, status, onRetry }) {
  const [showAll, setShowAll] = React.useState(false);
  const now = Date.now();
  const started = (items || []).filter(
    (item) =>
      item.published &&
      item.published.from &&
      new Date(item.published.from).getTime() <= now,
  );
  const visible = showAll ? started : started.slice(0, SHOWN);

  let body;
  if (status === "error") {
    body = <SectionError what="new series" onRetry={onRetry} />;
  } else if (status !== "ready") {
    body = (
      <ul className="landing-list" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <li
            key={index}
            className="landing-list__row landing-list__row--skeleton"
          />
        ))}
      </ul>
    );
  } else if (!started.length) {
    body = <p className="landing-message">No new series listed right now.</p>;
  } else {
    body = (
      <>
        <ul className="landing-list">
          {visible.map((item) => (
            <li key={item.mal_id} className="landing-list__row">
              <span className="landing-list__lead">
                {shortDate(item.published.from)}
              </span>
              <img
                className="landing-list__thumb"
                src={
                  item.images.jpg.small_image_url || item.images.jpg.image_url
                }
                alt=""
                width="36"
                height="50"
                loading="lazy"
              />
              <Link
                className="landing-list__title"
                to={`/manga/${item.mal_id}`}
              >
                {item.title}
              </Link>
              <span className="landing-list__end">{item.type}</span>
            </li>
          ))}
        </ul>
        {started.length > SHOWN ? (
          <button
            type="button"
            className="landing-text-button landing-list__more"
            aria-expanded={showAll}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show fewer" : `Show all ${started.length}`}
          </button>
        ) : null}
      </>
    );
  }

  return (
    <LandingSection id="new-series-heading" title="New series">
      {body}
    </LandingSection>
  );
}

export default NewSeries;
