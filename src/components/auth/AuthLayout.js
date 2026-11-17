import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

// Shared frame for the sign-in, register, reset and profile pages: a centred
// panel with a title, an optional one-line intro, the form and a footer.
// Flat surfaces and 1px lines like the rest of the app (no shadows).
export function AuthLayout({ title, intro, children, footer, wide = false }) {
  return (
    <div className={`auth-page${wide ? " auth-page--wide" : ""}`}>
      <section className="auth-panel" aria-labelledby="auth-title">
        <h1 className="auth-panel__title" id="auth-title">
          {title}
        </h1>
        {intro ? <p className="auth-panel__intro">{intro}</p> : null}
        {children}
      </section>
      {footer ? <div className="auth-footer">{footer}</div> : null}
    </div>
  );
}

// A labelled input with its hint and error underneath. The error is tied to
// the input (aria-describedby + aria-invalid) and carries an icon, so it
// doesn't rely on colour alone.
export function AuthField({ id, label, error, hint, ...inputProps }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-field__label">
        {label}
      </label>
      <input
        id={id}
        className="auth-field__input"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {error ? (
        <p className="auth-field__error" id={`${id}-error`}>
          <FontAwesomeIcon icon={faCircleExclamation} aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="auth-field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// A form-level problem (not tied to one field), announced when it appears.
export function AuthAlert({ children }) {
  return (
    <p className="auth-alert" role="alert">
      <FontAwesomeIcon icon={faCircleExclamation} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function AuthSubmit({ pending, children, pendingLabel }) {
  return (
    <button type="submit" className="auth-submit" disabled={pending} aria-busy={pending || undefined}>
      {pending ? pendingLabel : children}
    </button>
  );
}

export function AuthLoading() {
  return (
    <div className="details-loading" role="status" aria-busy="true">
      <span className="loader" />
      <span className="visually-hidden">Loading…</span>
    </div>
  );
}
