import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBj7URbnht5Ey_JHPGj7Dl61PE0eW5x6zY",
  authDomain: "anilookupdb.firebaseapp.com",
  projectId: "anilookupdb",
  storageBucket: "anilookupdb.appspot.com",
  messagingSenderId: "600441164380",
  appId: "1:600441164380:web:87439fedb4da748ae64c99",
  measurementId: "G-LZS0W197MG",
};

// initialize firebase
const app = initializeApp(firebaseConfig);

// initialize firebase authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
