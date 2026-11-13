import React from "react";

// Builds the Google favicon service URL for a site.
//
// This used to go through the favicon-proxy Netlify function, which only
// fetched this same URL server-side to read back its address. Google answers
// with a 404 status (plus a default globe icon) for sites without a favicon,
// which made the proxy fail and left a broken <img src="">. The browser can load
// the image directly: no proxy round trip, and it works in local development.
function faviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  } catch (error) {
    return "";
  }
}

function Favicon({ url }) {
  const src = faviconUrl(url);

  return (
    <img
      src={src || undefined}
      alt="Favicon"
      style={{ marginRight: "5px", maxWidth: "25px", maxHeight: "25px" }}
    />
  );
}

export default Favicon;
