import { Alert, Platform } from "react-native";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { firebaseConfig } from '../../../firebaseConfig';
import { initializeApp } from "firebase/app";
import firestore from "@react-native-firebase/firestore";
// import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { firebaseConfig } from "@/firebaseConfig";

// ==================================================

const firebaseApp = initializeApp(firebaseConfig);
// const storage = getStorage(firebaseApp);

// ==================================================
