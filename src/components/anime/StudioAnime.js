import React from "react";
import { useNavigate } from "react-router-dom";
import LazyLoad from "react-lazyload";
import { NumericFormat } from "react-number-format";
import LoadingOverlay from "react-loading-overlay-ts";

const StudioAnime = (props) => {
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

    kitsuData.data.map((item) => {
      if (
        item.attributes.canonicalTitle === props.title ||
        item.attributes.abbreviatedTitles.includes(props.title) ||
        item.attributes.titles.en === props.title ||
        item.attributes.titles.en_jp === props.title ||
        item.attributes.titles.ja_jp === props.title
      ) {
        if (item.attributes.coverImage != null) {
          sessionStorage.setItem(
            "kitsuCover",
            `${item.attributes.coverImage.original}`
          );
          sessionStorage.setItem("itemId", `/anime/${animeId}`);
          setIsLoading(false);
          setIsActive(false);
        } else {
          sessionStorage.setItem("kitsuCover", "");
          sessionStorage.setItem("itemId", `/anime/${animeId}`);
          setIsLoading(false);
          setIsActive(false);
        }
      } else {
        if (kitsuData.data[0].attributes.coverImage != null) {
          sessionStorage.setItem(
            "kitsuCover",
            `${kitsuData.data[0].attributes.coverImage.original}`
          );
          sessionStorage.setItem("itemId", `/anime/${animeId}`);
          setIsLoading(false);
          setIsActive(false);
        }
      }
      return navigate("/details");
    });
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
        <li id="studioAnimeList" className="zoomed-landing-page">
          <LazyLoad>
            <div
              className="studioAnimeDiv"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <img
                src={props.img}
                alt="loading cover..."
                loading="lazy"
                onClick={() => showDetails(`${props.malid}`)}
                style={{ maxWidth: "190px" }}
              />
              <p>
                Role: <strong>{props.role || "-"}</strong>
              </p>
              <p style={{ marginTop: "-15px" }}>
                Score: <strong>{props.score || "-"}</strong>
              </p>
              <p style={{ marginTop: "-15px" }}>
                Members:{" "}
                <NumericFormat
                  value={props.members || "-"}
                  thousandSeparator=","
                  displayType="text"
                  renderText={(value) => <b>{value}</b>}
                />
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
export default StudioAnime;
