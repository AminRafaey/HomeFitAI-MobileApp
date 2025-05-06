"use client";

import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Text,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import TopNavigation from "@/components/ui/TopNavigation";
import SideMenu from "@/components/ui/SideMenu";
import ConvAiDOMComponent from "@/components/AI/ConvAiDOMComponent";
import { BlurView } from "expo-blur";
import { cloudFunctions, DB } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import useAuth from "@/context/useAuth";
import { httpsCallable } from "@firebase/functions";
export default function App() {
  const { user } = useAuth();
const flatListRef = useRef<FlatList>(null);
const getAgentData = httpsCallable(cloudFunctions, "getAgentData");
const [userData, setUserData] = useState<any>(null);
const [messages, setMessages] = useState<{ message: string; source: string }[]>(
  []
);
const [userName, setUserName] = useState<string>("");
const ref = useRef(null);
useEffect(() => {
  if (!user) return;

  const fetchWorkoutPlans = async () => {
    try {
      const workoutPlanRef = collection(DB, "users", user.uid, "workoutPlans");
      const snapshot = await getDocs(workoutPlanRef);

      const workoutNames = snapshot.docs.map((doc) => doc.data());
      setUserName(workoutNames[0]?.name || "");

      const response = await getAgentData({
        conversationId: workoutNames[0]?.conversationId,
        userId: user.uid,
      });

      const data = response.data;
      setUserData({
        plan: data.latestOpenAIPlan.cleanedWorkoutPlan,
        conversation: data?.transcript,
        history: data?.workoutHistory,
      });
    } catch (error) {
      console.error("Error fetching workout plan:", error);
    }
  };

  fetchWorkoutPlans();
}, [user]);

useEffect(() => {
  ref.current = messages;
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
  if (newMessages.message === "Disconnected") {
    setMessages([]);
    return;
  }
  ref.current = [...ref.current, newMessages];
  setMessages([...ref.current]);
};
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
        {userData && (
          <ConvAiDOMComponent
            setMessages={handleSetMessages}
            dom={{ style: styles.domComponent }}
            username={userName}
            userId={user}
            text="coaching"
            agentId="oZReChF9Hmm27DtIsGtG"
            userData={userData}
          />
        )}
      </View>
    </ImageBackground>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
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
