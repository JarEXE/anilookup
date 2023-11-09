import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const homeRoute = () => {
    navigate("/");
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ height: "50vh" }}
    >
      <div className="text-center">
        <img
          src="anya.png"
          alt="anime girl looking through magnifying glass"
          width={150}
          height={150}
          style={{ marginRight: "5%" }}
        />
        <h1 className="display-1 fw-bold">404</h1>
        <p className="fs-3">
          {" "}
          <span className="text-danger">Oops!</span> Page not found.
        </p>
        <p className="lead">The page you’re looking for doesn’t exist.</p>
        <button
          className={`btn btn-${isDarkMode ? "info" : "dark"}`}
          style={{ width: "40%", borderRadius: "25px" }}
          type="button"
          onClick={homeRoute}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
