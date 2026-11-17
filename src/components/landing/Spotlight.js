import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import CoverCard from "../plugins/CoverCard";
import { compactNumber, displayName } from "../details/format";
import { LandingSection, SectionError, CoverSkeletons } from "./LandingSection";
import { cleanSynopsis, sinceLabel } from "./landingUtils";

const ROW_COUNT = 6;

const firstName = (list) => (list && list.length ? list[0].name : null);

// who made it: studio for anime, author and magazine for manga
function makers(item, type) {
  if (type === "anime") return [firstName(item.studios)];
  const author = item.authors && item.authors.length ? displayName(item.authors[0].name) : null;
  return [author, firstName(item.serializations)];
}

const listStatusFor = (listItems, id) => {
  if (!listItems) return null;
  const entry = listItems.find((item) => parseInt(item.id, 10) === id);
  return entry ? entry.currentList : null;
};

function FeatureCard({ item, type, kicker, listItems }) {
  const since =
    type === "anime"
      ? sinceLabel(item.aired && item.aired.from, true)
      : sinceLabel(item.published && item.published.from);
  const synopsis = cleanSynopsis(item.synopsis);
  const genres = (item.genres || []).slice(0, 4);
  const onList = listStatusFor(listItems, item.mal_id);

  return (
    <article className="landing-feature">
      <Link to={`/${type}/${item.mal_id}`} className="landing-feature__cover" tabIndex={-1} aria-hidden="true">
        <img
          src={item.images.jpg.large_image_url || item.images.jpg.image_url}
          alt=""
          width="160"
          height="228"
        />
      </Link>
      <div className="landing-feature__body">
        <p className="landing-feature__kicker">{kicker}</p>
        <h3 className="landing-feature__title">
          <Link to={`/${type}/${item.mal_id}`}>{item.title}</Link>
        </h3>
        <p className="landing-feature__facts">
          {typeof item.score === "number" ? (
            <span className="landing-feature__score">
              <FontAwesomeIcon icon={faStar} aria-hidden="true" />
              <span className="visually-hidden">Score </span>
              {item.score.toFixed(2)}
            </span>
          ) : null}
          {item.rank ? <span>Rank #{item.rank}</span> : null}
          {item.members ? <span>{compactNumber(item.members)} members</span> : null}
          {onList ? <span>On your list</span> : null}
        </p>
        <p className="landing-feature__facts">
          {makers(item, type)
            .filter(Boolean)
            .map((name) => (
              <span key={name}>{name}</span>
            ))}
          {since ? <span>{since}</span> : null}
        </p>
        {synopsis ? <p className="landing-feature__synopsis">{synopsis}</p> : null}
        {genres.length ? (
          <ul className="landing-chips" aria-label="Genres">
            {genres.map((genre) => (
              <li key={genre.mal_id}>
                <Link to={`/${type}/search?genre=${genre.mal_id}`}>{genre.name}</Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

// One featured title with the next few beside it (a sideways-scrolling row on
// phones).
function Spotlight({ id, type, title, subtitle, kicker, items, status, onRetry, listItems }) {
  let body;
  if (status === "error") {
    body = <SectionError what={title.toLowerCase()} onRetry={onRetry} />;
  } else if (status !== "ready") {
    body = (
      <div className="landing-spotlight" aria-busy="true">
        <div className="landing-feature landing-feature--skeleton" />
        <CoverSkeletons count={ROW_COUNT} className="cover-row landing-spotlight__row" />
      </div>
    );
  } else if (!items.length) {
    body = <p className="landing-message">Nothing to show here right now.</p>;
  } else {
    body = (
      <div className="landing-spotlight">
        <FeatureCard item={items[0]} type={type} kicker={kicker} listItems={listItems} />
        <ul className="cover-row landing-spotlight__row">
          {items.slice(1, 1 + ROW_COUNT).map((item) => (
            <CoverCard
              key={item.mal_id}
              to={`/${type}/${item.mal_id}`}
              image={item.images.jpg.large_image_url || item.images.jpg.image_url}
              title={item.title}
              listStatus={listStatusFor(listItems, item.mal_id)}
              meta={
                <>
                  {typeof item.score === "number" ? (
                    <span>★ {item.score.toFixed(2)}</span>
                  ) : null}
                  {makers(item, type)[type === "anime" ? 0 : 1] ? (
                    <span>{makers(item, type)[type === "anime" ? 0 : 1]}</span>
                  ) : null}
                </>
              }
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <LandingSection id={id} title={title} subtitle={subtitle}>
      {body}
    </LandingSection>
  );
}

export default Spotlight;
