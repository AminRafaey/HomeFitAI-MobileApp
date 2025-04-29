"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import PercentageCircle from "react-native-expo-circle-progress";
import { collection, getDocs, doc, query, orderBy } from "firebase/firestore";
import { DB } from "../../../firebaseConfig";
import useAuth from "@/context/useAuth";
import workoutCache from "./workoutcache";

export default function TodayWorkout({ onWorkoutPress, currentWeek = 2 }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const loadingRef = useRef(false);

  const fetchWorkoutData = async () => {
    try {
      setLoading(true);
      loadingRef.current = true;

      const userId = user?.uid;
      if (!userId) throw new Error("User not authenticated");

      if (workoutCache.userId === userId && workoutCache.data) {
        setWorkouts(workoutCache.data);
        setLoading(false);
        return;
      }

      const workoutPlansRef = collection(
        doc(DB, "users", userId),
        "workoutPlans"
      );
      const workoutPlansSnapshot = await getDocs(workoutPlansRef);

      const workoutDays = [];
      const today = new Date();
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const todayName = dayNames[today.getDay()];

      for (const dayDoc of workoutPlansSnapshot.docs) {
        const dayName = dayDoc.id;
        const isToday = dayName === todayName;

        const exercisesRef = collection(dayDoc.ref, "exercises");
        const exercisesSnapshot = await getDocs(
          query(exercisesRef, orderBy("name"))
        );
        const workoutData = dayDoc.data();
        if (exercisesSnapshot.empty) continue;

        const exercises = [];

        for (const exerciseDoc of exercisesSnapshot.docs) {
          const exerciseData = exerciseDoc.data();
          const sets = exerciseData.sets || 3;
          const reps = exerciseData.reps || "8-10";
          const estimatedTimePerRep = 3;
          const restBetweenSets = 30;
          let avgReps = 0;
          if (typeof reps === "string" && reps.includes("-")) {
            const [min, max] = reps
              .split("-")
              .map((num) => Number.parseInt(num, 10));
            avgReps = (min + max) / 2;
          } else {
            avgReps = Number.parseInt(reps, 10) || 8;
          }

          const totalSeconds =
            sets * avgReps * estimatedTimePerRep + (sets - 1) * restBetweenSets;
          const minutes = Math.ceil(totalSeconds / 60);
          const caloriesPerMinute = 8;
          const calories = minutes * caloriesPerMinute;

          exercises.push({
            id: exerciseDoc.id,
            name: exerciseData.name || "Unnamed Exercise",
            duration: `${minutes} mins`,
            calories: `${calories} kcal`,
            percentComplete: isToday ? 30 : 0,
            note: exerciseData.note,
            sets,
            reps,
            warmup: workoutData.warmup,
            cooldown: workoutData.cooldown,
            equipment: workoutData.equipment,
            goal: workoutData.goal,
          });
        }

        const date = new Date();
        if (!isToday) {
          const currentDayIndex = today.getDay();
          const targetDayIndex = dayNames.indexOf(dayName);
          const daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7;
          date.setDate(today.getDate() + daysToAdd);
        }

        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const formattedDate = `${
          monthNames[date.getMonth()]
        } ${date.getDate()}, ${dayName.substring(0, 3)}`;

        if (exercises.length > 0) {
          workoutDays.push({
            type: isToday ? "today" : "upcoming",
            date: formattedDate,
            exercises,
            timestamp: date,
          });
        }
      }

      workoutDays.sort((a, b) => a.timestamp - b.timestamp);

      workoutCache.data = workoutDays;
      workoutCache.userId = userId;

      setWorkouts(workoutDays);
    } catch (err) {
      console.error("Error fetching workout data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!loadingRef.current) fetchWorkoutData();
  }, [currentWeek]);

  const retryFetch = () => {
    workoutCache.data = null;
    workoutCache.userId = null;
    fetchWorkoutData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5B7D" />
        <Text style={styles.loadingText}>Loading your workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.todayContentContainer}>
        <Text style={styles.weekTitleLarge}>Week {currentWeek}</Text>

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

              const totalMinutes = dayWorkout.exercises.reduce((sum, ex) => {
                return sum + (parseInt(ex.duration) || 0);
              }, 0);
              const totalCalories = dayWorkout.exercises.reduce((sum, ex) => {
                return sum + (parseInt(ex.calories) || 0);
              }, 0);

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
                                {totalMinutes} mins
                              </Text>
                            </View>
                            <View style={styles.metaItem}>
                              <MaterialIcons
                                name="local-fire-department"
                                size={16}
                                color="#667085"
                              />
                              <Text style={styles.metaText}>
                                {totalCalories} kcal
                              </Text>
                            </View>
                          </View>
                        </View>
                        <PercentageCircle
                          radius={20}
                          percent={isToday ? 30 : 0}
                          borderWidth={4}
                          color={"rgba(255, 55, 127, 1)"}
                          textStyle={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: "rgba(255, 141, 81, 1)",
                          }}
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
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
