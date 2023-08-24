import React from "react";
import LandingPageManga from "./LandingPageManga.js";
import axios from "axios";

export default function TopPublishing({ isDarkMode, allowNSFW }) {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/manga?filter=publishing&page=${currentPage}${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        // Map data to Anime components
        const animeCards = animes.map((anime) => (
          <LandingPageManga
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

  const nextPage = () => {
    if (pagination.has_next_page) {
      setLoading(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setLoading(true);
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
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
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{ borderRadius: "25px", marginRight: "10px" }}
            >
              Previous
            </button>
            <p style={{ marginBottom: "0" }}>
              Page {currentPage} of {pagination.last_visible_page}
            </p>
            <button
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={nextPage}
              disabled={!pagination.has_next_page}
              style={{ borderRadius: "25px", marginLeft: "10px" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function TopManhwa({ isDarkMode, allowNSFW }) {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/manga?type=manhwa&page=${currentPage}${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        // Map data to Anime components
        const animeCards = animes.map((anime) => (
          <LandingPageManga
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

  const nextPage = () => {
    if (pagination.has_next_page) {
      setLoading(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setLoading(true);
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
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
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{ borderRadius: "25px", marginRight: "10px" }}
            >
              Previous
            </button>
            <p style={{ marginBottom: "0" }}>
              Page {currentPage} of {pagination.last_visible_page}
            </p>
            <button
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={nextPage}
              disabled={!pagination.has_next_page}
              style={{ borderRadius: "25px", marginLeft: "10px" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function TopManhua({ isDarkMode, allowNSFW }) {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/manga?type=manhua&page=${currentPage}${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        // Map data to Anime components
        const animeCards = animes.map((anime) => (
          <LandingPageManga
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

  const nextPage = () => {
    if (pagination.has_next_page) {
      setLoading(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setLoading(true);
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
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
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{ borderRadius: "25px", marginRight: "10px" }}
            >
              Previous
            </button>
            <p style={{ marginBottom: "0" }}>
              Page {currentPage} of {pagination.last_visible_page}
            </p>
            <button
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={nextPage}
              disabled={!pagination.has_next_page}
              style={{ borderRadius: "25px", marginLeft: "10px" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function TopManga({ isDarkMode, allowNSFW }) {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/manga?type=manga&page=${currentPage}${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        // Map data to Anime components
        const animeCards = animes.map((anime) => (
          <LandingPageManga
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

  const nextPage = () => {
    if (pagination.has_next_page) {
      setLoading(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setLoading(true);
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
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
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{ borderRadius: "25px", marginRight: "10px" }}
            >
              Previous
            </button>
            <p style={{ marginBottom: "0" }}>
              Page {currentPage} of {pagination.last_visible_page}
            </p>
            <button
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={nextPage}
              disabled={!pagination.has_next_page}
              style={{ borderRadius: "25px", marginLeft: "10px" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function TopNovel({ isDarkMode, allowNSFW }) {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Start with loading state
  const [pagination, setPagination] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/manga?type=novel&page=${currentPage}${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        // Map data to Anime components
        const animeCards = animes.map((anime) => (
          <LandingPageManga
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

  const nextPage = () => {
    if (pagination.has_next_page) {
      setLoading(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setLoading(true);
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
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
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{ borderRadius: "25px", marginRight: "10px" }}
            >
              Previous
            </button>
            <p style={{ marginBottom: "0" }}>
              Page {currentPage} of {pagination.last_visible_page}
            </p>
            <button
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={nextPage}
              disabled={!pagination.has_next_page}
              style={{ borderRadius: "25px", marginLeft: "10px" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function TopDoujin({ isDarkMode, allowNSFW }) {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(`https://api.jikan.moe/v4/top/manga?type=doujin&page=${currentPage}`)
      .then((response) => {
        const animes = response.data.data;
        setPagination(response.data.pagination);

        // Map data to Anime components
        const animeCards = animes.map((anime) => (
          <LandingPageManga
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

  const nextPage = () => {
    if (pagination.has_next_page) {
      setLoading(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setLoading(true);
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
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
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{ borderRadius: "25px", marginRight: "10px" }}
            >
              Previous
            </button>
            <p style={{ marginBottom: "0" }}>
              Page {currentPage} of {pagination.last_visible_page}
            </p>
            <button
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              onClick={nextPage}
              disabled={!pagination.has_next_page}
              style={{ borderRadius: "25px", marginLeft: "10px" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
