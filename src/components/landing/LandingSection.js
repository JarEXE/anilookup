import React from "react";

// A titled block of the landing page: heading, optional one-line subtitle and
// an optional action (a link or a small control) on the right.
export const LandingSection = React.forwardRef(function LandingSection(
  { id, title, subtitle, action, className = "", children },
  ref,
) {
  return (
    <section
      ref={ref}
      className={`landing-section ${className}`.trim()}
      aria-labelledby={id}
    >
      <div className="landing-section__header">
        <div>
          <h2 className="landing-section__title" id={id}>
            {title}
          </h2>
          {subtitle ? <p className="landing-section__subtitle">{subtitle}</p> : null}
        </div>
        {action || null}
      </div>
      {children}
    </section>
  );
});

// What failed and a way to retry, in the section's own space.
export function SectionError({ what, onRetry }) {
  return (
    <p className="landing-message" role="alert">
      Couldn't load {what}.{" "}
      <button type="button" className="landing-text-button" onClick={onRetry}>
        Try again
      </button>
    </p>
  );
}

// Grey cover-shaped placeholders while a row loads.
export function CoverSkeletons({ count, className = "cover-row" }) {
  return (
    <ul className={className} aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="cover-card cover-card--skeleton" />
      ))}
    </ul>
  );
}
