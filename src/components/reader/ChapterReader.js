import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import LoadError from "../plugins/LoadError";
import { useChapters } from "./useMangaDex";
import useReaderSettings, { useMediaQuery } from "./useReaderSettings";
import ReaderPage from "./ReaderPage";
import PagedView from "./PagedView";
import ReaderProgress from "./ReaderProgress";
import ReaderSettings from "./ReaderSettings";
import {
  chapterLabel,
  fetchPages,
  groupChapters,
  hostOf,
  languageName,
  pageSources,
  preferredVersion,
} from "./mangadex";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// keys typed into a field, or used inside the settings panel, aren't page turns
const isTyping = (target) =>
  target instanceof Element &&
  Boolean(target.closest("input, select, textarea, [contenteditable='true'], dialog"));

// [[0], [1], ...] or [[0, 1], [2, 3], ...]
const makeSpreads = (total, perSpread) =>
  Array.from({ length: Math.ceil(total / perSpread) }, (_, i) =>
    Array.from({ length: Math.min(perSpread, total - i * perSpread) }, (__, j) => i * perSpread + j),
  );

// Previous / next chapter, following the reading order of the chapter list.
function ChapterNav({ mangaId, language, prev, next, chaptersUrl, position }) {
  const link = (target, label, icon, side) => {
    if (!target) return <span aria-hidden="true" />;
    const text = (
      <>
        {side === "prev" ? <FontAwesomeIcon icon={icon} aria-hidden="true" /> : null}
        <span>
          {label}
          <span className="reader-nav__which">{chapterLabel(target.group)}</span>
        </span>
        {side === "next" ? <FontAwesomeIcon icon={icon} aria-hidden="true" /> : null}
      </>
    );
    return target.version.externalUrl ? (
      <a className={`reader-nav__link reader-nav__link--${side}`} href={target.version.externalUrl} target="_blank" rel="noreferrer">
        {text}
        <span className="visually-hidden"> (opens {hostOf(target.version.externalUrl)} in a new tab)</span>
      </a>
    ) : (
      <Link
        className={`reader-nav__link reader-nav__link--${side}`}
        to={`/manga/${mangaId}/read/${target.version.id}${language !== "en" ? `?lang=${language}` : ""}`}
      >
        {text}
      </Link>
    );
  };
  return (
    <nav className={`reader-nav reader-nav--${position}`} aria-label={`Chapters (${position})`}>
      {link(prev, "Previous", faChevronLeft, "prev")}
      <Link className="reader-nav__all" to={chaptersUrl}>
        All chapters
      </Link>
      {link(next, "Next", faChevronRight, "next")}
    </nav>
  );
}

function ChapterReader({ manga, chapterId, allowNSFW, isDarkMode, onDarkModeToggle }) {
  const malId = manga.mal_id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = React.useState({ id: null, status: "loading", data: null });
  const [reloadKey, setReloadKey] = React.useState(0);
  const [settings, updateSettings] = useReaderSettings();
  // double page needs room for two pages side by side
  const narrow = useMediaQuery("(max-width: 700px)");
  const layout = settings.layout === "double" && narrow ? "single" : settings.layout;
  const { direction, highQuality } = settings;
  // the first page on screen (0-based); `total` means the end-of-chapter card
  const [page, setPage] = React.useState(0);
  // page numbers that failed even after refreshing the server
  const [failed, setFailed] = React.useState(() => new Set());
  const refreshed = React.useRef(false);
  const stripRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    setState((s) => (s.id === chapterId ? { ...s, status: "loading" } : { id: chapterId, status: "loading", data: null }));
    fetchPages(chapterId)
      .then((data) => {
        if (!cancelled) setState({ id: chapterId, status: "ready", data });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("MangaDex chapter failed:", error);
        setState({ id: chapterId, status: error.status === 404 ? "notfound" : "error", data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [chapterId, reloadKey]);

  // a new chapter starts clean, on its first page
  React.useEffect(() => {
    refreshed.current = false;
    setPage(0);
  }, [chapterId]);
  // fresh addresses (or a new chapter): every page gets another go
  React.useEffect(() => setFailed(new Set()), [state.data]);

  const current = state.id === chapterId ? state : { status: "loading", data: null };
  const chapter = current.data ? current.data.chapter : null;
  const server = current.data ? current.data.server : null;
  const language = (chapter && chapter.language) || searchParams.get("lang") || "en";

  // the chapter list, for previous / next (cached from the list page)
  const list = useChapters(chapter ? chapter.mangaId : null, language, allowNSFW);
  const reading = React.useMemo(() => groupChapters(list.chapters).reverse(), [list.chapters]);
  const index = chapter
    ? reading.findIndex((g) => g.versions.some((v) => v.id === chapter.id))
    : -1;
  const neighbour = (offset) => {
    const group = index >= 0 ? reading[index + offset] : null;
    return group ? { group, version: preferredVersion(group, chapter.groups) } : null;
  };
  const prev = neighbour(-1);
  const next = neighbour(1);
  const chaptersUrl = `/manga/${malId}/read${language !== "en" ? `?lang=${language}` : ""}`;
  const chapterUrl = (target) =>
    `/manga/${malId}/read/${target.version.id}${language !== "en" ? `?lang=${language}` : ""}`;

  const sources = pageSources(server, highQuality);
  const total = sources.length;
  const paged = layout !== "strip" && total > 0;
  const spreads = React.useMemo(() => makeSpreads(total, layout === "double" ? 2 : 1), [total, layout]);
  const atEnd = paged && page >= total;
  const spreadIndex = atEnd ? spreads.length : Math.max(0, spreads.findIndex((s) => s.includes(page)));
  const shownPages = paged && !atEnd ? spreads[spreadIndex] || [0] : [Math.min(page, total - 1)];

  // ---- moving through the chapter ----
  const scrollToPage = React.useCallback((target, smooth) => {
    const element = document.getElementById(`reader-page-${target + 1}`);
    if (element) {
      element.scrollIntoView({ block: "start", behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto" });
    }
  }, []);

  // keep the paged viewer in full view while turning pages
  const viewerRef = React.useRef(null);
  const revealViewer = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const box = viewer.getBoundingClientRect();
    if (Math.abs(box.top) > 2) {
      window.scrollBy({ top: box.top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  };

  // opening a chapter (or switching) in a paged layout: the viewer fills the
  // screen right away; the chapter header is a scroll up
  const hasPages = Boolean(server && server.data.length);
  React.useEffect(() => {
    if (!paged || !hasPages) return undefined;
    let placedAt = null;
    const place = () => {
      const viewer = viewerRef.current;
      if (!viewer) return;
      window.scrollBy({ top: viewer.getBoundingClientRect().top, behavior: "auto" });
      placedAt = window.scrollY;
    };
    const frame = requestAnimationFrame(place);
    // the header can still shift as the page settles: place it once more,
    // unless the reader has scrolled in the meantime
    const timer = setTimeout(() => {
      if (placedAt !== null && window.scrollY === placedAt) place();
    }, 400);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [paged, hasPages, chapterId]);

  const goToSpread = (target) => {
    if (target < 0) return;
    if (target > spreads.length) {
      // past the end card: on to the next chapter, when it can be read here
      if (next && !next.version.externalUrl) navigate(chapterUrl(next));
      return;
    }
    setPage(target === spreads.length ? total : spreads[target][0]);
    revealViewer();
  };
  const step = (delta) => goToSpread(spreadIndex + delta);

  const jumpTo = (target) => {
    if (paged) {
      setPage(spreads[spreads.findIndex((s) => s.includes(target))][0]);
      revealViewer();
    } else {
      setPage(target);
      scrollToPage(target, true);
    }
  };

  // long strip: the page crossing 40% of the screen is the one being read
  React.useEffect(() => {
    if (paged || !total) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const items = stripRef.current ? stripRef.current.children : [];
      const line = window.innerHeight * 0.4;
      let reached = 0;
      for (let i = 0; i < items.length; i++) {
        if (items[i].getBoundingClientRect().top <= line) reached = i;
        else break;
      }
      // scrolled to the bottom: the last page counts as read, however short
      const list = stripRef.current;
      if (list && items.length && list.getBoundingClientRect().bottom <= window.innerHeight + 2) {
        reached = items.length - 1;
      }
      setPage(reached);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [paged, total]);

  // switching to long strip: continue from the page that was on screen
  const wasPaged = React.useRef(paged);
  React.useEffect(() => {
    if (wasPaged.current && !paged && page > 0) {
      requestAnimationFrame(() => scrollToPage(Math.min(page, total - 1), false));
    }
    wasPaged.current = paged;
    // only when the layout changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paged]);

  // keyboard: paged layouts turn pages; long strip scrolls in big steps
  const onKey = React.useRef(null);
  onKey.current = (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isTyping(event.target)) return;
    const onButton = event.target instanceof Element && event.target.closest("button, a");
    if (!total) return;

    if (paged) {
      const forwardKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
      const backKey = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
      let delta = 0;
      if (event.key === forwardKey || event.key === "ArrowDown" || event.key === "PageDown") delta = 1;
      else if (event.key === backKey || event.key === "ArrowUp" || event.key === "PageUp") delta = -1;
      // Space would also press a focused button
      else if (event.key === " " && !onButton) delta = event.shiftKey ? -1 : 1;
      else if (event.key === "Home") {
        event.preventDefault();
        goToSpread(0);
        return;
      } else if (event.key === "End") {
        event.preventDefault();
        goToSpread(spreads.length - 1);
        return;
      }
      if (delta) {
        event.preventDefault();
        step(delta);
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const sign = event.key === "ArrowDown" ? 1 : -1;
      // a held key repeats ~30 times a second: big instant steps; a single
      // press glides almost half a screen
      if (event.repeat) {
        window.scrollBy({ top: sign * 140, behavior: "auto" });
      } else {
        window.scrollBy({
          top: sign * window.innerHeight * 0.45,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      }
    }
  };
  React.useEffect(() => {
    const listener = (event) => onKey.current && onKey.current(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const onFailed = (number, kind) => {
    if (kind === "retry") {
      setFailed((set) => {
        const nextSet = new Set(set);
        nextSet.delete(number);
        return nextSet;
      });
      return;
    }
    // first failure: get fresh image server addresses once, then mark pages
    if (!refreshed.current) {
      refreshed.current = true;
      setReloadKey((k) => k + 1);
      return;
    }
    setFailed((set) => new Set(set).add(number));
  };

  if (current.status === "notfound") {
    return (
      <div className="reader-page">
        <div className="reader-empty">
          <p className="reader-empty__lead">This chapter isn't on MangaDex any more.</p>
          <Link to={chaptersUrl}>Back to the chapters</Link>
        </div>
      </div>
    );
  }
  if (current.status === "error" && !chapter) {
    return (
      <LoadError
        isDarkMode={isDarkMode}
        message="Couldn't load this chapter from MangaDex."
        onRetry={() => setReloadKey((k) => k + 1)}
        minHeight="80vh"
      />
    );
  }
  if (!chapter) {
    return (
      <div className="details-loading" role="status" aria-busy="true">
        <span className="loader" />
        <span className="visually-hidden">Loading the chapter…</span>
      </div>
    );
  }

  const heading = `${chapterLabel(chapter)}${chapter.title ? `: ${chapter.title}` : ""}`;
  const nav = (position) => (
    <ChapterNav mangaId={malId} language={language} prev={prev} next={next} chaptersUrl={chaptersUrl} position={position} />
  );

  const renderPage = (pageIndex, eager) => (
    <ReaderPage
      // new addresses or quality: every page starts over
      key={`${pageIndex}-${reloadKey}-${highQuality}`}
      sources={sources[pageIndex]}
      number={pageIndex + 1}
      total={total}
      eager={eager}
      failed={failed.has(pageIndex + 1)}
      onFailed={onFailed}
    />
  );

  const endCard = (
    <div className="reader-end">
      <p className="reader-end__title">End of {chapterLabel(chapter)}</p>
      {next ? (
        next.version.externalUrl ? (
          <a className="landing-button" href={next.version.externalUrl} target="_blank" rel="noreferrer">
            Read {chapterLabel(next.group)} on {hostOf(next.version.externalUrl)}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : (
          <Link className="landing-button" to={chapterUrl(next)}>
            Next: {chapterLabel(next.group)}
          </Link>
        )
      ) : (
        <p className="details-muted">This is the latest chapter here.</p>
      )}
      <Link className="reader-nav__all" to={chaptersUrl}>
        All chapters
      </Link>
    </div>
  );

  let pages;
  if (chapter.externalUrl) {
    pages = (
      <div className="reader-empty">
        <p className="reader-empty__lead">This is an official release, read on the publisher's site.</p>
        <a className="details-action" href={chapter.externalUrl} target="_blank" rel="noreferrer">
          Read on {hostOf(chapter.externalUrl)}
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </div>
    );
  } else if (!server) {
    pages = (
      <div className="reader-empty">
        <p className="reader-empty__lead">MangaDex lists this chapter but can't show its pages right now.</p>
        <p>
          {next || prev ? "Try another translation from the chapter list, or come back later. " : "Try again later. "}
          <button type="button" className="details-text-button" onClick={() => setReloadKey((k) => k + 1)}>
            Try again
          </button>
        </p>
      </div>
    );
  } else if (paged) {
    pages = (
      <div ref={viewerRef} className="reader-viewer-wrap">
        <PagedView
          spreads={spreads}
          spreadIndex={spreadIndex}
          direction={direction}
          onStep={step}
          renderPage={renderPage}
          end={endCard}
        />
      </div>
    );
  } else {
    pages = (
      <ol className="reader-pages" ref={stripRef} aria-label={`${total} pages`}>
        {sources.map((_, i) => (
          <li key={i} id={`reader-page-${i + 1}`}>
            {/* the first pages come right away, the rest as they scroll near */}
            {renderPage(i, i < 3)}
          </li>
        ))}
      </ol>
    );
  }

  const pageLabel = total
    ? atEnd
      ? "End"
      : shownPages.length > 1
        ? `${shownPages[0] + 1}–${shownPages[shownPages.length - 1] + 1} / ${total}`
        : `${shownPages[0] + 1} / ${total}`
    : null;

  return (
    <article
      className={`reader-page reader-page--chapter reader-page--${paged ? "paged" : "strip"}`}
      aria-labelledby="chapter-heading"
    >
      <header className="reader-bar">
        <Link className="reader-bar__back" to={chaptersUrl}>
          <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
          <span className="visually-hidden">Back to the chapters of </span>
          {manga.title}
        </Link>
        <h1 className="reader-bar__title" id="chapter-heading">
          {heading}
        </h1>
        <p className="search__facts reader-bar__facts">
          {chapter.volume ? <span>Volume {chapter.volume}</span> : null}
          <span>{chapter.groups.length ? chapter.groups.join(" & ") : "No group credited"}</span>
          <span>{languageName(chapter.language)}</span>
          {server ? <span>{total} pages</span> : null}
        </p>
      </header>

      {nav("top")}
      {pages}
      {/* the strip's own end: next chapter, all chapters */}
      {!paged ? nav("bottom") : null}

      {server ? (
        <>
          <ReaderSettings
            settings={settings}
            onChange={updateSettings}
            narrow={narrow}
            isDarkMode={isDarkMode}
            onDarkModeToggle={onDarkModeToggle}
            pageLabel={pageLabel}
          />
          <ReaderProgress
            total={total}
            first={shownPages[0]}
            last={shownPages[shownPages.length - 1]}
            done={atEnd}
            direction={paged ? direction : "ltr"}
            onJump={jumpTo}
          />
        </>
      ) : null}
    </article>
  );
}

export default ChapterReader;
