import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import ScoreGauge from "./ScoreGauge";
import TrailerDialog from "./TrailerDialog";
import { compactNumber, shortRating } from "./format";

const capitalise = (text) => (text ? text[0].toUpperCase() + text.slice(1) : text);

// Short facts shown as chips under the title.
function headerFacts(details, type) {
  const facts = [details.type];
  if (type === "anime") {
    if (details.episodes) {
      facts.push(`${details.episodes} ${details.episodes === 1 ? "episode" : "episodes"}`);
    }
    if (details.season && details.year) {
      facts.push(`${capitalise(details.season)} ${details.year}`);
    } else if (details.aired && details.aired.prop.from.year) {
      facts.push(String(details.aired.prop.from.year));
    }
  } else {
    if (details.chapters) facts.push(`${details.chapters} chapters`);
    if (details.volumes) facts.push(`${details.volumes} volumes`);
    if (details.published && details.published.prop.from.year) {
      facts.push(String(details.published.prop.from.year));
    }
  }
  facts.push(details.status);
  if (type === "anime") facts.push(shortRating(details.rating));
  return facts.filter(Boolean);
}

// Kitsu banner, poster, titles, key facts, actions and the at-a-glance numbers.
// `actions` holds the page's own buttons (Add to List, Read).
function DetailsHeader({ details, type, kitsuCover, isDarkMode, actions }) {
  const [trailerOpen, setTrailerOpen] = React.useState(false);
  const poster = details.images.jpg.large_image_url;
  const altTitles = [details.title_english, details.title_japanese].filter(
    (alt) => alt && alt !== details.title,
  );
  const youtubeId = details.trailer && details.trailer.youtube_id;

  const glance = [
    { label: "Rank", value: details.rank ? `#${compactNumber(details.rank)}` : "–" },
    {
      label: "Popularity",
      value: details.popularity ? `#${compactNumber(details.popularity)}` : "–",
    },
    { label: "Members", value: compactNumber(details.members) },
    { label: "Favorites", value: compactNumber(details.favorites) },
  ];

  return (
    <header className="details-header">
      {/* decorative: the Kitsu banner, or the poster blurred when Kitsu has none */}
      <div className="details-hero" aria-hidden="true">
        <div
          className={`details-hero__image${
            kitsuCover ? "" : " details-hero__image--fallback"
          }`}
          style={{ backgroundImage: `url("${kitsuCover || poster}")` }}
        />
      </div>

      <div className="details-head">
        <img
          className="details-head__poster"
          src={poster}
          alt={`${details.title} cover`}
          width="225"
          height="320"
        />
        <div className="details-head__text">
          <h1 className="details-head__title">{details.title}</h1>
          {altTitles.length ? (
            <p className="details-head__alt">
              {altTitles.map((alt) => (
                <span key={alt}>{alt}</span>
              ))}
            </p>
          ) : null}
          <ul className="details-chips" aria-label="Key facts">
            {headerFacts(details, type).map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="details-actions">
        {actions}
        {youtubeId ? (
          <button
            type="button"
            className="details-action"
            onClick={() => setTrailerOpen(true)}
          >
            <FontAwesomeIcon icon={faPlay} aria-hidden="true" />
            Trailer
          </button>
        ) : null}
        <a
          className="details-action"
          href={details.url}
          target="_blank"
          rel="noreferrer"
        >
          View on MAL
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </div>

      <section className="details-glance" aria-label="At a glance">
        <ScoreGauge
          score={details.score}
          scoredBy={details.scored_by}
          isDarkMode={isDarkMode}
        />
        <dl className="details-glance__tiles">
          {glance.map((item) => (
            <div key={item.label} className="details-glance__tile">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {youtubeId ? (
        <TrailerDialog
          youtubeId={youtubeId}
          title={details.title}
          open={trailerOpen}
          onClose={() => setTrailerOpen(false)}
        />
      ) : null}
    </header>
  );
}

export default DetailsHeader;
