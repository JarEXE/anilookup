import React from "react";
import { sfwQuery, withoutNsfw } from "../../utils/nsfw";
import StudioAnime from "../anime/StudioAnime.js";
import toast from "react-hot-toast";
import { API_URL, apiClient } from "../../config/api.js";
import LoadError from "../plugins/LoadError";
import useUrlParams, { parsePage } from "../../hooks/useUrlParams";

// What this studio did for the given anime. Later matches win, so the order of
// precedence is Studio > Licensor > Producer (same as before).
function studioRole(anime, studioName) {
  let foundIn = null;

  if ((anime.producers || []).some((item) => item.name === studioName)) {
    foundIn = "Producer";
  }
  if ((anime.licensors || []).some((item) => item.name === studioName)) {
    foundIn = "Licensor";
  }
  if ((anime.studios || []).some((item) => item.name === studioName)) {
    foundIn = "Studio";
  }

  return foundIn;
}

const StudioWorks = ({
  isDarkMode,
  allowNSFW,
  studioId,
  studioName,
  selectedOption,
  sortBy,
}) => {
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({});
  const [urlParams, updateUrlParams] = useUrlParams({ page: "1" });
  const currentPage = parsePage(urlParams.page);
  const setCurrentPage = (page) => {
    const newPage = parseInt(page, 10);
    if (Number.isInteger(newPage) && newPage > 0) {
      updateUrlParams({ page: newPage });
    }
  };
  const [inputValue, setInputValue] = React.useState(currentPage);

  // keep the page input in sync when the page changes via back/forward
  React.useEffect(() => {
    setInputValue(currentPage);
  }, [currentPage]);

  const [animes, setItems] = React.useState([]);
  const [loadError, setLoadError] = React.useState(false);
  // bumped by the "Try again" button to re-run the fetch effect
  const [reloadKey, setReloadKey] = React.useState(0);

  // Only data is stored here; the cards are rendered from it below. (Building
  // the JSX inside this effect forced the theme into its dependencies, which
  // re-fetched the API on every dark mode toggle.)
  React.useEffect(() => {
    // ignore a response for a page/filter the user has already moved away from
    let cancelled = false;

    setLoading(true);
    setLoadError(false);
    setKey((prevKey) => prevKey + 1);

    apiClient
      .get(
        `${API_URL}/anime?producers=${studioId}${
          selectedOption === "all"
            ? ""
            : selectedOption === "other"
              ? `&type=special`
              : `&type=${selectedOption}`
        }&order_by=${sortBy}&sort=desc&page=${currentPage}${sfwQuery(allowNSFW)}`,
      )
      .then((response) => {
        if (cancelled) return;
        setPagination(response.data.pagination || {});
        setItems(withoutNsfw(response.data.data, "anime", allowNSFW));
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error fetching API data:", error);
        setLoading(false);
        setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [
    allowNSFW,
    currentPage,
    studioId,
    selectedOption,
    sortBy,
    reloadKey,
  ]);

  const notifyInvalidPage = () =>
    toast(`Invalid page! Max is ${pagination.last_visible_page}`, {
      icon: "⚠️",
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
        color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
      },
    });

  const nextPage = () => {
    if (pagination.has_next_page) {
      setLoading(true);
      const nextPage = currentPage + 1;
      setInputValue(nextPage);
      setCurrentPage(nextPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setLoading(true);
      const prevPage = currentPage - 1;
      setInputValue(prevPage);
      setCurrentPage(prevPage);
    }
  };

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value, 10); // Parse the input value as an integer
    setInputValue(value); // Update the input value state
  };

  const handleInputBlur = () => {
    // When the input loses focus, update the currentPage state

    if (inputValue > pagination.last_visible_page) {
      notifyInvalidPage();
      return;
    } else {
      setCurrentPage(inputValue);
    }
  };

  const handleInputKeyPress = (event) => {
    // Check if Enter key was pressed
    if (event.key === "Enter") {
      if (inputValue > pagination.last_visible_page) {
        notifyInvalidPage();
        return;
      } else {
        setCurrentPage(inputValue); // Update currentPage when Enter is pressed
      }
    }
  };

  const handleArrowClick = () => {
    if (inputValue > pagination.last_visible_page) {
      notifyInvalidPage();
      return;
    } else {
      setCurrentPage(inputValue);
    }
  };

  return (
    <>
      {loading ? (
        <div className="loadContainer">
          <span className="loader"></span>
        </div>
      ) : loadError ? (
        <LoadError
          isDarkMode={isDarkMode}
          message="Couldn't load this studio's works right now."
          onRetry={() => setReloadKey((prevKey) => prevKey + 1)}
        />
      ) : (
        // Render the component with a unique key to force re-render
        <div>
          <ul className="cover-grid" key={key}>
            {animes.map((anime) => (
              <StudioAnime
                key={anime.mal_id}
                img={anime.images.jpg.large_image_url}
                title={anime.title}
                isDarkMode={isDarkMode}
                malid={anime.mal_id}
                role={studioRole(anime, studioName)}
                score={anime.score}
                members={anime.members}
              />
            ))}
          </ul>
          <div className="pagination">
            <button
              className={`btn btn-${
                isDarkMode ? "info" : "dark"
              } pagination-prev`}
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <div className="row align-items-center pagination-container-full">
              &nbsp;&nbsp;&nbsp;&nbsp;Page&nbsp;
              <div className="col pagination-container">
                <input
                  className="pagination-input"
                  value={inputValue}
                  type="number"
                  min={1}
                  max={pagination.last_visible_page}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyPress}
                />
              </div>
              <div
                className="col-auto"
                style={{ paddingLeft: "0", paddingRight: "0" }}
              >
                <button
                  className={`btn btn-${
                    isDarkMode ? "info" : "dark"
                  } pagination-button`}
                  onClick={handleArrowClick}
                  aria-label="Go to Page"
                >
                  <span>&#8594;</span>
                </button>
              </div>
              &nbsp;of {pagination.last_visible_page}&nbsp;&nbsp;&nbsp;&nbsp;
            </div>

            <button
              className={`btn btn-${
                isDarkMode ? "info" : "dark"
              } pagination-next`}
              onClick={nextPage}
              disabled={!pagination.has_next_page}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StudioWorks;
