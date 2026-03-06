// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3ZHOagX3v3GW9zqVslgixVT9852iqbxc",
  authDomain: "shepherd-sbookstore.firebaseapp.com",
  projectId: "shepherd-sbookstore",
  storageBucket: "shepherd-sbookstore.firebasestorage.app",
  messagingSenderId: "93896212710",
  appId: "1:93896212710:web:eefce969919bf3cd70fb27",
};

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
