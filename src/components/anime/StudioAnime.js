import React from "react";
import CoverCard from "../plugins/CoverCard";
import { compactNumber } from "../details/format";

// A work on a studio page: role, score and MAL members under the title.
function StudioAnime({ img, title, malid, role, score, members }) {
  return (
    <CoverCard
      to={`/anime/${malid}`}
      image={img}
      title={title}
      subtitle={role || "Unknown role"}
      meta={
        <>
          <span>{score ? `★ ${score.toFixed(2)}` : "No score"}</span>
          <span>{members ? `${compactNumber(members)} members` : null}</span>
        </>
      }
    />
  );
}

export default StudioAnime;
