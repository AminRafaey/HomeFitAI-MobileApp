"use dom";

import React from "react";
import { useConversation } from "@11labs/react";
import { AudioLines, Loader, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { requestMicrophonePermission } from "../permissions/askPermission";
import Config from "../config";
import { auth, cloudFunctions } from "@/firebaseConfig";
import { httpsCallable } from "@firebase/functions";

// =========================================================

export default function ConvAiDOMComponent({
  platform,
  setMessages,
  userId,
}: {
  dom?: import("expo/dom").DOMProps;
  platform: string;
  userId: any;
  setMessages: (newMessages: { message: string; source: string }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const getWorkoutPlan = httpsCallable(cloudFunctions, "getWorkoutPlan");
  const conversation = useConversation({
    onConnect: () => {
      setLoading(false);
      console.log("Connected");
    },
    onDisconnect: () => {
      console.log("Disconnected");

      setMessages({ message: "Disconnected", source: "ai" });
    },
    onMessage: (message) => {
      console.log(message);
      setMessages({ message: message.message, source: message.source });
    },
    onError: (error) => console.error("Error:", error),
  });
  const startConversation = useCallback(async () => {
    setLoading(true);
    try {
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert("No permission");
        return;
      }

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: Config.AI_AGENT_ID,
        dynamicVariables: {
          platform,
        },
        clientTools: {},
      });
      const sessionID = conversation.getId();
      if (sessionID) {
        setConversationId(sessionID);
      } else {
        console.error("Failed to retrieve session ID");
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    setMessages({ message: "Disconnected", source: "ai" });

    const response = await getWorkoutPlan({
      conversationId: conversationId,
      userId: userId,
    });

    const data = response.data;
  }, [conversation]);

  const buttonText = loading
    ? "Please wait..."
    : conversation.status === "disconnected"
    ? "Start orientation"
    : "End orientation";
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
