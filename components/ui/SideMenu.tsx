import { View, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import WorkoutPlanModal from "./workoutplan/WorkoutPlanModal";

const SideMenu = () => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton}>
        <View style={[styles.iconInner, { backgroundColor: "white" }]}>
          <Ionicons name="calendar" size={24} color="#FFA500" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: "#4169E1" }]}
      >
        <View style={[styles.iconInner, { backgroundColor: "white" }]}>
          <MaterialIcons name="leaderboard" size={24} color="#4169E1" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: "#32CD32" }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={[styles.iconInner, { backgroundColor: "white" }]}>
          <MaterialIcons name="list-alt" size={24} color="#32CD32" />
        </View>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <WorkoutPlanModal onClose={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 15,
    top: "35%",
    zIndex: 10,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    backgroundColor: "#FFA500",
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
});
export default SideMenu;
