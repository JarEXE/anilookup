import React from "react";
import AuthorAnime from "./AuthorAnime";
import { API_URL, apiClient } from "../../config/api";
import LoadError from "../plugins/LoadError";
import useNsfwFilter from "../../hooks/useNsfwFilter";

const AuthorWorks = ({ isDarkMode, authorId, allowNSFW }) => {
  // State to hold the key for re-rendering
  const [key, setKey] = React.useState(0);
  const [works, setWorks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  // bumped by the "Try again" button to re-run the fetch effect
  const [reloadKey, setReloadKey] = React.useState(0);

  // Only data is stored here; the cards are rendered from it below. (Building
  // the JSX inside this effect forced the theme into its dependencies, which
  // re-fetched the API on every dark mode toggle.)
  React.useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError(false);
    setKey((prevKey) => prevKey + 1);

    apiClient
      .get(`${API_URL}/people/${authorId}/anime`)
      .then((response) => {
        if (cancelled) return;
        setWorks(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        // used to leave the spinner running forever on anything but a 429
        console.error("Error fetching API data:", error);
        setLoading(false);
        setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [authorId, reloadKey]);

  // people/{id}/anime doesn't say which works are NSFW, so they're looked up
  // while NSFW content is off
  const ids = React.useMemo(() => works.map((work) => work.anime.mal_id), [works]);
  const nsfw = useNsfwFilter("anime", ids, allowNSFW);
  const shown = works.filter((work) => !nsfw.isHidden(work.anime.mal_id));

  return (
    <>
      {loading || nsfw.pending ? (
        <div className="loadContainer">
          <span className="loader"></span>
        </div>
      ) : loadError ? (
        <LoadError
          isDarkMode={isDarkMode}
          message="Couldn't load these works right now."
          onRetry={() => setReloadKey((prevKey) => prevKey + 1)}
        />
      ) : nsfw.failed ? (
        <p>Couldn't check these works for NSFW content, so they're hidden for now.</p>
      ) : works.length > 0 && shown.length === 0 ? (
        <p>No works to show while NSFW content is off.</p>
      ) : (
        // Render the component with a unique key to force re-render
        <div>
          <ul className="cover-grid" key={key}>
            {shown.map((work) => (
              <AuthorAnime
                role={work.position.replace(/^add /, "")}
                key={work.anime.mal_id}
                img={work.anime.images.jpg.large_image_url}
                title={work.anime.title}
                isDarkMode={isDarkMode}
                malid={work.anime.mal_id}
              />
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default AuthorWorks;
