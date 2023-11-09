import React from "react";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "react-loading-overlay-ts";

function Anime(props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  let kitsuData;

  const customStyles = {
    marginBottom: "10px",
    marginTop: "10px",
    padding: "10px 5px",
    boxShadow: props.isDarkMode
      ? "0px 0px 10px 5px rgba(60, 60, 60)"
      : "0px 0px 10px 5px rgba(0, 0, 0, 0.2)",
    borderRadius: "10px",
    minWidth: "215px",
    background: props.isDarkMode ? "#181818" : "#fff",
  };
  const navigate = useNavigate();

  const handleSubmit = async () => {
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
      sessionStorage.setItem("itemId", `/anime/${props.malid}`);
      navigate("/details");
    } else {
      sessionStorage.setItem("kitsuCover", "");
      sessionStorage.setItem("itemId", `/anime/${props.malid}`);
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
        <div
          className="col-md-3"
          style={{
            margin: "10px",
            height: "800px",
          }}
        >
          <div
            style={customStyles}
            className="well text-center zoomed-landing-page"
          >
            <div className="boxContainer">
              <img
                src={props.img}
                alt="anime cover"
                loading="lazy"
                style={{
                  marginBottom: "20px",
                  height: "300px",
                  width: "200px",
                  borderRadius: "10px",
                }}
              />
              <div className="summary-container">
                <h5>{props.title}</h5>
                <div
                  className={`${
                    props.isDarkMode ? "synopsisDark" : "synopsis"
                  }`}
                >
                  <p>{props.synopsis}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className={`btn btn-${props.isDarkMode ? "info" : "dark"}`}
            >
              More details
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Anime;
