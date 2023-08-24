import React from "react";
import { useNavigate } from "react-router-dom";
import TopAiring from "./TopAnime";
import { TopUpcoming } from "./TopAnime";
import { TopSeries } from "./TopAnime";
import { TopMovies } from "./TopAnime";
import toast, { Toaster } from "react-hot-toast";
import ScrollContainer from "react-indiana-drag-scroll";

function AnimeSearch({ onInputChange, isDarkMode, allowNSFW }) {
  const notifyBadSearch = () =>
    toast.error("Input cannot be empty!", {
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
        color: `${isDarkMode ? "#333" : "#fff"}`,
      },
    });
  const [searchText, setSearchText] = React.useState("");

  // Initialize state to manage the selected radio button
  const [selectedOption, setSelectedOption] = React.useState("airing");

  const navigate = useNavigate();

  // Handler to update the selected radio button
  const handleRadioChange = (event) => {
    setSelectedOption(event.target.id);
  };

  const handleChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleSubmit = () => {
    if (searchText.length < 1) {
      notifyBadSearch();
      return;
    } else {
      sessionStorage.setItem("searchText", searchText);
      onInputChange(searchText);

      navigate("/search");
    }
  };

  const mangaRoute = () => {
    navigate("/mangalookup");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div>
      <div className="container text-center">
        <div className="jumbotron" style={{ height: "161px" }}>
          <p className="lead">Lookup Any Anime!</p>
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Start typing here..."
              value={searchText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              style={{ borderRadius: "25px" }}
            />
          </div>
          <div className="d-flex justify-content-center">
            <button
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              style={{ width: "40%", borderRadius: "25px" }}
              type="button"
              onClick={handleSubmit}
            >
              Search
            </button>
            <a
              href="#/"
              className="btn btn-secondary"
              style={{
                width: "40%",
                height: "38px",
                borderRadius: "25px",
                marginLeft: "5px",
              }}
              onClick={() => mangaRoute()}
            >
              Manga Section
            </a>
          </div>
        </div>
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
        <ul className="image-gallery">
          {selectedOption === "airing" ? (
            <TopAiring isDarkMode={isDarkMode} allowNSFW={allowNSFW} />
          ) : selectedOption === "upcoming" ? (
            <TopUpcoming isDarkMode={isDarkMode} allowNSFW={allowNSFW} />
          ) : selectedOption === "series" ? (
            <TopSeries isDarkMode={isDarkMode} allowNSFW={allowNSFW} />
          ) : selectedOption === "movies" ? (
            <TopMovies isDarkMode={isDarkMode} allowNSFW={allowNSFW} />
          ) : (
            <TopAiring isDarkMode={isDarkMode} allowNSFW={allowNSFW} />
          )}
        </ul>
      </div>
      <Toaster position="top-left" />
      <hr className="footer-separator"></hr>
      <div className="text-center">
        Powered by{" "}
        <strong>
          <a href="https://jikan.moe/">Jikan</a>
        </strong>{" "}
        REST API
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
