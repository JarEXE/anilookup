import { deleteDoc, deleteField, doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const COLLECTIONS = { anime: "animelistitems", manga: "mangalistitems" };
// same keys useUserList reads, so the landing-page stats stay in step
const CACHE_KEYS = { anime: "animeListItems", manga: "mangaListItems" };

const itemRef = (type, id) =>
  doc(db, "users", auth.currentUser.uid, COLLECTIONS[type], String(id));

// Keep the session copy of the list in step after a change, so other pages
// (landing stats, Add to List buttons) don't show stale data.
export function writeCache(type, items) {
  try {
    sessionStorage.setItem(CACHE_KEYS[type], JSON.stringify(items));
  } catch (error) {
    // storage full or blocked: the next Firestore load fixes it
  }
}

// Only the status changes; the original "date added" is kept (changing the
// status used to overwrite it).
export const setStatus = (type, item, status) =>
  updateDoc(itemRef(type, item.id), { currentList: status });

// 1-10, or null to clear
export const setUserScore = (type, item, score) =>
  updateDoc(itemRef(type, item.id), {
    userScore: score === null ? deleteField() : score,
  });

export const removeItem = (type, item) => deleteDoc(itemRef(type, item.id));

// puts a removed entry back exactly as it was (for Undo)
export const restoreItem = (type, item) => {
  const { id, ...data } = item;
  return setDoc(itemRef(type, id), data);
};
