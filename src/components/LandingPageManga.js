import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPageManga(props) {
  const navigate = useNavigate();

  const showDetails = (mangaId) => {
    sessionStorage.setItem("itemId", `/manga/${mangaId}`);
    navigate(`/details`);
  };
  return (
    <li className="zoomed-landing-page">
      <img
        src={props.img}
        alt="loading cover..."
        onClick={() => showDetails(`${props.malid}`)}
      />
      <div className="overlay" onClick={() => showDetails(`${props.malid}`)}>
        <span>{props.title}</span>
      </div>
    </li>
  );
}
export default LandingPageManga;
