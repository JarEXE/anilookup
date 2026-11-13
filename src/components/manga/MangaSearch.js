import React from "react";
import useUrlParams from "../../hooks/useUrlParams";
import useUserList from "../../hooks/useUserList";
import ListStats from "../stats/ListStats";
import SearchBox from "../search/SearchBox";
import TopManga from "./TopManga";
import toast from "react-hot-toast";
import ScrollContainer from "react-indiana-drag-scroll";

function MangaSearch({ isDarkMode, allowNSFW, user }) {
  const notifyBadSearch = () =>
    toast.error("Type a title to search.", {
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
        color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
      },
    });
  const [{ top: selectedOption }, updateUrlParams] = useUrlParams({
    top: "publishing",
  });

  // The signed-in user's manga list (Firestore), shared by the stats panel and
  // the status badges on the Top cards.
  const {
    items: listItems,
    status: listLoadStatus,
    reload: reloadList,
  } = useUserList("manga", user);

  const topOptionAllowed =
    (selectedOption === "doujin" && allowNSFW === true) ||
    ["publishing", "manhwa", "manga", "novel", "manhua"].includes(
      selectedOption,
    );

  React.useEffect(() => {
    if (!topOptionAllowed) {
      updateUrlParams({ top: null, page: null }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topOptionAllowed]);

  const handleRadioChange = (event) => {
    // switching tabs starts back at page 1
    updateUrlParams({ top: event.target.id, page: null });
  };

  return (
    <div>
      <div className="container text-center">
        <div className="search-hero">
          <h1 className="search-hero__title">Look up any manga</h1>
          <SearchBox
            type="manga"
            variant="hero"
            onEmptySubmit={notifyBadSearch}
          />
        </div>
        {user ? (
          <ListStats
            type="manga"
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
        <div className="image-gallery">
          {topOptionAllowed ? (
            <TopManga
              isDarkMode={isDarkMode}
              allowNSFW={allowNSFW}
              selectedOption={selectedOption}
              listStatus={user ? listItems : null}
            />
          ) : null}
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

export default MangaSearch;
