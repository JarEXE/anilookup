import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

// Trailer in a native <dialog>: Escape and the close button dismiss it, focus
// is trapped inside while open and returns to the Trailer button after. The
// YouTube iframe only exists while the dialog is open, so the page doesn't
// load YouTube until someone asks for it.
function TrailerDialog({ youtubeId, title, open, onClose }) {
  const dialogRef = React.useRef(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="trailer-dialog"
      aria-label={`${title} trailer`}
      onClose={onClose}
      onClick={(event) => {
        // click on the backdrop (outside the content) closes it
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="trailer-dialog__content">
        <div className="trailer-dialog__header">
          <h2>{title}: trailer</h2>
          <button
            type="button"
            className="trailer-dialog__close"
            aria-label="Close trailer"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
          </button>
        </div>
        <div className="trailer-dialog__video">
          {open ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={`${title} trailer`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

export default TrailerDialog;
