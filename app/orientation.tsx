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
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import ConvAiDOMComponent from "@/components/AI/ConvAiDOMComponent";
import { BlurView } from "expo-blur";
import { getCurrentDate } from "@/components/commonFunctions/reuseableFunctions";
import useAuth from "@/context/useAuth";
import LogoutModal from "@/components/ui/LogoutModal";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { httpsCallable } from "@firebase/functions";
import { cloudFunctions } from "@/firebaseConfig";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// ==========================================

const getWorkoutPlan = httpsCallable(cloudFunctions, "getWorkoutPlan");
export default function AICoachingScreen() {
  const { user, logout, initializing } = useAuth();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const conversationIdRef = useRef<string>("");
  const messagesRef = useRef([]);
  const [messages, setMessages] = useState<
    { message: string; source: string }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);

  if (initializing) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#FF377F" />
      </SafeAreaView>
    );
  }

  const handleConversationIdReady = (id: string) => {
    conversationIdRef.current = id;
  };

  const handleNavigationDummy = async (
    messageText: string,
    routeParams: any
  ) => {
    router.push({
      pathname: "/loading",
      params: routeParams,
    });

    await getWorkoutPlan({
      conversationId: "JDekkMJixJ7HDNu52qKL",
      userId: user?.uid,
    }).catch((err) => console.error("Workout fetch error:", err));
  };

  const handleNavigation = (messageText: string, routeParams: any) => {
    router.push({
      pathname: "/loading",
      params: routeParams,
    });
    getWorkoutPlan({
      conversationId: conversationIdRef.current,
      userId: user?.uid,
    }).catch((err) => console.error("Workout fetch error:", err));
  };
  const handleLogout = async () => {
    logout();
    setModalVisible(false);
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
    if (
      newMessages.message.includes(
        "Alright, I’ve got your intel! Hang tight while I whip up your personalized workout plan. Catch you soon, champ! 💪"
      )
    ) {
      setTimeout(() => {
        handleNavigation("Creating your Plan", {
          text: "Creating your\nPersonal Plan\nPlease wait...",
          time: "40000",
          nextRoute:
            "/success?title=Your%20Plan%20Has%20Been%20Created&subtitle=Your%20personalized%20plan%20is%20ready.%20Start%20your%20journey%20to%20success%20today!&action=coaching",
        });
      }, 5000);
    }

    if (newMessages.message === "Disconnected" && messages.length < 6) {
      alert("Something went wrong please try again");
    }
    if (newMessages.message === "Disconnected") {
      setMessages([]);
      return;
    }
    messagesRef.current = [...messagesRef.current, newMessages];
    setMessages([...messagesRef.current]);
  };
  const handleWorkoutCreation = () => {
    handleNavigationDummy("Creating your Plan", {
      text: "Creating your\nPersonal Plan\nPlease wait...",
      time: "40000",
      nextRoute:
        "/success?title=Your%20Plan%20Has%20Been%20Created&subtitle=Your%20personalized%20plan%20is%20ready.%20Start%20your%20journey%20to%20success%20today!&action=coaching",
    });
  };
  return (
    <ImageBackground
      source={require("./../assets/images/image.png")}
      style={styles.container}
    >
      <ConfirmationModal
        visible={confirmModalVisible}
        onConfirm={() => {
          setConfirmModalVisible(false);
          handleWorkoutCreation();
        }}
        onCancel={() => setConfirmModalVisible(false)}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topContent}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <View
            style={{
              backgroundColor: "white",
              width: 42,
              height: 42,
              borderRadius: 87.5,
              borderWidth: 4,
              borderColor: "rgba(9, 229, 56, 1)",
              boxShadow: "0px 2.43px 0px 0px rgba(44, 122, 8, 1)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image
                style={{ width: 22, height: 19, resizeMode: "contain" }}
                source={require("./../assets/images/notepad.png")}
              />
            </TouchableOpacity>

            <LogoutModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              onLogout={handleLogout}
            />
          </View>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: "#8091FF" }]}
            onPress={() => setConfirmModalVisible(true)}
          >
            <View style={[styles.iconInner, { backgroundColor: "white" }]}>
              <MaterialCommunityIcons
                name="electron-framework"
                size={24}
                color="#4169E1"
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.topContentmid}></View>
        <View style={styles.topContentLower}>
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
          <View style={styles.domComponentContainer}>
            <ConvAiDOMComponent
              setMessages={handleSetMessages}
              dom={{ style: styles.domComponent }}
              username=""
              userId={user}
              text="orientation"
              agentId="qLyIzcdsyTfk1c61Nd2U"
              conversationIdRef={conversationIdRef}
              onConversationIdReady={handleConversationIdReady}
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
    marginTop: 70,
    paddingHorizontal: 24,
    alignItems: "flex-start",
    flex: 0.2,
  },
  dateText: {
    fontSize: 24,
    color: "white",
    marginBottom: 40,
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
  additionalBoxContainer: {
    width: "90%",
    height: "60%",
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
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    backgroundColor: "#FFA500",
    shadowColor: "#FFA500",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 10,
  },

  iconInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
});
