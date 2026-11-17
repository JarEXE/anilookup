import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import useApiResource, { useNearViewport } from "../details/useApiResource";

// The character's other pictures, loaded as the section scrolls near. Each
// opens in a viewer (native <dialog>: Esc closes it, focus is handled by the
// browser) with previous/next.
function CharacterGallery({ characterId, name }) {
  const ref = React.useRef(null);
  const near = useNearViewport(ref);
  const { data, status } = useApiResource(`/characters/${characterId}/pictures`, near);
  const pictures = (data || [])
    .map((p) => (p.jpg && (p.jpg.large_image_url || p.jpg.image_url)) || null)
    .filter(Boolean);

  const dialogRef = React.useRef(null);
  const [index, setIndex] = React.useState(null);

  const open = (i) => {
    setIndex(i);
    if (dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  };
  const close = () => dialogRef.current && dialogRef.current.close();
  const step = (delta) => setIndex((i) => (i + delta + pictures.length) % pictures.length);

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  };

  // nothing beyond the picture already in the header: no section at all
  if (status === "ready" && pictures.length < 2) return <div ref={ref} />;
  if (status === "error") return <div ref={ref} />;

  return (
    <section className="entity-known" ref={ref} aria-labelledby="pictures-heading">
      <h2 className="details-heading" id="pictures-heading">
        Pictures
      </h2>
      {status !== "ready" ? (
        <ul className="cover-row" aria-busy="true">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="cover-card cover-card--skeleton" />
          ))}
        </ul>
      ) : (
        <ul className="cover-row character-gallery">
          {pictures.map((src, i) => (
            <li key={src}>
              <button type="button" className="character-gallery__thumb" onClick={() => open(i)}>
                <img src={src} alt="" width="132" height="198" loading="lazy" />
                <span className="visually-hidden">
                  Open picture {i + 1} of {pictures.length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        className="character-viewer"
        aria-label={`Pictures of ${name}`}
        onClose={() => setIndex(null)}
        onKeyDown={onKeyDown}
        // a click on the backdrop (outside the content) closes it
        onClick={(event) => event.target === dialogRef.current && close()}
      >
        {index !== null ? (
          <div className="character-viewer__content">
            <img src={pictures[index]} alt={`${name} (${index + 1} of ${pictures.length})`} />
            <div className="character-viewer__bar">
              <button type="button" onClick={() => step(-1)} aria-label="Previous picture">
                <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
              </button>
              <span aria-live="polite">
                {index + 1} / {pictures.length}
              </span>
              <button type="button" onClick={() => step(1)} aria-label="Next picture">
                <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
              </button>
              <button type="button" onClick={close} aria-label="Close" className="character-viewer__close">
                <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}

export default CharacterGallery;
