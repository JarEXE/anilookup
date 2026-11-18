import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

// pages this many spreads away from the current one are loaded ahead
const PRELOAD = 2;
const SWIPE_DISTANCE = 50;

// Single or double page view: every spread sits side by side in a track that
// slides to the current one (the slide is a CSS transition, so it's skipped
// for people who ask for reduced motion). The last slide is `end`, the
// "end of chapter" card. Tapping or clicking either side, or swiping, turns
// the page; right to left swaps the sides.
//
// `onStep(+1)` means the next page in reading order, whatever the direction.
function PagedView({ spreads, spreadIndex, direction, onStep, renderPage, end }) {
  const rtl = direction === "rtl";
  const swipe = React.useRef(null);
  const atEnd = spreadIndex >= spreads.length;

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse") return;
    swipe.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // a mostly sideways movement, long enough to be meant
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    // dragging the page to the left brings in what is on its right
    const towardsRight = dx < 0;
    onStep(towardsRight === !rtl ? 1 : -1);
  };

  const zone = (side) => {
    const forward = (side === "right") === !rtl;
    const disabled = forward ? atEnd : spreadIndex <= 0;
    return (
      <button
        type="button"
        className={`reader-zone reader-zone--${side}`}
        onClick={() => onStep(forward ? 1 : -1)}
        disabled={disabled}
        aria-label={forward ? "Next page" : "Previous page"}
      >
        <FontAwesomeIcon icon={side === "left" ? faChevronLeft : faChevronRight} aria-hidden="true" />
      </button>
    );
  };

  return (
    <div
      className={`reader-viewer reader-viewer--${direction}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipe.current = null;
      }}
    >
      <div
        className="reader-track"
        style={{ transform: `translateX(${(rtl ? 1 : -1) * spreadIndex * 100}%)` }}
      >
        {spreads.map((spread, index) => {
          const distance = Math.abs(index - spreadIndex);
          return (
            <div
              key={index}
              className={`reader-slide${spread.length > 1 ? " reader-slide--double" : ""}`}
              aria-hidden={index !== spreadIndex}
              // off-screen slides keep their buttons out of the tab order
              inert={index !== spreadIndex ? "" : undefined}
            >
              {distance <= PRELOAD ? spread.map((page) => renderPage(page, distance <= 1)) : null}
            </div>
          );
        })}
        <div
          className="reader-slide reader-slide--end"
          aria-hidden={!atEnd}
          inert={!atEnd ? "" : undefined}
        >
          {end}
        </div>
      </div>
      {zone("left")}
      {zone("right")}
    </div>
  );
}

export default PagedView;
