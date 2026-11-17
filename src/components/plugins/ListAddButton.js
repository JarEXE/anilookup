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
import { useLocation, useNavigate } from "react-router-dom";
import { goToLogin } from "../../utils/authRedirect";
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
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [itemData, setItemData] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [activeList, setActiveList] = React.useState(null);
  const open = Boolean(anchorEl);

  // primary useffect for checking user status and setting database status
  React.useEffect(() => {
    // ignore a lookup that finishes after the item/type has changed
    let cancelled = false;

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

        if (cancelled) return;

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
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [itemId, itemType]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleListAdd = (event) => addToList(event.currentTarget.id);

  // `listKey` is the menu item's id: watching, completed, onhold, ...
  const addToList = async (listKey) => {
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
        currentList: listKey,
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
          setActiveList(listKey);
          toast.success(`Added to list`, {
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
              color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
            },
          });
        } else {
          await setDoc(itemDocRef, newData);
          setItemData(true);
          setActiveList(listKey);
          toast.success(`Added to list`, {
            style: {
              borderRadius: "10px",
              background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
              color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
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
            itemType === "anime" ? "animeListItems" : "mangaListItems",
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
            background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
            color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
          },
        });
      }
    } else {
      // signed out: sign in first, then come straight back here and finish
      // adding it to the list they picked
      setAnchorEl(null);
      goToLogin(navigate, location, {
        intent: { action: "add-to-list", itemType, itemId, list: listKey },
      });
      return;
    }

    setAnchorEl(null);
  };

  // Back from signing in with an add-to-list waiting for this title: finish
  // it once, then drop it from the history entry so a reload or Back/Forward
  // doesn't add it again.
  const pendingIntent = location.state && location.state.intent;
  const resumedIntent = React.useRef(false);
  React.useEffect(() => {
    if (
      resumedIntent.current ||
      !pendingIntent ||
      pendingIntent.action !== "add-to-list" ||
      pendingIntent.itemType !== itemType ||
      pendingIntent.itemId !== itemId
    ) {
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || resumedIntent.current) return;
      resumedIntent.current = true;
      navigate(`${location.pathname}${location.search}${location.hash}`, {
        replace: true,
        state: null,
      });
      addToList(pendingIntent.list);
    });
    return () => unsubscribe();
    // addToList reads the latest props; this only reacts to a new intent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingIntent, itemType, itemId]);

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
          background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
          color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
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
          itemType === "anime" ? "animeListItems" : "mangaListItems",
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
          background: `${isDarkMode ? "var(--d-surface-2)" : "#333"}`,
          color: `${isDarkMode ? "var(--d-ink)" : "#fff"}`,
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
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        style={{
          backgroundColor: `${isDarkMode ? "var(--d-accent)" : "#212529"}`,
          color: `${isDarkMode ? "var(--d-accent-ink)" : "#fff"}`,
          textTransform: "none",
          // same pill shape as the other actions on the details page
          minHeight: "36px",
          padding: "0 16px",
          borderRadius: "18px",
          fontSize: "0.9rem",
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
                activeList === "watching" ? "rgba(127, 127, 127, 0.18)" : "transparent"
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
                activeList === "reading" ? "rgba(127, 127, 127, 0.18)" : "transparent"
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
              activeList === "onhold" ? "rgba(127, 127, 127, 0.18)" : "transparent"
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
              activeList === "planned" ? "rgba(127, 127, 127, 0.18)" : "transparent"
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
              activeList === "dropped" ? "rgba(127, 127, 127, 0.18)" : "transparent"
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
              activeList === "completed" ? "rgba(127, 127, 127, 0.18)" : "transparent"
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
