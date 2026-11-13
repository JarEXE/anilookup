import React from "react";
import useUrlParams from "../../hooks/useUrlParams";
import useUserList from "../../hooks/useUserList";
import ListStats from "../stats/ListStats";
import SearchBox from "../search/SearchBox";
import TopAnime from "./TopAnime";
import toast from "react-hot-toast";
import ScrollContainer from "react-indiana-drag-scroll";

function AnimeSearch({ isDarkMode, allowNSFW, user }) {
  const notifyBadSearch = () =>
    toast.error("Type a title to search.", {
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
        color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
      },
    });

  const [{ top: selectedOption }, updateUrlParams] = useUrlParams({
    top: "airing",
  });

  const {
    items: listItems,
    status: listLoadStatus,
    reload: reloadList,
  } = useUserList("anime", user);

  // Handler to update the selected radio button
  const handleRadioChange = (event) => {
    // switching tabs starts back at page 1
    updateUrlParams({ top: event.target.id, page: null });
  };

  return (
    <div>
      <div className="container text-center">
        <div className="search-hero">
          <h1 className="search-hero__title">Look up any anime</h1>
          <SearchBox
            type="anime"
            variant="hero"
            onEmptySubmit={notifyBadSearch}
          />
        </div>
        {user ? (
          <ListStats
            type="anime"
            items={listItems}
            status={listLoadStatus}
            onRetry={reloadList}
          />
        ) : null}
        <hr className="separator"></hr>
        <div className="container text-center mt-4">
          <p className="lead">Top</p>
        </div>
        <ScrollContainer className="inputToggles">
          <div
            className="btn-group mb-4"
            role="group"
            aria-label="Basic radio toggle button group"
          >
            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="airing"
              autoComplete="off"
              checked={selectedOption === "airing"}
              onChange={handleRadioChange}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="airing"
            >
              Airing
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="upcoming"
              autoComplete="off"
              checked={selectedOption === "upcoming"}
              onChange={handleRadioChange}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="upcoming"
            >
              Upcoming
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="series"
              autoComplete="off"
              checked={selectedOption === "series"}
              onChange={handleRadioChange}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="series"
            >
              Series
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="movies"
              autoComplete="off"
              checked={selectedOption === "movies"}
              onChange={handleRadioChange}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="movies"
            >
              Movies
            </label>
          </div>
        </ScrollContainer>
      </div>
      <div>
        <div className="image-gallery">
          <TopAnime
            isDarkMode={isDarkMode}
            allowNSFW={allowNSFW}
            selectedOption={selectedOption}
            listStatus={user ? listItems : null}
          />
        </div>
      </div>
      <hr className="footer-separator"></hr>
      <div className="text-center">
        Powered by{" "}
        <strong>
          <a href="https://api.tenrai.org">Tenrai</a>
        </strong>{" "}
        <p>
          Made by{" "}
          <strong>
            <a href="https://github.com/JarEXE">Jarome Eyken</a>
          </strong>
        </p>
      </div>
    </div>
  );
}

export default AnimeSearch;
