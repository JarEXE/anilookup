import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import useSuggestions from "./useSuggestions";
import { bestCompletion, itemFacts } from "./searchUtils";

const SECTIONS = [
  { type: "anime", label: "Anime", home: "/" },
  { type: "manga", label: "Manga", home: "/manga" },
];

const resultsUrl = (type, query) =>
  `/${type}/search?q=${encodeURIComponent(query.trim())}`;

// Bold the part of the title that matches what was typed.
function HighlightedTitle({ title, query }) {
  const typed = query.trim();
  const index = typed ? title.toLowerCase().indexOf(typed.toLowerCase()) : -1;
  if (index === -1) return title;
  return (
    <>
      {title.slice(0, index)}
      <mark>{title.slice(index, index + typed.length)}</mark>
      {title.slice(index + typed.length)}
    </>
  );
}

// Search field with live suggestions for the current section (anime or manga).
//
// - Typing shows the most popular matching titles; the best guess is also
//   completed inline (faded text) and Tab / → accepts it.
// - Choosing a suggestion opens that title's page.
// - Pressing Enter / Search without choosing one opens the full results page.
//
// variant "hero" is the large landing page field, "bar" the compact one at the
// top of the results page, "nav" the one in the navbar on every other page.
// On the results page the section switch keeps the current query; in the
// navbar it only changes what is being searched (no navigation).
function SearchBox({
  type: pageType,
  initialQuery = "",
  variant = "hero",
  onEmptySubmit,
}) {
  const navigate = useNavigate();
  const inputRef = React.useRef(null);
  const id = React.useId();
  const listboxId = `${id}-listbox`;
  const optionId = (index) => `${id}-option-${index}`;

  const isNav = variant === "nav";
  // the navbar box keeps its own anime/manga choice, starting from the page's
  const [navType, setNavType] = React.useState(pageType);
  React.useEffect(() => {
    setNavType(pageType);
  }, [pageType]);
  const type = isNav ? navType : pageType;

  const [query, setQuery] = React.useState(initialQuery);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [caretAtEnd, setCaretAtEnd] = React.useState(true);
  const [typedOverflows, setTypedOverflows] = React.useState(false);

  // results page: follow the URL when it changes (back/forward, new search)
  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const { suggestions, status } = useSuggestions(type, query);
  const hasQuery = query.trim().length >= 2;
  const showDropdown = open && hasQuery;
  const seeAllIndex = suggestions.length;

  const completion = bestCompletion(query, suggestions);
  const showGhost =
    showDropdown && completion && caretAtEnd && !typedOverflows && activeIndex === -1;
  const ghostRest = completion
    ? completion.slice(query.trimStart().length)
    : "";

  // the inline completion is drawn behind the input, so hide it if the typed
  // text has scrolled inside the field (it would no longer line up)
  React.useLayoutEffect(() => {
    const input = inputRef.current;
    if (input) setTypedOverflows(input.scrollWidth > input.clientWidth + 1);
  }, [query]);

  // keep the highlighted option in range as suggestions change
  React.useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  const updateCaret = () => {
    const input = inputRef.current;
    if (!input) return;
    setCaretAtEnd(
      input.selectionStart === input.value.length &&
        input.selectionEnd === input.value.length,
    );
  };

  const acceptCompletion = () => {
    setQuery(completion);
    setCaretAtEnd(true);
  };

  const openItem = (item) => {
    setOpen(false);
    inputRef.current && inputRef.current.blur();
    // the navbar stays mounted across pages, so start fresh next time
    if (isNav) setQuery("");
    navigate(`/${type}/${item.mal_id}`);
  };

  const submitSearch = () => {
    if (!query.trim()) {
      if (onEmptySubmit) onEmptySubmit();
      inputRef.current && inputRef.current.focus();
      return;
    }
    setOpen(false);
    // closes the on-screen keyboard on phones
    inputRef.current && inputRef.current.blur();
    if (isNav) setQuery("");
    navigate(resultsUrl(type, query));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (showDropdown && activeIndex >= 0 && activeIndex < seeAllIndex) {
      openItem(suggestions[activeIndex]);
    } else {
      submitSearch();
    }
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        if (!hasQuery) return;
        event.preventDefault();
        setOpen(true);
        setActiveIndex((index) => (index >= seeAllIndex ? 0 : index + 1));
        break;
      case "ArrowUp":
        if (!hasQuery) return;
        event.preventDefault();
        setOpen(true);
        setActiveIndex((index) => (index <= 0 ? seeAllIndex : index - 1));
        break;
      case "Escape":
        if (showDropdown) {
          event.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
        } else if (query) {
          event.preventDefault();
          setQuery("");
        }
        break;
      case "Tab":
        if (showGhost && !event.shiftKey) {
          event.preventDefault();
          acceptCompletion();
        }
        break;
      case "ArrowRight":
        if (showGhost) {
          event.preventDefault();
          acceptCompletion();
        }
        break;
      default:
        break;
    }
  };

  // close when focus leaves the whole search box
  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const sectionLink = (section) =>
    variant === "bar" && query.trim()
      ? resultsUrl(section.type, query)
      : section.home;

  const announcement = !showDropdown
    ? ""
    : status === "error"
      ? "Suggestions unavailable. Press Enter to search."
      : status === "ready"
        ? suggestions.length
          ? `${suggestions.length} suggestions. Use the up and down arrows to review.`
          : "No matching titles. Press Enter to search anyway."
        : "";

  return (
    <form
      role="search"
      className={`search search--${variant}`}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
    >
      {!isNav ? (
        <div className="search__switch" role="group" aria-label="Search in">
          {SECTIONS.map((section) => (
            <Link
              key={section.type}
              to={sectionLink(section)}
              className="search__switch-option"
              aria-current={section.type === type ? "page" : undefined}
            >
              {section.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="search__field">
        {isNav ? (
          <div
            className="search__switch search__switch--inline"
            role="group"
            aria-label="Search in"
          >
            {SECTIONS.map((section) => (
              <button
                key={section.type}
                type="button"
                className="search__switch-option"
                aria-pressed={section.type === type}
                onClick={() => {
                  setNavType(section.type);
                  inputRef.current && inputRef.current.focus();
                }}
              >
                {section.label}
              </button>
            ))}
          </div>
        ) : (
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="search__icon"
            aria-hidden="true"
          />
        )}

        <div className="search__input-wrap">
          {showGhost ? (
            <span className="search__ghost" aria-hidden="true">
              {/* one inline run, so typed text and completion stay on one line */}
              <span>
                <span className="search__ghost-typed">{query}</span>
                {ghostRest}
              </span>
            </span>
          ) : null}
          <input
            ref={inputRef}
            type="search"
            name="q"
            className="search__input"
            placeholder={isNav ? `Search ${type}` : `Search ${type} by title`}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            enterKeyHint="search"
            role="combobox"
            aria-label={`Search ${type}`}
            aria-autocomplete="both"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-activedescendant={
              showDropdown && activeIndex >= 0 ? optionId(activeIndex) : undefined
            }
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              updateCaret();
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCaret}
            onClick={updateCaret}
            onSelect={updateCaret}
          />
        </div>

        {showGhost ? (
          <kbd className="search__tab-hint" aria-hidden="true">
            Tab
          </kbd>
        ) : null}

        {query ? (
          <button
            type="button"
            className="search__clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current && inputRef.current.focus();
            }}
          >
            <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
          </button>
        ) : null}

        {isNav ? (
          <button
            type="submit"
            className="search__submit search__submit--icon"
            aria-label={`Search ${type}`}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          </button>
        ) : (
          <button type="submit" className="search__submit">
            Search
          </button>
        )}
      </div>

      <div className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </div>

      {showDropdown ? (
        <div className="search__dropdown">
          {status === "error" ? (
            <p className="search__dropdown-message">
              Suggestions aren't available right now. Press Enter to see all
              results.
            </p>
          ) : status === "loading" && suggestions.length === 0 ? (
            <p className="search__dropdown-message">Searching…</p>
          ) : status === "ready" && suggestions.length === 0 ? (
            <p className="search__dropdown-message">
              No titles match “{query.trim()}”.
            </p>
          ) : null}

          <ul
            id={listboxId}
            role="listbox"
            aria-label={`${type === "anime" ? "Anime" : "Manga"} suggestions`}
            className="search__options"
          >
            {suggestions.map((item, index) => {
              const facts = itemFacts(item, type);
              const english =
                item.title_english && item.title_english !== item.title
                  ? item.title_english
                  : null;
              return (
                <li
                  key={item.mal_id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={activeIndex === index}
                  className="search__option"
                  // keep focus in the input so the click isn't lost on blur
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => openItem(item)}
                  onMouseMove={() => setActiveIndex(index)}
                >
                  <img
                    src={item.images.jpg.small_image_url || item.images.jpg.image_url}
                    alt=""
                    width="40"
                    height="56"
                    className="search__option-cover"
                  />
                  <span className="search__option-text">
                    <span className="search__option-title">
                      <HighlightedTitle title={item.title} query={query} />
                    </span>
                    {english ? (
                      <span className="search__option-english">{english}</span>
                    ) : null}
                    <span className="search__facts">
                      {facts.map((fact) => (
                        <span key={fact}>{fact}</span>
                      ))}
                    </span>
                  </span>
                  {item.score ? (
                    <span className="search__option-score">
                      <FontAwesomeIcon icon={faStar} aria-hidden="true" />
                      <span className="visually-hidden">Score </span>
                      {item.score.toFixed(2)}
                    </span>
                  ) : null}
                </li>
              );
            })}
            <li
              id={optionId(seeAllIndex)}
              role="option"
              aria-selected={activeIndex === seeAllIndex}
              className="search__option search__option--all"
              onMouseDown={(event) => event.preventDefault()}
              onClick={submitSearch}
              onMouseMove={() => setActiveIndex(seeAllIndex)}
            >
              <span>
                See all results for <strong>“{query.trim()}”</strong>
              </span>
              <kbd className="search__enter-hint" aria-hidden="true">
                Enter
              </kbd>
            </li>
          </ul>
        </div>
      ) : null}
    </form>
  );
}

export default SearchBox;
