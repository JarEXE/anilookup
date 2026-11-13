import React from "react";
import CoverCard from "../plugins/CoverCard";

// A anime on an author page, with the author's role on it.
function AuthorAnime({ img, title, malid, role }) {
  return (
    <CoverCard
      to={`/anime/${malid}`}
      image={img}
      title={title}
      subtitle={role || null}
    />
  );
}

export default AuthorAnime;
