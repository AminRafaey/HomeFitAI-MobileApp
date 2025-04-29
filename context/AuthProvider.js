import React, { createContext, useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DB, timestamp } from "../firebaseConfig";
import { router } from "expo-router";

// =====================================================================

export const AuthContext = createContext();

// =====================================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(DB, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        const userObject = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          orientation: userData?.orientation || false,
          ...userData,
        };
        setUser(userObject);
        if (!userData?.orientation) {
          router.replace("/trainer");
        } else {
          router.replace("/coaching");
        }
      } else {
        setUser(null);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      FirebaseErrorHandler(error);
      console.log("Login error:", error.code);
    }
  };

  const register = async (email, password) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      const userData = {
        email: user.email,
        createdAt: timestamp(),
        role: "user",
        orientation: false,
      };

      await setDoc(doc(DB, "users", user.uid), userData);

      router.push("/trainer");
    } catch (error) {
      FirebaseErrorHandler(error);
      console.error("Register error:", error.code);
    }
  };

  const logout = async () => {
    if (!user) return;
    try {
      await auth().signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        initializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
