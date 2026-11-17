import React from "react";
import { Link } from "react-router-dom";
import useApiResource from "../details/useApiResource";
import { fullNumber } from "../details/format";
import { SectionError } from "./LandingSection";

const NSFW_GENRES = new Set([12, 49]); // Hentai, Erotica
const GENRE_COUNT = 12;

// The biggest genres (by number of titles), each opening the genre search.
export function GenreLinks({ type, allowNSFW }) {
  const { data, status, retry } = useApiResource(`/genres/${type}`);
  const genres = (data || [])
    .filter((genre) => allowNSFW || !NSFW_GENRES.has(genre.mal_id))
    .sort((a, b) => b.count - a.count)
    .slice(0, GENRE_COUNT);

  return (
    <div className="landing-side__block">
      <h2 className="landing-side__title" id={`genres-${type}`}>
        Browse by genre
      </h2>
      {status === "error" ? (
        <SectionError what="genres" onRetry={retry} />
      ) : (
        <ul
          className="landing-pills"
          aria-labelledby={`genres-${type}`}
          aria-busy={status !== "ready"}
        >
          {genres.map((genre) => (
            <li key={genre.mal_id}>
              <Link to={`/${type}/search?genre=${genre.mal_id}`}>
                {genre.name}
                <span className="landing-pills__count">
                  <span className="visually-hidden">, </span>
                  {fullNumber(genre.count)}
                  <span className="visually-hidden"> titles</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// The magazines behind the most-read series that are still publishing,
// worked out from the "Popular right now" list (no extra request, and only
// magazines that run SFW-filtered hits show up while NSFW is off).
export function MagazineLinks({ items, status }) {
  const magazines = React.useMemo(() => {
    const byId = new Map();
    (items || []).forEach((item, position) => {
      (item.serializations || []).forEach((mag) => {
        const entry = byId.get(mag.mal_id) || {
          ...mag,
          series: 0,
          best: position,
        };
        entry.series += 1;
        byId.set(mag.mal_id, entry);
      });
    });
    return [...byId.values()]
      .sort((a, b) => b.series - a.series || a.best - b.best)
      .slice(0, 8);
  }, [items]);

  if (status === "ready" && !magazines.length) return null;

  return (
    <div className="landing-side__block">
      <h2 className="landing-side__title" id="magazines-heading">
        Browse by magazine
      </h2>
      <ul
        className="landing-pills"
        aria-labelledby="magazines-heading"
        aria-busy={status !== "ready"}
      >
        {magazines.map((mag) => (
          <li key={mag.mal_id}>
            <Link to={`/manga/search?magazine=${mag.mal_id}`}>{mag.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
