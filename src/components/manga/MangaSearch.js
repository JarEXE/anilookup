import React from "react";
import { useNavigate } from "react-router-dom";
import TopManga from "./TopManga";
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

function MangaSearch({ onInputChange, isDarkMode, allowNSFW, user }) {
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
  const [selectedOption, setSelectedOption] = React.useState("publishing");

  const [listStatus, setListStatus] = React.useState(
    JSON.parse(sessionStorage.getItem("mangaListItems"))
  );

  const [listUpdated, setListUpdated] = React.useState(false);

  const [readingListLength, setReadingListLength] = React.useState(null);
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

      navigate("/mangasearch");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const animeRoute = () => {
    navigate("/");
  };

  React.useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const mangalistitemsRef = collection(
          db,
          "users",
          user.uid,
          "mangalistitems"
        );

        try {
          const querySnapshot = await getDocs(mangalistitemsRef);
          let dataList = [];

          querySnapshot.forEach((doc) => {
            // doc.data() is an object representing the document
            dataList.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          sessionStorage.setItem("mangaListItems", JSON.stringify(dataList));

          setReadingListLength(
            dataList.filter((item) => item["currentList"] === "reading").length
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
            "Error getting documents from mangalistitems collection:",
            error
          );
          return [];
        }
      } else {
        console.log("user is logged out");
      }
    });
  }, [user]);

  // Update the listStatus state when setting mangaListItems in sessionStorage
  React.useEffect(() => {
    setListStatus(JSON.parse(sessionStorage.getItem("mangaListItems")));
  }, [listUpdated]);

  return (
    <div>
      <div className="container text-center">
        <div className="jumbotron" style={{ height: "161px" }}>
          <p className="lead">Lookup Any Manga!</p>
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
              onClick={() => animeRoute()}
            >
              Anime Section
            </button>
          </div>
        </div>
        <hr></hr>
        <div className="text-center mb-2">
          <p className="lead">Your Manga Stats</p>
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
            Reading: {readingListLength}
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
            Plan to Read: {plannedListLength}
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
        <hr className="separator"></hr>
        <div className="container text-center mt-4">
          <p className="lead">Top</p>
        </div>

        <ScrollContainer className="inputToggles">
          <div className="inputToggleContainer">
            <div
              className="btn-group mb-4"
              role="group"
              aria-label="Basic radio toggle button group"
            >
              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="publishing"
                autoComplete="off"
                checked={selectedOption === "publishing"}
                onChange={handleRadioChange}
              />
              <label
                className={`${
                  isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                }`}
                htmlFor="publishing"
              >
                Publishing
              </label>

              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="manga"
                autoComplete="off"
                checked={selectedOption === "manga"}
                onChange={handleRadioChange}
              />
              <label
                className={`${
                  isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                }`}
                htmlFor="manga"
              >
                Manga
              </label>

              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="manhwa"
                autoComplete="off"
                checked={selectedOption === "manhwa"}
                onChange={handleRadioChange}
              />
              <label
                className={`${
                  isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                }`}
                htmlFor="manhwa"
              >
                Manhwa
              </label>

              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="manhua"
                autoComplete="off"
                checked={selectedOption === "manhua"}
                onChange={handleRadioChange}
              />
              <label
                className={`${
                  isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                }`}
                htmlFor="manhua"
              >
                Manhua
              </label>

              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="novel"
                autoComplete="off"
                checked={selectedOption === "novel"}
                onChange={handleRadioChange}
              />
              <label
                className={`${
                  isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                }`}
                htmlFor="novel"
              >
                Novel
              </label>

              {allowNSFW ? (
                <>
                  <input
                    type="radio"
                    className="btn-check"
                    name="btnradio"
                    id="doujin"
                    autoComplete="off"
                    checked={selectedOption === "doujin"}
                    onChange={handleRadioChange}
                  />
                  <label
                    className={`${
                      isDarkMode
                        ? "btn btn-outline-info"
                        : "btn btn-outline-dark"
                    }`}
                    htmlFor="doujin"
                  >
                    Doujinshi
                  </label>
                </>
              ) : null}
            </div>
          </div>
        </ScrollContainer>
      </div>
      <div>
        <ul className="image-gallery">
          {(selectedOption === "doujin" && allowNSFW === true) ||
          ["publishing", "manhwa", "manga", "novel", "manhua"].includes(
            selectedOption
          ) ? (
            <TopManga
              isDarkMode={isDarkMode}
              allowNSFW={allowNSFW}
              selectedOption={selectedOption}
              listStatus={listStatus}
            />
          ) : (
            setSelectedOption("publishing")
          )}
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

export default MangaSearch;
