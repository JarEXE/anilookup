import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faEye,
  faBookOpen,
  faCircleXmark,
  faHand,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

// list status -> icon, colour variable and label (same as the list stats)
const STATUS = {
  watching: { icon: faEye, color: "--status-active", label: "Watching" },
  reading: { icon: faBookOpen, color: "--status-active", label: "Reading" },
  completed: { icon: faCircleCheck, color: "--status-completed", label: "Completed" },
  onhold: { icon: faHand, color: "--status-onhold", label: "On-Hold" },
  planned: { icon: faClock, color: "--status-planned", label: "Planned" },
  dropped: { icon: faCircleXmark, color: "--status-dropped", label: "Dropped" },
};

// A cover with its title always visible underneath (no hover-only text, so it
// works the same on touch screens). Optional extra lines go in `meta`, and
// `listStatus` shows the user's list badge on the cover.
//
// Must be rendered inside a <ul className="cover-grid"> or
// <ul className="cover-row">.
function CoverCard({ to, image, title, subtitle, meta, listStatus }) {
  const status = listStatus ? STATUS[listStatus] : null;

  return (
    <li className="cover-card">
      <Link to={to} className="cover-card__link">
        <span className="cover-card__image">
          <img src={image} alt="" loading="lazy" width="225" height="320" />
          {status ? (
            <span className="cover-card__badge" title={status.label}>
              <FontAwesomeIcon
                icon={status.icon}
                style={{ color: `var(${status.color})` }}
                aria-hidden="true"
              />
              <span className="visually-hidden">On your list: {status.label}</span>
            </span>
          ) : null}
        </span>
        <span className="cover-card__title">{title}</span>
        {subtitle ? <span className="cover-card__subtitle">{subtitle}</span> : null}
        {meta ? <span className="cover-card__meta">{meta}</span> : null}
      </Link>
    </li>
  );
}

export default CoverCard;
