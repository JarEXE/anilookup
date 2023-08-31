import React from "react";
import { useNavigate } from "react-router-dom";
import "react-circular-progressbar/dist/styles.css";
import "../../../src/style.css";
import Favicon from "../plugins/Favicon";
import toast from "react-hot-toast";
import dateFormat from "dateformat";
import Collapsible from "react-collapsible";
import AuthorWorks from "./AuthorWorks";
import AuthorMangaWorks from "./AuthorMangaWorks";

function AuthorDetails({ isDarkMode }) {
  const getAuthorId = sessionStorage.getItem("authorId");
  const getAuthorName = sessionStorage.getItem("authorName");

  const [loading, setLoading] = React.useState(false);

  const [authorId] = React.useState(getAuthorId);
  const [authorName] = React.useState(getAuthorName);
  const [authorDetails, setAuthorDetails] = React.useState({});
  const [showAuthorAnime, setShowAuthorAnime] = React.useState(false);
  const [showAuthorManga, setShowAuthorManga] = React.useState(false);

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
      "API error! The information for that author is currently missing or broken.",
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

  React.useEffect(() => {
    async function fetchAuthorData() {
      if (authorName.length < 1) {
        return;
      } else {
        try {
          setLoading(true);
          // Fetch both details and relations data concurrently
          const authorDetailsResponse = await fetch(
            `https://api.jikan.moe/v4/people/${authorId}/full`
          );

          // component unmounted, don't set the state
          if (!isMounted) {
            return;
          }

          // Check the response status before proceeding
          if (authorDetailsResponse.status === 429) {
            // Handle rate limiting error
            console.error("Rate limiting error");
            setLoading(false);
            notifyRequestRate();
            navigate("/details");
            return;
          }

          const authorDetailsData = await authorDetailsResponse.json();

          // Check the response status before proceeding
          if (authorDetailsData.status === 429) {
            // Handle rate limiting error
            console.error("Rate limiting error");
            setLoading(false);
            notifyRequestRate();
            navigate("/details");
            return;
          }

          if (authorDetailsData.status === 500) {
            console.error(`API error: ${authorDetailsResponse.error}`);
            setLoading(false);
            notifyError500();
            navigate("/details");
            return;
          }

          setAuthorDetails(authorDetailsData.data);

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

    if (typeof authorId !== "undefined" && authorId !== null) {
      fetchAuthorData();
    }
    // cleanup function to update the mounted flag
    return () => {
      // eslint-disable-next-line
      isMounted = false;
    };
  }, [authorId]);

  const landingPageRoute = () => {
    navigate("/");
  };

  const toggleAuthorAnime = () => {
    setShowAuthorAnime(!showAuthorAnime);
  };

  const toggleAuthorManga = () => {
    setShowAuthorManga(!showAuthorManga);
  };

  return (
    <div className="row">
      {/* check if details object contains data first otherwise there will be a race condition resulting in errors out the ass. That is to say, this will only run if details has been set fully */}
      {authorDetails && Object.keys(authorDetails).length > 0 && !loading ? (
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
                    src={authorDetails.images.jpg.image_url}
                    alt="author cover"
                    className="thumbnail"
                  />
                  <div
                    className="fulldetails-container"
                    style={{ color: `${isDarkMode ? "white" : "black"}` }}
                  >
                    <div className="details-container">
                      <div className="text-container">
                        {authorName.length < 11 ? (
                          <h1 style={{ fontWeight: "normal" }}>{authorName}</h1>
                        ) : (
                          <h3 style={{ fontWeight: "normal" }}>{authorName}</h3>
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            color: "gray",
                            marginTop: "-15px",
                          }}
                        >
                          <small>
                            <i>Given Name: {authorDetails.given_name || "-"}</i>
                          </small>
                          <small>
                            <i>
                              Family Name: {authorDetails.family_name || "-"}
                            </i>
                          </small>
                        </div>

                        <p style={{ marginBottom: "1px", width: "auto" }}>
                          <strong>
                            {typeof authorDetails.birthday !== "undefined" &&
                            authorDetails.birthday !== null
                              ? `Birthday: ${dateFormat(
                                  authorDetails.birthday,
                                  "fullDate"
                                )}`
                              : `Birthday: ?`}
                          </strong>
                        </p>
                      </div>
                    </div>
                    <div className="container-secondary">
                      <div className="thumbnail-synopsis">
                        {authorDetails.about || "No information available."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div style={{ margin: "5px" }} className="well">
              <h5>Website</h5>
              {typeof authorDetails.website_url !== "undefined" &&
              authorDetails.website_url !== null &&
              authorDetails.website_url.length > 0 ? (
                <>
                  <Favicon url={authorDetails.website_url} />
                  <a href={authorDetails.website_url}>
                    {authorDetails.website_url}
                  </a>
                  <hr />
                </>
              ) : (
                <div>
                  No website available.
                  <hr />
                </div>
              )}
            </div>
          </div>
          <h5>Works by this author</h5>
          {authorDetails.anime.length !== 0 ? (
            <Collapsible
              trigger={"Anime"}
              onOpening={toggleAuthorAnime}
              onClose={toggleAuthorAnime}
            >
              <div style={{ marginTop: "5%" }}>
                <ul className="image-gallery">
                  {showAuthorAnime ? (
                    <AuthorWorks isDarkMode={isDarkMode} authorId={authorId} />
                  ) : null}
                </ul>
              </div>
            </Collapsible>
          ) : null}

          {authorDetails.manga.length !== 0 ? (
            <Collapsible
              trigger={"Manga"}
              onOpening={toggleAuthorManga}
              onClose={toggleAuthorManga}
            >
              <div style={{ marginTop: "5%" }}>
                <ul className="image-gallery">
                  {showAuthorManga ? (
                    <AuthorMangaWorks
                      isDarkMode={isDarkMode}
                      authorId={authorId}
                      authorName={authorName}
                    />
                  ) : null}
                </ul>
              </div>
            </Collapsible>
          ) : null}

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

export default AuthorDetails;
