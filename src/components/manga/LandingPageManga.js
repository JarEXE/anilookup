import React from "react";
import CoverCard from "../plugins/CoverCard";

// Top manga card on the landing page.
function LandingPageManga({ img, title, malid, currentList }) {
  return (
    <CoverCard
      to={`/manga/${malid}`}
      image={img}
      title={title}
      listStatus={currentList}
    />
  );
}

export default LandingPageManga;
