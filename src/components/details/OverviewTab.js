import React from "react";
import { Link } from "react-router-dom";
import Favicon from "../plugins/Favicon";
import { displayName } from "./format";

const capitalise = (text) => (text ? text[0].toUpperCase() + text.slice(1) : text);
const SYNOPSIS_CLAMP_CHARS = 520;

// Producers, studios and licensors all live under /producers on the API, so
// each one links to our studio page.
const companyLinks = (list) =>
  list && list.length
    ? list.map((company, index) => (
        <React.Fragment key={company.mal_id}>
          {index > 0 ? ", " : null}
          <Link to={`/studio/${company.mal_id}`}>{company.name}</Link>
        </React.Fragment>
      ))
    : null;

function infoRows(details, type, authorPositions) {
  if (type === "anime") {
    return [
      ["Type", details.type],
      ["Episodes", details.episodes],
      ["Duration", details.duration],
      ["Status", details.status],
      ["Aired", details.aired && details.aired.string],
      [
        "Season",
        details.season && details.year
          ? `${capitalise(details.season)} ${details.year}`
          : null,
      ],
      ["Broadcast", details.broadcast && details.broadcast.string],
      ["Source", details.source],
      ["Rating", details.rating],
      ["Studios", companyLinks(details.studios)],
      ["Producers", companyLinks(details.producers)],
      ["Licensors", companyLinks(details.licensors)],
      ["Japanese", details.title_japanese],
      ["Also known as", (details.title_synonyms || []).join(", ")],
    ];
  }
  return [
    ["Type", details.type],
    ["Chapters", details.chapters],
    ["Volumes", details.volumes],
    ["Status", details.status],
    ["Published", details.published && details.published.string],
    [
      "Authors",
      details.authors && details.authors.length
        ? details.authors.map((author, index) => {
            const position =
              authorPositions &&
              authorPositions.find((p) => p.authorId === author.mal_id);
            return (
              <React.Fragment key={author.mal_id}>
                {index > 0 ? ", " : null}
                <Link to={`/author/${author.mal_id}`}>
                  {displayName(author.name)}
                </Link>
                {position ? (
                  <span className="details-info__note"> ({position.position})</span>
                ) : null}
              </React.Fragment>
            );
          })
        : null,
    ],
    [
      "Serialization",
      (details.serializations || []).map((s) => s.name).join(", "),
    ],
    ["Japanese", details.title_japanese],
    ["Also known as", (details.title_synonyms || []).join(", ")],
  ];
}

function SongList({ title, songs }) {
  const [showAll, setShowAll] = React.useState(false);
  if (!songs || songs.length === 0) return null;
  const visible = showAll ? songs : songs.slice(0, 4);
  return (
    <div className="details-songs__group">
      <h3 className="details-subheading">{title}</h3>
      <ol className="details-songs__list">
        {visible.map((song) => (
          // entries look like '1: "again" by YUI (eps 1-14)' - drop the number,
          // the ordered list provides it
          <li key={song}>{song.replace(/^\d+:\s*/, "")}</li>
        ))}
      </ol>
      {songs.length > 4 ? (
        <button
          type="button"
          className="details-text-button"
          aria-expanded={showAll}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show fewer" : `Show all ${songs.length}`}
        </button>
      ) : null}
    </div>
  );
}

function OverviewTab({ details, type, authorPositions }) {
  const [expanded, setExpanded] = React.useState(false);
  const synopsis = (details.synopsis || "").replace(
    /\s*\[Written by[^\]]*\]\s*$/i,
    "",
  );
  const isLong = synopsis.length > SYNOPSIS_CLAMP_CHARS || !!details.background;

  const tags = [
    ...(details.genres || []),
    ...(details.explicit_genres || []),
    ...(details.themes || []),
    ...(details.demographics || []),
  ];
  const rows = infoRows(details, type, authorPositions).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
  const theme = details.theme || {};

  return (
    <div className="details-overview">
      <div className="details-overview__main">
        <section aria-labelledby="synopsis-heading">
          <h2 className="details-heading" id="synopsis-heading">
            Synopsis
          </h2>
          <div
            className={`details-synopsis${
              isLong && !expanded ? " details-synopsis--clamped" : ""
            }`}
          >
            <p>{synopsis || "No synopsis available yet."}</p>
            {expanded && details.background ? (
              <>
                <h3 className="details-subheading">Background</h3>
                <p>{details.background}</p>
              </>
            ) : null}
          </div>
          {isLong ? (
            <button
              type="button"
              className="details-text-button"
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          ) : null}
        </section>

        {tags.length ? (
          <section aria-labelledby="genres-heading">
            <h2 className="details-heading" id="genres-heading">
              Genres &amp; themes
            </h2>
            <ul className="details-tags">
              {tags.map((tag) => (
                <li key={tag.mal_id}>
                  <Link to={`/${type}/search?genre=${tag.mal_id}`}>{tag.name}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {type === "anime" ? (
          <section aria-labelledby="streaming-heading">
            <h2 className="details-heading" id="streaming-heading">
              Where to watch
            </h2>
            {details.streaming && details.streaming.length ? (
              <ul className="details-links">
                {details.streaming.map((site) => (
                  <li key={site.url}>
                    <a href={site.url} target="_blank" rel="noreferrer">
                      <Favicon url={site.url} />
                      {site.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="details-muted">No streaming sites listed.</p>
            )}
          </section>
        ) : null}

        {(theme.openings && theme.openings.length) ||
        (theme.endings && theme.endings.length) ? (
          <section aria-labelledby="songs-heading" className="details-songs">
            <h2 className="details-heading" id="songs-heading">
              Theme songs
            </h2>
            <div className="details-songs__groups">
              <SongList title="Openings" songs={theme.openings} />
              <SongList title="Endings" songs={theme.endings} />
            </div>
          </section>
        ) : null}

        {details.external && details.external.length ? (
          <section aria-labelledby="links-heading">
            <h2 className="details-heading" id="links-heading">
              Links
            </h2>
            <ul className="details-links details-links--small">
              {details.external.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    <Favicon url={link.url} />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <aside className="details-overview__aside" aria-labelledby="info-heading">
        <h2 className="details-heading" id="info-heading">
          Details
        </h2>
        <dl className="details-info">
          {rows.map(([label, value]) => (
            <div key={label} className="details-info__row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}

export default OverviewTab;
