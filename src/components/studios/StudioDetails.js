import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "react-circular-progressbar/dist/styles.css";
import "../../../src/style.css";
import Favicon from "../plugins/Favicon";
import dateFormat from "dateformat";
import StudioWorks from "./StudioWorks";
import ScrollContainer from "react-indiana-drag-scroll";
import { API_URL, apiFetch } from "../../config/api";
import useNotify from "../../hooks/useNotify";
import useUrlParams from "../../hooks/useUrlParams";
import { goBackOrHome } from "../../utils/navigation";
import ErrorPage from "../ErrorPage";

// Rendered at /studio/:id?type=...&sort=...&page=...
function StudioDetails({ isDarkMode, allowNSFW }) {
  const { id: studioId } = useParams();

  const [loading, setLoading] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);

  const [studioDetails, setStudioDetails] = React.useState({});

  const studioName =
    studioDetails && Array.isArray(studioDetails.titles)
      ? (
          studioDetails.titles.find((title) => title.type === "Default") ||
          studioDetails.titles[0] || { title: "" }
        ).title
      : "";

  const [{ type: selectedOption, sort: sortBy }, updateUrlParams] =
    useUrlParams({ type: "all", sort: "members" });

  // stable across dark mode toggles, so it doesn't re-trigger the fetch effect
  const notify = useNotify(isDarkMode);
  const notifyRequestRate = () =>
    notify("Too many requests! Please wait a moment then try again.");
  const notifyError500 = () =>
    notify(
      "API error! The information for that studio is currently missing or broken.",
      { type: "error" },
    );
  const notifyErrorGeneral = () =>
    notify(
      "API error! Could not fetch requested data. Please try again later.",
      { type: "error" },
    );

  const navigate = useNavigate();
  const location = useLocation();

  // Handler to update the selected radio button
  const handleRadioChange = (event) => {
    // changing the filter starts back at page 1
    updateUrlParams({ type: event.target.id, page: null });
  };

  const handleSortChange = (event, sort) => {
    event.preventDefault();
    updateUrlParams({ sort: sort, page: null });
  };

  React.useEffect(() => {
    async function fetchStudioData() {
      try {
        setLoading(true);
        // Fetch both details and relations data concurrently
        const [studioDetailsResponse] = await Promise.all([
          apiFetch(`${API_URL}/producers/${studioId}/full`),
        ]);

        // ids now come from the URL, so they can be invalid
        if (
          studioDetailsResponse.status === 404 ||
          studioDetailsResponse.status === 400
        ) {
          setLoading(false);
          setNotFound(true);
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
          goBackOrHome(navigate, location);
          return;
        }

        if (studioDetailsData.status === 500) {
          console.error(`API error: ${studioDetailsResponse.error}`);
          setLoading(false);
          notifyError500();
          goBackOrHome(navigate, location);
          return;
        }

        setStudioDetails(studioDetailsData.data);

        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        notifyErrorGeneral();
        goBackOrHome(navigate, location);
        return;
      }
    }

    fetchStudioData();
    // location is only used for the error fallback and must not trigger a
    // refetch when the filter/sort/page query params change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    studioId,
    navigate,
    notify,
  ]);

  if (notFound) {
    return <ErrorPage isDarkMode={isDarkMode} />;
  }

  return (
    <div className="row">
      {studioDetails && Object.keys(studioDetails).length > 0 && !loading ? (
        <>
          <div className="col-md-12" style={{ marginBottom: "20px" }}>
            <div
              className={`${isDarkMode ? "pseudo-blur-dark" : "pseudo-blur"}`}
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
                  color: `${isDarkMode ? "var(--d-ink)" : "black"}`,
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
                              "fullDate",
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
                    onClick={(event) => handleSortChange(event, "members")}
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
                    onClick={(event) => handleSortChange(event, "score")}
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
                    onClick={(event) => handleSortChange(event, "title")}
                  >
                    Title
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: "5%" }}>
            <div className="image-gallery">
              <StudioWorks
                isDarkMode={isDarkMode}
                allowNSFW={allowNSFW}
                studioId={studioId}
                studioName={studioName}
                selectedOption={selectedOption}
                sortBy={sortBy}
              />
            </div>
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
