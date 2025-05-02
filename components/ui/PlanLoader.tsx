// components/PlanLoader.tsx
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  ImageBackground,
} from "react-native";
// import PercentageCircle from "react-native-expo-circle-progress";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function PlanLoader({
  duration = 30000,
  nextRoute = "/success",
  text = "Creating your\nPersonal Plan\nPlease wait...",
}: {
  duration?: number;
  nextRoute?: string;
  text?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const intervalDuration = 100;
    const totalSteps = duration / intervalDuration;
    const increment = 100 / totalSteps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push(nextRoute as any), 0);
          return 100;
        }
        return next;
      });
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [duration, nextRoute]);

  const [line1, line2, line3] = text.split("\n");

  return (
    <ImageBackground
      source={require("../../assets/images/back.png")}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            {line1 && <Text style={styles.creatingText}>{line1}</Text>}
            {line2 && <Text style={styles.planText}>{line2}</Text>}
            {line3 && <Text style={styles.waitText}>{line3}</Text>}
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

// <PercentageCircle
// radius={55}
// percent={Math.floor(progress)}
// borderWidth={8}
// color={"rgba(255, 55, 127, 1)"}
// textStyle={{
//   fontSize: 28,
//   fontWeight: "800",
//   color: "rgba(255, 141, 81, 1)",
// }}
// />
