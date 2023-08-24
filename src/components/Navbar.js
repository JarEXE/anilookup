import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Switch from "react-switch";
import DarkModeToggle from "./DarkModeToggle";
import toast, { Toaster } from "react-hot-toast";

function Navbar({ onToggle, onDarkModeToggle, isDarkMode }) {
  const notifySafe = () =>
    toast.success("NSFW content disabled!", {
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
        color: `${isDarkMode ? "#333" : "#fff"}`,
      },
    });
  const notifyUnsafe = () =>
    toast("NSFW content enabled!", {
      icon: "⚠️",
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
        color: `${isDarkMode ? "#333" : "#fff"}`,
      },
    });
  const sfwStatus = sessionStorage.getItem("sfw");
  // eslint-disable-next-line
  const [checked, setChecked] = React.useState(sfwStatus == 1 ? true : false);
  const location = useLocation();
  const navigate = useNavigate();

  const landingPageRoute = () => {
    if (location.pathname === "/search" || location.pathname === "/") {
      navigate("/");
    } else if (
      location.pathname === "/mangasearch" ||
      location.pathname === "/mangalookup"
    ) {
      navigate("/mangalookup");
    } else {
      navigate("/");
    }
  };

  const handleChange = () => {
    if (checked) {
      setChecked(false);
      onToggle(false);
      sessionStorage.setItem("sfw", 0);
      notifySafe();
    } else {
      setChecked(true);
      onToggle(true);
      sessionStorage.setItem("sfw", 1);
      notifyUnsafe();
    }
  };

  const customStyles = {
    color: isDarkMode ? "white" : "black",
    fontSize: "24px",
  };

  return (
    <nav className="navbar navbar-default" id="customNav">
      <div className="container-fluid">
        <div className="navbar-header">
          <a
            className="navbar-brand"
            href="#/"
            style={customStyles}
            onClick={() => landingPageRoute()}
          >
            AniLookup 🔍
          </a>
        </div>
        <div className="navbar-right">
          <div className="toggle-container">
            <DarkModeToggle onDarkModeToggle={onDarkModeToggle} />
          </div>

          <div className="toggle-container">
            <span>🔞</span>
            <Switch
              onChange={handleChange}
              checked={checked}
              className="react-switch"
              height={20}
              width={46}
            />
          </div>
        </div>
        <Toaster position="top-left" />
      </div>
    </nav>
  );
}

export default Navbar;
