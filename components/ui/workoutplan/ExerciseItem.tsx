import { View, Text, StyleSheet, Image } from "react-native";
import fallbackImage from "../../../assets/images/warmup.gif";

export default function ExerciseItem({ index, name, duration, image, length }) {
  const hasBottomBorder = index < length - 1;
  return (
    <View
      style={[
        styles.exerciseItem,
        hasBottomBorder && styles.exerciseItemWithBorder,
      ]}
    >
      <View style={styles.exerciseIconContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.exerciseIcon} />
        ) : (
          <Image source={fallbackImage} style={styles.exerciseIcon} />
        )}
      </View>
      <View style={styles.exerciseDetails}>
        <Text style={styles.exerciseName}>{name}</Text>
        <Text style={styles.exerciseDuration}>{duration}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0,
    borderBottomColor: "#F3F4F6",
  },
  exerciseItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  exerciseIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exerciseIcon: {
    width: 24,
    height: 24,
    backgroundColor: "#D1D5DB",
    borderRadius: 4,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1D2939",
    marginBottom: 2,
  },
  exerciseDuration: {
    fontSize: 14,
    color: "#6B7280",
  },
});
