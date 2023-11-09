import React from "react";
import { useNavigate } from "react-router-dom";
import LazyLoad from "react-lazyload";
import LoadingOverlay from "react-loading-overlay-ts";

const AuthorAnime = (props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  let kitsuData;
  const navigate = useNavigate();

  const showDetails = async (animeId) => {
    setIsLoading(true);
    setIsActive(true);

    await fetch(
      `https://kitsu.io/api/edge/anime?filter[text]=${props.title}&page[limit]=5`
    ).then(async (response) => {
      kitsuData = await response.json();
    });

    const matchingItem = kitsuData.data.find(
      (item) =>
        item.attributes.canonicalTitle === props.title ||
        item.attributes.abbreviatedTitles.includes(props.title) ||
        item.attributes.titles.en === props.title ||
        item.attributes.titles.en_jp === props.title ||
        item.attributes.titles.ja_jp === props.title
    );

    if (matchingItem) {
      const coverImage = matchingItem.attributes.coverImage
        ? matchingItem.attributes.coverImage.original
        : "";
      sessionStorage.setItem("kitsuCover", coverImage);
      sessionStorage.setItem("itemId", `/anime/${animeId}`);
      navigate("/details");
    } else {
      sessionStorage.setItem("kitsuCover", "");
      sessionStorage.setItem("itemId", `/anime/${animeId}`);
      navigate("/details");
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
        <li id="authorAnimeList" className="zoomed-landing-page">
          <LazyLoad>
            <div
              className="authorAnimeDiv"
              style={{
                display: "flex",
                flexDirection: "column",
                width: "190px",
              }}
            >
              <img
                src={props.img}
                alt="loading cover..."
                loading="lazy"
                onClick={() => showDetails(`${props.malid}`)}
                style={{ width: "190px" }}
              />
              <p className="authorAnimeRole">
                Role: <strong>{props.role || "-"}</strong>
              </p>
            </div>
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
};
export default AuthorAnime;
