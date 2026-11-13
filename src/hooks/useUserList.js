import React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

const COLLECTIONS = { anime: "animelistitems", manga: "mangalistitems" };
const CACHE_KEYS = { anime: "animeListItems", manga: "mangaListItems" };

function readCache(type) {
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEYS[type]));
  } catch (error) {
    return null;
  }
}

// Loads the signed-in user's anime or manga list from Firestore.
//
// The cached copy (sessionStorage) is shown immediately while the fresh copy
// loads, so returning to the landing page doesn't flash empty stats.
//
// Returns { items, status, reload }:
//   items  - array of list entries, or null when nothing is known yet
//   status - "idle" (signed out) | "loading" | "ready" | "error"
export default function useUserList(type, user) {
  const [items, setItems] = React.useState(() => readCache(type));
  const [status, setStatus] = React.useState(user ? "loading" : "idle");
  // bumped by reload() to re-run the fetch
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        if (!cancelled) setStatus("idle");
        return;
      }

      setStatus("loading");

      try {
        const querySnapshot = await getDocs(
          collection(db, "users", authUser.uid, COLLECTIONS[type]),
        );
        if (cancelled) return;

        const dataList = [];
        querySnapshot.forEach((doc) => {
          dataList.push({ id: doc.id, ...doc.data() });
        });

        try {
          sessionStorage.setItem(CACHE_KEYS[type], JSON.stringify(dataList));
        } catch (error) {
          // storage full/blocked - the in-memory copy is enough
        }

        setItems(dataList);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        console.error(`Error loading the ${type} list:`, error);
        setStatus("error");
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [type, user, reloadKey]);

  const reload = React.useCallback(() => setReloadKey((key) => key + 1), []);

  return { items, status, reload };
}
