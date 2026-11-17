import React from "react";

// Page header for a person or a studio: picture, name, other names, a row of
// actions and an "at a glance" strip of facts. Same look as the details page
// header, without the banner (people and studios have no artwork for one).
//
// facts: [{ label, value }] (falsy values are left out)
function EntityHeader({ image, imageKind = "portrait", title, subtitle, facts, actions }) {
  const shown = (facts || []).filter((fact) => fact.value !== null && fact.value !== undefined && fact.value !== "");
  return (
    <header className="entity-head">
      <div className={`entity-head__image entity-head__image--${imageKind}`}>
        {image ? <img src={image} alt="" width="180" height={imageKind === "logo" ? 180 : 270} /> : null}
      </div>
      <div className="entity-head__body">
        <h1 className="entity-head__title">{title}</h1>
        {subtitle ? <p className="entity-head__subtitle">{subtitle}</p> : null}
        {actions ? <div className="details-actions">{actions}</div> : null}
        {shown.length ? (
          <dl className="entity-facts">
            {shown.map((fact) => (
              <div key={fact.label} className="entity-facts__item">
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </header>
  );
}

export default EntityHeader;
