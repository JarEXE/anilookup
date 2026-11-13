import React from "react";
import All from "./Watchlist";
import AllManga from "./ReadingList";
import useUrlParams from "../../hooks/useUrlParams";

const sortLabels = {
  default: "Default",
  name: "Name (A-Z)",
  released: "Released Date",
};

const listStatuses = [
  "all",
  "watching",
  "reading",
  "onhold",
  "planned",
  "dropped",
  "completed",
];

const AnimeLists = ({ isDarkMode }) => {
  const [urlParams, updateUrlParams] = useUrlParams({
    type: "anime",
    status: "all",
    sort: "default",
  });
  const listType = urlParams.type === "manga" ? "manga" : "anime";
  const selectedOption = listStatuses.includes(urlParams.status)
    ? urlParams.status
    : "all";
  const sortBy = sortLabels[urlParams.sort] ? urlParams.sort : "default";
  const sortText = sortLabels[sortBy];

  const handleListType = (event) => {
    // switching between anime and manga resets the status tab and sorting
    updateUrlParams({
      type: event.target.id === "mangalist" ? "manga" : "anime",
      status: null,
      sort: null,
    });
  };

  const handleClick = (event) => {
    updateUrlParams({
      status: listStatuses.includes(event.target.id) ? event.target.id : null,
    });
  };

  const handleSortChange = (event) => {
    // these are <a href="#/"> items - don't let them add a "#/" history entry
    event.preventDefault();
    updateUrlParams({
      sort: sortLabels[event.target.id] ? event.target.id : null,
    });
  };
  return (
    <div style={{ marginTop: "5%" }}>
      <div className="animeListsToggles" style={{ justifyContent: "center" }}>
        <div
          className="btn-group mb-4"
          role="group"
          aria-label="Basic radio toggle button group"
        >
          <input
            type="radio"
            className="btn-check"
            name="btnradiolist"
            id="animelist"
            autoComplete="off"
            checked={listType === "anime"}
            onChange={handleListType}
          />
          <label
            className={`${
              isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
            }`}
            htmlFor="animelist"
          >
            Anime
          </label>

          <input
            type="radio"
            className="btn-check"
            name="btnradiolist"
            id="mangalist"
            autoComplete="off"
            checked={listType === "manga"}
            onChange={handleListType}
          />
          <label
            className={`${
              isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
            }`}
            htmlFor="mangalist"
          >
            Manga
          </label>
        </div>
      </div>
      <hr></hr>
      <br></br>
      <h5>{listType === "anime" ? "Watch" : "Reading"} List</h5>
      <div
        style={{
          marginTop: "5%",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div className="animeListsToggles" style={{ justifyContent: "start" }}>
          <div
            className="btn-group mb-4"
            role="group"
            aria-label="Basic radio toggle button group"
          >
            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="all"
              autoComplete="off"
              checked={selectedOption === "all"}
              onChange={handleClick}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="all"
            >
              All
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id={listType === "anime" ? "watching" : "reading"}
              autoComplete="off"
              checked={
                selectedOption === "watching" || selectedOption === "reading"
              }
              onChange={handleClick}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor={`${listType === "anime" ? "watching" : "reading"}`}
            >
              {listType === "anime" ? "Watching" : "Reading"}
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="onhold"
              autoComplete="off"
              checked={selectedOption === "onhold"}
              onChange={handleClick}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              style={{ width: "100px" }}
              htmlFor="onhold"
            >
              On-Hold
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="planned"
              autoComplete="off"
              checked={selectedOption === "planned"}
              onChange={handleClick}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              style={{ width: "150px" }}
              htmlFor="planned"
            >
              Plan to {`${listType === "anime" ? "Watch" : "Read"}`}
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="dropped"
              autoComplete="off"
              checked={selectedOption === "dropped"}
              onChange={handleClick}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="dropped"
            >
              Dropped
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="completed"
              autoComplete="off"
              checked={selectedOption === "completed"}
              onChange={handleClick}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="completed"
            >
              Completed
            </label>
          </div>
        </div>
        <div
          className="dropdown"
          data-bs-popper="none"
          style={{
            marginLeft: "5%",
          }}
        >
          <button
            className={`btn btn-${
              isDarkMode ? "info" : "dark"
            } dropdown-toggle`}
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Sort By: {sortText}
          </button>
          <ul className="dropdown-menu">
            <li>
              <a
                className="dropdown-item"
                href="#/"
                type="radio"
                name="btnsort"
                id="default"
                autoComplete="off"
                checked={sortBy === "default"}
                onClick={handleSortChange}
              >
                Recently Added (Default)
              </a>
            </li>

            <li>
              <a
                className="dropdown-item"
                href="#/"
                type="radio"
                name="btnsort"
                id="name"
                autoComplete="off"
                checked={sortBy === "name"}
                onClick={handleSortChange}
              >
                Name (A-Z)
              </a>
            </li>

            <li>
              <a
                className="dropdown-item"
                href="#/"
                type="radio"
                name="btnsort"
                id="released"
                autoComplete="off"
                checked={sortBy === "released"}
                onClick={handleSortChange}
              >
                Released Date
              </a>
            </li>
          </ul>
        </div>
      </div>
      {listType === "anime" ? (
        <All
          isDarkMode={isDarkMode}
          selectedOption={selectedOption}
          sortBy={sortBy}
        />
      ) : (
        <AllManga
          isDarkMode={isDarkMode}
          selectedOption={selectedOption}
          sortBy={sortBy}
        />
      )}
    </div>
  );
};

export default AnimeLists;
