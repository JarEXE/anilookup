import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "react-circular-progressbar/dist/styles.css";
import "../../../src/style.css";
import Favicon from "../plugins/Favicon";
import dateFormat from "dateformat";
import Collapsible from "react-collapsible";
import AuthorWorks from "./AuthorWorks";
import AuthorMangaWorks from "./AuthorMangaWorks";
import { API_URL, apiFetch } from "../../config/api";
import useNotify from "../../hooks/useNotify";
import { goBackOrHome } from "../../utils/navigation";
import ErrorPage from "../ErrorPage";

// Rendered at /author/:id
function AuthorDetails({ isDarkMode, allowNSFW }) {
  const { id: authorId } = useParams();

  const [loading, setLoading] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);

  const [authorDetails, setAuthorDetails] = React.useState({});
  const authorName = (authorDetails && authorDetails.name) || "";
  const [showAuthorAnime, setShowAuthorAnime] = React.useState(false);
  const [showAuthorManga, setShowAuthorManga] = React.useState(false);

  // stable across dark mode toggles, so it doesn't re-trigger the fetch effect
  const notify = useNotify(isDarkMode);
  const notifyRequestRate = () =>
    notify("Too many requests! Please wait a moment then try again.");
  const notifyError500 = () =>
    notify(
      "API error! The information for that author is currently missing or broken.",
      { type: "error" },
    );
  const notifyErrorGeneral = () =>
    notify(
      "API error! Could not fetch requested data. Please try again later.",
      { type: "error" },
    );

  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    async function fetchAuthorData() {
      try {
        setLoading(true);
        // Fetch both details and relations data concurrently
        const authorDetailsResponse = await apiFetch(
          `${API_URL}/people/${authorId}/full`,
        );

        // ids now come from the URL, so they can be invalid
        if (
          authorDetailsResponse.status === 404 ||
          authorDetailsResponse.status === 400
        ) {
          setLoading(false);
          setNotFound(true);
          return;
        }

        // Check the response status before proceeding
        if (authorDetailsResponse.status === 429) {
          // Handle rate limiting error
          console.error("Rate limiting error");
          setLoading(false);
          notifyRequestRate();
          goBackOrHome(navigate, location);
          return;
        }

        const authorDetailsData = await authorDetailsResponse.json();

        // Check the response status before proceeding
        if (authorDetailsData.status === 429) {
          // Handle rate limiting error
          console.error("Rate limiting error");
          setLoading(false);
          notifyRequestRate();
          goBackOrHome(navigate, location);
          return;
        }

        if (authorDetailsData.status === 500) {
          console.error(`API error: ${authorDetailsResponse.error}`);
          setLoading(false);
          notifyError500();
          goBackOrHome(navigate, location);
          return;
        }

        setAuthorDetails(authorDetailsData.data);

        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        notifyErrorGeneral();
        goBackOrHome(navigate, location);
        return;
      }
    }

    fetchAuthorData();
    // location is only used for the error fallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authorId,
    navigate,
    notify,
  ]);

  const toggleAuthorAnime = () => {
    setShowAuthorAnime(!showAuthorAnime);
  };

  const toggleAuthorManga = () => {
    setShowAuthorManga(!showAuthorManga);
  };

  if (notFound) {
    return <ErrorPage isDarkMode={isDarkMode} />;
  }

  return (
    <div className="row">
      {/* check if details object contains data first otherwise there will be a race condition resulting in errors out the ass. That is to say, this will only run if details has been set fully */}
      {authorDetails && Object.keys(authorDetails).length > 0 && !loading ? (
        <>
          <div className="col-md-12" style={{ marginBottom: "20px" }}>
            <div
              className={`${isDarkMode ? "pseudo-blur-dark" : "pseudo-blur"}`}
            >
              <img
                id="thumbnail-img"
                src={authorDetails.images.jpg.image_url}
                alt="author cover"
                className="thumbnail"
              />
              <div
                className="fulldetails-container"
                style={{ color: `${isDarkMode ? "var(--d-ink)" : "black"}` }}
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
                      <br />
                      <small>
                        <i>Given Name: {authorDetails.given_name || "-"}</i>
                      </small>
                      <small>
                        <i>Family Name: {authorDetails.family_name || "-"}</i>
                      </small>
                      <br />
                    </div>

                    <p style={{ marginBottom: "1px", width: "auto" }}>
                      <strong>
                        {typeof authorDetails.birthday !== "undefined" &&
                        authorDetails.birthday !== null
                          ? `Birthday: ${dateFormat(
                              authorDetails.birthday,
                              "fullDate",
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
                <div className="image-gallery">
                  {showAuthorAnime ? (
                    <AuthorWorks
                      isDarkMode={isDarkMode}
                      authorId={authorId}
                      allowNSFW={allowNSFW}
                    />
                  ) : null}
                </div>
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
                <div className="image-gallery">
                  {showAuthorManga ? (
                    <AuthorMangaWorks
                      isDarkMode={isDarkMode}
                      authorId={authorId}
                      authorName={authorName}
                      allowNSFW={allowNSFW}
                    />
                  ) : null}
                </div>
              </div>
            </Collapsible>
          ) : null}

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
