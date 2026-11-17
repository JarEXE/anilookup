import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { auth } from "../../firebase";
import useUrlParams from "../../hooks/useUrlParams";
import useUserList from "../../hooks/useUserList";
import useTitleInfo from "../../hooks/useTitleInfo";
import { goToLogin } from "../../utils/authRedirect";
import { getStatuses } from "../stats/listStatuses";
import LoadError from "../plugins/LoadError";
import ListRow from "./ListRow";
import { removeItem, restoreItem, setStatus, setUserScore, writeCache } from "./listActions";

const PAGE = 25;

// old URLs used "default" / "name"; they keep working
const SORTS = [
  { value: "default", label: "Recently added" },
  { value: "name", label: "Title (A–Z)" },
  { value: "released", label: "Release date" },
  { value: "score", label: "MAL score" },
  { value: "mine", label: "Your score" },
];

const time = (iso) => {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

// One list (anime or manga). Keyed by type below, so switching lists starts
// fresh instead of briefly showing the other list's items.
function ListView({ isDarkMode, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, updateUrlParams] = useUrlParams({
    type: "anime",
    status: "all",
    sort: "default",
    q: "",
  });
  const type = params.type === "manga" ? "manga" : "anime";
  const statuses = getStatuses(type);
  const status = statuses.some((s) => s.key === params.status) ? params.status : "all";
  const sort = SORTS.some((s) => s.value === params.sort) ? params.sort : "default";
  const search = params.q || "";

  // signed out: sign in, then come back to this exact view
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (!authUser) goToLogin(navigate, location, { replace: true });
    });
    return () => unsubscribe();
    // only the location at the moment of redirecting matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const { items: loaded, status: loadStatus, reload } = useUserList(type, user);
  // local copy, so changes show at once and roll back if Firestore refuses
  const [items, setItems] = React.useState(loaded);
  React.useEffect(() => setItems(loaded), [loaded]);
  const [busyId, setBusyId] = React.useState(null);
  const [visible, setVisible] = React.useState(PAGE);
  React.useEffect(() => setVisible(PAGE), [type, status, sort, search]);

  const list = React.useMemo(() => items || [], [items]);
  const ids = React.useMemo(() => list.map((item) => Number(item.id)).filter(Boolean), [list]);
  const info = useTitleInfo(type, ids);
  const recordFor = (item) => info.get(Number(item.id)) || null;

  const toastStyle = {
    borderRadius: "10px",
    background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
    color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
  };

  // apply a change locally, save it, and undo the local change on failure
  const mutate = async (item, change, save, message) => {
    const before = list;
    const after = list.map((entry) => (entry.id === item.id ? { ...entry, ...change } : entry));
    setItems(after);
    setBusyId(item.id);
    try {
      await save();
      writeCache(type, after);
      if (message) toast.success(message, { style: toastStyle });
    } catch (error) {
      console.error("Error updating the list:", error);
      setItems(before);
      toast.error("Couldn't save that change. Please try again.", { style: toastStyle });
    } finally {
      setBusyId(null);
    }
  };

  const changeStatus = (item, next) => {
    const label = statuses.find((s) => s.key === next).label;
    mutate(item, { currentList: next }, () => setStatus(type, item, next), `Moved to ${label}`);
  };

  const changeScore = (item, score) => {
    const change = { userScore: score === null ? undefined : score };
    mutate(item, change, () => setUserScore(type, item, score), null);
  };

  const remove = async (item) => {
    const before = list;
    const after = list.filter((entry) => entry.id !== item.id);
    setItems(after);
    try {
      await removeItem(type, item);
      writeCache(type, after);
      toast(
        (t) => (
          <span className="list-toast">
            Removed {item.title}
            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await restoreItem(type, item);
                  setItems((current) => {
                    const restored = [...(current || []), item];
                    writeCache(type, restored);
                    return restored;
                  });
                } catch (error) {
                  console.error("Error restoring list item:", error);
                  toast.error("Couldn't undo. Please add it again from its page.", { style: toastStyle });
                }
              }}
            >
              Undo
            </button>
          </span>
        ),
        { duration: 6000, style: toastStyle },
      );
    } catch (error) {
      console.error("Error removing list item:", error);
      setItems(before);
      toast.error("Couldn't remove it. Please try again.", { style: toastStyle });
    }
  };

  // ---- derive the visible list ----
  const counts = Object.fromEntries(
    statuses.map((s) => [s.key, list.filter((item) => item.currentList === s.key).length]),
  );
  const query = search.trim().toLowerCase();
  const matches = (item) => {
    if (!query) return true;
    const record = recordFor(item);
    return [item.title, record && record.title, record && record.title_english]
      .filter(Boolean)
      .some((text) => text.toLowerCase().includes(query));
  };
  const filtered = list
    .filter((item) => status === "all" || item.currentList === status)
    .filter(matches);

  const malScore = (item) => (recordFor(item) && recordFor(item).score) || 0;
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return (a.title || "").localeCompare(b.title || "");
    if (sort === "released") return time(b.released) - time(a.released);
    if (sort === "score") return malScore(b) - malScore(a);
    if (sort === "mine") return (b.userScore || 0) - (a.userScore || 0) || time(b.date) - time(a.date);
    return time(b.date) - time(a.date);
  });

  const statusLabel = status === "all" ? "" : statuses.find((s) => s.key === status).label;
  const noun = type === "anime" ? "anime" : "manga";

  let body;
  if (items === null && loadStatus === "error") {
    body = (
      <LoadError isDarkMode={isDarkMode} message={`Couldn't load your ${noun} list.`} onRetry={reload} />
    );
  } else if (items === null) {
    body = (
      <ul className="list-rows" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <li key={index} className="list-row list-row--skeleton" />
        ))}
      </ul>
    );
  } else if (!list.length) {
    body = (
      <div className="list-empty">
        <p>Your {noun} list is empty.</p>
        <p>
          Open any {noun} and use <strong>Add to List</strong> to start tracking.{" "}
          <Link to={type === "anime" ? "/" : "/manga"}>Browse {noun}</Link>
        </p>
      </div>
    );
  } else if (!sorted.length) {
    body = (
      <div className="list-empty">
        <p>
          {query
            ? `Nothing ${statusLabel ? `in ${statusLabel} ` : ""}matches “${search.trim()}”.`
            : `Nothing in ${statusLabel} yet.`}
        </p>
        {query ? (
          <button type="button" className="details-text-button" onClick={() => updateUrlParams({ q: null }, { replace: true })}>
            Clear the search
          </button>
        ) : null}
      </div>
    );
  } else {
    body = (
      <>
        <ul className="list-rows">
          {sorted.slice(0, visible).map((item) => (
            <ListRow
              key={item.id}
              type={type}
              item={item}
              record={recordFor(item)}
              statuses={statuses}
              showStatus={status === "all"}
              busy={busyId === item.id}
              onStatus={changeStatus}
              onScore={changeScore}
              onRemove={remove}
            />
          ))}
        </ul>
        {visible < sorted.length ? (
          <button type="button" className="details-more-button" onClick={() => setVisible(visible + PAGE)}>
            Show more ({sorted.length - visible} left)
          </button>
        ) : null}
      </>
    );
  }

  return (
    <div className="lists-page">
      <div className="lists-page__header">
        <h1 className="lists-page__title">Your lists</h1>
        <nav className="search__switch lists-page__type" aria-label="Which list">
          {["anime", "manga"].map((t) => (
            // switching lists starts on "All" with the default sort
            <Link
              key={t}
              to={`/lists?type=${t}`}
              className="search__switch-option"
              aria-current={type === t ? "page" : undefined}
            >
              {t === "anime" ? "Anime" : "Manga"}
            </Link>
          ))}
        </nav>
      </div>

      <div className="landing-tabs lists-page__tabs" role="group" aria-label="Status">
        <button
          type="button"
          className="landing-tabs__button"
          aria-pressed={status === "all"}
          onClick={() => updateUrlParams({ status: null })}
        >
          All <span className="entity-works__count">{list.length}</span>
        </button>
        {statuses.map((s) => (
          <button
            key={s.key}
            type="button"
            className="landing-tabs__button"
            aria-pressed={status === s.key}
            onClick={() => updateUrlParams({ status: s.key })}
          >
            <span className="list-row__dot" style={{ background: `var(${s.colorVar})` }} aria-hidden="true" />
            {s.label} <span className="entity-works__count">{counts[s.key]}</span>
          </button>
        ))}
      </div>

      <div className="lists-page__tools">
        <label className="lists-page__search">
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <span className="visually-hidden">Search your {noun} list</span>
          <input
            type="search"
            placeholder={`Search your ${noun} list`}
            value={search}
            onChange={(event) => updateUrlParams({ q: event.target.value || null }, { replace: true })}
          />
          {search ? (
            <button
              type="button"
              aria-label="Clear the search"
              onClick={() => updateUrlParams({ q: null }, { replace: true })}
            >
              <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            </button>
          ) : null}
        </label>
        <label className="search-page__filter">
          <span>Sort by</span>
          <select value={sort} onChange={(event) => updateUrlParams({ sort: event.target.value })}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {list.length ? (
        <p className="details-muted lists-page__count" role="status">
          {sorted.length} {sorted.length === 1 ? "title" : "titles"}
          {statusLabel ? ` in ${statusLabel}` : ""}
          {query ? ` matching “${search.trim()}”` : ""}
        </p>
      ) : null}

      {body}
    </div>
  );
}

// Rendered at /lists?type=anime|manga&status=...&sort=...&q=...
function Lists(props) {
  const { search } = useLocation();
  const type = new URLSearchParams(search).get("type") === "manga" ? "manga" : "anime";
  return <ListView key={type} {...props} />;
}

export default Lists;
