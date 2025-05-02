import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import DayPill from "./DayPill";
import { useEffect, useState } from "react";

export default function WeekProgress({
  schedule,
  week,
  progress,
  active,
  completed,
}) {
  const containerStyle = [
    styles.weekContainer,
    active && styles.activeWeekContainer,
    completed && styles.completedWeekContainer,
  ];

  const weekTextStyle = [
    styles.weekTitle,
    active && styles.activeWeekTitle,
    completed && styles.completedWeekTitle,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.weekHeader}>
        <Text style={weekTextStyle}>Week {week}</Text>
        {week === 1 && (
          <Image
            style={{ width: 50, height: 50 }}
            source={require("../../../assets/images/100P.png")}
          />
        )}
        {week === 2 && (
          <Image
            style={{ width: 50, height: 50 }}
            source={require("../../../assets/images/three.png")}
          />
        )}
        {week === 3 && (
          <Image
            style={{ width: 50, height: 50 }}
            source={require("../../../assets/images/0percent.png")}
          />
        )}
        {week === 4 && (
          <Image
            style={{ width: 50, height: 50 }}
            source={require("../../../assets/images/0percent.png")}
          />
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayPillContainer}
      >
        {schedule.map((day, index) => (
          <DayPill key={index} day={day.slice(0, 3)} completed={completed} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  weekContainer: {
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
  },
  activeWeekContainer: {
    borderWidth: 1,
    borderColor: "#FF5B7D",
  },
  completedWeekContainer: {
    borderColor: "#E4E7EC",
    opacity: 0.7,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1D2939",
  },
  activeWeekTitle: {
    color: "#FF5B7D",
  },
  completedWeekTitle: {
    color: "#9CA3AF",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D1D5DB",
  },
  progressTextActive: {
    color: "#344054",
  },
  completedProgressText: {
    color: "#9CA3AF",
  },
  dayPillContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
});
