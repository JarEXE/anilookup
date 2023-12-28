import React from "react";
import DataTable, { createTheme } from "react-data-table-component";
import dateFormat from "dateformat";
import sortArray from "sort-array";
import moment from "moment-timezone";
import LoadingOverlay from "react-loading-overlay-ts";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { Edit, Visibility } from "@mui/icons-material";
import { Check } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  getDoc,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import toast from "react-hot-toast";

const All = ({ isDarkMode, selectedOption, sortBy }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [isActive, setIsActive] = React.useState(false);
  const [activeList, setActiveList] = React.useState(null);
  const [allData, setAllData] = React.useState([]);
  const [currentData, setCurrentData] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);
  const [currentId, setCurrentId] = React.useState(null);
  const [currentTitle, setCurrentTitle] = React.useState("");
  const [currentType, setCurrentType] = React.useState("");
  const [currentImage, setCurrentImage] = React.useState("");
  const [currentRelease, setCurrentRelease] = React.useState(null);
  const [itemRemoved, setItemRemoved] = React.useState(false);
  const [itemUpdated, setItemUpdated] = React.useState(false);
  const open = Boolean(anchorEl);

  // primary useffect for checking user status and setting database status
  React.useEffect(() => {
    setLoading(true);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const animelistitemsRef = collection(
          db,
          "users",
          auth.currentUser.uid,
          "animelistitems"
        );

        try {
          const querySnapshot = await getDocs(animelistitemsRef);
          const dataList = [];

          querySnapshot.forEach((doc) => {
            // doc.data() is an object representing the document
            dataList.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          setAllData(dataList);
          setItemRemoved(false);
          setItemUpdated(false);
        } catch (error) {
          console.error(
            "Error getting documents from animelistitems collection:",
            error
          );
          return [];
        }
      } else {
        navigate("/login");
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [navigate, itemRemoved, itemUpdated]);

  React.useEffect(() => {
    // Update screenWidth state when the window is resized
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Remove event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  React.useEffect(() => {
    setLoading(true);
    setCurrentData(allData);
    let newData = [];
    allData.map((item) => {
      if (selectedOption === "all") {
        newData.push(item);
      } else if (
        item.currentList === "watching" &&
        selectedOption === "watching"
      ) {
        newData.push(item);
      } else if (item.currentList === "onhold" && selectedOption === "onhold") {
        newData.push(item);
      } else if (
        item.currentList === "planned" &&
        selectedOption === "planned"
      ) {
        newData.push(item);
      } else if (
        item.currentList === "dropped" &&
        selectedOption === "dropped"
      ) {
        newData.push(item);
      } else if (
        item.currentList === "completed" &&
        selectedOption === "completed"
      ) {
        newData.push(item);
      } else {
        setCurrentData(allData);
      }
      return newData;
    });

    if (sortBy === "default") {
      setCurrentData(
        sortArray(newData, {
          by: "date",
          order: "desc",
        })
      );
    } else if (sortBy === "name") {
      setCurrentData(
        sortArray(newData, {
          by: "title",
          order: "asc",
        })
      );
    } else if (sortBy === "released") {
      setCurrentData(
        sortArray(newData, {
          by: "released",
          order: "desc",
        })
      );
    }

    setLoading(false);
  }, [selectedOption, allData, sortBy]);

  const handleClick = (
    event,
    currentList,
    itemId,
    title,
    type,
    image,
    released
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveList(currentList);
    setCurrentId(itemId);
    setCurrentTitle(title);
    setCurrentType(type);
    setCurrentImage(image);
    setCurrentRelease(released);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleListAdd = async (event) => {
    if (auth.currentUser !== null) {
      const itemDocRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "animelistitems",
        currentId
      );

      const animelistitemsRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "animelistitems"
      );

      const newData = {
        currentList: event.target.id,
        itemId: `/anime/${currentId}`,
        title: currentTitle,
        type: currentType,
        image: currentImage,
        released: currentRelease,
        date: dateFormat(new Date(), "isoDateTime"),
      };

      try {
        const docSnapshot = await getDoc(itemDocRef);

        if (docSnapshot.exists()) {
          await updateDoc(itemDocRef, newData);
          setActiveList(event.target.id);
          setItemUpdated(true);
          toast.success(`List updated`, {
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
              color: `${isDarkMode ? "#333" : "#fff"}`,
            },
          });
        } else {
          await setDoc(itemDocRef, newData);
          setActiveList(event.target.id);
          setItemUpdated(true);
          toast.success(`List updated`, {
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
              color: `${isDarkMode ? "#333" : "#fff"}`,
            },
          });
        }
        // update sessionstorage
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
          sessionStorage.setItem("animelistitems", JSON.stringify(dataList));
        } catch (error) {
          console.error(
            "Error getting documents from animelistitems collection:",
            error
          );
          return [];
        }
      } catch (error) {
        console.error("Error updating document: ", error);
        toast.error(`Something went wrong!`, {
          style: {
            borderRadius: "10px",
            background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
            color: `${isDarkMode ? "#333" : "#fff"}`,
          },
        });
      }
    } else {
      navigate("/login");
    }

    setAnchorEl(null);
  };

  const handleListRemove = async () => {
    const itemDocRef = doc(
      db,
      "users",
      auth.currentUser.uid,
      "animelistitems",
      currentId
    );

    const animelistitemsRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "animelistitems"
    );

    try {
      await deleteDoc(itemDocRef);
      setActiveList(null);
      setItemRemoved(true);
      toast.success(`Removed from lists.`, {
        style: {
          borderRadius: "10px",
          background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
          color: `${isDarkMode ? "#333" : "#fff"}`,
        },
      });

      // update sessionstorage
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
        sessionStorage.setItem("animelistitems", JSON.stringify(dataList));
      } catch (error) {
        console.error(
          "Error getting documents from animelistitems collection:",
          error
        );
        return [];
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
      setItemRemoved(false);
      toast.error(`Something went wrong!`, {
        style: {
          borderRadius: "10px",
          background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
          color: `${isDarkMode ? "#333" : "#fff"}`,
        },
      });
    }

    setAnchorEl(null);
  };

  // createTheme creates a new theme named solarized that overrides the build in dark theme
  createTheme("dark", {
    background: {
      default: "#282828",
    },
  });

  const paginationComponentOptions = {
    selectAllRowsItem: true,
    selectALlRowsItemText: "All",
  };

  const columns = [
    {
      name: "id",
      selector: (row) => row.id,
      sortable: true,
      omit: true,
    },
    {
      name: "Options",
      selector: (row) => row.options,
      cell: (row) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            id={`spinner${row.id}`}
            className="spinner-border"
            style={{ marginLeft: "5%", display: "none" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <Button
            className="mb-2"
            id="basic-button"
            row={row}
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={(event) =>
              handleClick(
                event,
                row.currentList,
                row.id,
                row.title,
                row.type,
                row.image,
                row.released
              )
            }
            style={{
              backgroundColor: `${isDarkMode ? "#0dcaf0" : "#212529"}`,
              color: `${isDarkMode ? "black" : "white"}`,
              textTransform: "none",
              height: "30px",
              fontSize: `${screenWidth > 500 ? "16px" : "12px"}`,
            }}
          >
            <Edit /> &nbsp;Edit
          </Button>
          <Menu
            id="basic-menu"
            row={row}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem
              id="watching"
              onClick={handleListAdd}
              style={{
                backgroundColor: `${
                  activeList === "watching" ? "rgba(0, 0, 0, 0.04)" : "#FFF"
                }`,
              }}
            >
              {activeList === "watching" ? (
                <>
                  Watching &nbsp;
                  <Check />
                </>
              ) : (
                <>Watching</>
              )}
            </MenuItem>
            <MenuItem
              id="onhold"
              onClick={handleListAdd}
              style={{
                backgroundColor: `${
                  activeList === "onhold" ? "rgba(0, 0, 0, 0.04)" : "#FFF"
                }`,
              }}
            >
              {activeList === "onhold" ? (
                <>
                  On-Hold &nbsp;
                  <Check />
                </>
              ) : (
                <>On-Hold</>
              )}
            </MenuItem>
            <MenuItem
              id="planned"
              onClick={handleListAdd}
              style={{
                backgroundColor: `${
                  activeList === "planned" ? "rgba(0, 0, 0, 0.04)" : "#FFF"
                }`,
              }}
            >
              {activeList === "planned" ? (
                <>
                  Plan to Watch &nbsp;
                  <Check />
                </>
              ) : (
                <>Plan to Watch</>
              )}
            </MenuItem>
            <MenuItem
              id="dropped"
              onClick={handleListAdd}
              style={{
                backgroundColor: `${
                  activeList === "dropped" ? "rgba(0, 0, 0, 0.04)" : "#FFF"
                }`,
              }}
            >
              {activeList === "dropped" ? (
                <>
                  Dropped &nbsp;
                  <Check />
                </>
              ) : (
                <>Dropped</>
              )}
            </MenuItem>
            <MenuItem
              id="completed"
              onClick={handleListAdd}
              style={{
                backgroundColor: `${
                  activeList === "completed" ? "rgba(0, 0, 0, 0.04)" : "#FFF"
                }`,
              }}
            >
              {activeList === "completed" ? (
                <>
                  Completed &nbsp;
                  <Check />
                </>
              ) : (
                <>Completed</>
              )}
            </MenuItem>

            <MenuItem
              id="remove"
              onClick={() => handleListRemove()}
              style={{ color: "#dc3848" }}
            >
              Remove
            </MenuItem>
          </Menu>

          <Button
            id={`detailsButton`}
            onClick={() => showDetails(row.itemId, row.title)}
            style={{
              backgroundColor: `${isDarkMode ? "#0dcaf0" : "#212529"}`,
              color: `${isDarkMode ? "black" : "white"}`,
              textTransform: "none",
              height: "30px",
              fontSize: `${screenWidth > 500 ? "16px" : "12px"}`,
            }}
          >
            {" "}
            <Visibility />
            &nbsp;View
          </Button>
        </div>
      ),
      width: "125px",
      center: true,
    },
    {
      name: "List Item",
      selector: (row) => row.title,
      cell: (row) => (
        <div
          style={{
            marginTop: "3%",
            marginBottom: "3%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            fontSize: "16px",
          }}
        >
          <img src={row.image} alt="anime cover" width={75} height={110} />
          {screenWidth > 500 ? (
            <p style={{ flex: "1", paddingLeft: "30px" }}>{row.title}</p>
          ) : null}
        </div>
      ),
      wrap: true,
    },
  ];

  const ExpandedComponent = ({ data }) => {
    const inputDate = data.released;
    const formattedDate = moment.tz(inputDate, "UTC").format("MMMM Do, YYYY");

    return (
      <div style={{ marginTop: "2%", marginLeft: "2%" }}>
        <p>
          <strong>Title</strong>: {data.title !== null ? data.title : "?"}
        </p>
        <p>
          <strong>Type</strong>: {data.type !== null ? data.type : "?"}
        </p>
        <p>
          <strong>Date Added</strong>:{" "}
          {data.date !== null ? dateFormat(data.date, "mmmm dS, yyyy") : "?"}
        </p>
        <p>
          <strong>Released Date</strong>:{" "}
          {formattedDate !== null || typeof formattedDate !== "undefined"
            ? formattedDate
            : "?"}
        </p>
      </div>
    );
  };

  const LinearIndeterminate = () => {
    return (
      <Box sx={{ width: "100%", marginTop: "5%" }}>
        <LinearProgress />
      </Box>
    );
  };

  const showDetails = async (animeId, animeTitle) => {
    setIsActive(true);
    let kitsuData;

    await fetch(
      `https://kitsu.io/api/edge/anime?filter[text]=${animeTitle}&page[limit]=5`
    ).then(async (response) => {
      kitsuData = await response.json();
    });

    const matchingItem = kitsuData.data.find(
      (item) =>
        item.attributes.canonicalTitle === animeTitle ||
        item.attributes.abbreviatedTitles.includes(animeTitle) ||
        item.attributes.titles.en === animeTitle ||
        item.attributes.titles.en_jp === animeTitle ||
        item.attributes.titles.ja_jp === animeTitle
    );

    if (matchingItem) {
      const coverImage = matchingItem.attributes.coverImage
        ? matchingItem.attributes.coverImage.original
        : "";
      sessionStorage.setItem("kitsuCover", coverImage);
      sessionStorage.setItem("itemId", animeId);
      setIsActive(false);
      navigate("/details");
    } else {
      sessionStorage.setItem("kitsuCover", "");
      sessionStorage.setItem("itemId", animeId);
      setIsActive(false);
      navigate("/details");
    }
  };

  return (
    <>
      {isActive ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: "999",
          }}
        >
          <LoadingOverlay
            active={isActive}
            spinner={<span className="overlay_loader"></span>}
          ></LoadingOverlay>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={currentData}
        expandableRows
        expandableRowsComponent={ExpandedComponent}
        direction="ltr"
        fixedHeaderScrollHeight="300px"
        highlightOnHover
        pagination
        paginationComponentOptions={paginationComponentOptions}
        progressPending={loading}
        progressComponent={<LinearIndeterminate />}
        responsive
        subHeaderAlign="right"
        subHeaderWrap
        theme={isDarkMode ? "dark" : "light"}
      />
    </>
  );
};

export default All;
