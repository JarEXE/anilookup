import React, { useState, useEffect } from "react";

function Favicon({ url }) {
  const [favicon, setFavicon] = useState("");

  useEffect(() => {
    async function fetchFavicon() {
      try {
        const response = await fetch(
          `https://www.google.com/s2/favicons?domain=${url}`
        );
        const blob = await response.blob();
        const faviconUrl = URL.createObjectURL(blob);
        setFavicon(faviconUrl);
      } catch (error) {
        console.error("Error fetching favicon:", error);
      }
    }

    fetchFavicon();
  }, [url]);

  return <img src={favicon} alt="Favicon" style={{ marginRight: "5px" }} />;
}

export default Favicon;
