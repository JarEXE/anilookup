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
