import React from "react";
import CoverCard from "../plugins/CoverCard";
import useApiResource, { useNearViewport } from "./useApiResource";
import { compactNumber } from "./format";
import useNsfwFilter from "../../hooks/useNsfwFilter";

const ROW_COUNT = 12;
const MAX_SHOWN = 48;

// "If you liked this" row, always visible under the tabs. Loads by itself as
// it scrolls near the viewport (no toggle), titles are always shown, and
// "See all" turns the row into a grid.
function Recommendations({ details, type, allowNSFW }) {
  const sectionRef = React.useRef(null);
  const near = useNearViewport(sectionRef);
  const { data, status, retry } = useApiResource(
    `/${type}/${details.mal_id}/recommendations`,
    near,
  );
  const [showAll, setShowAll] = React.useState(false);

  // only the most-recommended titles are ever shown, so only those are
  // checked; NSFW ones are left out while NSFW content is off
  const candidates = React.useMemo(() => (data || []).slice(0, MAX_SHOWN), [data]);
  const candidateIds = React.useMemo(
    () => candidates.map((rec) => rec.entry.mal_id),
    [candidates],
  );
  const nsfw = useNsfwFilter(type, candidateIds, allowNSFW);
  const list = candidates.filter((rec) => !nsfw.isHidden(rec.entry.mal_id));
  const visible = showAll ? list : list.slice(0, ROW_COUNT);

  return (
    <section className="details-recs" ref={sectionRef} aria-labelledby="recs-heading">
      <div className="details-recs__header">
        <h2 className="details-heading" id="recs-heading">
          If you liked this
        </h2>
        {list.length > ROW_COUNT ? (
          <button
            type="button"
            className="details-text-button"
            aria-expanded={showAll}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show fewer" : `See all ${list.length}`}
          </button>
        ) : null}
      </div>
      <p className="details-muted details-recs__note">Recommended by MyAnimeList users.</p>

      {status === "error" ? (
        <p className="details-muted">
          Couldn't load recommendations.{" "}
          <button type="button" className="details-text-button" onClick={retry}>
            Try again
          </button>
        </p>
      ) : status !== "ready" || nsfw.pending ? (
        <ul className="cover-row" aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="cover-card cover-card--skeleton" />
          ))}
        </ul>
      ) : nsfw.failed ? (
        <p className="details-muted">
          Couldn't check these recommendations for NSFW content, so they're
          hidden for now.
        </p>
      ) : list.length === 0 ? (
        <p className="details-muted">
          {candidates.length
            ? "No recommendations to show while NSFW content is off."
            : "No recommendations yet."}
        </p>
      ) : (
        <ul className={showAll ? "cover-grid cover-grid--compact" : "cover-row"}>
          {visible.map((rec) => (
            <CoverCard
              key={rec.entry.mal_id}
              to={`/${type}/${rec.entry.mal_id}`}
              image={rec.entry.images.jpg.large_image_url || rec.entry.images.jpg.image_url}
              title={rec.entry.title}
              subtitle={`${compactNumber(rec.votes)} ${rec.votes === 1 ? "user" : "users"} recommend`}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default Recommendations;
