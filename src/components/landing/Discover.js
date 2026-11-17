import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import CoverCard from "../plugins/CoverCard";
import useApiResource, { useNearViewport } from "../details/useApiResource";
import useNsfwFilter from "../../hooks/useNsfwFilter";
import { sfwQuery, withoutNsfw } from "../../utils/nsfw";
import { compactNumber, displayName } from "../details/format";
import { LandingSection, SectionError, CoverSkeletons } from "./LandingSection";
import { releaseLabel } from "./landingUtils";

// ---------- Coming soon (anime) ----------

// shared with the hero's "announced" count, so it's one request
export const upcomingPath = (allowNSFW) =>
  `/seasons/upcoming?order_by=members&sort=desc&limit=10${sfwQuery(allowNSFW)}`;

// Most anticipated upcoming anime, by how many members are already waiting.
export function ComingSoon({ allowNSFW }) {
  const ref = React.useRef(null);
  const near = useNearViewport(ref);
  const { data, status, retry } = useApiResource(upcomingPath(allowNSFW), near);
  const items = withoutNsfw(data, "anime", allowNSFW).slice(0, 8);

  return (
    <LandingSection ref={ref} id="soon-heading" title="Coming soon">
      {status === "error" ? (
        <SectionError what="upcoming anime" onRetry={retry} />
      ) : status !== "ready" ? (
        <CoverSkeletons count={6} />
      ) : (
        <ul className="cover-row landing-row">
          {items.map((item) => (
            <CoverCard
              key={item.mal_id}
              to={`/anime/${item.mal_id}`}
              image={
                item.images.jpg.large_image_url || item.images.jpg.image_url
              }
              title={item.title}
              meta={
                <>
                  <span>{compactNumber(item.members)} waiting</span>
                  <span>{releaseLabel(item)}</span>
                </>
              }
            />
          ))}
        </ul>
      )}
    </LandingSection>
  );
}

// ---------- Fans recommend ----------

const RECS_SHOWN = 4;
const RECS_CHECKED = 12; // the newest pairs checked for NSFW titles

// "If you liked A, try B" pairs, newest first, written by MyAnimeList users.
export function FanRecs({ type, allowNSFW }) {
  const ref = React.useRef(null);
  const near = useNearViewport(ref);
  const { data, status, retry } = useApiResource(
    `/recommendations/${type}`,
    near,
  );

  const candidates = React.useMemo(
    () =>
      (data || [])
        .filter((rec) => rec.entry && rec.entry.length === 2)
        .slice(0, RECS_CHECKED),
    [data],
  );
  const ids = React.useMemo(
    () => [
      ...new Set(candidates.flatMap((rec) => rec.entry.map((e) => e.mal_id))),
    ],
    [candidates],
  );
  const nsfw = useNsfwFilter(type, ids, allowNSFW);
  const pairs = candidates
    .filter((rec) => rec.entry.every((e) => !nsfw.isHidden(e.mal_id)))
    .slice(0, RECS_SHOWN);

  return (
    <LandingSection
      ref={ref}
      id={`fans-${type}-heading`}
      title="Fans recommend"
      subtitle="Suggestions from MyAnimeList users"
      className="landing-half"
    >
      {status === "error" ? (
        <SectionError what="recommendations" onRetry={retry} />
      ) : status !== "ready" || nsfw.pending ? (
        <ul className="landing-recs" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="landing-rec landing-rec--skeleton" />
          ))}
        </ul>
      ) : !pairs.length ? (
        <p className="landing-message">
          No new recommendations to show right now.
        </p>
      ) : (
        <ul className="landing-recs">
          {pairs.map((rec) => {
            const [from, to] = rec.entry;
            return (
              <li key={rec.mal_id} className="landing-rec">
                <span className="landing-rec__covers" aria-hidden="true">
                  <img
                    src={
                      from.images.jpg.small_image_url ||
                      from.images.jpg.image_url
                    }
                    alt=""
                    width="44"
                    height="62"
                    loading="lazy"
                  />
                  <FontAwesomeIcon icon={faArrowRight} />
                  <img
                    src={
                      to.images.jpg.small_image_url || to.images.jpg.image_url
                    }
                    alt=""
                    width="44"
                    height="62"
                    loading="lazy"
                  />
                </span>
                <div className="landing-rec__body">
                  <p className="landing-rec__pair">
                    If you liked{" "}
                    <Link to={`/${type}/${from.mal_id}`}>{from.title}</Link>,
                    try <Link to={`/${type}/${to.mal_id}`}>{to.title}</Link>
                  </p>
                  <p className="landing-rec__text">{rec.content}</p>
                  {rec.user && rec.user.username ? (
                    <p className="landing-rec__by">{rec.user.username}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </LandingSection>
  );
}

// ---------- Most-loved characters ----------

export function TopCharacters() {
  const ref = React.useRef(null);
  const near = useNearViewport(ref);
  const { data, status, retry } = useApiResource(
    "/top/characters?limit=6",
    near,
  );

  return (
    <LandingSection
      ref={ref}
      id="characters-heading"
      title="Most-loved characters"
      subtitle="By MyAnimeList favorites"
      className="landing-half"
    >
      {status === "error" ? (
        <SectionError what="characters" onRetry={retry} />
      ) : (
        <ul className="landing-characters" aria-busy={status !== "ready"}>
          {(status === "ready"
            ? data || []
            : Array.from({ length: 6 }, () => null)
          ).map((character, index) =>
            character ? (
              <li key={character.mal_id}>
                <Link
                  to={`/character/${character.mal_id}`}
                  className="landing-character"
                >
                  <img
                    src={character.images.jpg.image_url}
                    alt=""
                    width="52"
                    height="52"
                    loading="lazy"
                  />
                  <span>
                    <span className="landing-character__name">
                      {displayName(character.name)}
                    </span>
                    <span className="landing-character__favs">
                      {compactNumber(character.favorites)} favorites
                    </span>
                  </span>
                </Link>
              </li>
            ) : (
              <li
                key={index}
                className="landing-character landing-character--skeleton"
              />
            ),
          )}
        </ul>
      )}
    </LandingSection>
  );
}
