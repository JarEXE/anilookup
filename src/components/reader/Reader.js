import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import useApiResource from "../details/useApiResource";
import useUrlParams from "../../hooks/useUrlParams";
import { isNsfw } from "../../utils/nsfw";
import { fullNumber } from "../details/format";
import LoadError from "../plugins/LoadError";
import NsfwRedirect from "../plugins/NsfwRedirect";
import ErrorPage from "../ErrorPage";
import Favicon from "../plugins/Favicon";
import ChapterReader from "./ChapterReader";
import { useChapters, useLookup } from "./useMangaDex";
import { chapterLabel, groupChapters, hostOf, languageName, languageOptions } from "./mangadex";

const PAGE = 100;

const shortDate = (iso) => {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null;
};

// Official links from MAL (publisher site, etc.), for when MangaDex has
// nothing to read.
function WhereToRead({ manga }) {
  const links = (manga.external || []).filter((link) => !/wikipedia/i.test(link.url));
  if (!links.length) return null;
  return (
    <section className="reader-where" aria-labelledby="where-heading">
      <h2 className="details-heading" id="where-heading">
        Official links
      </h2>
      <ul className="details-links details-links--small">
        {links.map((link) => (
          <li key={link.url}>
            <a href={link.url} target="_blank" rel="noreferrer">
              <Favicon url={link.url} />
              {link.name}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function VersionLink({ mangaId, group, version, language }) {
  const who = version.groups.length ? version.groups.join(" & ") : "No group credited";
  const date = shortDate(version.readableAt);
  if (version.externalUrl) {
    return (
      <a
        className="reader-version reader-version--external"
        href={version.externalUrl}
        target="_blank"
        rel="noreferrer"
      >
        <span className="reader-version__who">
          {who}
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
        </span>
        <span className="reader-version__meta">
          Official, on {hostOf(version.externalUrl)}
          {date ? ` (${date})` : ""}
        </span>
        <span className="visually-hidden">
          {" "}
          {chapterLabel(group)}, opens in a new tab
        </span>
      </a>
    );
  }
  return (
    <Link
      className="reader-version"
      to={`/manga/${mangaId}/read/${version.id}${language !== "en" ? `?lang=${language}` : ""}`}
    >
      <span className="reader-version__who">{who}</span>
      <span className="reader-version__meta">
        {version.pages} {version.pages === 1 ? "page" : "pages"}
        {date ? `, ${date}` : ""}
      </span>
      <span className="visually-hidden"> {chapterLabel(group)}</span>
    </Link>
  );
}

function ChapterList({ manga, mangaDex, allowNSFW, isDarkMode }) {
  const malId = manga.mal_id;
  const [params, updateUrlParams] = useUrlParams({ lang: "en", order: "desc", find: "" });
  const languages = languageOptions(mangaDex.languages);
  const language = /^[a-z]{2,3}(-[a-z]{2,4})?$/i.test(params.lang) ? params.lang : "en";
  const order = params.order === "asc" ? "asc" : "desc";
  const find = (params.find || "").trim();
  const { status, chapters, truncated, retry } = useChapters(mangaDex.id, language, allowNSFW);
  const [visible, setVisible] = React.useState(PAGE);
  React.useEffect(() => setVisible(PAGE), [language, order, find]);

  const groups = React.useMemo(() => {
    const all = groupChapters(chapters);
    return order === "asc" ? all.reverse() : all;
  }, [chapters, order]);
  const shown = find
    ? groups.filter((g) => g.chapter && g.chapter.startsWith(find))
    : groups;
  const hostedCount = chapters.filter((c) => !c.externalUrl).length;
  const otherLanguages = languages.filter((code) => code !== language);

  let body;
  if (status === "error") {
    body = <LoadError isDarkMode={isDarkMode} message="Couldn't load the chapters from MangaDex." onRetry={retry} />;
  } else if (status !== "ready") {
    body = (
      <ul className="reader-chapters" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="reader-chapter reader-chapter--skeleton" />
        ))}
      </ul>
    );
  } else if (!groups.length) {
    body = (
      <div className="reader-empty">
        <p className="reader-empty__lead">No {languageName(language)} chapters on MangaDex.</p>
        {otherLanguages.length ? (
          <>
            <p>It has chapters in:</p>
            <ul className="landing-pills">
              {otherLanguages.map((code) => (
                <li key={code}>
                  <Link to={`?lang=${code}`} replace>
                    {languageName(code)}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <WhereToRead manga={manga} />
      </div>
    );
  } else if (!shown.length) {
    body = (
      <div className="reader-empty">
        <p>No chapter {find} in this list.</p>
        <button type="button" className="details-text-button" onClick={() => updateUrlParams({ find: null }, { replace: true })}>
          Show every chapter
        </button>
      </div>
    );
  } else {
    body = (
      <>
        {hostedCount === 0 ? (
          <p className="reader-note" role="note">
            These {languageName(language)} chapters are official releases hosted by the publisher, so each one opens on
            their site.
          </p>
        ) : null}
        <ul className="reader-chapters">
          {shown.slice(0, visible).map((group) => (
            <li key={group.key} className="reader-chapter">
              <div className="reader-chapter__head">
                <span className="reader-chapter__number">{chapterLabel(group)}</span>
                {group.title ? <span className="reader-chapter__title">{group.title}</span> : null}
                {group.volume ? <span className="reader-chapter__volume">Vol. {group.volume}</span> : null}
              </div>
              <ul className="reader-chapter__versions" aria-label={`Translations of ${chapterLabel(group)}`}>
                {group.versions.map((version) => (
                  <li key={version.id}>
                    <VersionLink mangaId={malId} group={group} version={version} language={language} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {visible < shown.length ? (
          <button type="button" className="details-more-button" onClick={() => setVisible(visible + PAGE)}>
            Show more ({fullNumber(shown.length - visible)} left)
          </button>
        ) : null}
        {truncated ? (
          <p className="details-muted reader-note">Only the first 4,000 chapters are listed.</p>
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="lists-page__tools reader-tools">
        <label className="search-page__filter">
          <span>Language</span>
          <select value={language} onChange={(event) => updateUrlParams({ lang: event.target.value, find: null }, { replace: true })}>
            {(languages.includes(language) ? languages : [language, ...languages]).map((code) => (
              <option key={code} value={code}>
                {languageName(code)}
              </option>
            ))}
          </select>
        </label>
        <label className="search-page__filter">
          <span>Order</span>
          <select value={order} onChange={(event) => updateUrlParams({ order: event.target.value }, { replace: true })}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>
        <label className="search-page__filter reader-tools__find">
          <span>Go to chapter</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 12"
            value={params.find || ""}
            onChange={(event) => updateUrlParams({ find: event.target.value.trim() || null }, { replace: true })}
          />
        </label>
      </div>
      {status === "ready" && groups.length ? (
        <p className="details-muted reader-count" role="status">
          {fullNumber(groups.length)} {groups.length === 1 ? "chapter" : "chapters"} in {languageName(language)}
          {chapters.length > groups.length ? `, ${fullNumber(chapters.length)} translations` : ""}
        </p>
      ) : null}
      {body}
    </>
  );
}

// Rendered at /manga/:id/read?lang=...&order=...&find=... (chapter list) and
// /manga/:id/read/:chapterId?lang=... (the pages of one chapter)
function Reader({ isDarkMode, allowNSFW, onDarkModeToggle }) {
  const { id, chapterId } = useParams();
  const location = useLocation();
  const details = useApiResource(`/manga/${id}/full`);
  const manga = details.data;
  // the details page passes what it already looked up
  const known = location.state && location.state.mangaDex && location.state.mangaDex.found ? location.state.mangaDex : null;
  // (a chapter knows its own manga, so the reader itself skips the lookup)
  const lookup = useLookup(chapterId ? null : manga, known);

  if (details.status === "error") {
    return <LoadError isDarkMode={isDarkMode} message="Couldn't load this manga right now." onRetry={details.retry} minHeight="80vh" />;
  }
  if (details.status === "ready" && !manga) return <ErrorPage isDarkMode={isDarkMode} />;
  if (!manga) {
    return (
      <div className="details-loading" role="status" aria-busy="true">
        <span className="loader" />
        <span className="visually-hidden">Loading…</span>
      </div>
    );
  }
  if (!allowNSFW && isNsfw(manga, "manga")) {
    return <NsfwRedirect type="manga" isDarkMode={isDarkMode} />;
  }

  const mangaDex = lookup.result;

  if (chapterId) {
    return (
      <ChapterReader
        manga={manga}
        chapterId={chapterId}
        allowNSFW={allowNSFW}
        isDarkMode={isDarkMode}
        onDarkModeToggle={onDarkModeToggle}
      />
    );
  }

  let body;
  if (lookup.status === "error") {
    body = <LoadError isDarkMode={isDarkMode} message="Couldn't reach MangaDex." onRetry={lookup.retry} />;
  } else if (lookup.status !== "ready") {
    body = (
      <div className="details-loading" role="status" aria-busy="true">
        <span className="loader" />
        <span className="visually-hidden">Finding this manga on MangaDex…</span>
      </div>
    );
  } else if (!mangaDex.found) {
    body = (
      <div className="reader-empty">
        <p className="reader-empty__lead">MangaDex doesn't have this manga.</p>
        <WhereToRead manga={manga} />
      </div>
    );
  } else {
    body = <ChapterList manga={manga} mangaDex={mangaDex} allowNSFW={allowNSFW} isDarkMode={isDarkMode} />;
  }

  return (
    <div className="reader-page">
      <header className="reader-head">
        <img
          className="reader-head__cover"
          src={manga.images.jpg.image_url}
          alt=""
          width="72"
          height="104"
        />
        <div>
          <h1 className="reader-head__title">{manga.title}</h1>
          <p className="reader-head__sub">
            Chapters from{" "}
            <a href="https://mangadex.org" target="_blank" rel="noreferrer">
              MangaDex
            </a>
            , translated by fans and publishers.{" "}
            <Link to={`/manga/${id}`}>About this manga</Link>
          </p>
        </div>
      </header>
      {body}
    </div>
  );
}

export default Reader;
