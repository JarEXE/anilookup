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
          height="400"
          src={`${embedUrl}?enablejsapi=1&fs=1`}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen="allowFullScreen"
          title="Trailer"
        ></iframe>
      ) : (
        <p>{unavailableString}</p>
      )}
    </div>
  );
}

export default YouTubeEmbed;
