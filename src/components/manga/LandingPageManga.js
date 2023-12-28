import React from "react";
import { useNavigate } from "react-router-dom";
import LazyLoad from "react-lazyload";
import LoadingOverlay from "react-loading-overlay-ts";
import {
  faCircleCheck,
  faEye,
  faCircleXmark,
  faHand,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function LandingPageManga(props) {
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

  const getStatusIcon = () => {
    switch (props.currentList) {
      case "reading":
        return (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              zIndex: 1,
              width: "25%",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "5px",
              borderTopLeftRadius: "10px",
              textAlign: "center",
            }}
          >
            <FontAwesomeIcon icon={faEye} style={{ color: "blueviolet" }} />
          </div>
        );
      case "onhold":
        return (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              zIndex: 1,
              width: "25%",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "5px",
              borderTopLeftRadius: "10px",
              textAlign: "center",
            }}
          >
            <FontAwesomeIcon icon={faHand} style={{ color: "orange" }} />
          </div>
        );
      case "planned":
        return (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              zIndex: 1,
              width: "25%",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "5px",
              borderTopLeftRadius: "10px",
              textAlign: "center",
            }}
          >
            <FontAwesomeIcon icon={faClock} style={{ color: "gray" }} />
          </div>
        );
      case "dropped":
        return (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              zIndex: 1,
              width: "25%",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "5px",
              borderTopLeftRadius: "10px",
              textAlign: "center",
            }}
          >
            <FontAwesomeIcon icon={faCircleXmark} style={{ color: "red" }} />
          </div>
        );
      case "completed":
        return (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              zIndex: 1,
              width: "25%",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "5px",
              borderTopLeftRadius: "10px",
              textAlign: "center",
            }}
          >
            <FontAwesomeIcon icon={faCircleCheck} style={{ color: "green" }} />
          </div>
        );
      default:
        return null;
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
              style={{ width: "190px" }}
            />
          </LazyLoad>
          {getStatusIcon()}
          <div
            className="overlay"
            onClick={() => showDetails(`${props.malid}`)}
          >
            <span>{props.title}</span>
          </div>
        </li>
      )}
    </>
  );
}
export default LandingPageManga;
