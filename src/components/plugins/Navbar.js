import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import Switch from "react-switch";
import DarkModeToggle from "./DarkModeToggle";
import toast, { Toaster } from "react-hot-toast";
import InfoIcon from "@mui/icons-material/Info";
import ListIcon from "@mui/icons-material/ListRounded";
import ExitIcon from "@mui/icons-material/ExitToApp";
import ProfileIcon from "@mui/icons-material/Person2";
import {
  CircleMenu,
  CircleMenuItem,
  TooltipPlacement,
} from "react-circular-menu";

function Navbar({
  onToggle,
  onDarkModeToggle,
  isDarkMode,
  handleBackgroundBlur,
}) {
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
  const [user, setUser] = React.useState(null);
  const [closeMenu, setCloseMenu] = React.useState(true);
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);
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

  const handleMenuOpen = () => {
    // menu is open
    setCloseMenu(false);
    handleBackgroundBlur(true);
  };

  const handleMenuClosed = async () => {
    // menu is closed
    setCloseMenu(true);
    handleBackgroundBlur(false);
  };

  const loginRoute = () => {
    navigate("/login");
  };

  const profileRoute = async () => {
    // close the menu then redirect
    await handleMenuClosed();
    //navigate("/profile");

    if (auth.currentUser !== null) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  const listsRoute = async () => {
    await handleMenuClosed();

    if (auth.currentUser !== null) {
      navigate("/lists");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    await signOut(auth)
      .then(async () => {
        // close the menu then redirect
        await handleMenuClosed();
        // Sign-out successful.
        toast.success(`You have been logged out. Redirecting...`, {
          style: {
            borderRadius: "10px",
            background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
            color: `${isDarkMode ? "#333" : "#fff"}`,
          },
        });

        sessionStorage.removeItem("animeListItems");
        navigate("/");

        // refresh page after 3 seconds
        setTimeout(() => {
          navigate(0);
        }, 2500);
      })
      .catch((error) => {
        console.log(error);
        toast(
          "Failed to log out! Please try again later or contact developer if this problem persists.",
          {
            icon: "⚠️",
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
              color: `${isDarkMode ? "#W333" : "#fff"}`,
            },
          }
        );

        navigate(0);
      });
  };

  const customStyles = {
    color: isDarkMode ? "white" : "black",
    fontSize: "24px",
  };

  React.useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        console.log(user);
        console.log("user is logged out");
      }
    });
  }, []);

  React.useEffect(() => {
    // Update screenWidth state when the window is resized
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Remove event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array ensures the effect runs once after the initial render

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <a
          className="navbar-brand"
          href="#/"
          style={customStyles}
          onClick={() => landingPageRoute()}
        >
          AniLookup{" "}
          <img
            alt="detective anya with magnifying glass"
            src="anya.png"
            width={35}
            height={35}
            style={{ borderRadius: "20px" }}
          />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarText"
          aria-controls="navbarText"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{
            backgroundColor: `${isDarkMode ? "#0dcaf0" : "#fff"}`,
            borderColor: `${isDarkMode ? "#0dcaf0" : "#282828"}`,
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <div
                className="toggle-container"
                style={{ marginRight: "30px", marginTop: "8px" }}
              >
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
            </li>
            <hr></hr>
            <>
              {user && screenWidth < 992 ? (
                <>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#/"
                      onClick={() => landingPageRoute()}
                      style={{ color: `${isDarkMode ? "#fff" : "#282828"}` }}
                    >
                      Home
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#/"
                      onClick={() => profileRoute()}
                      style={{ color: `${isDarkMode ? "#fff" : "#282828"}` }}
                    >
                      Profile
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#/"
                      onClick={() => listsRoute()}
                      style={{ color: `${isDarkMode ? "#fff" : "#282828"}` }}
                    >
                      Lists
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#/"
                      onClick={() => alert("No info just yet :(")}
                      style={{ color: `${isDarkMode ? "#fff" : "#282828"}` }}
                    >
                      Info
                    </a>
                  </li>
                  <hr></hr>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#/"
                      onClick={() => handleLogout()}
                      style={{ color: `${isDarkMode ? "#fff" : "#282828"}` }}
                    >
                      Logout
                    </a>
                  </li>
                  <hr></hr>
                </>
              ) : null}
            </>
          </ul>
          <span className="navbar-text">
            {user && screenWidth > 991 ? (
              <div className="mobile-width">
                <CircleMenu
                  startAngle={180}
                  rotationAngle={-120}
                  itemSize={1}
                  radius={5}
                  open={closeMenu ? false : true}
                  rotationAngleInclusive={false}
                  onMenuToggle={(menuActive) =>
                    menuActive === true ? handleMenuOpen() : handleMenuClosed()
                  }
                >
                  <CircleMenuItem
                    tooltip="Edit Profile"
                    tooltipPlacement={TooltipPlacement.Left}
                    onClick={() => profileRoute()}
                  >
                    <ProfileIcon />
                  </CircleMenuItem>
                  <CircleMenuItem
                    onClick={() => listsRoute()}
                    tooltip="Lists"
                    tooltipPlacement={TooltipPlacement.Left}
                  >
                    <ListIcon />
                  </CircleMenuItem>
                  <CircleMenuItem
                    onClick={() => handleLogout()}
                    tooltip="Logout"
                    tooltipPlacement={TooltipPlacement.Left}
                  >
                    <ExitIcon />
                  </CircleMenuItem>
                  <CircleMenuItem
                    onClick={() => alert("https://github.com/JarEXE/anilookup")}
                    tooltip="Info"
                    tooltipPlacement={TooltipPlacement.Bottom}
                  >
                    <InfoIcon />
                  </CircleMenuItem>
                </CircleMenu>
              </div>
            ) : !user ? (
              <>
                <button
                  id="loginButton"
                  className="btn btn-secondary"
                  style={{ borderRadius: "25px" }}
                  onClick={loginRoute}
                >
                  Login
                </button>
                <br />
                <br />
              </>
            ) : null}
          </span>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </nav>
  );
}

export default Navbar;
