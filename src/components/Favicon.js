import React, { useState, useEffect } from "react";

function Favicon({ url }) {
  const [favicon, setFavicon] = useState("");
  useEffect(() => {
    async function fetchFavicon() {
      try {
        const response = await fetch("/.netlify/functions/favicon-proxy", {
          method: "POST",
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch favicon");
        }

        const data = await response.json();

        setFavicon(data.faviconUrl);
      } catch (error) {
        console.error("Invalid URL:", error);
        return null;
      }
    }

    fetchFavicon();
  }, [url]);

  return (
    <img
      src={favicon}
      alt="Favicon"
      style={{ marginRight: "5px", maxWidth: "25px", maxHeight: "25px" }}
    />
  );
}

export default Favicon;
