import React, { useState, useEffect } from "react";

function Favicon({ url }) {
  const [favicon, setFavicon] = useState("");
  useEffect(() => {
    async function fetchFavicon() {
      try {
        let domain;
        const parsedURL = new URL(url);
        domain = parsedURL.hostname;

        const response = await fetch(
          `https://upper-bronze-crawdad.faviconkit.com/${domain}/25`
        );
        const blob = await response.blob();
        const faviconUrl = URL.createObjectURL(blob);
        setFavicon(faviconUrl);
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
