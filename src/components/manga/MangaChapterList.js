import React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import dateFormat from "dateformat";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { API_URL, apiFetch } from "../../config/api";
import { goBackOrHome } from "../../utils/navigation";
import { isNsfw } from "../../utils/nsfw";
import useApiResource from "../details/useApiResource";
import NsfwRedirect from "../plugins/NsfwRedirect";

const baseUrl = "https://api.mangadex.org";

const chapterListCacheKey = (malId) => `mangachapters:${malId}`;

async function fetchChapterList(malId, known = {}) {
  let { mangaDexId, title, image } = known;

  if (!title || !image) {
    const detailsResponse = await apiFetch(`${API_URL}/manga/${malId}`);
    if (!detailsResponse.ok) {
      throw new Error("Failed to fetch manga details");
    }
    const detailsData = await detailsResponse.json();
    title = detailsData.data.title;
    image = detailsData.data.images.jpg.large_image_url;
  }

  if (!mangaDexId) {
    const idResponse = await fetch("/.netlify/functions/manga-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: baseUrl,
        title: title,
      }),
    });
    if (!idResponse.ok) {
      throw new Error("Failed to fetch Manga ID");
    }
    mangaDexId = await idResponse.json();
  }

  const response = await fetch("/.netlify/functions/mangachapters-proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: baseUrl,
      mangaID: mangaDexId,
      mangaImage: image,
      mangaTitle: title,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Manga Chapters");
  }

  return response.json();
}

const MangaChapterList = (props) => {
  const { id, chapterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [mangaChapterList, setMangaChapterList] = React.useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(chapterListCacheKey(id)));
    } catch (error) {
      return null;
    }
  });
  // images are stored together with the chapter they belong to, so a stale
  // chapter is never shown while the URL points at a different one
  const [loadedChapter, setLoadedChapter] = React.useState({
    id: null,
    images: [],
  });
  const [loading, setLoading] = React.useState(false);
  const chapterImages =
    chapterId && loadedChapter.id === chapterId ? loadedChapter.images : [];

  // chapter list
  React.useEffect(() => {
    if (mangaChapterList !== null) {
      return;
    }

    let cancelled = false;

    fetchChapterList(id, location.state || {})
      .then((data) => {
        if (cancelled) return;
        sessionStorage.setItem(chapterListCacheKey(id), JSON.stringify(data));
        setMangaChapterList(data);
      })
      .catch((error) => {
        if (cancelled) return;
        console.log("Invalid URL:", error);
        alert("Failed to fetch manga chapters!");
        goBackOrHome(navigate, location);
      });

    return () => {
      cancelled = true;
    };
    // only refetch when the manga changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // chapter pages - driven by the :chapterId part of the URL
  React.useEffect(() => {
    if (!chapterId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const downloadMangaDexChapter = async (chapterID) => {
      setLoading(true);

      try {
        const response = await fetch(
          "/.netlify/functions/chapterimages-proxy",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: baseUrl,
              chapterID: chapterID,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chapter images");
        }

        const data = await response.json();

        console.log(`Client side data response: ${data}`);

        if (cancelled) return;
        setLoadedChapter({ id: chapterID, images: data });
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        console.log("Invalid URL:", error);
        alert("Error: Cannot show this chapter.");
        setLoading(false);
        // back to the chapter list (replace, so this broken chapter URL
        // isn't left in the history)
        navigate(`/manga/${id}/read`, { replace: true });
      }
    };

    downloadMangaDexChapter(chapterId);

    return () => {
      cancelled = true;
    };
  }, [id, chapterId, navigate]);

  const openChapter = (chapterID) => {
    navigate(`/manga/${id}/read/${chapterID}`);
  };

  const emptyChapterImages = () => {
    navigate(`/manga/${id}/read`);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {chapterImages.length > 0 && !loading ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {chapterImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt="manga chapter"
              style={{ maxWidth: "900px", marginBottom: "2%" }}
            />
          ))}
          <button
            className={`${
              props.isDarkMode ? "chapters-button-dark" : "chapters-button"
            }`}
            onClick={emptyChapterImages}
          >
            <FontAwesomeIcon icon={faUndo} /> Chapters
          </button>
        </div>
      ) : loading ||
        (chapterId && chapterImages.length === 0) ||
        mangaChapterList === null ? (
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
      ) : (
        <nav aria-label="secondary mailbox folders">
          <Divider
            style={{
              border: `1px solid ${props.isDarkMode ? "var(--d-line)" : "black"}`,
              marginBottom: "-7px",
            }}
          />
          <List>
            {mangaChapterList.chapters.map((chapter) => (
              <React.Fragment key={chapter.id}>
                <ListItem id={chapter.id} disablePadding>
                  <ListItemButton
                    id={chapter.id}
                    onClick={() => openChapter(chapter.id)}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <ListItemText
                        style={{ marginBottom: "-2px" }}
                        primary={
                          chapter.title
                            ? `#${chapter.chapter} - ${chapter.title}`
                            : `#${chapter.chapter}`
                        }
                      />
                      <small
                        style={{
                          color: props.isDarkMode ? "var(--d-muted)" : "dimgray",
                        }}
                      >
                        {chapter.scanlationGroup}
                      </small>
                      <small>
                        {dateFormat(chapter.published, "mm/dd/yyyy")}
                      </small>
                    </div>
                  </ListItemButton>
                </ListItem>
                <Divider
                  style={{
                    border: `1px solid ${props.isDarkMode ? "var(--d-line)" : "black"}`,
                  }}
                />
              </React.Fragment>
            ))}
          </List>
        </nav>
      )}
    </Box>
  );
};

// While NSFW content is off, the reader checks the manga first (the reader
// can be opened straight from the address bar, without visiting its page).
const MangaChapterListRoute = (props) => {
  const { id } = useParams();
  const check = useApiResource(`/manga/${id}`, !props.allowNSFW);

  if (!props.allowNSFW) {
    if (check.status === "ready" && isNsfw(check.data, "manga")) {
      return <NsfwRedirect type="manga" isDarkMode={props.isDarkMode} />;
    }
    if (check.status !== "ready" && check.status !== "error") {
      return (
        <div className="loadContainer" role="status" aria-busy="true">
          <span className="loader" />
          <span className="visually-hidden">Loading…</span>
        </div>
      );
    }
  }
  return <MangaChapterList key={id} {...props} />;
};

export default MangaChapterListRoute;
