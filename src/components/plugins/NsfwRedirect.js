import React from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { homeFor } from "../../utils/nsfw";

// Leaves an NSFW title for that section's home page. `replace` swaps the
// title out of the history, so Back doesn't bounce the user straight into it.
function NsfwRedirect({ type, isDarkMode }) {
  React.useEffect(() => {
    // fixed id: one toast even if the effect runs twice (Strict Mode)
    toast("That title is NSFW and hidden while NSFW content is off.", {
      id: "nsfw-redirect",
      icon: "🔒",
      style: {
        borderRadius: "10px",
        background: isDarkMode ? "var(--d-surface-2)" : "#333",
        color: isDarkMode ? "var(--d-ink)" : "#fff",
      },
    });
  }, [isDarkMode]);

  return <Navigate to={homeFor(type)} replace />;
}

export default NsfwRedirect;
