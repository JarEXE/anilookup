import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginState } from "../../utils/authRedirect";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import Switch from "react-switch";
import DarkModeToggle from "./DarkModeToggle";
import toast, { Toaster } from "react-hot-toast";
import SearchBox from "../search/SearchBox";
import AccountMenu from "./AccountMenu";
import { listUrl } from "../stats/listStatuses";

function Navbar({ onToggle, onDarkModeToggle, isDarkMode }) {
  const notifySafe = () =>
    toast.success("NSFW content disabled!", {
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
        color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
      },
    });
  const notifyUnsafe = () =>
    toast("NSFW content enabled!", {
      icon: "⚠️",
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
        color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
      },
    });
  const sfwStatus = sessionStorage.getItem("sfw");
  // eslint-disable-next-line
  const [checked, setChecked] = React.useState(sfwStatus == 1 ? true : false);
  const [user, setUser] = React.useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const landingPagePath =
    location.pathname === "/manga" || location.pathname === "/manga/search"
      ? "/manga"
      : "/";

  // Pages that already have their own big search box don't get one here.
  const hasOwnSearch = [
    "/",
    "/manga",
    "/anime/search",
    "/manga/search",
  ].includes(location.pathname);

  // Which catalogue the navbar search starts on, from where the user is.
  const searchParamsType = new URLSearchParams(location.search).get("type");
  const navSearchType =
    location.pathname.startsWith("/manga") ||
    location.pathname.startsWith("/author") ||
    (location.pathname === "/lists" && searchParamsType === "manga")
      ? "manga"
      : "anime";

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

  const handleLogout = async () => {
    await signOut(auth)
      .then(async () => {
        // Sign-out successful.
        toast.success(`You have been logged out. Redirecting...`, {
          style: {
            borderRadius: "10px",
            background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
            color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
          },
        });

        sessionStorage.removeItem("animeListItems");
        sessionStorage.removeItem("mangaListItems");
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
              background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
              color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
            },
          },
        );

        navigate(0);
      });
  };

  const customStyles = {
    color: isDarkMode ? "var(--d-ink)" : "black",
    fontSize: "24px",
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // clear it on logout too, so the menu switches back to "Login"
        setUser(null);
        console.log("user is logged out");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link
          className="navbar-brand"
          to={landingPagePath}
          style={customStyles}
        >
          AniLookup{" "}
          <img
            alt="detective anya with magnifying glass"
            src="/anya.png"
            width={35}
            height={35}
            style={{ borderRadius: "20px" }}
          />
        </Link>
        {!hasOwnSearch ? (
          <div className="navbar-search">
            <SearchBox type={navSearchType} variant="nav" />
          </div>
        ) : null}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarText"
          aria-controls="navbarText"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{
            backgroundColor: `${isDarkMode ? "var(--d-surface-2)" : "#fff"}`,
            borderColor: `${isDarkMode ? "var(--d-line)" : "#282828"}`,
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <div
                className="toggle-container navbar-toggles"
                style={{ marginRight: "30px" }}
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
                    aria-label="Show NSFW content"
                    height={20}
                    width={46}
                  />
                </div>
              </div>
            </li>
            <hr></hr>
            {user ? (
              // phones: the account menu's items, as plain links in the
              // collapsed menu (desktop uses the avatar dropdown instead)
              <>
                <li className="nav-item d-lg-none">
                  <Link className="nav-link navbar-account-link" to="/profile">
                    Profile ({user.displayName})
                  </Link>
                </li>
                <li className="nav-item d-lg-none">
                  <Link
                    className="nav-link navbar-account-link"
                    to={listUrl("anime")}
                  >
                    Anime list
                  </Link>
                </li>
                <li className="nav-item d-lg-none">
                  <Link
                    className="nav-link navbar-account-link"
                    to={listUrl("manga")}
                  >
                    Manga list
                  </Link>
                </li>
                {/* <li className="nav-item d-lg-none">
                  <a className="nav-link navbar-account-link" href={ABOUT_URL} target="_blank" rel="noreferrer">
                    About AniLookup
                    <span className="visually-hidden"> (opens GitHub in a new tab)</span>
                  </a>
                </li> */}
                <li className="nav-item d-lg-none">
                  <button
                    type="button"
                    className="nav-link navbar-account-link"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : null}
          </ul>
          <span className="navbar-text">
            {user ? (
              <span className="navbar-account d-none d-lg-flex">
                <Link className="navbar-lists-link" to={listUrl(navSearchType)}>
                  My lists
                </Link>
                <AccountMenu user={user} onSignOut={handleLogout} />
              </span>
            ) : !user ? (
              <Link
                to="/login"
                state={loginState(location)}
                className="landing-button navbar-signin"
              >
                Sign in
              </Link>
            ) : null}
          </span>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </nav>
  );
}

export default Navbar;
