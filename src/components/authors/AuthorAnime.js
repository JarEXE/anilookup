import React from "react";
import { useNavigate } from "react-router-dom";
import LazyLoad from "react-lazyload";

const AuthorAnime = (props) => {
  const navigate = useNavigate();

  const showDetails = (animeId) => {
    sessionStorage.setItem("itemId", `/anime/${animeId}`);
    navigate(`/details`);
  };
  return (
    <li className="zoomed-landing-page">
      <LazyLoad>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "190px",
          }}
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
  );
};
export default AuthorAnime;
