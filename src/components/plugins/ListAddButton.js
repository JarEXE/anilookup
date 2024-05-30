import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Add } from "@mui/icons-material";
import { Edit } from "@mui/icons-material";
import { Check } from "@mui/icons-material";
import {
  doc,
  collection,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ListAddButton = ({
  isDarkMode,
  itemType,
  itemId,
  title,
  type,
  image,
  released,
  date,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [itemData, setItemData] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [activeList, setActiveList] = React.useState(null);
  const open = Boolean(anchorEl);

  // primary useffect for checking user status and setting database status
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const itemDocRef = doc(
          db,
          "users",
          auth.currentUser.uid,
          `${itemType === "anime" ? "animelistitems" : "mangalistitems"}`,
          itemId.substring(7)
        );

        const docSnapshot = await getDoc(itemDocRef);

        if (docSnapshot.exists()) {
          setItemData(true);
          const data = docSnapshot.data();
          setActiveList(data.currentList);
        } else {
          console.error("User not authenticated or missing UID.");
        }
      }
    });

    setLoading(false);

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [itemId, itemType]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
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
        `${itemType === "anime" ? "animelistitems" : "mangalistitems"}`,
        itemId.substring(7)
      );

      const listitemsRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        `${itemType === "anime" ? "animelistitems" : "mangalistitems"}`
      );

      const newData = {
        currentList: event.target.id,
        itemId: itemId,
        title: title,
        type: type,
        image: image,
        released: released,
        date: date,
      };

      try {
        const docSnapshot = await getDoc(itemDocRef);

        if (docSnapshot.exists()) {
          await updateDoc(itemDocRef, newData);
          setItemData(true);
          setActiveList(event.target.id);
          toast.success(`Added to list`, {
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
              color: `${isDarkMode ? "#333" : "#fff"}`,
            },
          });
        } else {
          await setDoc(itemDocRef, newData);
          setItemData(true);
          setActiveList(event.target.id);
          toast.success(`Added to list`, {
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
              color: `${isDarkMode ? "#333" : "#fff"}`,
            },
          });
        }

        // update sessionstorage
        try {
          const querySnapshot = await getDocs(listitemsRef);
          let dataList = [];

          querySnapshot.forEach((doc) => {
            // doc.data() is an object representing the document
            dataList.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          sessionStorage.setItem(
            `${itemType === "anime" ? "animelistitems" : "mangalistitems"}`,
            JSON.stringify(dataList)
          );
        } catch (error) {
          console.error(
            "Error getting documents from listitems collection:",
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
      `${itemType === "anime" ? "animelistitems" : "mangalistitems"}`,
      itemId.substring(7)
    );

    const listitemsRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      `${itemType === "anime" ? "animelistitems" : "mangalistitems"}`
    );

    try {
      await deleteDoc(itemDocRef);
      setItemData(false);
      setActiveList(null);
      toast.success(`Removed from lists.`, {
        style: {
          borderRadius: "10px",
          background: `${isDarkMode ? "#0dcaf0" : "#333"}`,
          color: `${isDarkMode ? "#333" : "#fff"}`,
        },
      });

      // update sessionstorage
      try {
        const querySnapshot = await getDocs(listitemsRef);
        let dataList = [];

        querySnapshot.forEach((doc) => {
          dataList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        sessionStorage.setItem(
          `${itemType === "anime" ? "animelistitems" : "mangalistitems"}`,
          JSON.stringify(dataList)
        );
      } catch (error) {
        console.error(
          "Error getting documents from listitems collection:",
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

    setAnchorEl(null);
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <div>
      <Button
        className="mb-4"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        style={{
          backgroundColor: `${isDarkMode ? "#0dcaf0" : "#212529"}`,
          color: `${isDarkMode ? "black" : "#fff"}`,
          textTransform: "none",
        }}
      >
        {itemData ? (
          <>
            <Edit /> &nbsp;Edit List
          </>
        ) : (
          <>
            <Add /> &nbsp;Add to List
          </>
        )}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {itemType === "anime" ? (
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
        ) : (
          <MenuItem
            id="reading"
            onClick={handleListAdd}
            style={{
              backgroundColor: `${
                activeList === "reading" ? "rgba(0, 0, 0, 0.04)" : "#FFF"
              }`,
            }}
          >
            {activeList === "reading" ? (
              <>
                Reading &nbsp;
                <Check />
              </>
            ) : (
              <>Reading</>
            )}
          </MenuItem>
        )}

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
              Plan to {`${itemType === "anime" ? "Watch" : "Read"}`} &nbsp;
              <Check />
            </>
          ) : (
            <>Plan to {`${itemType === "anime" ? "Watch" : "Read"}`}</>
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
        {itemData ? (
          <>
            <MenuItem
              id="remove"
              onClick={handleListRemove}
              style={{ color: "#dc3848" }}
            >
              Remove
            </MenuItem>
          </>
        ) : null}
      </Menu>
    </div>
  );
};

export default ListAddButton;
