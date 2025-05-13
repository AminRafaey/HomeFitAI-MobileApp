"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { collection, getDocs, doc, query, orderBy } from "firebase/firestore";
import { DB } from "../../../firebaseConfig";
import * as Progress from "react-native-progress";
import useAuth from "@/context/useAuth";
import workoutCache from "./workoutcache";
import fetchTodayWorkoutDetails from "@/utils/static/helpers/fetchTodayWorkoutDetails";

export default function TodayWorkout({
  onWorkoutPress,
  currentWeek = 2,
  setExerciseDetailstate,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const data = await fetchTodayWorkoutDetails(user?.uid);
        setWorkouts(data);
      } catch (error) {
        console.error("Failed to fetch workout details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      loadWorkout();
    }
  }, [user?.uid]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5B7D" />
        <Text style={styles.loadingText}>Loading your workouts...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => setExerciseDetailstate(false)}
      >
        <Ionicons name="arrow-back" size={16} color="white" />
      </TouchableOpacity>
      <View style={styles.todayContentContainer}>
        {workouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workouts scheduled</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {workouts.map((dayWorkout, index) => {
              const isLast = index === workouts.length - 1;
              const isToday = dayWorkout.type === "today";
              const dotStyle = isToday
                ? styles.timelineDotToday
                : styles.timelineDotUpcoming;
              const labelStyle = isToday
                ? styles.timelineLabelToday
                : styles.timelineLabelUpcoming;

              

              const goal = dayWorkout.exercises[0]?.goal || "Workout";

              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={dotStyle} />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text style={labelStyle}>
                      {isToday ? "Today" : "Upcoming"}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        onWorkoutPress({
                          exercises: dayWorkout.exercises,
                          date: dayWorkout.date,
                        })
                      }
                      style={[styles.workoutCardToday, { marginBottom: 12 }]}
                    >
                      <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{dayWorkout.date}</Text>
                      </View>
                      <View style={styles.workoutContainer}>
                        <View style={styles.workoutMeta}>
                          <Text style={styles.workoutName}>{goal}</Text>
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 8,
                              marginTop: 8,
                            }}
                          >
                            <View style={styles.metaItem}>
                              <AntDesign
                                name="clockcircle"
                                size={14}
                                color="#667085"
                              />
                              <Text style={styles.metaText}>
                                {dayWorkout?.exercises[0]?.total_time} mins
                              </Text>
                            </View>
                            <View style={styles.metaItem}>
                              <MaterialIcons
                                name="local-fire-department"
                                size={16}
                                color="#667085"
                              />
                              <Text style={styles.metaText}>
                                {dayWorkout?.exercises[0]?.total_cal} kcal
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Progress.Circle
                          progress={isToday ? 30 / 100 : 0}
                          size={50}
                          color="rgba(255, 55, 127, 1)"
                          unfilledColor="#f2f4f7"
                          showsText
                          borderWidth={0}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  todayContentContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    padding: 12,
    borderRadius: 16,
  },
  weekTitleLarge: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1D2939",
    marginBottom: 16,
  },
  timeline: {
    // paddingLeft: ,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: "center",
    width: 24,
  },
  timelineLine: {
    borderLeftWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dotted",
    flex: 1,
    marginTop: 4,
  },
  timelineDotToday: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FF5B7D",
    borderWidth: 3,
    borderColor: "#FFE4EA",
  },
  timelineDotUpcoming: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#9CA3AF",
    borderWidth: 3,
    borderColor: "#E5E7EB",
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
  },
  timelineLabelToday: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1D2939",
    marginBottom: 8,
  },
  timelineLabelUpcoming: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6B7280",
    marginBottom: 8,
  },
  workoutCardToday: {
    borderColor: "#E4E7EC",
    borderWidth: 1,
    flex: 1,
    borderRadius: 14,
  },
  dateContainer: {
    backgroundColor: "#F2F4F7",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 12,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6B7280",
  },
  workoutContainer: {
    marginBottom: 12,
    padding: 8,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  workoutName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D2939",
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: "column",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F2F4F7",
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF5B7D",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FF5B7D",
    padding: 12,
    borderRadius: 40,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },
});
