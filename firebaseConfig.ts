import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import firebase from "@react-native-firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyBKub3LGRYpnw1t6JIyt0pJ4cffPFYi_x0",
  authDomain: "homefit-ai.firebaseapp.com",
  projectId: "homefit-ai",
  storageBucket: "homefit-ai.firebasestorage.app",
  messagingSenderId: "558357878887",
  appId: "1:558357878887:web:ad3f18484d856db2981cc2",
  measurementId: "G-R7FSNR4610",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firebaseApp = initializeApp(firebaseConfig);
const DB = getFirestore(firebaseApp);
const cloudFunctions = getFunctions(firebaseApp);

export { DB, cloudFunctions };
