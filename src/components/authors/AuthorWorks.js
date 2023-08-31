import React from "react";
import AuthorAnime from "./AuthorAnime.js";
import axios from "axios";
import toast from "react-hot-toast";

const AuthorWorks = ({ isDarkMode, authorId }) => {
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const notifyRequestRate = () =>
    toast("Too many requests! Please wait a bit then try again.", {
      icon: "⚠️",
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
        color: `${isDarkMode ? "#333" : "#fff"}`,
      },
    });

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    setLoading(true);
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(`https://api.jikan.moe/v4/people/${authorId}/anime`)
      .then((response) => {
        const animes = response.data.data;

        if (animes) {
          const animeCards = animes.map((anime) => {
            return (
              <AuthorAnime
                role={anime.position.replace(/^add /, "")}
                key={anime.anime.mal_id}
                img={anime.anime.images.jpg.large_image_url}
                title={anime.anime.title}
                isDarkMode={isDarkMode}
                malid={anime.anime.mal_id}
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
        if (error.message === "Request failed with status code 429") {
          notifyRequestRate();
          console.error("Error fetching anime data:", error);
          setLoading(false);
          return;
        }
        console.error("Error fetching API data:", error);
        return;
      });
    // eslint-disable-next-line
  }, [isDarkMode, authorId]);

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

export default AuthorWorks;
