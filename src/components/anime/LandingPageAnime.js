import React from "react";
import CoverCard from "../plugins/CoverCard";

// Top anime card on the landing page.
function LandingPageAnime({ img, title, malid, currentList }) {
  return (
    <CoverCard
      to={`/anime/${malid}`}
      image={img}
      title={title}
      listStatus={currentList}
    />
  );
}

export default LandingPageAnime;
