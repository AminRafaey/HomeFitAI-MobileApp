// app/index.js
import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, DB } from "@/firebaseConfig";
import { router } from "expo-router";
import { doc, setDoc } from "@firebase/firestore";
import firestore, { Timestamp } from "@react-native-firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        router.push("/");
        Alert.alert("Logged in");
      })
      .catch((err) => Alert.alert(err.message));
  };

  const signup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userData = {
        email: user.email,
        createdAt: firestore.FieldValue.serverTimestamp(),
        role: "user",
      };

      await firestore().collection("users").doc(user.uid).set(userData);

      router.push("/");
      console.log("User added successfully and saved to Firestore");
    } catch (error) {
      console.error("Signup error:", error.message);
    }
  };
  const logout = async () => {
    await auth.signOut();
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Login" onPress={login} />
      <Button title="Sign Up" onPress={signup} />
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
    gap: 5,
  },
  input: { borderBottomWidth: 1, marginBottom: 12, padding: 8 },
});
