import React from "react";
import Switch from "react-switch";

function DarkModeToggle({ onDarkModeToggle }) {
  const darkStatus = JSON.parse(sessionStorage.getItem("darkMode"));
  // darkmode will be enabled by default for first time visits or first time users. subsequent toggles will remain upon refresh
  const [isDarkMode, setIsDarkMode] = React.useState(
    darkStatus == null || typeof darkStatus === "undefined" ? true : darkStatus
  );

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    onDarkModeToggle(!isDarkMode); // Notify the parent component
    sessionStorage.setItem("darkMode", JSON.stringify(!isDarkMode));

    // Get the dynamic color value based on dark mode state
    const dynamicColor = isDarkMode ? "#282828" : "#ffffff";

    // Update manifest.json properties dynamically
    const manifest = {
      name: "AniLookup",
      short_name: "AniLookup",
      start_url: "/",
      display: "standalone",
      background_color: dynamicColor,
      theme_color: dynamicColor,
    };

    // Update the manifest.json file with the dynamic properties
    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: "application/json",
    });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    // Set the manifest URL in the document head
    const manifestTag = document.createElement("link");
    manifestTag.rel = "manifest";
    manifestTag.href = manifestUrl;
    document.head.appendChild(manifestTag);
  };

  return (
    <div className="dark-mode-toggle">
      <span>{isDarkMode ? "☀️" : "🌙"}</span>
      <Switch
        onChange={toggleDarkMode}
        checked={isDarkMode}
        className="react-switch"
        height={20}
        width={46}
      />
    </div>
  );
}

export default DarkModeToggle;
