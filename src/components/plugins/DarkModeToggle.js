import React from "react";
import Switch from "react-switch";

// The navbar's dark mode switch. It shows App's state (the reader's settings
// can change it too) and App remembers the choice.
function DarkModeToggle({ isDarkMode, onDarkModeToggle }) {
  return (
    <div className="dark-mode-toggle">
      <span aria-hidden="true">{isDarkMode ? "☀️" : "🌙"}</span>
      <Switch
        onChange={() => onDarkModeToggle(!isDarkMode)}
        checked={Boolean(isDarkMode)}
        className="react-switch"
        aria-label="Dark mode"
        height={20}
        width={46}
      />
    </div>
  );
}

export default DarkModeToggle;
