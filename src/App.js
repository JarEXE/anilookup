import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import "./style.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import LoadingOverlay from "react-loading-overlay-ts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Navbar from "./components/plugins/Navbar";
import BackToTopButton from "./components/plugins/BackToTopButton";

const Register = lazy(() => import("./components/auth/Register"));
const Login = lazy(() => import("./components/auth/Login"));
const Reset = lazy(() => import("./components/auth/Reset"));
const Profile = lazy(() => import("./components/auth/Profile"));
const MangaSearch = lazy(() => import("./components/manga/MangaSearch"));
const Details = lazy(() => import("./components/Details"));
const StudioDetails = lazy(() => import("./components/studios/StudioDetails"));
const AuthorDetails = lazy(() => import("./components/authors/AuthorDetails"));
const CharacterDetails = lazy(() =>
  import("./components/characters/CharacterDetails"),
);
const Lists = lazy(() => import("./components/lists/Lists"));
const ErrorPage = lazy(() => import("./components/ErrorPage"));
const AnimeSearch = lazy(() => import("./components/anime/AnimeSearch"));
const SearchResults = lazy(() => import("./components/search/SearchResults"));
const Browse = lazy(() => import("./components/browse/Browse"));
const Reader = lazy(() => import("./components/reader/Reader"));

function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  React.useEffect(() => {
    if (navigationType !== "POP") {
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}

function RemountOnPathChange({ children }) {
  const { pathname } = useLocation();
  return <div key={pathname}>{children}</div>;
}

// MUI components (menus, lists, progress bars) follow the app's palette.
// Mirrors the --d-* tokens in style.css; MUI needs real colour values for
// its own calculations, so they're repeated here.
const lightMuiTheme = createTheme();
const darkMuiTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#5ec4dc", contrastText: "#0d1f24" },
    background: { default: "#1d2024", paper: "#2e3238" },
    text: { primary: "#e3e6ea", secondary: "#9aa2ab" },
    divider: "#3b4047",
  },
  components: {
    // MUI lightens dark paper with a gradient overlay; use the flat surface
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

function App() {
  const sfwStatus = sessionStorage.getItem("sfw");
  const darkStatus = JSON.parse(sessionStorage.getItem("darkMode"));
  const [user, setUser] = React.useState(null);
  // darkmode will be enabled by default for first time visits or first time users. subsequent toggles will remain upon refresh
  const [isDarkMode, setIsDarkMode] = React.useState(
    darkStatus == null || typeof darkStatus === "undefined"
      ? false
      : darkStatus,
  );
  const [allowNSFW, setAllowNSFW] = React.useState(
    // eslint-disable-next-line
    sfwStatus == 1 ? true : false,
  );

  const bodyStyling = {
    maxWidth: "900px",
    margin: "0 auto 20px auto",
    padding: "20px",
    marginTop: "0",
    paddingTop: "0",
  };


  const handleToggle = (input) => {
    setAllowNSFW(input);
  };

  // the one place dark mode changes (navbar switch, reader settings), so
  // every switch shows the same state; remembered for the session
  const handleDarkModeToggle = (value) => {
    setIsDarkMode(value);
    try {
      sessionStorage.setItem("darkMode", JSON.stringify(value));
    } catch (error) {
      // just not remembered
    }
  };


  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // clear it on logout too, so the UI doesn't keep showing a signed-in
        // user until the page reloads
        setUser(null);
        console.log("user is logged out");
      }
    });

    return () => unsubscribe();
  }, []);

  // browser UI colour (address bar on phones) follows the theme, including
  // right after a reload (it used to only change when the switch was flipped)
  React.useEffect(() => {
    const meta = document.querySelector("meta[name=theme-color]");
    if (meta) meta.setAttribute("content", isDarkMode ? "#1d2024" : "#ffffff");
  }, [isDarkMode]);

  return (
    <ThemeProvider theme={isDarkMode ? darkMuiTheme : lightMuiTheme}>
      <Router>
        <ScrollToTop />
        <div
          className={`App ${isDarkMode ? "dark" : ""}`}
          data-bs-theme={isDarkMode ? "dark" : "light"}
        >
          <Navbar
            onToggle={handleToggle}
            onDarkModeToggle={handleDarkModeToggle}
            isDarkMode={isDarkMode}
          />
          <div
            className="row"
            style={bodyStyling}
          >
            <Suspense
              fallback={
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0, 0, 0, 0.75)",
                    zIndex: "999",
                  }}
                >
                  <LoadingOverlay
                    active={true}
                    spinner={<span className="overlay_loader"></span>}
                  ></LoadingOverlay>
                </div>
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <div>
                      <AnimeSearch
                        isDarkMode={isDarkMode}
                        allowNSFW={allowNSFW}
                        user={user}
                      />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </div>
                  }
                />
                <Route path="/anime" element={<Navigate to="/" replace />} />
                <Route
                  path="/anime/browse"
                  element={
                    <div>
                      <Browse key="anime" type="anime" allowNSFW={allowNSFW} />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </div>
                  }
                />
                <Route
                  path="/anime/search"
                  element={
                    <div>
                      <SearchResults
                        type="anime"
                        allowNSFW={allowNSFW}
                        isDarkMode={isDarkMode}
                      />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </div>
                  }
                />
                <Route
                  path="/anime/:id"
                  element={
                    <RemountOnPathChange>
                      <Details
                        type="anime"
                        isDarkMode={isDarkMode}
                        allowNSFW={allowNSFW}
                        user={user}
                      />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </RemountOnPathChange>
                  }
                />

                <Route
                  path="/manga"
                  element={
                    <div>
                      <MangaSearch
                        isDarkMode={isDarkMode}
                        allowNSFW={allowNSFW}
                        user={user}
                      />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </div>
                  }
                />
                <Route
                  path="/manga/browse"
                  element={
                    <div>
                      <Browse key="manga" type="manga" allowNSFW={allowNSFW} />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </div>
                  }
                />
                <Route
                  path="/manga/search"
                  element={
                    <div>
                      <SearchResults
                        type="manga"
                        allowNSFW={allowNSFW}
                        isDarkMode={isDarkMode}
                      />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </div>
                  }
                />
                <Route
                  path="/manga/:id"
                  element={
                    <RemountOnPathChange>
                      <Details
                        type="manga"
                        isDarkMode={isDarkMode}
                        allowNSFW={allowNSFW}
                        user={user}
                      />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </RemountOnPathChange>
                  }
                />

                {["/manga/:id/read", "/manga/:id/read/:chapterId"].map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <div>
                        <Reader
                          isDarkMode={isDarkMode}
                          allowNSFW={allowNSFW}
                          onDarkModeToggle={handleDarkModeToggle}
                        />
                        <BackToTopButton isDarkMode={isDarkMode} />
                      </div>
                    }
                  />
                ))}

                <Route
                  path="/studio/:id"
                  element={
                    <RemountOnPathChange>
                      <StudioDetails
                        isDarkMode={isDarkMode}
                        allowNSFW={allowNSFW}
                      />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </RemountOnPathChange>
                  }
                />
                <Route
                  path="/character/:id"
                  element={
                    <RemountOnPathChange>
                      <CharacterDetails
                        isDarkMode={isDarkMode}
                        allowNSFW={allowNSFW}
                      />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </RemountOnPathChange>
                  }
                />
                <Route
                  path="/author/:id"
                  element={
                    <RemountOnPathChange>
                      <AuthorDetails
                        isDarkMode={isDarkMode}
                        allowNSFW={allowNSFW}
                      />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </RemountOnPathChange>
                  }
                />

                <Route
                  path="/register"
                  element={
                    <div>
                      <Register isDarkMode={isDarkMode} user={user} />
                    </div>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <div>
                      <Login isDarkMode={isDarkMode} user={user} />
                    </div>
                  }
                />
                <Route
                  path="/reset"
                  element={
                    <div>
                      <Reset isDarkMode={isDarkMode} user={user} />
                    </div>
                  }
                />
                <Route
                  path="/profile"
                  element={<Profile isDarkMode={isDarkMode} user={user} />}
                />
                <Route
                  path="/lists"
                  element={
                    <div>
                      <Lists isDarkMode={isDarkMode} user={user} />
                      <BackToTopButton isDarkMode={isDarkMode} />
                    </div>
                  }
                />

                <Route
                  path="/mangalookup"
                  element={<Navigate to="/manga" replace />}
                />
                <Route
                  path="/mangasearch"
                  element={<Navigate to="/manga" replace />}
                />
                <Route path="/search" element={<Navigate to="/" replace />} />
                <Route path="/details" element={<Navigate to="/" replace />} />
                <Route
                  path="/studiodetails"
                  element={<Navigate to="/" replace />}
                />
                <Route
                  path="/authordetails"
                  element={<Navigate to="/" replace />}
                />
                <Route path="/read" element={<Navigate to="/" replace />} />

                <Route path="*" element={<ErrorPage isDarkMode={isDarkMode} />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
