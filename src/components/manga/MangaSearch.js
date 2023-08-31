import React from "react";
import { useNavigate } from "react-router-dom";
import TopManga from "./TopManga";
import toast from "react-hot-toast";
import ScrollContainer from "react-indiana-drag-scroll";

function MangaSearch({ onInputChange, isDarkMode, allowNSFW }) {
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
  const [selectedOption, setSelectedOption] = React.useState("publishing");

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

      navigate("/mangasearch");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const animeRoute = () => {
    navigate("/");
  };

  return (
    <div>
      <div className="container text-center">
        <div className="jumbotron" style={{ height: "161px" }}>
          <p className="lead">Lookup Any Manga!</p>
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
              onClick={() => animeRoute()}
            >
              Anime Section
            </a>
          </div>
        </div>
        <hr className="separator"></hr>
        <div className="container text-center mt-4">
          <p className="lead">Top</p>
        </div>

        <ScrollContainer className="inputToggles">
          <div className="inputToggleContainer">
            <div
              className="btn-group mb-4"
              role="group"
              aria-label="Basic radio toggle button group"
            >
              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="publishing"
                autoComplete="off"
                checked={selectedOption === "publishing"}
                onChange={handleRadioChange}
              />
              <label
                className={`${
                  isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                }`}
                htmlFor="publishing"
              >
                Publishing
              </label>

              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="manga"
                autoComplete="off"
                checked={selectedOption === "manga"}
                onChange={handleRadioChange}
              />
              <label
                className={`${
                  isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                }`}
                htmlFor="manga"
              >
                Manga
              </label>

              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="manhwa"
                autoComplete="off"
                checked={selectedOption === "manhwa"}
                onChange={handleRadioChange}
              />
              <label
                className={`${
                  isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                }`}
                htmlFor="manhwa"
              >
                Manhwa
              </label>

              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="manhua"
                autoComplete="off"
                checked={selectedOption === "manhua"}
                onChange={handleRadioChange}
              />
              <label
                className={`${
                  isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                }`}
                htmlFor="manhua"
              >
                Manhua
              </label>

              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="novel"
                autoComplete="off"
                checked={selectedOption === "novel"}
                onChange={handleRadioChange}
              />
              <label
                className={`${
                  isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                }`}
                htmlFor="novel"
              >
                Novel
              </label>

              {allowNSFW ? (
                <>
                  <input
                    type="radio"
                    className="btn-check"
                    name="btnradio"
                    id="doujin"
                    autoComplete="off"
                    checked={selectedOption === "doujin"}
                    onChange={handleRadioChange}
                  />
                  <label
                    className={`${
                      isDarkMode
                        ? "btn btn-outline-info"
                        : "btn btn-outline-dark"
                    }`}
                    htmlFor="doujin"
                  >
                    Doujinshi
                  </label>
                </>
              ) : null}
            </div>
          </div>
        </ScrollContainer>
      </div>
      <div>
        <ul className="image-gallery">
          {(selectedOption === "doujin" && allowNSFW === true) ||
          ["publishing", "manhwa", "manga", "novel", "manhua"].includes(
            selectedOption
          ) ? (
            <TopManga
              isDarkMode={isDarkMode}
              allowNSFW={allowNSFW}
              selectedOption={selectedOption}
            />
          ) : (
            setSelectedOption("publishing")
          )}
        </ul>
      </div>
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

export default MangaSearch;
