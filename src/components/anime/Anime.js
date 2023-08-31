import React from "react";
import { useNavigate } from "react-router-dom";

function Anime(props) {
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

  const handleSubmit = () => {
    sessionStorage.setItem("itemId", `/anime/${props.malid}`);
    navigate(`/details`);
  };

  return (
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
              className={`${props.isDarkMode ? "synopsisDark" : "synopsis"}`}
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
  );
}

export default Anime;
