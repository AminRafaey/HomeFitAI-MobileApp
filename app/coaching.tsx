"use client";

import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import TopNavigation from "@/components/ui/TopNavigation";
import SideMenu from "@/components/ui/SideMenu";
import ConvAiDOMComponent from "@/components/AI/ConvAiDOMComponent";
import { BlurView } from "expo-blur";
import { cloudFunctions } from "@/firebaseConfig";
import useAuth from "@/context/useAuth";
import { httpsCallable } from "@firebase/functions";
import { fetchWorkoutPlans } from "@/utils/static/helpers/fetchWorkoutPlans";
import { useLocalSearchParams } from "expo-router";
import { useNavigationState } from "@react-navigation/native";
export default function Coaching() {
  const { user, initializing } = useAuth();
  const userID = user?.uid;
  const conversationIdRef = useRef<string>("");
  const messagesRef = useRef([]);
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<
    { message: string; source: string }[]
  >([]);
  const { userdata, username } = useLocalSearchParams();
  const getAgentData = httpsCallable(cloudFunctions, "getAgentData");
  const [userData, setUserData] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const isCurrentScreen = useNavigationState((state) => {
    const currentRoute = state.routes[state.index];
    return currentRoute.name === "coaching";
  });

  useEffect(() => {
    if (!user || !isCurrentScreen) return;
    const fetchPlans = async () => {
      const { userData, userName } = await fetchWorkoutPlans(
        userID,
        getAgentData
      );

      setUserData(userData);
      setUserName(userName);
    };

    fetchPlans();
  }, [user, isCurrentScreen]);

  const handleConversationIdReady = (id: string) => {
    conversationIdRef.current = id;
  };

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);
  const handleSetMessages = (newMessages: {
    message: string;
    source: string;
  }) => {
    if (newMessages.message === "Disconnected" && messages.length < 3) {
      alert("Something went wrong please try again");
    }
    if (newMessages.message === "Disconnected" && newMessages.source === "ai") {
      setMessages([]);
      return;
    }
    messagesRef.current = [...messagesRef.current, newMessages];
    setMessages([...messagesRef.current]);
  };
  if (initializing) {
    return (
      <ImageBackground
        source={require("../assets/images/Splash.jpg")}
        style={styles.loadingBackground}
        resizeMode="cover"
      >
        <ActivityIndicator
          size="large"
          color="#fff"
          style={styles.loadingIndicator}
        />
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("./../assets/images/image.png")}
        style={styles.backgroundImage}
      >
        <TopNavigation />
        <SideMenu />
        <View style={styles.domComponentContainer}>
          <View style={styles.additionalBoxContainer}>
            <BlurView intensity={100} tint="dark" style={styles.additionalBox}>
              <FlatList
                ref={flatListRef}
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
              />
            </BlurView>
          </View>
          <ConvAiDOMComponent
            setMessages={handleSetMessages}
            dom={{ style: styles.domComponent }}
            username={userName ? userName : username}
            userId={user}
            text="coaching"
            agentId="oZReChF9Hmm27DtIsGtG"
            userData={userData ? userData : userdata}
            conversationIdRef={conversationIdRef}
            onConversationIdReady={handleConversationIdReady}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  additionalBoxContainer: {
    width: "90%",
    height: 180,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 55, 127, 1)",
  },

  additionalBox: {
    flex: 1,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 20,
    overflow: "hidden",
  },

  domComponentContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  domComponent: {
    width: 200,
    height: 120,
    flex: 1,
    flexDirection: "row",
  },
  messageBubble: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    maxWidth: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
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
