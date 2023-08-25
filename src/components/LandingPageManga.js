import React from "react";
import { useNavigate } from "react-router-dom";
import LazyLoad from "react-lazyload";

function LandingPageManga(props) {
  const navigate = useNavigate();

  const showDetails = (mangaId) => {
    sessionStorage.setItem("itemId", `/manga/${mangaId}`);
    navigate(`/details`);
  };
  return (
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
      <div className="overlay" onClick={() => showDetails(`${props.malid}`)}>
        <span>{props.title}</span>
      </div>
    </li>
  );
}
export default LandingPageManga;
