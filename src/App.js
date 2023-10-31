import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./style.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Reset from "./components/auth/Reset";
import Profile from "./components/auth/Profile";
import Cards from "./components/anime/Cards";
import AnimeSearch from "./components/anime/AnimeSearch";
import Navbar from "./components/plugins/Navbar";
import MangaSearch from "./components/manga/MangaSearch";
import Details from "./components/Details";
import ScrollToBottomButton from "./components/plugins/ScrollToBottomButton";
import StudioDetails from "./components/studios/StudioDetails";
import AuthorDetails from "./components/authors/AuthorDetails";

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
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        setUser(user);
        console.log("uid", uid);
      } else {
        console.log(user);
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
              element={
                <div>
                  <Profile isDarkMode={isDarkMode} user={user} />
                </div>
              }
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
              path="/details"
              element={
                <div>
                  <Details isDarkMode={isDarkMode} allowNSFW={allowNSFW} />
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
