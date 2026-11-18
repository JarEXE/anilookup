import React from "react";

// One page image. Tries each of its sources in turn (full quality, then the
// data-saver copy), holding a page-shaped space until one loads. When all of
// them fail it tells the parent, which asks MangaDex for fresh addresses once
// (they expire after about 15 minutes), and after that shows a retry button.
function ReaderPage({ sources, number, total, onFailed, failed, eager }) {
  const [which, setWhich] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);

  if (failed) {
    return (
      <div className="reader-page__missing" role="group" aria-label={`Page ${number} of ${total}`}>
        <p>Couldn't load page {number}.</p>
        <button
          type="button"
          className="details-text-button"
          onClick={() => {
            setWhich(0);
            setLoaded(false);
            setAttempt((a) => a + 1);
            onFailed(number, "retry");
          }}
        >
          Try again
        </button>
      </div>
    );
  }
  // a retry gets its own address, so a cached failure isn't reused
  const src = `${sources[which]}${attempt ? `&try=${attempt}` : ""}`;
  return (
    <img
      key={src}
      className={`reader-page__image${loaded ? "" : " reader-page__image--loading"}`}
      src={src}
      alt={`Page ${number} of ${total}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable="false"
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (which < sources.length - 1) setWhich(which + 1);
        else onFailed(number, "error");
      }}
    />
  );
}

export default ReaderPage;
