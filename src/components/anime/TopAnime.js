import React from "react";
import LandingPageAnime from "./LandingPageAnime.js";
import axios from "axios";
import toast from "react-hot-toast";

const TopAnime = ({ isDarkMode, allowNSFW, selectedOption, listStatus }) => {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [inputValue, setInputValue] = React.useState(currentPage);

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    setLoading(true);
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/anime?${
          selectedOption === "airing"
            ? "filter=airing"
            : selectedOption === "upcoming"
            ? "filter=upcoming"
            : selectedOption === "series"
            ? "type=tv"
            : selectedOption === "movies"
            ? "type=movie"
            : "filter=airing"
        }&page=${currentPage}${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        if (animes) {
          // Map data to Anime components
          const animeCards = animes.map((anime) => {
            let listIndex;

            if (listStatus !== null) {
              listIndex = listStatus.findIndex(
                (list) => parseInt(list.id) === anime.mal_id
              );
            }

            return (
              <LandingPageAnime
                key={anime.mal_id}
                img={anime.images.jpg.large_image_url}
                title={anime.title}
                //synopsis={anime.synopsis}
                isDarkMode={isDarkMode}
                malid={anime.mal_id}
                currentList={
                  listIndex > -1 ? listStatus[listIndex].currentList : null
                }
              />
            );
          });
          // Set cards and mark loading as false
          setCards(animeCards);
          setLoading(false);
        } else {
          setLoading(false);
          return null;
        }
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
    //eslint-disable-next-line
  }, [allowNSFW, sfwToggle, currentPage, selectedOption, listStatus]);

  const notifyInvalidPage = () =>
    toast(`Invalid page! Max is ${pagination.last_visible_page}`, {
      icon: "⚠️",
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
        color: `${isDarkMode ? "#333" : "#fff"}`,
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
      ) : (
        // Render the component with a unique key to force re-render
        <div>
          <div className="cards" key={key}>
            {cards}
          </div>
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

export default TopAnime;
