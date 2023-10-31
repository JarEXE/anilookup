import React from "react";
import { useNavigate } from "react-router-dom";
import "react-circular-progressbar/dist/styles.css";
import "../../../src/style.css";
import Favicon from "../plugins/Favicon";
import toast from "react-hot-toast";
import dateFormat from "dateformat";
import StudioWorks from "./StudioWorks";
import ScrollContainer from "react-indiana-drag-scroll";

function StudioDetails({ isDarkMode, allowNSFW }) {
  const getStudioId = sessionStorage.getItem("studioId");
  const getStudioName = sessionStorage.getItem("studioName");

  const [loading, setLoading] = React.useState(false);

  const [studioId] = React.useState(getStudioId);
  const [studioName] = React.useState(getStudioName);
  const [studioDetails, setStudioDetails] = React.useState({});

  // Initialize state to manage the selected radio button
  const [selectedOption, setSelectedOption] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("members");

  let isMounted = true;

  const notifyRequestRate = () =>
    toast("Too many requests! Please wait a moment then try again.", {
      icon: "⚠️",
      style: {
        borderRadius: "10px",
        background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
        color: `${isDarkMode ? "#333" : "#fff"}`,
      },
    });

  const notifyError500 = () =>
    toast.error(
      "API error! The information for that studio is currently missing or broken.",
      {
        style: {
          borderRadius: "10px",
          background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
          color: `${isDarkMode ? "#333" : "#fff"}`,
        },
      }
    );

  const notifyErrorGeneral = () =>
    toast.error(
      "API error! Could not fetch requested data. Please try again later.",
      {
        style: {
          borderRadius: "10px",
          background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
          color: `${isDarkMode ? "#333" : "#fff"}`,
        },
      }
    );

  const navigate = useNavigate();

  // Handler to update the selected radio button
  const handleRadioChange = (event) => {
    setSelectedOption(event.target.id);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  React.useEffect(() => {
    async function fetchStudioData() {
      if (studioName.length < 1) {
        return;
      } else {
        try {
          setLoading(true);
          // Fetch both details and relations data concurrently
          const [studioDetailsResponse] = await Promise.all([
            fetch(`https://api.jikan.moe/v4/producers/${studioId}/full`),
          ]);

          // component unmounted, don't set the state
          if (!isMounted) {
            return;
          }

          const [studioDetailsData] = await Promise.all([
            studioDetailsResponse.json(),
          ]);

          // Check the response status before proceeding
          if (studioDetailsData.status === 429) {
            // Handle rate limiting error
            console.error("Rate limiting error");
            setLoading(false);
            notifyRequestRate();
            navigate("/details");
            return;
          }

          if (studioDetailsData.status === 500) {
            console.error(`API error: ${studioDetailsResponse.error}`);
            setLoading(false);
            notifyError500();
            navigate("/details");
            return;
          }

          setStudioDetails(studioDetailsData.data);

          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
          notifyErrorGeneral();
          navigate("/details");
          return;
        }
      }
    }

    if (typeof studioId !== "undefined" && studioId !== null) {
      fetchStudioData();
    }
    // cleanup function to update the mounted flag
    return () => {
      // eslint-disable-next-line
      isMounted = false;
    };
  }, [studioId]);

  const landingPageRoute = () => {
    navigate("/");
  };

  return (
    <div className="row">
      {/* check if details object contains data first otherwise there will be a race condition resulting in errors out the ass. That is to say, this will only run if details has been set fully */}
      {studioDetails && Object.keys(studioDetails).length > 0 && !loading ? (
        <>
          <div className="col-md-12" style={{ marginBottom: "20px" }}>
            <div>
              <div>
                <div
                  className={`${
                    isDarkMode ? "pseudo-blur-dark" : "pseudo-blur"
                  }`}
                >
                  <img
                    id="thumbnail-img"
                    src={studioDetails.images.jpg.image_url}
                    alt="studio cover"
                    className="studio-thumbnail"
                  />
                  <div
                    className="fulldetails-container"
                    style={{
                      marginTop: "5%",
                      color: `${isDarkMode ? "white" : "black"}`,
                    }}
                  >
                    <div className="details-container">
                      <div className="text-container">
                        {studioName.length < 11 ? (
                          <h1 style={{ fontWeight: "normal" }}>{studioName}</h1>
                        ) : (
                          <h3 style={{ fontWeight: "normal" }}>{studioName}</h3>
                        )}
                        <p style={{ marginBottom: "1px", width: "auto" }}>
                          <strong>
                            {typeof studioDetails.established !== "undefined" &&
                            studioDetails.established !== null
                              ? `Established: ${dateFormat(
                                  studioDetails.established,
                                  "fullDate"
                                )}`
                              : `Established: ?`}
                          </strong>
                        </p>
                        <br />
                      </div>
                    </div>
                    <div className="container-secondary">
                      <div className="thumbnail-synopsis">
                        {studioDetails.about || "No information available."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div style={{ margin: "5px" }} className="well">
              <h5>External Links</h5>
              {typeof studioDetails.external !== "undefined" &&
              studioDetails.external.length > 0 ? (
                <>
                  <ul style={{ listStyle: "none", padding: "0" }}>
                    {studioDetails.external.map((item, index) => (
                      <li
                        key={index}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <Favicon url={item.url} />
                        <a href={item.url}>{item.name}</a>
                      </li>
                    ))}
                  </ul>
                  <hr />
                </>
              ) : (
                <div>
                  No external links available.
                  <hr />
                </div>
              )}
            </div>
          </div>
          <h5>Works by this Studio</h5>
          <div
            style={{
              marginTop: "5%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <ScrollContainer
              className="inputToggles"
              style={{ justifyContent: "start" }}
            >
              <div
                className="btn-group mb-4"
                role="group"
                aria-label="Basic radio toggle button group"
              >
                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="all"
                  autoComplete="off"
                  checked={selectedOption === "all"}
                  onChange={handleRadioChange}
                />
                <label
                  className={`${
                    isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                  }`}
                  htmlFor="all"
                >
                  All
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="tv"
                  autoComplete="off"
                  checked={selectedOption === "tv"}
                  onChange={handleRadioChange}
                />
                <label
                  className={`${
                    isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                  }`}
                  htmlFor="tv"
                >
                  TV
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="ona"
                  autoComplete="off"
                  checked={selectedOption === "ona"}
                  onChange={handleRadioChange}
                />
                <label
                  className={`${
                    isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                  }`}
                  htmlFor="ona"
                >
                  ONA
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="ova"
                  autoComplete="off"
                  checked={selectedOption === "ova"}
                  onChange={handleRadioChange}
                />
                <label
                  className={`${
                    isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                  }`}
                  htmlFor="ova"
                >
                  OVA
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="movie"
                  autoComplete="off"
                  checked={selectedOption === "movie"}
                  onChange={handleRadioChange}
                />
                <label
                  className={`${
                    isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                  }`}
                  htmlFor="movie"
                >
                  Movie
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="other"
                  autoComplete="off"
                  checked={selectedOption === "other"}
                  onChange={handleRadioChange}
                />
                <label
                  className={`${
                    isDarkMode ? "btn btn-outline-info" : "btn btn-outline-dark"
                  }`}
                  htmlFor="other"
                >
                  Other
                </label>
              </div>
            </ScrollContainer>
            <div
              className="dropdown"
              data-bs-popper="none"
              style={{ marginLeft: "5%" }}
            >
              <button
                className={`btn btn-${
                  isDarkMode ? "info" : "dark"
                } dropdown-toggle`}
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Sort By
              </button>
              <ul className="dropdown-menu">
                <li>
                  <a
                    className="dropdown-item"
                    href="#/"
                    type="radio"
                    name="btnsort"
                    id="members"
                    autoComplete="off"
                    //   checked={sortBy === "members"}
                    onClick={() => handleSortChange("members")}
                  >
                    Members
                  </a>
                </li>

                <li>
                  <a
                    className="dropdown-item"
                    href="#/"
                    type="radio"
                    name="btnsort"
                    id="score"
                    autoComplete="off"
                    //   checked={sortBy === "score"}
                    onClick={() => handleSortChange("score")}
                  >
                    Score
                  </a>
                </li>

                <li>
                  <a
                    className="dropdown-item"
                    href="#/"
                    type="radio"
                    name="btnsort"
                    id="title"
                    autoComplete="off"
                    //   checked={sortBy === "title"}
                    onClick={() => handleSortChange("title")}
                  >
                    Title
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: "5%" }}>
            <ul className="image-gallery">
              <StudioWorks
                isDarkMode={isDarkMode}
                allowNSFW={allowNSFW}
                studioId={studioId}
                studioName={studioName}
                selectedOption={selectedOption}
                sortBy={sortBy}
              />
            </ul>
          </div>

          <div className="row">
            <div style={{ margin: "5px" }} className="well">
              <hr></hr>
              <div
                style={{
                  marginTop: "-15px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <small>
                  <i>"Members" refers to MAL members/users.</i>
                </small>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <a
                    id="returnBtn"
                    href="#/"
                    className={`${
                      isDarkMode ? "btn btn-info mt-4" : "btn btn-dark mt-4"
                    }`}
                    style={{ borderRadius: "25px" }}
                    onClick={() => landingPageRoute()}
                  >
                    Return to Lookup Page
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
          }}
        >
          <span className="loader"></span>
        </div>
      )}
    </div>
  );
}

export default StudioDetails;
