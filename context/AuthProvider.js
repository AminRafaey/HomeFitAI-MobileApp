import React, { createContext, useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DB, timestamp } from "../firebaseConfig";
import { router } from "expo-router";
import { Alert } from "react-native";

// =====================================================================

export const AuthContext = createContext();

// =====================================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
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
        if (!userData?.orientation && router.asPath !== "/trainer") {
          router.replace("/trainer");
        } else if (userData?.orientation && router.asPath !== "/coaching") {
          router.replace("/coaching");
        }
      } else {
        setUser(null);
        router.replace("/login");
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      FirebaseErrorHandler(error);
      Alert.alert("Login Error", error.message);
      console.log("Login error:", error.code);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setSignupLoading(true);
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
      Alert.alert("Signup Error", error.message);
      console.error("Register error:", error.code);
    } finally {
      setSignupLoading(false);
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
        loading,
        signupLoading,
        initializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
