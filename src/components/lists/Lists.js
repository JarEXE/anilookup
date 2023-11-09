import React from "react";
import All from "./Watchlist";
import AllManga from "./ReadingList";

const AnimeLists = ({ isDarkMode }) => {
  const [listType, setListType] = React.useState("anime");
  const [selectedOption, setSelectedOption] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("default");
  const [sortText, setSortText] = React.useState("Default");

  const handleListType = (event) => {
    if (event.target.id === "animelist") {
      setListType("anime");
    } else if (event.target.id === "mangalist") {
      setListType("manga");
    } else {
      setListType("anime");
    }

    setSelectedOption("all");
    setSortBy("default");
    setSortText("Default");
  };

  const handleClick = (event) => {
    console.log("clicked");
    if (event.target.id === "all") {
      setSelectedOption("all");
    } else if (event.target.id === "watching") {
      setSelectedOption("watching");
    } else if (event.target.id === "reading") {
      setSelectedOption("reading");
    } else if (event.target.id === "onhold") {
      setSelectedOption("onhold");
    } else if (event.target.id === "planned") {
      setSelectedOption("planned");
    } else if (event.target.id === "dropped") {
      setSelectedOption("dropped");
    } else if (event.target.id === "completed") {
      setSelectedOption("completed");
    } else {
      setSelectedOption("all");
    }
  };

  const handleSortChange = (event) => {
    if (event.target.id === "default") {
      setSortBy("default");
      setSortText("Default");
    } else if (event.target.id === "name") {
      setSortBy("name");
      setSortText("Name (A-Z)");
    } else if (event.target.id === "released") {
      setSortBy("released");
      setSortText("Released Date");
    } else {
      setSortBy("default");
      setSortText("Default");
    }
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
            onClick={handleListType}
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
            onClick={handleListType}
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
              onClick={handleClick}
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
              onClick={handleClick}
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
              onClick={handleClick}
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
              onClick={handleClick}
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
              onClick={handleClick}
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
              onClick={handleClick}
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
