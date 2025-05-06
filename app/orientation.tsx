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
  Modal,
} from "react-native";
import ConvAiDOMComponent from "@/components/AI/ConvAiDOMComponent";
import { BlurView } from "expo-blur";
import { getCurrentDate } from "@/components/commonFunctions/reuseableFunctions";
import useAuth from "@/context/useAuth";

// ==========================================

export default function AICoachingScreen() {
  const { user, logout } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<
    { message: string; source: string }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    logout();
    setModalVisible(false);
  };
  const ref = useRef(null);
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
    <ImageBackground
      source={require("./../assets/images/image.png")}
      style={styles.container}
    >
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
            <Modal
              transparent
              animationType="fade"
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Confirm Logout</Text>
                  <Text style={styles.modalMessage}>
                    Are you sure you want to logout?
                  </Text>
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { backgroundColor: "rgba(255, 55, 125, 1)" },
                      ]}
                      onPress={handleLogout}
                    >
                      <Text style={styles.modalButtonText}>Logout</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
