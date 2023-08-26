import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./style.css";
import Cards from "./components/Cards";
import AnimeSearch from "./components/AnimeSearch";
import Navbar from "./components/Navbar";
import MangaSearch from "./components/MangaSearch";
import Details from "./components/Details";
import ScrollToBottomButton from "./components/ScrollToBottomButton";

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
                  <Details isDarkMode={isDarkMode} />
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
