import React from "react";
import { useNavigate } from "react-router-dom";
import TopAnime from "./TopAnime";
import toast from "react-hot-toast";
import ScrollContainer from "react-indiana-drag-scroll";
import { onAuthStateChanged } from "firebase/auth";
import { getDocs, collection } from "firebase/firestore";
import { auth, db } from "../../firebase";
import {
  faCircleCheck,
  faEye,
  faCircleXmark,
  faHand,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AnimeSearch({ onInputChange, isDarkMode, allowNSFW, user }) {
  const notifyBadSearch = () =>
    toast.error("Input cannot be empty!", {
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
        color: `${isDarkMode ? "#333" : "#fff"}`,
      },
    });
  const [searchText, setSearchText] = React.useState("");

  // Initialize state to manage the selected radio button
  const [selectedOption, setSelectedOption] = React.useState("airing");

  // State to hold the animeListItems from sessionStorage
  const [listStatus, setListStatus] = React.useState(
    JSON.parse(sessionStorage.getItem("animeListItems"))
  );

  const [listUpdated, setListUpdated] = React.useState(false);

  const [watchListLength, setWatchListLength] = React.useState(null);
  const [holdListLength, setHoldListLength] = React.useState(null);
  const [plannedListLength, setPlannedListLength] = React.useState(null);
  const [droppedListLength, setDroppedListLength] = React.useState(null);
  const [completedListLength, setCompletedListLength] = React.useState(null);

  const navigate = useNavigate();

  // Handler to update the selected radio button
  const handleRadioChange = (event) => {
    setSelectedOption(event.target.id);
  };

  const handleChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleSubmit = () => {
    if (searchText.length < 1) {
      notifyBadSearch();
      return;
    } else {
      sessionStorage.setItem("searchText", searchText);
      onInputChange(searchText);

      navigate("/search");
    }
  };

  const mangaRoute = () => {
    navigate("/mangalookup");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  React.useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const animelistitemsRef = collection(
          db,
          "users",
          user.uid,
          "animelistitems"
        );

        try {
          const querySnapshot = await getDocs(animelistitemsRef);
          let dataList = [];

          querySnapshot.forEach((doc) => {
            // doc.data() is an object representing the document
            dataList.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          sessionStorage.setItem("animeListItems", JSON.stringify(dataList));

          setWatchListLength(
            dataList.filter((item) => item["currentList"] === "watching").length
          );
          setHoldListLength(
            dataList.filter((item) => item["currentList"] === "onhold").length
          );
          setPlannedListLength(
            dataList.filter((item) => item["currentList"] === "planned").length
          );
          setDroppedListLength(
            dataList.filter((item) => item["currentList"] === "dropped").length
          );
          setCompletedListLength(
            dataList.filter((item) => item["currentList"] === "completed")
              .length
          );
          setListUpdated(true);
        } catch (error) {
          console.error(
            "Error getting documents from animelistitems collection:",
            error
          );
          return [];
        }
      } else {
        console.log("user is logged out");
      }
    });
  }, [user]);

  // Update the listStatus state when setting animeListItems in sessionStorage
  React.useEffect(() => {
    setListStatus(JSON.parse(sessionStorage.getItem("animeListItems")));
  }, [listUpdated]);

  return (
    <div>
      <div className="container text-center">
        <div className="jumbotron" style={{ height: "161px" }}>
          <p className="lead">Lookup Any Anime!</p>
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Start typing here..."
              value={searchText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              style={{ borderRadius: "25px" }}
            />
          </div>
          <div className="d-flex justify-content-center">
            <button
              className={`btn btn-${isDarkMode ? "info" : "dark"}`}
              style={{ width: "40%", borderRadius: "25px" }}
              type="button"
              onClick={handleSubmit}
            >
              Search
            </button>
            <button
              className="btn btn-secondary"
              style={{
                width: "40%",
                borderRadius: "25px",
                marginLeft: "5px",
              }}
              onClick={() => mangaRoute()}
            >
              Manga Section
            </button>
          </div>
        </div>
        {user ? (
          <>
            <hr></hr>
            <div className="text-center mb-2">
              <p className="lead">Your Anime Stats</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                className="mb-2"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faEye}
                  style={{ color: "blueviolet", marginRight: "2%" }}
                />{" "}
                Watching: {watchListLength}
              </div>
              <div
                className="mb-2"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faHand}
                  style={{ color: "orange", marginRight: "2%" }}
                />{" "}
                On-Hold: {holdListLength}
              </div>
              <div
                className="mb-2"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faClock}
                  style={{ color: "gray", marginRight: "2%" }}
                />{" "}
                Plan to Watch: {plannedListLength}
              </div>
              <div
                className="mb-2"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faCircleXmark}
                  style={{ color: "red", marginRight: "2%" }}
                />{" "}
                Dropped: {droppedListLength}
              </div>
              <div
                className="mb-4"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  style={{ color: "green", marginRight: "2%" }}
                />{" "}
                Completed: {completedListLength}
              </div>
            </div>
          </>
        ) : null}
        <hr className="separator"></hr>
        <div className="container text-center mt-4">
          <p className="lead">Top</p>
        </div>
        <ScrollContainer className="inputToggles">
          <div
            className="btn-group mb-4"
            role="group"
            aria-label="Basic radio toggle button group"
          >
            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="airing"
              autoComplete="off"
              checked={selectedOption === "airing"}
              onChange={handleRadioChange}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="airing"
            >
              Airing
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="upcoming"
              autoComplete="off"
              checked={selectedOption === "upcoming"}
              onChange={handleRadioChange}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="upcoming"
            >
              Upcoming
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="series"
              autoComplete="off"
              checked={selectedOption === "series"}
              onChange={handleRadioChange}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="series"
            >
              Series
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="movies"
              autoComplete="off"
              checked={selectedOption === "movies"}
              onChange={handleRadioChange}
            />
            <label
              className={`${
                isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
              }`}
              htmlFor="movies"
            >
              Movies
            </label>
          </div>
        </ScrollContainer>
      </div>
      <div>
        <ul className="image-gallery">
          <TopAnime
            isDarkMode={isDarkMode}
            allowNSFW={allowNSFW}
            selectedOption={selectedOption}
            listStatus={listStatus}
          />
        </ul>
      </div>
      <hr className="footer-separator"></hr>
      <div className="text-center">
        Powered by{" "}
        <strong>
          <a href="https://jikan.moe/">Jikan</a>
        </strong>{" "}
        REST API
        <p>
          Made by{" "}
          <strong>
            <a href="https://github.com/JarEXE">Jarome Eyken</a>
          </strong>
        </p>
      </div>
    </div>
  );
}

export default AnimeSearch;
