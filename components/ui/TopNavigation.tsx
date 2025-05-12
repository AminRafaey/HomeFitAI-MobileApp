import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useState } from "react";
import useAuth from "@/context/useAuth";
import LogoutModal from "./LogoutModal";

const TopNavigation = () => {
  const { logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    logout();
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileButton}>
        <View style={styles.iconInner}>
          <Ionicons name="person" size={24} color="#D737FF" />
        </View>
      </TouchableOpacity>

      <View style={styles.currencyContainer}>
        <View style={styles.currencyItem}>
          <FontAwesome5 name="coins" size={20} color="#FFD700" />
          <Text style={styles.currencyText}>1.2k</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.currencyItem}>
          <MaterialCommunityIcons name="diamond" size={22} color="#4FC3F7" />
          <Text style={styles.currencyText}>56</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.iconInner}>
          <Ionicons name="settings" size={24} color="#EE4C06" />
        </View>
      </TouchableOpacity>

      <LogoutModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onLogout={handleLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 50,
    zIndex: 10,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D737FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EE4C06",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  iconInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  currencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  currencyText: {
    color: "white",
    fontWeight: "bold",
    marginRight: 5,
    fontSize: 16,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#32CD32",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 3,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TopNavigation;
