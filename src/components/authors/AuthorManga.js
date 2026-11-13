import React from "react";
import CoverCard from "../plugins/CoverCard";

// A manga on an author page, with the author's role on it.
function AuthorManga({ img, title, malid, role }) {
  return (
    <CoverCard
      to={`/manga/${malid}`}
      image={img}
      title={title}
      subtitle={role || null}
    />
  );
}

export default AuthorManga;
