import React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import dateFormat from "dateformat";
import LazyLoad from "react-lazyload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo } from "@fortawesome/free-solid-svg-icons";

const MangaChapterList = (props) => {
  const mangaChapterList = JSON.parse(sessionStorage.getItem("mangachapters"));
  const [chapterImages, setChapterImages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const downloadMangaDexChapter = async (chapterID) => {
    setLoading(true);
    const baseUrl = "https://api.mangadex.org";

    try {
      const response = await fetch("/.netlify/functions/chapterimages-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: baseUrl,
          chapterID: chapterID,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chapter images");
      }

      const data = await response.json();

      setChapterImages(data);
      setLoading(false);
    } catch (error) {
      console.log("Invalid URL:", error);
      alert("Error: Cannot show this chapter.");
      return null;
    }
  };

  const emptyChapterImages = () => {
    setChapterImages([]);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {chapterImages.length > 0 && !loading ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {chapterImages.map((image) => (
            <img
              src={`/chapter-images-proxy?url=${encodeURIComponent(image)}`}
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
      ) : loading ? (
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
              border: `1px solid ${props.isDarkMode ? "white" : "black"}`,
              marginBottom: "-7px",
            }}
          />
          <List>
            {mangaChapterList.chapters.map((chapter) => (
              <>
                <ListItem key={chapter.id} id={chapter.id} disablePadding>
                  <ListItemButton
                    key={chapter.id}
                    id={chapter.id}
                    onClick={() => downloadMangaDexChapter(chapter.id)}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <ListItemText
                        style={{ marginBottom: "-2px" }}
                        primary={`#${chapter.chapter} - ${chapter.title}`}
                      />
                      <small style={{ color: "dimgray" }}>
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
                    border: `1px solid ${props.isDarkMode ? "white" : "black"}`,
                  }}
                />
              </>
            ))}
          </List>
        </nav>
      )}
    </Box>
  );
};

export default MangaChapterList;
