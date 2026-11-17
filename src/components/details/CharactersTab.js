import React from "react";
import { Link } from "react-router-dom";
import LoadError from "../plugins/LoadError";
import useApiResource from "./useApiResource";
import { displayName } from "./format";

const PAGE_SIZE = 18;

function CharactersTab({ details, type, isDarkMode }) {
  const { data, status, retry } = useApiResource(
    `/${type}/${details.mal_id}/characters`,
  );
  const [visible, setVisible] = React.useState(PAGE_SIZE);

  if (status === "error") {
    return (
      <LoadError isDarkMode={isDarkMode} message="Couldn't load the characters." onRetry={retry} />
    );
  }
  if (!data) {
    return (
      <ul className="character-grid" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index} className="character-card character-card--skeleton" />
        ))}
      </ul>
    );
  }
  if (data.length === 0) {
    return <p className="details-muted">No characters listed yet.</p>;
  }

  // main characters first, then by how many people favourited them
  const characters = data
    .slice()
    .sort(
      (a, b) =>
        (a.role === "Main" ? 0 : 1) - (b.role === "Main" ? 0 : 1) ||
        (b.favorites || 0) - (a.favorites || 0),
    );

  return (
    <div>
      <h2 className="visually-hidden">Characters</h2>
      <p className="details-muted details-count">
        {characters.length} {characters.length === 1 ? "character" : "characters"}
      </p>
      <ul className="character-grid">
        {characters.slice(0, visible).map(({ character, role, voice_actors }) => {
          const japaneseVoice = (voice_actors || []).find((va) => va.language === "Japanese");
          return (
            <li key={character.mal_id} className="character-card">
              <img
                src={character.images.jpg.image_url}
                alt=""
                width="64"
                height="96"
                loading="lazy"
                className="character-card__image"
              />
              <div className="character-card__text">
                <Link to={`/character/${character.mal_id}`} className="character-card__name">
                  {displayName(character.name)}
                </Link>
                <span className={`character-card__role${role === "Main" ? " character-card__role--main" : ""}`}>
                  {role}
                </span>
                {japaneseVoice ? (
                  <Link
                    to={`/author/${japaneseVoice.person.mal_id}`}
                    className="character-card__voice"
                  >
                    <span className="visually-hidden">Japanese voice: </span>
                    {displayName(japaneseVoice.person.name)}
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {visible < characters.length ? (
        <button
          type="button"
          className="details-more-button"
          onClick={() => setVisible(visible + PAGE_SIZE * 2)}
        >
          Show more characters ({characters.length - visible} left)
        </button>
      ) : null}
    </div>
  );
}

export default CharactersTab;
