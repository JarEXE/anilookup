import React from "react";
import dateFormat from "dateformat";
import LoadError from "../plugins/LoadError";
import { useEpisodes } from "./useApiResource";

const PAGE_SIZE = 25;

// Episode list (anime). Shares its data with the Stats tab's episode chart.
function EpisodesTab({ details, isDarkMode }) {
  const { episodes, done, truncated, error, retry } = useEpisodes(details.mal_id, true);
  const [visible, setVisible] = React.useState(PAGE_SIZE);

  if (error && episodes.length === 0) {
    return <LoadError isDarkMode={isDarkMode} message="Couldn't load the episodes." onRetry={retry} />;
  }
  if (!done && episodes.length === 0) {
    return (
      <ol className="episode-list" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index} className="episode-row episode-row--skeleton" />
        ))}
      </ol>
    );
  }
  if (episodes.length === 0) {
    return <p className="details-muted">No episode list available.</p>;
  }

  return (
    <div>
      <h2 className="visually-hidden">Episodes</h2>
      <p className="details-muted details-count">
        {episodes.length} {episodes.length === 1 ? "episode" : "episodes"}
        {!done ? " so far, loading more…" : ""}
        {truncated ? " (first 1000 shown)" : ""}
      </p>
      <ol className="episode-list">
        {episodes.slice(0, visible).map((episode) => (
          <li key={episode.mal_id} className="episode-row">
            <span className="episode-row__number" aria-label={`Episode ${episode.mal_id}`}>
              {episode.mal_id}
            </span>
            <span className="episode-row__text">
              <span className="episode-row__title">{episode.title || "Untitled"}</span>
              <span className="episode-row__meta">
                {episode.aired ? <span>{dateFormat(episode.aired, "mmm d, yyyy")}</span> : null}
                {episode.filler ? <span className="episode-badge">Filler</span> : null}
                {episode.recap ? <span className="episode-badge">Recap</span> : null}
              </span>
            </span>
            <span className="episode-row__score">
              {typeof episode.score === "number" ? (
                <>
                  <span className="visually-hidden">Score </span>
                  {episode.score.toFixed(2)}
                </>
              ) : (
                <span className="details-muted">–</span>
              )}
            </span>
          </li>
        ))}
      </ol>
      {visible < episodes.length ? (
        <button
          type="button"
          className="details-more-button"
          onClick={() => setVisible(visible + PAGE_SIZE * 2)}
        >
          Show more episodes ({episodes.length - visible} left)
        </button>
      ) : null}
    </div>
  );
}

export default EpisodesTab;
