import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import AnimatedProgressProvider from "./AnimatedProgressProvider";
import { easeQuadIn } from "d3-ease";
import ScrollContainer from "react-indiana-drag-scroll";
import "react-circular-progressbar/dist/styles.css";
import mal from "../images/mal.png";
import "../../src/style.css";
import YouTubeEmbed from "./YoutubeEmbed";

function Details({ isDarkMode }) {
  const [itemId, setItemId] = React.useState(sessionStorage.getItem("itemId"));
  const [details, setDetails] = React.useState({});
  const [relations, setRelations] = React.useState({});
  const [recommendations, setRecommendations] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  let isMounted = true;

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch both details and relations data concurrently
        const [detailsResponse, relationsResponse, recommendationsResponse] =
          await Promise.all([
            fetch(`https://api.jikan.moe/v4${itemId}`),
            fetch(`https://api.jikan.moe/v4${itemId}/relations`),
            fetch(`https://api.jikan.moe/v4${itemId}/recommendations`),
          ]);

        // component unmounted, don't set the state
        if (!isMounted) {
          return;
        }

        const [detailsData, relationsData, recommendationsData] =
          await Promise.all([
            detailsResponse.json(),
            relationsResponse.json(),
            recommendationsResponse.json(),
          ]);

        setDetails(detailsData.data);
        setRelations(relationsData.data);
        setRecommendations(recommendationsData.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }

    fetchData();

    // cleanup function to update the mounted flag
    return () => {
      // eslint-disable-next-line
      isMounted = false;
    };
  }, [itemId]);

  const getColor = (score) => {
    if (score >= 7.5) {
      return "#00D100"; // Green for high scores
    } else if (score >= 5.0) {
      return "#FFA500"; // Yellow for moderate scores
    } else {
      return "#FF0000"; // Red for low scores
    }
  };

  const newDetails = (navInfo) => {
    sessionStorage.setItem("itemId", navInfo);
    setItemId(sessionStorage.getItem("itemId"));
  };

  // Apply 'dark-mode' class conditionally based on the darkMode state
  const listGroupClass = `list-group${isDarkMode ? " dark-mode" : ""}`;

  let itemType;

  if (
    details.type === "TV" ||
    details.type === "Special" ||
    details.type === "ONA" ||
    details.type === "OVA" ||
    details.type === "Movie"
  ) {
    itemType = "anime";
  } else {
    itemType = "manga";
  }

  return (
    <div className="row">
      {/* check if details object contains data first otherwise there will be a race condition resulting in errors out the ass. That is to say, this will only run if details has been set fully */}
      {Object.keys(details).length > 0 && !loading ? (
        <>
          <div className="col-md-12" style={{ marginBottom: "20px" }}>
            <img
              src={details.images.jpg.large_image_url}
              alt="anime cover"
              className="thumbnail"
            />
            <div className="col-md-12" style={{ marginBottom: "15px" }}>
              <div className="details-container">
                <div className="text-container">
                  <h2>{details.title}</h2>
                  <p style={{ color: "#999", marginBottom: "1px" }}>
                    {details.title_english}
                  </p>
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
                        ? `${details.episodes} Episodes`
                        : `${
                            details.chapters === null ? "?" : details.chapters
                          } Chapters (${
                            details.volumes === null ? "?" : details.volumes
                          } Volumes)`}
                    </strong>
                  </p>
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

              <ul className={listGroupClass}>
                <li className="list-group-item">
                  <strong>Japanese Title:</strong>{" "}
                  {details.title_japanese || "-"}
                </li>
                <li className="list-group-item">
                  <strong>Synonyms:</strong>{" "}
                  {details.title_synonyms.map((x) => x.trim()).join(", ") ||
                    "-"}
                </li>
                <li className="list-group-item">
                  <strong>Genres:</strong>{" "}
                  {details.genres.map((x) => x.name).join(", ") || "-"}
                </li>
                <li className="list-group-item">
                  <strong>Themes:</strong>{" "}
                  {details.themes.map((x) => x.name).join(", ") || "-"}
                </li>
                <li className="list-group-item">
                  <strong>Type:</strong> {details.type || ""}
                </li>
                {typeof details.duration !== "undefined" ? (
                  <li className="list-group-item">
                    <strong>Duration:</strong> {details.duration || "-"}
                  </li>
                ) : null}
                {typeof details.rating !== "undefined" ? (
                  <li className="list-group-item">
                    <strong>Rating:</strong> {details.rating || "-"}
                  </li>
                ) : null}
                {typeof details.source !== "undefined" ? (
                  <li className="list-group-item">
                    <strong>Source:</strong> {details.source || "-"}
                  </li>
                ) : null}

                <li className="list-group-item">
                  <strong>Status:</strong> {details.status || "-"}
                </li>
                {typeof details.producers !== "undefined" ? (
                  <li className="list-group-item">
                    <strong>Producers:</strong>{" "}
                    {details.producers.map((x) => x.name).join(", ") || "-"}
                  </li>
                ) : (
                  <li className="list-group-item">
                    <strong>Authors:</strong>{" "}
                    {details.authors.map((x) => x.name).join(", ") || "-"}
                  </li>
                )}
                {typeof details.producers !== "undefined" ? (
                  <li className="list-group-item">
                    <strong>Studios:</strong>{" "}
                    {details.studios.map((x) => x.name).join(", ") || "-"}
                  </li>
                ) : (
                  <li className="list-group-item">
                    <strong>Serializations:</strong>{" "}
                    {details.serializations.map((x) => x.name).join(", ") ||
                      "-"}
                  </li>
                )}

                <li className="list-group-item">
                  <strong>MAL:</strong>{" "}
                  <a href={details.url || "-"} target="_blank" rel="noreferrer">
                    View on MyAnimeList{""}
                  </a>
                  &nbsp;&nbsp;
                  <img src={mal} width={"25px"} alt="myanimelist" />
                </li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div style={{ margin: "5px" }} className="well">
              <h3>Synopsis</h3>
              {details.synopsis || "No synopsis available."}
              <br></br>
              <br></br>
              <h5>Background</h5>
              {details.background || "No background information available."}
              <hr></hr>
              {typeof details.trailer !== "undefined" ? (
                <>
                  <h5>Trailer</h5>
                  <YouTubeEmbed embedUrl={details.trailer.embed_url} />
                  <hr></hr>
                </>
              ) : null}

              <h5>Related Works</h5>
              {typeof relations !== "undefined" && relations.length > 0 ? (
                <>
                  <table style={{ borderSpacing: "0px" }}>
                    <tbody>
                      {relations.map((item, index) => (
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
                                        `/${entry.type}/${entry.mal_id}`
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
                  Nothing to show
                  <hr></hr>
                </div>
              )}
              <h5>Recommendations*</h5>

              {typeof recommendations !== "undefined" &&
              recommendations.length > 0 ? (
                <div
                  className={`${
                    isDarkMode ? "fadeContainerDark" : "fadeContainer"
                  }`}
                >
                  <ScrollContainer className="recommendations">
                    {recommendations.map((item, index) => (
                      <div className="zoomed">
                        <img
                          key={index}
                          src={item.entry.images.jpg.image_url}
                          alt="loading cover..."
                          onClick={() =>
                            newDetails(`/${itemType}/${item.entry.mal_id}`)
                          }
                        />
                        <div
                          className="overlay"
                          onClick={() =>
                            newDetails(`/${itemType}/${item.entry.mal_id}`)
                          }
                        >
                          <span>{item.entry.title}</span>
                        </div>
                      </div>
                    ))}
                  </ScrollContainer>
                </div>
              ) : (
                <div>No recommendations available.</div>
              )}

              <hr></hr>
              <div style={{ marginTop: "-15px", color: "gray" }}>
                <small>
                  <i>*Recommendations are based on MAL user votes.</i>
                </small>
              </div>
              <a
                id="returnBtn"
                href="/"
                className={`${
                  isDarkMode ? "btn btn-info mt-4" : "btn btn-dark mt-4"
                }`}
                style={{ borderRadius: "25px" }}
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
