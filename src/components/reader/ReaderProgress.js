import React from "react";

// The chapter's progress along the bottom of the screen: one segment per
// page, filled up to the page being read. Clicking it jumps to that page.
// (Keyboard users turn pages with the arrow keys, so the bar itself is a
// progressbar for screen readers rather than another control.)
function ReaderProgress({ total, first, last, done, direction, onJump }) {
  const ref = React.useRef(null);
  if (!total) return null;

  const onClick = (event) => {
    const box = ref.current.getBoundingClientRect();
    let ratio = (event.clientX - box.left) / box.width;
    if (direction === "rtl") ratio = 1 - ratio;
    onJump(Math.min(total - 1, Math.max(0, Math.floor(ratio * total))));
  };

  const shown = done ? total : last + 1;
  const label = done
    ? `End of chapter, ${total} pages`
    : first === last
      ? `Page ${first + 1} of ${total}`
      : `Pages ${first + 1}–${last + 1} of ${total}`;

  return (
    <div
      className={`reader-progress reader-progress--${direction}`}
      role="progressbar"
      aria-label="Chapter progress"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={shown}
      aria-valuetext={label}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="reader-progress__track" ref={ref} onClick={onClick} title="Jump to a page">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`reader-progress__segment${index < shown ? " reader-progress__segment--read" : ""}${
              !done && index >= first && index <= last ? " reader-progress__segment--current" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default ReaderProgress;
