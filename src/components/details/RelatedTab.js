import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import useNsfwFilter from "../../hooks/useNsfwFilter";

// The story's direct neighbours get pride of place; everything else is
// grouped by relation underneath.
const STORY_RELATIONS = ["Prequel", "Sequel", "Parent Story", "Full Story"];

const entryPath = (entry) => `/${entry.type}/${entry.mal_id}`;

const idsOfType = (relations, type) =>
  relations.flatMap((r) =>
    r.entry.filter((e) => e.type === type).map((e) => e.mal_id),
  );

function RelatedTab({ details, allowNSFW }) {
  const allRelations = React.useMemo(() => details.relations || [], [details]);
  const animeIds = React.useMemo(() => idsOfType(allRelations, "anime"), [allRelations]);
  const mangaIds = React.useMemo(() => idsOfType(allRelations, "manga"), [allRelations]);
  const animeFilter = useNsfwFilter("anime", animeIds, allowNSFW);
  const mangaFilter = useNsfwFilter("manga", mangaIds, allowNSFW);

  if (animeFilter.pending || mangaFilter.pending) {
    return (
      <p className="details-muted" role="status">
        Loading related works…
      </p>
    );
  }

  // NSFW entries (e.g. an explicit spin-off) are left out while NSFW is off
  const hidden = (entry) =>
    (entry.type === "anime" ? animeFilter : mangaFilter).isHidden(entry.mal_id);
  const relations = allRelations
    .map((r) => ({ ...r, entry: r.entry.filter((e) => !hidden(e)) }))
    .filter((r) => r.entry.length > 0);
  const hiddenCount =
    allRelations.reduce((n, r) => n + r.entry.length, 0) -
    relations.reduce((n, r) => n + r.entry.length, 0);

  if (relations.length === 0) {
    return (
      <p className="details-muted">
        {hiddenCount
          ? "No related works to show while NSFW content is off."
          : "No related works listed."}
      </p>
    );
  }

  const story = relations.filter((r) => STORY_RELATIONS.includes(r.relation));
  const others = relations.filter((r) => !STORY_RELATIONS.includes(r.relation));
  const kindLabel = (entry) => (entry.type === "anime" ? "Anime" : "Manga");

  return (
    <div className="details-related">
      <h2 className="visually-hidden">Related works</h2>
      {story.length ? (
        <section aria-labelledby="story-heading">
          <h3 className="details-heading" id="story-heading">
            Continue the story
          </h3>
          <ul className="related-story">
            {story.flatMap((relation) =>
              relation.entry.map((entry) => (
                <li key={`${relation.relation}-${entry.type}-${entry.mal_id}`}>
                  <Link to={entryPath(entry)} className="related-story__link">
                    <span className="related-story__relation">
                      {relation.relation === "Prequel" ? (
                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                      ) : null}
                      {relation.relation}
                      {relation.relation === "Sequel" ? (
                        <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                      ) : null}
                    </span>
                    <span className="related-story__title">{entry.name}</span>
                    <span className="related-story__kind">{kindLabel(entry)}</span>
                  </Link>
                </li>
              )),
            )}
          </ul>
        </section>
      ) : null}

      {others.length ? (
        <section aria-labelledby="other-related-heading">
          <h3 className="details-heading" id="other-related-heading">
            {story.length ? "More related works" : "Related works"}
          </h3>
          <dl className="related-groups">
            {others.map((relation) => (
              <div key={relation.relation} className="related-groups__row">
                <dt>{relation.relation}</dt>
                <dd>
                  <ul>
                    {relation.entry.map((entry) => (
                      <li key={`${entry.type}-${entry.mal_id}`}>
                        <Link to={entryPath(entry)}>{entry.name}</Link>
                        <span className="related-groups__kind">{kindLabel(entry)}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}

export default RelatedTab;
