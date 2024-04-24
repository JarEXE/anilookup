import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./style.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import LoadingOverlay from "react-loading-overlay-ts";
import Cards from "./components/anime/Cards";
import Navbar from "./components/plugins/Navbar";
import ScrollToBottomButton from "./components/plugins/ScrollToBottomButton";
import MangaChapterList from "./components/manga/MangaChapterList";

// import Register from "./components/auth/Register";
// import Login from "./components/auth/Login";
// import Reset from "./components/auth/Reset";
// import Profile from "./components/auth/Profile";
// import MangaSearch from "./components/manga/MangaSearch";
// import Details from "./components/Details";
// import StudioDetails from "./components/studios/StudioDetails";
// import AuthorDetails from "./components/authors/AuthorDetails";
// import Lists from "./components/lists/Lists";
// import ErrorPage from "./components/ErrorPage";
// import AnimeSearch from "./components/anime/AnimeSearch";
const Register = lazy(() => import("./components/auth/Register"));
const Login = lazy(() => import("./components/auth/Login"));
const Reset = lazy(() => import("./components/auth/Reset"));
const Profile = lazy(() => import("./components/auth/Profile"));
const MangaSearch = lazy(() => import("./components/manga/MangaSearch"));
const Details = lazy(() => import("./components/Details"));
const StudioDetails = lazy(() => import("./components/studios/StudioDetails"));
const AuthorDetails = lazy(() => import("./components/authors/AuthorDetails"));
const Lists = lazy(() => import("./components/lists/Lists"));
const ErrorPage = lazy(() => import("./components/ErrorPage"));
const AnimeSearch = lazy(() => import("./components/anime/AnimeSearch"));

function App() {
  const sfwStatus = sessionStorage.getItem("sfw");
  const darkStatus = JSON.parse(sessionStorage.getItem("darkMode"));
  const [user, setUser] = React.useState(null);
  // darkmode will be enabled by default for first time visits or first time users. subsequent toggles will remain upon refresh
  const [isDarkMode, setIsDarkMode] = React.useState(
    darkStatus == null || typeof darkStatus === "undefined" ? false : darkStatus
  );
  const [backgroundBlurred, setBackgroundBlurred] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [allowNSFW, setAllowNSFW] = React.useState(
    // eslint-disable-next-line
    sfwStatus == 1 ? true : false
  );

  const bodyStyling = {
    maxWidth: "900px",
    margin: "0 auto 20px auto",
    padding: "20px",
    marginTop: "0",
    paddingTop: "0",
  };

  const bodyStylingBlurred = {
    maxWidth: "900px",
    margin: "0 auto 20px auto",
    padding: "20px",
    filter: "blur(5px)",
    marginTop: "0",
    paddingTop: "0",
  };

  const handleChange = (input) => {
    setSearchText(input);
  };

  const handleToggle = (input) => {
    setAllowNSFW(input);
  };

  const handleDarkModeToggle = (value) => {
    setIsDarkMode(value);
  };

  const handleBackgroundBlur = (value) => {
    setBackgroundBlurred(value);
  };

  React.useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      } else {
        console.log("user is logged out");
      }
    });
  }, []);

  return (
    <Router>
      <div className={`App ${isDarkMode ? "dark" : ""}`}>
        <Navbar
          onToggle={handleToggle}
          onDarkModeToggle={handleDarkModeToggle}
          isDarkMode={isDarkMode}
          handleBackgroundBlur={handleBackgroundBlur}
        />
        <div
          className="row"
          style={backgroundBlurred ? bodyStylingBlurred : bodyStyling}
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
                exact
                path="/"
                element={
                  <div>
                    <AnimeSearch
                      onInputChange={handleChange}
                      isDarkMode={isDarkMode}
                      allowNSFW={allowNSFW}
                      user={user}
                    />
                    <ScrollToBottomButton isDarkMode={isDarkMode} />
                  </div>
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
                exact
                path="/mangalookup"
                element={
                  <div>
                    <MangaSearch
                      onInputChange={handleChange}
                      isDarkMode={isDarkMode}
                      allowNSFW={allowNSFW}
                      user={user}
                    />
                    <ScrollToBottomButton isDarkMode={isDarkMode} />
                  </div>
                }
              />
              <Route
                path="/search"
                element={
                  <div>
                    <Cards
                      searchText={searchText}
                      allowNSFW={allowNSFW}
                      isDarkMode={isDarkMode}
                    />
                    <ScrollToBottomButton isDarkMode={isDarkMode} />
                  </div>
                }
              />
              <Route
                path="/mangasearch"
                element={
                  <div>
                    <Cards
                      searchText={searchText}
                      allowNSFW={allowNSFW}
                      isDarkMode={isDarkMode}
                    />
                    <ScrollToBottomButton isDarkMode={isDarkMode} />
                  </div>
                }
              />
              <Route
                path="/read"
                element={
                  <div>
                    <MangaChapterList
                      isDarkMode={isDarkMode}
                      allowNSFW={allowNSFW}
                      user={user}
                    />
                    <ScrollToBottomButton isDarkMode={isDarkMode} />
                  </div>
                }
              />
              <Route
                path="/details"
                element={
                  <div>
                    <Details
                      isDarkMode={isDarkMode}
                      allowNSFW={allowNSFW}
                      user={user}
                    />
                    <ScrollToBottomButton isDarkMode={isDarkMode} />
                  </div>
                }
              />
              <Route
                path="/studiodetails"
                element={
                  <div>
                    <StudioDetails
                      isDarkMode={isDarkMode}
                      allowNSFW={allowNSFW}
                    />
                    <ScrollToBottomButton isDarkMode={isDarkMode} />
                  </div>
                }
              />
              <Route
                path="/authordetails"
                element={
                  <div>
                    <AuthorDetails
                      isDarkMode={isDarkMode}
                      allowNSFW={allowNSFW}
                    />
                    <ScrollToBottomButton isDarkMode={isDarkMode} />
                  </div>
                }
              />
              <Route
                path="/lists"
                element={
                  <div>
                    <Lists isDarkMode={isDarkMode} user={user} />
                    <ScrollToBottomButton isDarkMode={isDarkMode} />
                  </div>
                }
              />
              <Route path="*" element={<ErrorPage isDarkMode={isDarkMode} />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

export default App;
