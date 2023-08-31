import React from "react";
import { useNavigate } from "react-router-dom";
import LazyLoad from "react-lazyload";
import { NumericFormat } from "react-number-format";

const StudioAnime = (props) => {
  const navigate = useNavigate();

  const showDetails = (animeId) => {
    sessionStorage.setItem("itemId", `/anime/${animeId}`);
    navigate(`/details`);
  };
  return (
    <li className="zoomed-landing-page">
      <LazyLoad>
        <div style={{ display: "flex", flexDirection: "column" }}>
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
  );
};
export default StudioAnime;
