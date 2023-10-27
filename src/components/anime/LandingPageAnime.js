import React from "react";
import { useNavigate } from "react-router-dom";
import LazyLoad from "react-lazyload";
import LoadingOverlay from "react-loading-overlay-ts";

function LandingPageAnime(props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  const navigate = useNavigate();
  let kitsuData;

  const showDetails = async (animeId) => {
    setIsLoading(true);
    setIsActive(true);

    await fetch(
      `https://kitsu.io/api/edge/anime?filter[text]=${props.title}&page[limit]=1`
    ).then(async (response) => {
      kitsuData = await response.json();
    });

    if (kitsuData.data[0].attributes.coverImage != null) {
      sessionStorage.setItem(
        "kitsuCover",
        `${kitsuData.data[0].attributes.coverImage.original}`
      );
      sessionStorage.setItem("itemId", `/anime/${animeId}`);
      setIsLoading(false);
      setIsActive(false);
      navigate(`/details`);
    } else {
      sessionStorage.setItem("kitsuCover", "");
      sessionStorage.setItem("itemId", `/anime/${animeId}`);
      setIsLoading(false);
      setIsActive(false);
      navigate(`/details`);
    }
  };
  return (
    <>
      {isLoading ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: "999",
          }}
        >
          <LoadingOverlay
            active={isActive}
            spinner={<span className="overlay_loader"></span>}
          ></LoadingOverlay>
        </div>
      ) : (
        <li className="zoomed-landing-page">
          <LazyLoad>
            <img
              src={props.img}
              alt="loading cover..."
              loading="lazy"
              onClick={() => showDetails(`${props.malid}`)}
              style={{ maxWidth: "190px" }}
            />
          </LazyLoad>
          <div
            className="overlay"
            style={{ overflowY: "hidden" }}
            onClick={() => showDetails(`${props.malid}`)}
          >
            <span>{props.title}</span>
          </div>
        </li>
      )}
    </>
  );
}
export default LandingPageAnime;
