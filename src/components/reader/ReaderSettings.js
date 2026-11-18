import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders, faXmark } from "@fortawesome/free-solid-svg-icons";
import { DIRECTIONS, LAYOUTS } from "./useReaderSettings";

function Choices({ legend, name, options, value, onChange, hint }) {
  return (
    <fieldset className="reader-settings__group">
      <legend>{legend}</legend>
      <div className="reader-choices">
        {options.map((option) => (
          <label key={option.value} className="reader-choice">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {hint ? <p className="reader-settings__hint">{hint}</p> : null}
    </fieldset>
  );
}

// The floating "Settings" button (always in reach, wherever the reader is
// scrolled to), the page count beside it, and the settings panel it opens.
function ReaderSettings({ settings, onChange, narrow, isDarkMode, onDarkModeToggle, pageLabel }) {
  const dialogRef = React.useRef(null);
  const open = () => dialogRef.current && !dialogRef.current.open && dialogRef.current.showModal();
  const close = () => dialogRef.current && dialogRef.current.close();

  return (
    <>
      <div className="reader-float">
        <button type="button" className="reader-float__button" onClick={open} aria-haspopup="dialog">
          <FontAwesomeIcon icon={faSliders} aria-hidden="true" />
          <span className="reader-float__label">Settings</span>
          <span className="visually-hidden"> for reading</span>
        </button>
        {pageLabel ? (
          <span className="reader-float__pages" aria-hidden="true">
            {pageLabel}
          </span>
        ) : null}
      </div>

      <dialog
        ref={dialogRef}
        className="reader-settings"
        aria-labelledby="reader-settings-heading"
        // a click on the backdrop (outside the panel) closes it
        onClick={(event) => event.target === dialogRef.current && close()}
      >
        <div className="reader-settings__panel">
          <div className="reader-settings__head">
            <h2 id="reader-settings-heading">Reading settings</h2>
            <button type="button" className="reader-settings__close" onClick={close} aria-label="Close settings">
              <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            </button>
          </div>

          <Choices
            legend="Page layout"
            name="reader-layout"
            options={LAYOUTS}
            value={settings.layout}
            onChange={(layout) => onChange({ layout })}
            hint={
              settings.layout === "double" && narrow
                ? "Double page needs a wider screen, so this one shows a page at a time."
                : null
            }
          />
          <Choices
            legend="Reading direction"
            name="reader-direction"
            options={DIRECTIONS}
            value={settings.direction}
            onChange={(direction) => onChange({ direction })}
            hint={
              settings.layout === "strip"
                ? "Used by the single and double page layouts. Most Japanese manga read right to left."
                : "Most Japanese manga read right to left."
            }
          />

          <fieldset className="reader-settings__group">
            <legend>Display</legend>
            <label className="reader-toggle">
              <span>
                High quality images
                <span className="reader-settings__hint">Larger and slower to load</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={settings.highQuality}
                onChange={(event) => onChange({ highQuality: event.target.checked })}
              />
            </label>
            <label className="reader-toggle">
              <span>Dark mode</span>
              <input
                type="checkbox"
                role="switch"
                checked={isDarkMode}
                onChange={(event) => onDarkModeToggle(event.target.checked)}
              />
            </label>
          </fieldset>

          <p className="reader-settings__keys">
            Keyboard: arrow keys turn pages (or scroll quickly in long strip), Space goes forward.
          </p>
          <button type="button" className="landing-button reader-settings__done" onClick={close}>
            Done
          </button>
        </div>
      </dialog>
    </>
  );
}

export default ReaderSettings;
