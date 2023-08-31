import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./style.css";
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
  //const darkStatus = JSON.parse(sessionStorage.getItem("darkMode"));
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [searchText, setSearchText] = React.useState("");
  const [allowNSFW, setAllowNSFW] = React.useState(
    // eslint-disable-next-line
    sfwStatus == 1 ? true : false
  );

  const handleChange = (input) => {
    setSearchText(input);
  };

  const handleToggle = (input) => {
    setAllowNSFW(input);
  };

  const handleDarkModeToggle = (value) => {
    setIsDarkMode(value);
  };

  return (
    <Router>
      <div className={`App ${isDarkMode ? "dark" : ""}`}>
        <Navbar
          onToggle={handleToggle}
          onDarkModeToggle={handleDarkModeToggle}
          isDarkMode={isDarkMode}
        />
        <div
          className="row"
          style={{
            maxWidth: "900px",
            margin: "0 auto 20px auto",
            padding: "20px",
          }}
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
