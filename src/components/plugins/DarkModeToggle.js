import React, { useState } from "react";
import Switch from "react-switch";

function DarkModeToggle({ onDarkModeToggle }) {
  //const darkStatus = JSON.parse(sessionStorage.getItem("darkMode"));
  const [isDarkMode, setIsDarkMode] = useState(true);

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
