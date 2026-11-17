import React from "react";
import { Link } from "react-router-dom";
import useApiResource from "../details/useApiResource";
import useUrlParams from "../../hooks/useUrlParams";
import { withoutNsfw } from "../../utils/nsfw";
import { LandingSection, SectionError } from "./LandingSection";
import {
  DAYS,
  formatMinutes,
  jstDaysFor,
  timeZoneLabel,
  toLocalBroadcast,
  todayIndex,
} from "./landingUtils";

const SHOWN = 8;
const schedulePath = (dayIndex) =>
  dayIndex === undefined ? null : `/schedules?filter=${DAYS[dayIndex].api}&limit=100`;

// This week's broadcasts for one day, converted from Japan time to the
// visitor's own clock and sorted by it. Because a local day straddles two
// Japanese days in most time zones, up to two schedule days are fetched
// (each once per session).
function AiringToday({ allowNSFW }) {
  const today = todayIndex();
  const [{ day: dayParam }, updateUrlParams] = useUrlParams({ day: DAYS[today].key });
  const selected = Math.max(0, DAYS.findIndex((d) => d.key === dayParam));
  const [showAll, setShowAll] = React.useState(false);

  const [firstDay, secondDay] = jstDaysFor(selected);
  const first = useApiResource(schedulePath(firstDay));
  const second = useApiResource(schedulePath(secondDay), secondDay !== undefined);

  const sources = secondDay === undefined ? [first] : [first, second];
  const status = sources.some((s) => s.status === "error")
    ? "error"
    : sources.every((s) => s.status === "ready")
      ? "ready"
      : "loading";

  const shows = React.useMemo(() => {
    if (status !== "ready") return [];
    const seen = new Set();
    return sources
      .flatMap((source) => source.data || [])
      .filter((item) => !seen.has(item.mal_id) && seen.add(item.mal_id))
      .map((item) => ({ item, local: toLocalBroadcast(item.broadcast) }))
      .filter(({ local }) => local && local.day === selected)
      .filter(({ item }) => withoutNsfw([item], "anime", allowNSFW).length > 0)
      .sort((a, b) => a.local.minutes - b.local.minutes || (b.item.members || 0) - (a.item.members || 0));
    // sources' data is what changes; the array itself is rebuilt every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, first.data, second.data, selected, allowNSFW]);

  const retry = () => sources.forEach((s) => s.status === "error" && s.retry());
  const visible = showAll ? shows : shows.slice(0, SHOWN);

  const pickDay = (index) => {
    setShowAll(false);
    updateUrlParams({ day: DAYS[index].key }, { replace: true });
  };

  return (
    <LandingSection
      id="airing-heading"
      title={selected === today ? "Airing today" : `Airing ${DAYS[selected].long}`}
      subtitle={`Broadcast times in your time zone (${timeZoneLabel()})`}
    >
      <div className="landing-days" role="group" aria-label="Day of the week">
        {DAYS.map((day, index) => (
          <button
            key={day.key}
            type="button"
            className="landing-day"
            aria-pressed={index === selected}
            aria-label={`${day.long}${index === today ? " (today)" : ""}`}
            onClick={() => pickDay(index)}
          >
            {index === today ? "Today" : day.short}
          </button>
        ))}
      </div>

      {status === "error" ? (
        <SectionError what="the broadcast schedule" onRetry={retry} />
      ) : status !== "ready" ? (
        <ul className="landing-list" aria-busy="true">
          {Array.from({ length: 5 }, (_, index) => (
            <li key={index} className="landing-list__row landing-list__row--skeleton" />
          ))}
        </ul>
      ) : shows.length === 0 ? (
        <p className="landing-message">No broadcasts listed for {DAYS[selected].long}.</p>
      ) : (
        <>
          <ul className="landing-list">
            {visible.map(({ item, local }) => (
              <li key={item.mal_id} className="landing-list__row">
                <span className="landing-list__lead">{formatMinutes(local.minutes)}</span>
                <img
                  className="landing-list__thumb"
                  src={item.images.jpg.small_image_url || item.images.jpg.image_url}
                  alt=""
                  width="36"
                  height="50"
                  loading="lazy"
                />
                <Link className="landing-list__title" to={`/anime/${item.mal_id}`}>
                  {item.title}
                </Link>
                <span className="landing-list__end">
                  {typeof item.score === "number" ? (
                    <>
                      <span aria-hidden="true">★ </span>
                      <span className="visually-hidden">Score </span>
                      {item.score.toFixed(2)}
                    </>
                  ) : (
                    <span className="landing-list__new">New</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {shows.length > SHOWN ? (
            <button
              type="button"
              className="landing-text-button landing-list__more"
              aria-expanded={showAll}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show fewer" : `Show all ${shows.length}`}
            </button>
          ) : null}
        </>
      )}
    </LandingSection>
  );
}

export default AiringToday;
