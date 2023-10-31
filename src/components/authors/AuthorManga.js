import React from "react";
import { useNavigate } from "react-router-dom";
import LazyLoad from "react-lazyload";
import LoadingOverlay from "react-loading-overlay-ts";

const AuthorManga = (props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  let kitsuData;
  const navigate = useNavigate();

  const showDetails = async (mangaId) => {
    setIsLoading(true);
    setIsActive(true);

    await fetch(
      `https://kitsu.io/api/edge/manga?filter[text]=${props.title}&page[limit]=1`
    ).then(async (response) => {
      kitsuData = await response.json();
    });

    if (kitsuData.data[0].attributes.coverImage != null) {
      sessionStorage.setItem(
        "kitsuCover",
        `${kitsuData.data[0].attributes.coverImage.original}`
      );
      sessionStorage.setItem("itemId", `/manga/${mangaId}`);
      setIsLoading(false);
      setIsActive(false);
      navigate(`/details`);
    } else {
      sessionStorage.setItem("kitsuCover", "");
      sessionStorage.setItem("itemId", `/manga/${mangaId}`);
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
        <li id="authorMangaList" className="zoomed-landing-page">
          <LazyLoad>
            <div
              className="authorMangaDiv"
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
              <p>
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
export default AuthorManga;
