"use dom";

import React, { useRef } from "react";
import { useConversation } from "@11labs/react";
import { AudioLines, Loader, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { requestMicrophonePermission } from "../permissions/askPermission";
import { cloudFunctions } from "@/firebaseConfig";
import { httpsCallable } from "@firebase/functions";
import { router } from "expo-router";

// =========================================================

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
  const getWorkoutPlan = httpsCallable(cloudFunctions, "getWorkoutPlan");
  const geUpdatedWorkoutPlan = httpsCallable(
    cloudFunctions,
    "geUpdatedWorkoutPlan"
  );

  const conversation = useConversation({
    onConnect: () => {
      setLoading(false);
    },
    onDisconnect: () => {
      const wasUser = userStoppedRef.current;
      setMessages({ message: `Disconnected`, source: "ai" });
      if (!wasUser && text === "orientation") {
        router.push({
          pathname: "/loading",
          params: {
            text: "Creating your\nPersonal Plan\nPlease wait...",
            time: "30000",
            nextRoute:
              "/success?title=Your%20Plan%20Has%20Been%20Created&subtitle=Your%20personalized%20plan%20is%20ready.%20Start%20your%20journey%20to%20success%20today!&action=coaching",
          },
        });

        getWorkoutPlan({
          conversationId: conversationIdRef.current,
          userId: userId.uid,
        })
          .then((response) => {
            const data = response.data;
          })
          .catch((error) => {
            console.error("Error fetching workout plan:", error);
          });
      }

      if (!wasUser && text === "coaching") {
      } else if (wasUser) {
        alert("Try again");
      }

      userStoppedRef.current = false;
      conversationIdRef.current = "";
    },
    onMessage: (message) => {
      setMessages({ message: message.message, source: message.source });
    },

    onError: (error) => console.error("Error:", error),
  });
  const changeWorkoutPlan = async ({ goal, days, intensity }) => {
    console.log("changeWorkoutPlan called with:", { goal, days, intensity });
    console.log(conversationIdRef.current, userId.uid);
    geUpdatedWorkoutPlan({
      conversationId: conversationIdRef.current,
      userId: userId.uid,
      userData: { goal, days, intensity },
    })
      .then((response) => {
        const data = response.data;
        console.log(data, "Workout plan updated successfully:");
      })
      .catch((error) => {
        console.error("Error fetching workout plan:", error);
      });

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await conversation.endSession();
    router.push({
      pathname: "/loading",
      params: {
        text: "Updating your\nPersonal Plan\nPlease wait...",
        time: "30000",
        nextRoute:
          "/success?title=Your%20Plan%20Has%20Been%20Updated&subtitle=Your%20personalized%20plan%20is%20ready.%20Start%20your%20journey%20to%20success%20today!&action=coaching",
      },
    });

    return "Workout updated and session ended.";
  };
  const startConversation = useCallback(async () => {
    setLoading(true);
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert("No permission");
        return;
      }
      const con = await conversation.startSession({
        agentId: agentId,
        dynamicVariables: {
          username: username ? username : "",
          conversation: userData ? userData.conversation : "",
          workoutplan: userData ? userData.plan : "",
          history: userData ? userData.history : "",
        },
        clientTools: { changeWorkoutPlan },
      });

      const sessionID = conversation.getId();
      if (sessionID) {
        conversationIdRef.current = sessionID;
      } else {
        console.error("Failed to retrieve session ID");
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
          conversation.status === "connected" && styles.buttonInnerActive,
          conversation.status === "connected" && styles.buttonInnerEnd,
          loading && styles.buttonInnerLoading,
        ]}
        colors={
          loading
            ? ["#333", "#999"]
            : conversation.status === "connected"
            ? ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 1)"]
            : ["rgba(255, 55, 127, 1)", "rgba(255, 141, 81, 1)"]
        }
      >
        {loading ? (
          <Loader size={28} color="white" style={styles.buttonIcon} />
        ) : conversation.status === "connected" ? (
          <X
            size={28}
            color="rgba(255, 141, 81, 1)"
            style={styles.buttonIcon}
          />
        ) : (
          <AudioLines
            size={28}
            color={loading ? "#ccc" : "#E2E8F0"}
            style={[styles.buttonIcon, loading && { opacity: 0.5 }]}
          />
        )}

        <Text
          style={[
            styles.textStyle,
            loading
              ? { color: "#ddd" }
              : conversation.status === "connected"
              ? {
                  color: "rgba(255,141,82,1)",
                }
              : { color: "#fff" },
          ]}
        >
          {buttonText}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    color: "white",
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
    flexDirection: "row",
    width: "100%",
    height: 60,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 2.78px 0px 0px rgba(160, 69, 21, 1)",
    borderWidth: 2,
    borderColor: "rgba(255, 141, 81, 1)",
  },

  buttonInnerActive: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    borderWidth: 2,
    borderColor: "rgba(255,141,82,1)",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonInnerLoading: {
    backgroundColor: "#666",
    shadowColor: "transparent",
  },
});
