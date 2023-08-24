import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../src/style.css";
import Anime from "./Anime";
import Manga from "./Manga";

function Cards({ allowNSFW, isDarkMode }) {
  let oldSearch = sessionStorage.getItem("searchText");
  let sfwToggle = sessionStorage.getItem("sfw");

  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Start with loading state

  const navigate = useNavigate();
  const location = useLocation();

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    if (oldSearch && location.pathname === "/search") {
      axios
        .get(
          `https://api.jikan.moe/v4/anime?q=${oldSearch}${
            // eslint-disable-next-line
            sfwToggle == 1 ? "/" : "&sfw"
          }`
        )
        .then((response) => {
          const animes = response.data.data;

          // Map data to Anime components
          const animeCards = animes.map((anime) => (
            <Anime
              key={anime.mal_id}
              img={anime.images.jpg.image_url}
              title={anime.title}
              synopsis={anime.synopsis}
              malid={anime.mal_id}
              isDarkMode={isDarkMode}
            />
          ));

          // Set cards and mark loading as false
          setCards(animeCards);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching API data:", error);
        });
    } else if (oldSearch && location.pathname === "/mangasearch") {
      axios
        .get(
          `https://api.jikan.moe/v4/manga?q=${oldSearch}${
            // eslint-disable-next-line
            sfwToggle == 1 ? "/" : "&sfw"
          }`
        )
        .then((response) => {
          const mangas = response.data.data;

          // Map data to Manga components
          const mangaCards = mangas.map((manga) => (
            <Manga
              key={manga.mal_id}
              img={manga.images.jpg.image_url}
              title={manga.title}
              synopsis={manga.synopsis}
              malid={manga.mal_id}
              isDarkMode={isDarkMode}
            />
          ));

          // Set cards and mark loading as false
          setCards(mangaCards);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching API data:", error);
        });
    }
  }, [oldSearch, location.pathname, sfwToggle, allowNSFW, isDarkMode]);

  if (oldSearch === null) {
    navigate("/");
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        maxWidth: "900px",
        justifyContent: "space-around",
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
          }}
        >
          <span className="loader"></span>
        </div>
      ) : (
        // Render the component with a unique key to force re-render
        <React.Fragment key={key}>{cards}</React.Fragment>
      )}
    </div>
  );
}

export default Cards;
