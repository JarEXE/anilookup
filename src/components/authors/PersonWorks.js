import React from "react";
import CoverCard from "../plugins/CoverCard";
import useUrlParams from "../../hooks/useUrlParams";
import { isNsfw } from "../../utils/nsfw";
import { compactNumber, displayName } from "../details/format";

const PAGE = 24;

const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "score", label: "Highest rated" },
  { value: "newest", label: "Newest" },
  { value: "title", label: "Title (A–Z)" },
];

// "add Storyboard" -> "Storyboard" (MAL marks some credits with "add"), and
// "Principle Drawing (ep 8)" -> "Principle Drawing": per-episode details would
// otherwise make every episode its own role filter
const cleanRole = (role) =>
  (role || "")
    .replace(/^add\s+/i, "")
    .replace(/\s*\(+\s*(?:ep|eps|episode)s?\b.*$/i, "")
    .trim();

export const startYear = (item) => {
  if (!item) return null;
  const dates = item.aired || item.published;
  const year = dates && dates.prop && dates.prop.from && dates.prop.from.year;
  return year || null;
};

// One entry per title (a person can hold several roles on one), or per
// character for voice roles.
export function groupWorks(details) {
  const byTitle = (list, key) => {
    const map = new Map();
    (list || []).forEach((credit) => {
      const work = credit[key];
      if (!work) return;
      const entry = map.get(work.mal_id) || {
        key: `${key}-${work.mal_id}`,
        type: key,
        id: work.mal_id,
        title: work.title,
        image: work.images.jpg.large_image_url || work.images.jpg.image_url,
        roles: [],
      };
      const role = cleanRole(credit.position);
      if (role && !entry.roles.includes(role)) entry.roles.push(role);
      map.set(work.mal_id, entry);
    });
    return [...map.values()];
  };

  const voices = (details.voices || [])
    .filter((v) => v.anime && v.character)
    .map((v) => ({
      key: `voice-${v.anime.mal_id}-${v.character.mal_id}`,
      // the card is the character, so it opens the character's page
      link: `/character/${v.character.mal_id}`,
      type: "anime",
      id: v.anime.mal_id,
      title: displayName(v.character.name),
      subtitle: v.anime.title,
      image: v.character.images.jpg.image_url,
      roles: v.role ? [v.role] : [],
    }));

  return {
    manga: byTitle(details.manga, "manga"),
    anime: byTitle(details.anime, "anime"),
    voices,
  };
}

function sortEntries(entries, sort, info) {
  const members = (e) => (info(e) && info(e).members) || 0;
  const score = (e) => (info(e) && info(e).score) || 0;
  const year = (e) => startYear(info(e)) || 0;
  const sorted = [...entries];
  if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === "score") sorted.sort((a, b) => score(b) - score(a) || members(b) - members(a));
  else if (sort === "newest") sorted.sort((a, b) => year(b) - year(a) || members(b) - members(a));
  else sorted.sort((a, b) => members(b) - members(a));
  return sorted;
}

// The person's credits in tabs (Manga / Anime / Voice roles), with a role
// filter and sorting. Scores, years and popularity come from `infoFor`, a
// lookup filled in batches by the page.
// `heading` shows a visible title (the person page leaves it hidden).
function PersonWorks({ groups, infoFor, infoStatus, allowNSFW, heading }) {
  const tabs = [
    { key: "manga", label: "Manga", entries: groups.manga },
    { key: "anime", label: groups.voices.length ? "Anime staff" : "Anime", entries: groups.anime },
    { key: "voices", label: "Voice roles", entries: groups.voices },
  ].filter((tab) => tab.entries.length);
  const largest = [...tabs].sort((a, b) => b.entries.length - a.entries.length)[0];

  const [params, updateUrlParams] = useUrlParams({
    tab: largest ? largest.key : "manga",
    role: "",
    sort: "popular",
  });
  const tab = tabs.find((t) => t.key === params.tab) || largest;
  const sort = SORTS.some((s) => s.value === params.sort) ? params.sort : "popular";
  const [visible, setVisible] = React.useState(PAGE);
  React.useEffect(() => setVisible(PAGE), [params.tab, params.role, sort]);

  if (!tab) return null;

  const info = (entry) => infoFor(entry.type, entry.id);
  // while NSFW is off, titles stay hidden until they're confirmed safe
  const allowed = tab.entries.filter((entry) => {
    if (allowNSFW) return true;
    const record = info(entry);
    if (record === undefined) return infoStatus === "ready"; // never looked up (huge lists)
    return !record || !isNsfw(record, entry.type);
  });

  const roleCounts = new Map();
  allowed.forEach((entry) =>
    entry.roles.forEach((role) => roleCounts.set(role, (roleCounts.get(role) || 0) + 1)),
  );
  const roles = [...roleCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const role = roleCounts.has(params.role) ? params.role : "";

  const filtered = role ? allowed.filter((entry) => entry.roles.includes(role)) : allowed;
  const sorted = sortEntries(filtered, sort, info);
  const hiddenCount = tab.entries.length - allowed.length;

  return (
    <section className="entity-works" aria-labelledby="works-heading">
      <h2 className={heading ? "details-heading" : "visually-hidden"} id="works-heading">
        {heading || "Works"}
      </h2>
      <div className="entity-works__bar">
        <div className="landing-tabs" role="group" aria-label="Kind of work">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className="landing-tabs__button"
              aria-pressed={t.key === tab.key}
              onClick={() => updateUrlParams({ tab: t.key, role: null })}
            >
              {t.label} <span className="entity-works__count">{t.entries.length}</span>
            </button>
          ))}
        </div>
        <label className="search-page__filter">
          <span>Sort by</span>
          <select value={sort} onChange={(event) => updateUrlParams({ sort: event.target.value })}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {roles.length > 1 ? (
        <ul className="entity-roles" aria-label="Filter by role">
          <li>
            <button type="button" aria-pressed={!role} onClick={() => updateUrlParams({ role: null })}>
              All <span>{allowed.length}</span>
            </button>
          </li>
          {roles.map(([name, count]) => (
            <li key={name}>
              <button
                type="button"
                aria-pressed={role === name}
                onClick={() => updateUrlParams({ role: role === name ? null : name })}
              >
                {name} <span>{count}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!allowNSFW && infoStatus === "loading" && !allowed.length ? (
        <p className="details-muted" role="status">
          Loading…
        </p>
      ) : !sorted.length ? (
        <p className="details-muted">
          {hiddenCount ? "Nothing to show here while NSFW content is off." : "Nothing listed."}
        </p>
      ) : (
        <>
          <ul className="cover-grid entity-works__grid">
            {sorted.slice(0, visible).map((entry) => {
              const record = info(entry);
              const year = startYear(record);
              return (
                <CoverCard
                  key={entry.key}
                  to={entry.link || `/${entry.type}/${entry.id}`}
                  image={entry.image}
                  title={entry.title}
                  subtitle={entry.subtitle || entry.roles.join(", ")}
                  meta={
                    <>
                      {entry.subtitle && entry.roles.length ? <span>{entry.roles.join(", ")}</span> : null}
                      {record && typeof record.score === "number" ? (
                        <span>★ {record.score.toFixed(2)}</span>
                      ) : null}
                      {year ? <span>{year}</span> : null}
                    </>
                  }
                />
              );
            })}
          </ul>
          {visible < sorted.length ? (
            <button type="button" className="details-more-button" onClick={() => setVisible(visible + PAGE)}>
              Show more ({sorted.length - visible} left)
            </button>
          ) : null}
        </>
      )}
      {hiddenCount && sorted.length ? (
        <p className="details-muted entity-works__note">
          {hiddenCount} NSFW {hiddenCount === 1 ? "title is" : "titles are"} hidden.
        </p>
      ) : null}
    </section>
  );
}

// The person's most popular works across everything they did.
export function KnownFor({ groups, infoFor, allowNSFW }) {
  const seen = new Set();
  const all = [...groups.manga, ...groups.anime, ...groups.voices]
    .map((entry) => ({ entry, record: infoFor(entry.type, entry.id) }))
    .filter(({ entry, record }) => {
      if (!record || !record.members) return false;
      if (!allowNSFW && isNsfw(record, entry.type)) return false;
      const key = `${entry.type}-${entry.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.record.members - a.record.members)
    .slice(0, 6);

  if (all.length < 3) return null;

  return (
    <section className="entity-known" aria-labelledby="known-heading">
      <h2 className="details-heading" id="known-heading">
        Known for
      </h2>
      <ul className="cover-row">
        {all.map(({ entry, record }) => (
          <CoverCard
            key={`${entry.type}-${entry.id}`}
            to={`/${entry.type}/${entry.id}`}
            image={record.images.jpg.large_image_url || entry.image}
            title={record.title}
            subtitle={entry.subtitle ? `Voice of ${entry.title}` : entry.roles.join(", ")}
            meta={
              <>
                <span>{entry.type === "anime" ? "Anime" : "Manga"}</span>
                <span>{compactNumber(record.members)} members</span>
              </>
            }
          />
        ))}
      </ul>
    </section>
  );
}

export default PersonWorks;
