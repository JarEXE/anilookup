import React from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { API_URL, apiFetch } from "../../config/api";
import useTitleInfo from "../../hooks/useTitleInfo";
import Favicon from "../plugins/Favicon";
import LoadError from "../plugins/LoadError";
import ErrorPage from "../ErrorPage";
import EntityHeader from "../entity/EntityHeader";
import AboutSection from "../entity/AboutSection";
import { displayName, fullNumber } from "../details/format";
import PersonWorks, { KnownFor, groupWorks, startYear } from "./PersonWorks";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

// Rendered at /author/:id. Any MyAnimeList person: manga authors, anime
// staff and voice actors (whichever credits they have get a tab).
function AuthorDetails({ isDarkMode, allowNSFW }) {
  const { id: authorId } = useParams();
  const [person, setPerson] = React.useState(null);
  const [status, setStatus] = React.useState("loading");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        // retries by itself while rate limited
        const response = await apiFetch(`${API_URL}/people/${authorId}/full`);
        if (cancelled) return;
        if (response.status === 404 || response.status === 400) {
          setStatus("notfound");
          return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (cancelled) return;
        setPerson(json.data);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading person:", error);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authorId, reloadKey]);

  const groups = React.useMemo(
    () => (person ? groupWorks(person) : { manga: [], anime: [], voices: [] }),
    [person],
  );
  const animeIds = React.useMemo(
    () => [...new Set([...groups.anime, ...groups.voices].map((e) => e.id))],
    [groups],
  );
  const mangaIds = React.useMemo(() => groups.manga.map((e) => e.id), [groups]);
  const animeInfo = useTitleInfo("anime", animeIds);
  const mangaInfo = useTitleInfo("manga", mangaIds);

  const infoFor = (type, id) => (type === "anime" ? animeInfo.get(id) : mangaInfo.get(id));
  const infoStatus =
    animeInfo.status === "loading" || mangaInfo.status === "loading"
      ? "loading"
      : animeInfo.status === "error" || mangaInfo.status === "error"
        ? "error"
        : "ready";

  if (status === "notfound") return <ErrorPage isDarkMode={isDarkMode} />;
  if (status === "error") {
    return (
      <LoadError
        isDarkMode={isDarkMode}
        message="Couldn't load this person right now."
        onRetry={() => setReloadKey((key) => key + 1)}
        minHeight="80vh"
      />
    );
  }
  if (status !== "ready" || !person) {
    return (
      <div className="details-loading" role="status" aria-busy="true">
        <span className="loader" />
        <span className="visually-hidden">Loading…</span>
      </div>
    );
  }

  const name = displayName(person.name);
  const nativeName = [person.family_name, person.given_name].filter(Boolean).join(" ");
  const otherNames = (person.alternate_names || []).slice(0, 3).join(", ");

  // years of their first and latest credited work
  const years = [...groups.manga, ...groups.anime, ...groups.voices]
    .map((entry) => startYear(infoFor(entry.type, entry.id)))
    .filter(Boolean);
  const active =
    years.length > 1
      ? `${Math.min(...years)}–${Math.max(...years)}`
      : years.length === 1
        ? String(years[0])
        : null;

  return (
    <article className="entity-page">
      <EntityHeader
        image={person.images && person.images.jpg && person.images.jpg.image_url}
        title={name}
        subtitle={
          nativeName || otherNames ? (
            <>
              {nativeName}
              {otherNames ? (
                <span className="entity-head__aka">Also known as {otherNames}</span>
              ) : null}
            </>
          ) : null
        }
        actions={
          <>
            {person.website_url ? (
              <a className="details-action" href={person.website_url} target="_blank" rel="noreferrer">
                <Favicon url={person.website_url} />
                Website
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ) : null}
            <a className="details-action" href={person.url} target="_blank" rel="noreferrer">
              View on MAL
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </>
        }
        facts={[
          { label: "Birthday", value: person.birthday ? formatDate(person.birthday) : null },
          { label: "Favorites", value: person.favorites ? fullNumber(person.favorites) : null },
          { label: "Manga", value: groups.manga.length || null },
          { label: groups.voices.length ? "Anime staff" : "Anime", value: groups.anime.length || null },
          { label: "Voice roles", value: groups.voices.length || null },
          { label: "Active", value: active },
        ]}
      />

      <AboutSection
        id="about-heading"
        text={person.about}
        emptyText="No biography available."
      />

      <KnownFor groups={groups} infoFor={infoFor} allowNSFW={allowNSFW} />

      {groups.manga.length || groups.anime.length || groups.voices.length ? (
        <PersonWorks
          groups={groups}
          infoFor={infoFor}
          infoStatus={infoStatus}
          allowNSFW={allowNSFW}
        />
      ) : (
        <p className="details-muted">No credited works listed.</p>
      )}
    </article>
  );
}

export default AuthorDetails;
