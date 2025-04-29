import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  ImageBackground,
} from "react-native";
import PercentageCircle from "react-native-expo-circle-progress";
import { router } from "expo-router";

export default function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 30 * 1000;
    const intervalDuration = 100;
    const totalSteps = totalDuration / intervalDuration;
    const increment = 100 / totalSteps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            router.push("/success");
          }, 0);

          return 100;
        }
        return next;
      });
    }, intervalDuration);

    return () => clearInterval(interval);
  }, []);
  return (
    <ImageBackground
      source={require("./../assets/images/back.png")}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <PercentageCircle
            radius={55}
            percent={Math.floor(progress)}
            borderWidth={8}
            color={"rgba(255, 55, 127, 1)"}
            textStyle={{
              fontSize: 28,
              fontWeight: "800",
              color: "rgba(255, 141, 81, 1)",
            }}
          />
          <View style={styles.textContainer}>
            <Text style={styles.creatingText}>Creating your</Text>
            <Text style={styles.planText}>Personal Plan</Text>
            <Text style={styles.waitText}>Please wait...</Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 30 : 10,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    alignItems: "center",
    top: 10,
  },
  creatingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#212121",
  },
  planText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  waitText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ff377d",
  },
});
