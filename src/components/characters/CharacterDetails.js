import React from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { API_URL, apiFetch } from "../../config/api";
import useTitleInfo from "../../hooks/useTitleInfo";
import { isNsfw } from "../../utils/nsfw";
import LoadError from "../plugins/LoadError";
import NsfwRedirect from "../plugins/NsfwRedirect";
import ErrorPage from "../ErrorPage";
import EntityHeader from "../entity/EntityHeader";
import AboutSection from "../entity/AboutSection";
import PersonWorks from "../authors/PersonWorks";
import { displayName, fullNumber } from "../details/format";
import CharacterGallery from "./CharacterGallery";

// Japanese first (the original), then English, then everything else A–Z
const LANGUAGE_ORDER = ["Japanese", "English"];
const languageRank = (language) => {
  const index = LANGUAGE_ORDER.indexOf(language);
  return index === -1 ? LANGUAGE_ORDER.length : index;
};

// One entry per title, with the character's role in it (Main / Supporting).
function appearances(list, key) {
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
    if (credit.role && !entry.roles.includes(credit.role)) entry.roles.push(credit.role);
    map.set(work.mal_id, entry);
  });
  return [...map.values()];
}

function VoiceActors({ voices }) {
  const [showAll, setShowAll] = React.useState(false);
  const sorted = [...voices].sort(
    (a, b) =>
      languageRank(a.language) - languageRank(b.language) ||
      a.language.localeCompare(b.language) ||
      displayName(a.person.name).localeCompare(displayName(b.person.name)),
  );
  // the original and English casts up front; other dubs behind "Show all"
  const main = sorted.filter((v) => LANGUAGE_ORDER.includes(v.language));
  const shown = showAll || main.length === 0 ? sorted : main;

  return (
    <section className="entity-known" aria-labelledby="voices-heading">
      <h2 className="details-heading" id="voices-heading">
        Voice actors
      </h2>
      <ul className="landing-characters character-voices">
        {shown.map((voice) => (
          <li key={`${voice.language}-${voice.person.mal_id}`}>
            <Link to={`/author/${voice.person.mal_id}`} className="landing-character">
              <img
                src={voice.person.images.jpg.image_url}
                alt=""
                width="52"
                height="52"
                loading="lazy"
              />
              <span>
                <span className="landing-character__name">{displayName(voice.person.name)}</span>
                <span className="landing-character__favs">{voice.language}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {sorted.length > shown.length || showAll ? (
        <button
          type="button"
          className="details-text-button character-voices__more"
          aria-expanded={showAll}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show fewer" : `Show all ${sorted.length} languages`}
        </button>
      ) : null}
    </section>
  );
}

// Rendered at /character/:id
function CharacterDetails({ isDarkMode, allowNSFW }) {
  const { id } = useParams();
  const [character, setCharacter] = React.useState(null);
  const [status, setStatus] = React.useState("loading");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        // retries by itself while rate limited
        const response = await apiFetch(`${API_URL}/characters/${id}/full`);
        if (cancelled) return;
        if (response.status === 404 || response.status === 400) {
          setStatus("notfound");
          return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (cancelled) return;
        setCharacter(json.data);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading character:", error);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const groups = React.useMemo(
    () => ({
      anime: character ? appearances(character.anime, "anime") : [],
      manga: character ? appearances(character.manga, "manga") : [],
      voices: [],
    }),
    [character],
  );
  const animeIds = React.useMemo(() => groups.anime.map((e) => e.id), [groups]);
  const mangaIds = React.useMemo(() => groups.manga.map((e) => e.id), [groups]);
  const animeInfo = useTitleInfo("anime", animeIds);
  const mangaInfo = useTitleInfo("manga", mangaIds);
  const infoFor = (type, titleId) => (type === "anime" ? animeInfo.get(titleId) : mangaInfo.get(titleId));
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
        message="Couldn't load this character right now."
        onRetry={() => setReloadKey((key) => key + 1)}
        minHeight="80vh"
      />
    );
  }
  if (status !== "ready" || !character) {
    return (
      <div className="details-loading" role="status" aria-busy="true">
        <span className="loader" />
        <span className="visually-hidden">Loading…</span>
      </div>
    );
  }

  // A character who only appears in NSFW titles is NSFW too: same rule and
  // redirect as a title's details page while NSFW content is off.
  const all = [...groups.anime, ...groups.manga];
  if (!allowNSFW && all.length && infoStatus === "ready") {
    const records = all.map((entry) => infoFor(entry.type, entry.id)).filter(Boolean);
    if (records.length === all.length && all.every((entry) => isNsfw(infoFor(entry.type, entry.id), entry.type))) {
      return <NsfwRedirect type={groups.anime.length ? "anime" : "manga"} isDarkMode={isDarkMode} />;
    }
  }

  const name = displayName(character.name);
  const nicknames = (character.nicknames || []).filter((n) => n && n !== name);
  const mainRoles = all.filter((entry) => entry.roles.includes("Main")).length;

  return (
    <article className="entity-page">
      <EntityHeader
        image={character.images && character.images.jpg && character.images.jpg.image_url}
        title={name}
        subtitle={
          character.name_kanji || nicknames.length ? (
            <>
              {character.name_kanji}
              {nicknames.length ? (
                <span className="entity-head__aka">
                  Also known as {nicknames.slice(0, 5).join(", ")}
                  {nicknames.length > 5 ? ` and ${nicknames.length - 5} more` : ""}
                </span>
              ) : null}
            </>
          ) : null
        }
        actions={
          <a className="details-action" href={character.url} target="_blank" rel="noreferrer">
            View on MAL
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        }
        facts={[
          { label: "Favorites", value: character.favorites ? fullNumber(character.favorites) : null },
          { label: "Anime", value: groups.anime.length || null },
          { label: "Manga", value: groups.manga.length || null },
          { label: "Main role in", value: mainRoles ? `${mainRoles} ${mainRoles === 1 ? "title" : "titles"}` : null },
          { label: "Voice actors", value: (character.voices || []).length || null },
        ]}
      />

      <AboutSection id="about-heading" text={character.about} emptyText="No biography available." />

      <CharacterGallery characterId={id} name={name} />

      {(character.voices || []).length ? <VoiceActors voices={character.voices} /> : null}

      {all.length ? (
        <PersonWorks
          heading="Appears in"
          groups={groups}
          infoFor={infoFor}
          infoStatus={infoStatus}
          allowNSFW={allowNSFW}
        />
      ) : null}
    </article>
  );
}

export default CharacterDetails;
