import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { useNavigate } from "react-router-dom";
import AnimatedProgressProvider from "./plugins/AnimatedProgressProvider";
import { easeQuadIn } from "d3-ease";
import "react-circular-progressbar/dist/styles.css";
import mal from "../images/mal.png";
import "../../src/style.css";
import YouTubeEmbed from "./plugins/YoutubeEmbed";
import Favicon from "./plugins/Favicon";
import toast from "react-hot-toast";
import ListAddButton from "./plugins/ListAddButton";
import dateFormat from "dateformat";
import { Button } from "@mui/material";
import { Book } from "@mui/icons-material";

function Details({ isDarkMode }) {
  const getKitsuCover = sessionStorage.getItem("kitsuCover");
  const getAnimeOrMangaId = sessionStorage.getItem("itemId");

  const [kitsuCover] = React.useState(getKitsuCover);
  const [itemId] = React.useState(getAnimeOrMangaId);
  const [details, setDetails] = React.useState({});
  const [recommendations, setRecommendations] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [backgroundBlur, setBackgroundBlur] = React.useState({});
  const [streamingSitesSection, setStreamingSitesSection] =
    React.useState(null);
  const [itemType, setItemType] = React.useState("");
  const [authors, setAuthors] = React.useState(null);
  const [loadingChapters, setLoadingChapters] = React.useState(false);
  const [mangaDexMangaID, setMangaDexMangaID] = React.useState(null);

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

  // Define a function to fetch author details and positions
  const fetchAuthorDetailsAndPositions = async () => {
    let authorsArray = [];

    if (typeof details.authors !== "undefined") {
      for (const author of details.authors) {
        try {
          const authorsResponse = await fetch(
            `https://api.jikan.moe/v4/people/${author.mal_id}/full`
          );
          const authorsData = await authorsResponse.json();

          if (authorsData) {
            const targetMalId = details.mal_id;
            const mangaArray = authorsData.data.manga;

            // Function to find the position that comes before the manga key by matching the target mal_id
            function findPositionByMalId(targetMalId) {
              for (let i = 0; i < mangaArray.length; i++) {
                if (mangaArray[i].manga.mal_id === targetMalId) {
                  if (i > -1) {
                    return mangaArray[i].position;
                  }
                  // If the first object matches, there's no position before it
                  return null;
                }
              }
              // Return null if the target mal_id is not found
              return null;
            }

            // Call the function to find the position
            const position = findPositionByMalId(targetMalId);

            if (position !== null) {
              authorsArray.push({
                authorId: authorsData.data.mal_id,
                position: position,
              });
            } else {
              console.log(`Manga ID ${targetMalId} not found in the array.`);
            }
          }
        } catch (error) {
          console.log(error);
          return;
        }
      }
    }

    // Set the authors array in the state
    setAuthors(authorsArray);
  };

  const getMangaIdByName = async (title) => {
    const baseUrl = "https://api.mangadex.org";

    try {
      const response = await fetch("/.netlify/functions/manga-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: baseUrl,
          title: title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Manga ID");
      }

      const data = await response.json();
      console.log(typeof data);
      console.log(data);

      setMangaDexMangaID(data);
    } catch (error) {
      console.log("Invalid URL:", error);
      return null;
    }
  };

  const getMangaChapters = async () => {
    setLoadingChapters(true);
    const baseUrl = "https://api.mangadex.org";

    try {
      const response = await fetch("/.netlify/functions/mangachapters-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: baseUrl,
          mangaID: mangaDexMangaID,
          mangaImage: details.images.jpg.large_image_url,
          mangaTitle: details.title,
        }),
      });

      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to fetch Manga Chapters");
      }

      const data = await response.json();

      sessionStorage.setItem("mangachapters", data);
    } catch (error) {
      console.log("Invalid URL:", error);
      return null;
    }

    if (
      sessionStorage.getItem("mangachapters") !== "" ||
      sessionStorage.getItem("mangachapters") !== null
    ) {
      setLoadingChapters(false);
      window.location.href = "/read";
    } else {
      setLoadingChapters(false);
      alert("Failed to fetch manga chapters!");
      return;
    }
  };

  const navigate = useNavigate();

  React.useEffect(() => {
    async function fetchData() {
      if (itemId === null) {
        navigate("/");
      } else {
        try {
          setLoading(true);
          // Fetch both details and relations data concurrently
          const [detailsResponse, recommendationsResponse] = await Promise.all([
            fetch(`https://api.jikan.moe/v4${itemId}/full`),
            fetch(`https://api.jikan.moe/v4${itemId}/recommendations`),
          ]);

          // component unmounted, don't set the state
          if (!isMounted) {
            return;
          }

          // Check the response status before proceeding
          if (detailsResponse.status === 429) {
            // Handle rate limiting error
            console.error("Rate limiting error");
            setLoading(false);
            notifyRequestRate();
            return;
          }

          const [detailsData, recommendationsData] = await Promise.all([
            detailsResponse.json(),
            recommendationsResponse.json(),
          ]);

          setDetails(detailsData.data);
          setRecommendations(recommendationsData.data);

          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
          notifyRequestRate();
          return;
        }
      }
    }

    if (typeof itemId !== "undefined" && itemId !== null) {
      fetchData();
    } else {
      navigate("/");
    }

    // cleanup function to update the mounted flag
    return () => {
      // eslint-disable-next-line
      isMounted = false;
    };
  }, [itemId]);

  React.useEffect(() => {
    if (Object.keys(details).length > 0) {
      setBackgroundBlur({
        backgroundImage: `url("${
          kitsuCover.length > 0
            ? kitsuCover
            : details.images.jpg.large_image_url
        }")`,
        width: `${kitsuCover.length > 0 ? "100vw" : "100vw"}`,
        marginLeft: `${
          kitsuCover.length > 0 ? "calc(50% - 50vw)" : "calc(50% - 50vw)"
        }`,
        backgroundSize: "cover",
        backgroundPosition: `${kitsuCover.length > 0 ? "" : "center"}`,
        marginBottom: "20px",
        boxShadow: `${
          kitsuCover.length > 0
            ? "0px 0px 10px 5px rgba(0, 0, 0, 0.5)"
            : " inset 0 0 0 2000px rgba(28, 28, 28, 0.75)"
        }`,
        filter: `${kitsuCover.length > 0 ? "" : "blur(5px)"}`,
      });

      // anime or manga check
      if (
        details.type === "TV" ||
        details.type === "Special" ||
        details.type === "ONA" ||
        details.type === "OVA" ||
        details.type === "Movie" ||
        details.type === "Music"
      ) {
        setItemType("anime");
        setStreamingSitesSection(true);
      } else {
        setItemType("manga");
        fetchAuthorDetailsAndPositions();
        setStreamingSitesSection(false);
        getMangaIdByName(details.title);
      }
    }
    // eslint-disable-next-line
  }, [details]);

  const getColor = (score) => {
    if (score >= 7.5) {
      return "#00A300"; // Green for high scores
    } else if (score >= 5.0) {
      return "#FFA500"; // Yellow for moderate scores
    } else {
      return "#FF0000"; // Red for low scores
    }
  };

  const newDetails = async (navInfo, navTitle, itemType) => {
    let kitsuData;
    setLoading(true);
    console.log(itemType);

    await fetch(
      `https://kitsu.io/api/edge/${itemType}?filter[text]=${navTitle}&page[limit]=${
        itemType === "anime" ? "5" : "1"
      }`
    ).then(async (response) => {
      kitsuData = await response.json();
    });

    if (itemType === "anime") {
      const matchingItem = kitsuData.data.find(
        (item) =>
          item.attributes.canonicalTitle === navTitle ||
          item.attributes.abbreviatedTitles.includes(navTitle) ||
          item.attributes.titles.en === navTitle ||
          item.attributes.titles.en_jp === navTitle ||
          item.attributes.titles.ja_jp === navTitle
      );

      if (matchingItem) {
        const coverImage = matchingItem.attributes.coverImage
          ? matchingItem.attributes.coverImage.original
          : "";
        sessionStorage.setItem("kitsuCover", coverImage);
        sessionStorage.setItem("itemId", navInfo);
        window.location.href = "/details";
      } else {
        sessionStorage.setItem("kitsuCover", "");
        sessionStorage.setItem("itemId", navInfo);
        window.location.href = "/details";
      }
    } else {
      console.log(kitsuData.data[0].attributes);
      if (kitsuData.data[0].attributes.coverImage != null) {
        sessionStorage.setItem(
          "kitsuCover",
          `${kitsuData.data[0].attributes.coverImage.original}`
        );
        sessionStorage.setItem("itemId", navInfo);
        window.location.href = "/details";
      } else {
        sessionStorage.setItem("kitsuCover", "");
        sessionStorage.setItem("itemId", navInfo);
        window.location.href = "/details";
      }
    }
  };

  const studioInfo = async (studioId, studioName) => {
    try {
      sessionStorage.setItem("studioId", studioId);

      sessionStorage.setItem("studioName", studioName);

      const storeStudioId = sessionStorage.getItem("studioId");
      const storeStudioName = sessionStorage.getItem("studioName");

      if (storeStudioId && storeStudioName) {
        navigate("/studiodetails");
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const authorInfo = async (authorId, authorName) => {
    try {
      sessionStorage.setItem("authorId", authorId);

      sessionStorage.setItem("authorName", authorName);

      const storeAuthorId = sessionStorage.getItem("authorId");
      const storeAuthorName = sessionStorage.getItem("authorName");

      if (storeAuthorId && storeAuthorName) {
        navigate("/authordetails");
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const landingPageRoute = () => {
    navigate("/");
  };

  // Apply 'dark-mode' class conditionally based on the darkMode state
  const listGroupClass = `list-group${isDarkMode ? " dark-mode" : ""}`;
  const blurDetailsClass = `blur-details${isDarkMode ? " dark-mode" : ""}`;

  return (
    <div className="row">
      {Object.keys(details).length > 0 && !loading ? (
        <>
          <div
            className="col-md-12"
            style={{
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={backgroundBlur}>
              <div className="blur-container">
                <div
                  className={`${
                    isDarkMode
                      ? "pseudo-blur-banner-dark"
                      : "pseudo-blur-banner"
                  }`}
                ></div>
              </div>
            </div>
            <div className={blurDetailsClass}>
              <img
                id="thumbnail-img"
                src={details.images.jpg.large_image_url}
                alt="anime cover"
                className="thumbnail"
              />
              <div className="fulldetails-container">
                <div className="details-container">
                  <div className="text-container">
                    {details.title.length < 11 ? (
                      <h1 style={{ fontWeight: "normal" }}>{details.title}</h1>
                    ) : (
                      <h3 style={{ fontWeight: "normal" }}>{details.title}</h3>
                    )}
                    <p>{details.title_english}</p>
                    <p style={{ marginBottom: "1px", width: "auto" }}>
                      <strong>
                        {typeof details.aired !== "undefined"
                          ? details.aired.string
                          : details.published.string}
                      </strong>
                    </p>
                    <p>
                      <strong>
                        {typeof details.episodes !== "undefined"
                          ? details.episodes === null
                            ? "? Episodes"
                            : `${details.episodes} Episodes`
                          : `${
                              details.chapters === null ? "?" : details.chapters
                            } Chapters | ${
                              details.volumes === null ? "?" : details.volumes
                            } Volume(s)`}
                      </strong>
                    </p>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <ListAddButton
                        isDarkMode={isDarkMode}
                        itemType={itemType}
                        itemId={itemId}
                        title={details.title}
                        type={details.type}
                        image={details.images.jpg.image_url}
                        released={
                          details.aired
                            ? details.aired.from
                            : details.published
                            ? details.published.from
                            : "?"
                        }
                        date={dateFormat(new Date(), "isoDateTime")}
                      />
                      {itemType === "manga" && mangaDexMangaID !== null ? (
                        <div style={{ marginLeft: "5%" }}>
                          <Button
                            style={{
                              backgroundColor: `${
                                isDarkMode ? "#0dcaf0" : "#212529"
                              }`,
                              color: "#FFF",
                              textTransform: "none",
                            }}
                            onClick={getMangaChapters}
                          >
                            <Book />
                            &nbsp;Read
                          </Button>
                        </div>
                      ) : loadingChapters ? (
                        <div style={{ marginLeft: "5%" }}>
                          <Button
                            style={{
                              backgroundColor: `${
                                isDarkMode ? "#0dcaf0" : "#212529"
                              }`,
                              color: "#FFF",
                              textTransform: "none",
                            }}
                          >
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="gauge-container">
                    <div className="gauge-wrapper">
                      <AnimatedProgressProvider
                        valueStart={0}
                        valueEnd={details.score}
                        duration={1.4}
                        easingFunction={easeQuadIn}
                      >
                        {(value) => {
                          return (
                            <CircularProgressbar
                              value={value}
                              maxValue={10}
                              text={`${details.score ? details.score : "-"}`}
                              styles={buildStyles({
                                pathTransition: "none",
                                pathColor: getColor(details.score),
                              })}
                            />
                          );
                        }}
                      </AnimatedProgressProvider>
                    </div>

                    <div className="ranked-wrapper">
                      <strong>Ranked #{details.rank || "-"}</strong>
                    </div>
                  </div>
                </div>
                <div className="container-secondary">
                  <div className="thumbnail-synopsis">
                    {details.synopsis || "No synopsis available."}
                  </div>
                </div>
              </div>
            </div>
            <ul className={listGroupClass}>
              <li key={1} className="list-group-item">
                <strong>Japanese Title:</strong> {details.title_japanese || "-"}
              </li>
              <li key={2} className="list-group-item">
                <strong>Synonyms:</strong>{" "}
                {details.title_synonyms.map((x) => x.trim()).join(", ") || "-"}
              </li>
              <li key={3} className="list-group-item">
                <strong>Genres:</strong>{" "}
                {details.genres.map((x) => x.name).join(", ") || "-"}
              </li>
              <li key={4} className="list-group-item">
                <strong>Themes:</strong>{" "}
                {details.themes.map((x) => x.name).join(", ") || "-"}
              </li>
              <li key={5} className="list-group-item">
                <strong>Type:</strong> {details.type || ""}
              </li>
              {typeof details.duration !== "undefined" ? (
                <li key={6} className="list-group-item">
                  <strong>Duration:</strong> {details.duration || "-"}
                </li>
              ) : null}
              {typeof details.rating !== "undefined" ? (
                <li key={7} className="list-group-item">
                  <strong>Rating:</strong> {details.rating || "-"}
                </li>
              ) : null}
              {typeof details.source !== "undefined" ? (
                <li key={8} className="list-group-item">
                  <strong>Source:</strong> {details.source || "-"}
                </li>
              ) : null}

              <li key={9} className="list-group-item">
                <strong>Status:</strong> {details.status || "-"}
              </li>
              {typeof details.producers !== "undefined" ? (
                <li key={10} className="list-group-item">
                  <strong>Producers:</strong>{" "}
                  {details.producers.map((x) => x.name).join(", ") || "-"}
                </li>
              ) : typeof details.authors !== "undefined" ? (
                <li key={10} className="list-group-item">
                  <strong>Authors:</strong>{" "}
                  {details.authors.map((author) => (
                    <React.Fragment key={author.mal_id}>
                      {author > 0 && ", "}{" "}
                      <a
                        href="#/"
                        rel="noopener noreferrer"
                        onClick={() =>
                          authorInfo(`${author.mal_id}`, `${author.name}`)
                        }
                      >
                        {author.name}
                      </a>
                      {authors
                        ? authors.map((person) =>
                            person.authorId === author.mal_id
                              ? ` (${person.position})`
                              : null
                          )
                        : null}
                    </React.Fragment>
                  ))}
                </li>
              ) : null}
              {typeof details.producers !== "undefined" ? (
                <li key={11} className="list-group-item">
                  <strong>Studios:</strong>{" "}
                  {details.studios.map((studio) => (
                    <a
                      key={studio.mal_id}
                      // eslint-disable-next-line
                      href="#/"
                      rel="noopener noreferrer"
                      onClick={() =>
                        studioInfo(`${studio.mal_id}`, `${studio.name}`)
                      }
                    >
                      {studio.name}{" "}
                    </a>
                  ))}
                </li>
              ) : (
                <li key={11} className="list-group-item">
                  <strong>Serializations:</strong>{" "}
                  {details.serializations.map((x) => x.name).join(", ") || "-"}
                </li>
              )}
            </ul>
          </div>
          <div className="row">
            <div style={{ margin: "5px" }} className="well">
              {typeof details.trailer !== "undefined" ? (
                <>
                  <h5>Trailer</h5>
                  <YouTubeEmbed embedUrl={details.trailer.embed_url} />
                  <hr></hr>
                </>
              ) : null}

              {streamingSitesSection ? (
                <>
                  <h5>Streaming Sites</h5>
                  {typeof details.streaming !== "undefined" &&
                  details.streaming.length > 0 ? (
                    <>
                      <ul style={{ listStyle: "none", padding: "0" }}>
                        {details.streaming.map((item, index) => (
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
                      No streaming sites available.
                      <hr />
                    </div>
                  )}
                </>
              ) : null}

              <h5>Related Works</h5>
              {typeof details.relations !== "undefined" &&
              details.relations.length > 0 ? (
                <>
                  <table style={{ borderSpacing: "0px" }}>
                    <tbody>
                      {details.relations.map((item, index) => (
                        <React.Fragment key={index}>
                          <tr>
                            <td nowrap="" valign="top">
                              {item.relation}:&nbsp;
                            </td>
                            <td width={"100%"}>
                              {item.entry.map((entry, entryIndex) => (
                                <div key={entryIndex}>
                                  <a
                                    // eslint-disable-next-line
                                    href="#/"
                                    rel="noopener noreferrer"
                                    onClick={() =>
                                      newDetails(
                                        `/${entry.type}/${entry.mal_id}`,
                                        entry.name,
                                        entry.type
                                      )
                                    }
                                  >
                                    {entry.name}
                                  </a>
                                </div>
                              ))}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="4">
                              <hr />
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div>
                  No related works available.
                  <hr></hr>
                </div>
              )}
              <h5>Recommended*</h5>

              {typeof recommendations !== "undefined" &&
              recommendations.length > 0 ? (
                <div
                  className={`${
                    isDarkMode ? "fadeContainerDark" : "fadeContainer"
                  }`}
                >
                  <div className="recommendations">
                    {recommendations.map((item, index) => (
                      <div className="zoomed">
                        <img
                          key={index}
                          src={item.entry.images.jpg.image_url}
                          alt="loading cover..."
                          loading="lazy"
                          onClick={() =>
                            newDetails(
                              `/${itemType}/${item.entry.mal_id}`,
                              item.entry.title,
                              itemType
                            )
                          }
                        />
                        <div
                          className="overlay"
                          onClick={() =>
                            newDetails(
                              `/${itemType}/${item.entry.mal_id}`,
                              item.entry.title,
                              itemType
                            )
                          }
                        >
                          <span>{item.entry.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>No recommended works available.</div>
              )}

              <hr></hr>
              <div
                style={{
                  marginTop: "-15px",
                  color: "gray",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <small>
                  <i>*Recommended works are based on MAL user votes.</i>
                </small>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <img src={mal} width={"25px"} alt="myanimelist" />
                  &nbsp;&nbsp;
                  <a href={details.url || "-"} target="_blank" rel="noreferrer">
                    View on MyAnimeList{""}
                  </a>
                </div>
              </div>
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

export default Details;
