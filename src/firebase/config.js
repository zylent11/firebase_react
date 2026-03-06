// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
// firebase init
// {
//   "hosting": {
//     "site": "shepherdsbookstore",

//     "public": "public",
//     ...
//   }
// }
// firebase deploy --only hosting:shepherdsbookstore
