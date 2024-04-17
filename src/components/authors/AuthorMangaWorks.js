import React, { useCallback } from "react";
import AuthorManga from "./AuthorManga";
import axios from "axios";
import toast from "react-hot-toast";

const AuthorMangaWorks = ({ isDarkMode, authorId }) => {
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const notifyRequestRate = useCallback(
    function notifyRequestRate() {
      toast("Too many requests! Please wait a moment then try again.", {
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
          color: `${isDarkMode ? "#333" : "#fff"}`,
        },
      });
    },
    [isDarkMode]
  );

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    setLoading(true);
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(`https://api.jikan.moe/v4/people/${authorId}/manga`)
      .then((response) => {
        const mangas = response.data.data;

        if (mangas) {
          // Map data to Anime components
          const mangaCards = mangas.map((manga) => {
            return (
              <AuthorManga
                role={manga.position.replace(/^add /, "")}
                key={manga.manga.mal_id}
                img={manga.manga.images.jpg.large_image_url}
                title={manga.manga.title}
                isDarkMode={isDarkMode}
                malid={manga.manga.mal_id}
              />
            );
          });

          // Set cards and mark loading as false
          setCards(mangaCards);
          setLoading(false);
        } else {
          setLoading(false);
          return null;
        }
      })
      .catch((error) => {
        if (error.message === "Request failed with status code 429") {
          notifyRequestRate();
          console.error("Error fetching anime data:", error);
          setLoading(false);
          return;
        }
      });
  }, [isDarkMode, authorId, notifyRequestRate]);

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
        </div>
      )}
    </>
  );
};

export default AuthorMangaWorks;
