import React from "react";

// Shown in place of a page/section when its data couldn't be loaded (e.g. the
// API kept rate-limiting even after retries), instead of an endless spinner.
function LoadError({ isDarkMode, message, onRetry, minHeight = "40vh" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: minHeight,
        width: "100%",
      }}
    >
      <p className="lead">
        {message || "Something went wrong while loading this."}
      </p>
      {onRetry ? (
        <button
          className={`btn btn-${isDarkMode ? "info" : "dark"}`}
          style={{ borderRadius: "25px" }}
          type="button"
          onClick={onRetry}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export default LoadError;
