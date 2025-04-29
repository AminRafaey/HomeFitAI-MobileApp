import { View, Text, StyleSheet } from "react-native";

export default function DayPill({ day, completed }) {
  return (
    <View style={[styles.dayPill, completed && styles.completedDayPill]}>
      <Text
        style={[styles.dayPillText, completed && styles.completedDayPillText]}
      >
        {day}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F2F4F7",
    borderRadius: 100,
  },
  completedDayPill: {
    backgroundColor: "#F3F4F6",
  },
  dayPillText: {
    color: "#344054",
    fontWeight: "500",
    fontSize: 12,
  },
  completedDayPillText: {
    color: "#9CA3AF",
  },
});
