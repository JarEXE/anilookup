import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faTowerBroadcast } from "@fortawesome/free-solid-svg-icons";
import { formatMinutes, toLocalBroadcast, DAYS } from "../landing/landingUtils";

const SCORES = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

const STATUS_WORDS = {
  "Currently Airing": "Airing",
  "Finished Airing": "Finished",
  "Not yet aired": "Upcoming",
  Publishing: "Publishing",
  Finished: "Finished",
  "On Hiatus": "On hiatus",
  Discontinued: "Discontinued",
  "Not yet published": "Upcoming",
};

const isRunning = (record) =>
  record && (record.status === "Currently Airing" || record.status === "Publishing");

const shortDate = (iso) => {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
    : null;
};

const startYear = (record, item) => {
  const dates = record && (record.aired || record.published);
  const year = dates && dates.prop && dates.prop.from && dates.prop.from.year;
  if (year) return year;
  const released = item.released ? new Date(item.released) : null;
  return released && !Number.isNaN(released.getTime()) ? released.getUTCFullYear() : null;
};

// One title on the user's list: cover, title and facts from Tenrai (type,
// year, length, airing status, MAL score), and the controls to change its
// status, give it a score or remove it.
function ListRow({ type, item, record, statuses, showStatus, onStatus, onScore, onRemove, busy }) {
  const title = (record && record.title) || item.title;
  const cover =
    (record && (record.images.jpg.large_image_url || record.images.jpg.image_url)) || item.image;
  const year = startYear(record, item);
  const length =
    type === "anime"
      ? record && record.episodes
        ? `${record.episodes} ${record.episodes === 1 ? "ep" : "eps"}`
        : null
      : record && record.chapters
        ? `${record.chapters} ch`
        : record && record.volumes
          ? `${record.volumes} vol`
          : null;
  const statusWord = record ? STATUS_WORDS[record.status] || null : null;
  const broadcast = type === "anime" && isRunning(record) ? toLocalBroadcast(record.broadcast) : null;
  const status = statuses.find((s) => s.key === item.currentList);
  const route = `/${type}/${item.id}`;

  return (
    <li className={`list-row${busy ? " list-row--busy" : ""}`}>
      <Link to={route} className="list-row__cover" tabIndex={-1} aria-hidden="true">
        <img src={cover} alt="" width="64" height="92" loading="lazy" />
      </Link>

      <div className="list-row__body">
        <Link to={route} className="list-row__title">
          {title}
        </Link>
        <p className="search__facts list-row__facts">
          {record && record.type ? <span>{record.type}</span> : item.type ? <span>{item.type}</span> : null}
          {year ? <span>{year}</span> : null}
          {length ? <span>{length}</span> : null}
          {statusWord ? (
            <span className={isRunning(record) ? "list-row__running" : undefined}>{statusWord}</span>
          ) : null}
        </p>
        {broadcast ? (
          <p className="list-row__broadcast">
            <FontAwesomeIcon icon={faTowerBroadcast} aria-hidden="true" />
            New episodes {DAYS[broadcast.day].long}s at {formatMinutes(broadcast.minutes)}
          </p>
        ) : null}
        <p className="list-row__meta">
          {showStatus && status ? (
            <span className="list-row__status">
              <span className="list-row__dot" style={{ background: `var(${status.colorVar})` }} aria-hidden="true" />
              {status.label}
            </span>
          ) : null}
          {record && typeof record.score === "number" ? (
            <span>
              MAL <strong>★ {record.score.toFixed(2)}</strong>
            </span>
          ) : null}
          {typeof item.userScore === "number" ? (
            <span>
              You <strong>{item.userScore}</strong>
            </span>
          ) : null}
          {shortDate(item.date) ? <span>Added {shortDate(item.date)}</span> : null}
        </p>
      </div>

      <div className="list-row__controls">
        <label className="list-row__control">
          <span className="visually-hidden">Status of {title}</span>
          <select value={item.currentList} disabled={busy} onChange={(event) => onStatus(item, event.target.value)}>
            {statuses.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="list-row__control list-row__control--score">
          <span className="visually-hidden">Your score for {title}</span>
          <select
            value={typeof item.userScore === "number" ? String(item.userScore) : ""}
            disabled={busy}
            onChange={(event) => onScore(item, event.target.value ? Number(event.target.value) : null)}
          >
            <option value="">Your score</option>
            {SCORES.map((score) => (
              <option key={score} value={score}>
                ★ {score}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="list-row__remove"
          disabled={busy}
          onClick={() => onRemove(item)}
          aria-label={`Remove ${title} from your list`}
          title="Remove from list"
        >
          <FontAwesomeIcon icon={faTrashCan} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export default ListRow;
