"use client";

import { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function SuccessScreen() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),

      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.push("/coaching");
  };

  return (
    <LinearGradient
      colors={["#ff377d", "#ff8d51"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.circleBackground,
                {
                  opacity: opacityAnim,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.checkmarkContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Feather name="check" size={64} color="#ff377d" />
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: textOpacityAnim,
                transform: [
                  {
                    translateY: textOpacityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.title}>Your Plan Has Been Created</Text>
            <Text style={styles.subtitle}>
              Your personalized plan is ready. Start your journey to success
              today!
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: textOpacityAnim,
                transform: [
                  {
                    translateY: textOpacityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Get Started</Text>
              <Feather
                name="arrow-right"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.decorationContainer}>
          <View style={[styles.decorationDot, { top: "15%", left: "10%" }]} />
          <View style={[styles.decorationDot, { top: "25%", right: "15%" }]} />
          <View
            style={[styles.decorationDot, { bottom: "30%", left: "15%" }]}
          />
          <View
            style={[styles.decorationDot, { bottom: "20%", right: "10%" }]}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 1,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  circleBackground: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
  },
  checkmarkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  continueButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  decorationContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  decorationDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
});
