import React from "react";
import LandingPageAnime from "./LandingPageAnime.js";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function TopAiring({ isDarkMode, allowNSFW }) {
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
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/anime?filter=airing&page=${currentPage}${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        // Map data to Anime components
        const animeCards = animes.map((anime) => (
          <LandingPageAnime
            key={anime.mal_id}
            img={anime.images.jpg.large_image_url}
            title={anime.title}
            //synopsis={anime.synopsis}
            isDarkMode={isDarkMode}
            malid={anime.mal_id}
          />
        ));

        // Set cards and mark loading as false
        setCards(animeCards);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  }, [isDarkMode, allowNSFW, sfwToggle, currentPage]);

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
          <Toaster position="top-left" />
        </div>
      )}
    </>
  );
}

export function TopUpcoming({ isDarkMode, allowNSFW }) {
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
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/anime?filter=upcoming&page=${currentPage}${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        // Map data to Anime components
        const animeCards = animes.map((anime) => (
          <LandingPageAnime
            key={anime.mal_id}
            img={anime.images.jpg.large_image_url}
            title={anime.title}
            //synopsis={anime.synopsis}
            isDarkMode={isDarkMode}
            malid={anime.mal_id}
          />
        ));

        // Set cards and mark loading as false
        setCards(animeCards);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  }, [isDarkMode, allowNSFW, sfwToggle, currentPage]);
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
          <Toaster position="top-left" />
        </div>
      )}
    </>
  );
}

export function TopSeries({ isDarkMode, allowNSFW }) {
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
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/anime?type=tv&page=${currentPage}${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        // Map data to Anime components
        const animeCards = animes.map((anime) => (
          <LandingPageAnime
            key={anime.mal_id}
            img={anime.images.jpg.large_image_url}
            title={anime.title}
            //synopsis={anime.synopsis}
            isDarkMode={isDarkMode}
            malid={anime.mal_id}
          />
        ));

        // Set cards and mark loading as false
        setCards(animeCards);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  }, [isDarkMode, allowNSFW, sfwToggle, currentPage]);

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
          <Toaster position="top-left" />
        </div>
      )}
    </>
  );
}

export function TopMovies({ isDarkMode, allowNSFW }) {
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
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/anime?type=movie&page=${currentPage}${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        // Map data to Anime components
        const animeCards = animes.map((anime) => (
          <LandingPageAnime
            key={anime.mal_id}
            img={anime.images.jpg.large_image_url}
            title={anime.title}
            //synopsis={anime.synopsis}
            isDarkMode={isDarkMode}
            malid={anime.mal_id}
          />
        ));

        // Set cards and mark loading as false
        setCards(animeCards);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  }, [isDarkMode, allowNSFW, sfwToggle, currentPage]);

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
          <Toaster position="top-left" />
        </div>
      )}
    </>
  );
}
