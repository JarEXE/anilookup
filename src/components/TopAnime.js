import React from "react";
import LandingPageAnime from "./LandingPageAnime.js";
import axios from "axios";

export default function TopAiring({ isDarkMode, allowNSFW }) {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Start with loading state

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/anime?filter=airing&limit=24${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;

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
  }, [isDarkMode, allowNSFW, sfwToggle]);

  return (
    <>
      {loading ? (
        <span className="loader"></span>
      ) : (
        // Render the component with a unique key to force re-render
        <React.Fragment key={key}>{cards}</React.Fragment>
      )}
    </>
  );
}

export function TopUpcoming({ isDarkMode, allowNSFW }) {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Start with loading state

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/anime?filter=upcoming&limit=24${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;

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
  }, [isDarkMode, allowNSFW, sfwToggle]);

  return (
    <>
      {loading ? (
        <span className="loader"></span>
      ) : (
        // Render the component with a unique key to force re-render
        <React.Fragment key={key}>{cards}</React.Fragment>
      )}
    </>
  );
}

export function TopSeries({ isDarkMode, allowNSFW }) {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Start with loading state

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/anime?type=tv&limit=24${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;

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
  }, [isDarkMode, allowNSFW, sfwToggle]);

  return (
    <>
      {loading ? (
        <span className="loader"></span>
      ) : (
        // Render the component with a unique key to force re-render
        <React.Fragment key={key}>{cards}</React.Fragment>
      )}
    </>
  );
}

export function TopMovies({ isDarkMode, allowNSFW }) {
  let sfwToggle = sessionStorage.getItem("sfw");
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [cards, setCards] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Start with loading state

  // Use useEffect to re-render the component when allowNSFW changes
  React.useEffect(() => {
    // Increment the key whenever allowNSFW changes
    setKey((prevKey) => prevKey + 1);

    axios
      .get(
        `https://api.jikan.moe/v4/top/anime?type=movie&limit=24${
          // eslint-disable-next-line
          sfwToggle == 1 ? "&" : "&sfw"
        }`
      )
      .then((response) => {
        const animes = response.data.data;

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
  }, [isDarkMode, allowNSFW, sfwToggle]);

  return (
    <>
      {loading ? (
        <span className="loader"></span>
      ) : (
        // Render the component with a unique key to force re-render
        <React.Fragment key={key}>{cards}</React.Fragment>
      )}
    </>
  );
}
