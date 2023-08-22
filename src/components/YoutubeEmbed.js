import React from "react";

function YouTubeEmbed({ embedUrl }) {
  const unavailableString = "Trailer unavailable 😵‍💫";
  return (
    <div
      className="video-container"
      style={{
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {embedUrl ? (
        <iframe
          width="100%" // You can adjust the width and height as needed
          height="500"
          src={embedUrl}
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          title="Embedded YouTube Video"
        ></iframe>
      ) : (
        <p>{unavailableString}</p>
      )}
    </div>
  );
}

export default YouTubeEmbed;
