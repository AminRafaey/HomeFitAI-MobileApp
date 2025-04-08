import React from "react";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Image,
  FlatList,
} from "react-native";
import { Platform } from "react-native";
import { getCurrentDate } from "@/components/commonFunctions/reuseableFunctions";
import ConvAiDOMComponent from "@/components/AI/ConvAiDOMComponent";

// ==========================================

export default function AICoachingScreen() {
  const [messages, setMessages] = useState<
    { message: string; source: string }[]
  >([]);
  const ref = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: messages.length - 1,
        animated: true,
      });
    }
  }, [messages]);

  useEffect(() => {
    ref.current = messages;
  }, [messages]);

  const handleSetMessages = (newMessages: {
    message: string;
    source: string;
  }) => {
    if (newMessages.message === "Disconnected") {
      setMessages([]);
      return;
    }
    ref.current = [...ref.current, newMessages];
    setMessages([...ref.current]);
  };
  return (
    <ImageBackground
      source={require("../../assets/images/back.gif")}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topContent}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <Image source={require("../../assets/images/notepad.png")} />
        </View>
        <View style={styles.topContentmid}></View>
        <View style={styles.topContentLower}>
          <View style={styles.additionalBox}>
            <FlatList
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.source === "ai"
                      ? styles.aiMessage
                      : styles.userMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{item.message}</Text>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToIndex({
                  index: messages.length - 1,
                  animated: true,
                })
              }
              onLayout={() =>
                flatListRef.current?.scrollToIndex({
                  index: messages.length - 1,
                  animated: true,
                })
              }
              getItemLayout={(data, index) => ({
                length: 50, // Approximate height of each message
                offset: 50 * index,
                index,
              })}
            />
          </View>
          <View style={styles.domComponentContainer}>
            <ConvAiDOMComponent
              setMessages={handleSetMessages}
              dom={{ style: styles.domComponent }}
              platform={Platform.OS}
            />
          </View>
        </View>
        <StatusBar style="light" />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    width: "100%",
  },
  topContent: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: "flex-start",
    flex: 0.2,
  },
  dateText: {
    fontSize: 24,
    color: "white",
    marginBottom: 8,
  },
  topContentmid: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    flex: 0.3,
  },
  topContentLower: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    flex: 0.5,
  },
  additionalBox: {
    width: "90%",
    height: "60%",
    backgroundColor: "rgba(0, 0, 0, 0.66)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 55, 127, 1)",
    overflow: "hidden",
    marginBottom: 20,
    padding: 12,
  },
  glassContainer: {
    width: "90%",
    height: "60%",
    borderRadius: 20,
    overflow: "hidden",
  },
  boxText: {
    fontSize: 18,
    color: "white",
  },

  domComponentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  domComponent: {
    width: 200,
    height: 60,
    flex: 1,
    flexDirection: "row",
  },
  messageBubble: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    maxWidth: "80%",
  },
  aiMessage: {
    backgroundColor: "rgba(255, 55, 127, 0.5)",
    alignSelf: "flex-start",
  },
  userMessage: {
    backgroundColor: "rgba(255, 141, 81, 0.5)",
    alignSelf: "flex-end",
  },
  messageText: {
    color: "#FFF",
    fontSize: 14,
  },
});
