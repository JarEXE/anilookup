import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPageAnime(props) {
  const navigate = useNavigate();

  const showDetails = (animeId) => {
    sessionStorage.setItem("itemId", `/anime/${animeId}`);
    navigate(`/details`);
  };
  return (
    <li className="zoomed-landing-page">
      <img
        src={props.img}
        alt="loading cover..."
        onClick={() => showDetails(`${props.malid}`)}
        style={{ maxWidth: "190px" }}
      />
      <div className="overlay" onClick={() => showDetails(`${props.malid}`)}>
        <span>{props.title}</span>
      </div>
    </li>
  );
}
export default LandingPageAnime;
