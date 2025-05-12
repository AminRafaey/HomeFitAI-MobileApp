"use dom";

import React, { useCallback, useRef, useState } from "react";
import { useConversation } from "@11labs/react";
import { AudioLines, Loader, X } from "lucide-react-native";
import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { requestMicrophonePermission } from "../permissions/askPermission";
import { cloudFunctions } from "@/firebaseConfig";
import { httpsCallable } from "@firebase/functions";
import { router } from "expo-router";

// Firestore cloud functions
const getWorkoutPlan = httpsCallable(cloudFunctions, "getWorkoutPlan");
const getUpdatedWorkoutPlan = httpsCallable(
  cloudFunctions,
  "geUpdatedWorkoutPlan"
);

export default function ConvAiDOMComponent({
  username,
  setMessages,
  userId,
  text,
  agentId,
  userData,
}: {
  dom?: import("expo/dom").DOMProps;
  username: string;
  userId: any;
  text: string;
  agentId: string;
  userData?: any;
  setMessages: (newMessages: { message: string; source: string }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const userStoppedRef = useRef(false);
  const conversationIdRef = useRef<string>("");

  const handleNavigation = (messageText: string, routeParams: any) => {
    router.push({
      pathname: "/loading",
      params: routeParams,
    });

    getWorkoutPlan({
      conversationId: conversationIdRef.current,
      userId: userId.uid,
    }).catch((err) => console.error("Workout fetch error:", err));
  };

  const conversation = useConversation({
    onConnect: () => setLoading(false),
    onDisconnect: () => {
      const wasUser = userStoppedRef.current;
      setMessages({ message: "Disconnected", source: "ai" });

      if (!wasUser && text === "orientation") {
        handleNavigation("Creating your Plan", {
          text: "Creating your\nPersonal Plan\nPlease wait...",
          time: "20000",
          nextRoute:
            "/success?title=Your%20Plan%20Has%20Been%20Created&subtitle=Your%20personalized%20plan%20is%20ready.%20Start%20your%20journey%20to%20success%20today!&action=coaching",
        });
      } else if (wasUser) {
        alert("Try again");
      }

      userStoppedRef.current = false;
      conversationIdRef.current = "";
    },
    onMessage: (message) => {
      setMessages({ message: message.message, source: message.source });
    },
    onError: (error) => console.error("Conversation error:", error),
  });

  const changeWorkoutPlan = async ({ goal, days, intensity }) => {
    try {
      await getUpdatedWorkoutPlan({
        conversationId: conversationIdRef.current,
        userId: userId.uid,
        userData: { goal, days, intensity },
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
      await conversation.endSession();

      router.push({
        pathname: "/loading",
        params: {
          text: "Updating your\nPersonal Plan\nPlease wait...",
          time: "20000",
          nextRoute:
            "/success?title=Your%20Plan%20Has%20Been%20Updated&subtitle=Your%20personalized%20plan%20is%20ready.%20Start%20your%20journey%20to%20success%20today!&action=coaching",
        },
      });

      return "Workout updated and session ended.";
    } catch (error) {
      console.error("Error updating workout plan:", error);
    }
  };

  const startConversation = useCallback(async () => {
    setLoading(true);

    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert("No permission");
      setLoading(false);
      return;
    }

    try {
      await conversation.startSession({
        agentId,
        dynamicVariables: {
          username: username || "",
          conversation: userData?.conversation || "",
          workoutplan: userData?.plan || "",
          history: userData?.history || "",
        },
        clientTools: { changeWorkoutPlan },
      });

      const sessionID = conversation.getId();
      if (sessionID) {
        conversationIdRef.current = sessionID;
      } else {
        console.error("No session ID received");
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    userStoppedRef.current = true;
    await conversation.endSession();
    setMessages({ message: "Disconnected", source: "ai" });
  }, [conversation]);

  const buttonText = loading
    ? "Please wait..."
    : conversation.status === "disconnected"
      ? `Start ${text}`
      : `End ${text}`;

  const gradientColors = loading
    ? ["#333", "#999"]
    : conversation.status === "connected"
      ? ["#fff", "#fff"]
      : ["#FF377F", "#FF8D51"];

  const buttonTextColor = loading
    ? "#ddd"
    : conversation.status === "connected"
      ? "#FF8D52"
      : "#fff";

  const icon = loading ? (
    <Loader size={28} color="white" style={styles.buttonIcon} />
  ) : conversation.status === "connected" ? (
    <X size={28} color="#FF8D51" style={styles.buttonIcon} />
  ) : (
    <AudioLines
      size={28}
      color={loading ? "#ccc" : "#E2E8F0"}
      style={[styles.buttonIcon, loading && { opacity: 0.5 }]}
    />
  );

  return (
    <Pressable
      style={[
        styles.callButton,
        conversation.status === "connected" && styles.callButtonActive,
      ]}
      onPress={
        conversation.status === "disconnected"
          ? startConversation
          : stopConversation
      }
      disabled={loading}
    >
      <LinearGradient
        style={[
          styles.buttonInner,
          conversation.status === "connected" && styles.buttonInnerEnd,
          loading && styles.buttonInnerLoading,
        ]}
        colors={gradientColors as [string, string, ...string[]]}
      >
        {icon}
        <Text style={[styles.textStyle, { color: buttonTextColor }]}>
          {buttonText}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 16,
  },
  callButton: {
    width: "100%",
    height: 60,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  callButtonActive: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  buttonInner: {
    flexDirection: "row",
    width: "100%",
    height: 60,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 2.78px 0px 0px rgba(160, 69, 21, 1)",
  },
  buttonInnerEnd: {
    borderWidth: 2,
    borderColor: "#FF8D51",
  },
  buttonInnerLoading: {
    backgroundColor: "#666",
    shadowColor: "transparent",
  },
  buttonIcon: {
    marginRight: 8,
  },
});
