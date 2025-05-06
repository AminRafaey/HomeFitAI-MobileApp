"use client";

import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import WeekProgress from "./WeekProgress";
import TodayWorkout from "./TodayWorkout";
import ExerciseDetail from "./ExerciseDetail";
import useAuth from "@/context/useAuth";
import { DB } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function WorkoutPlanModal({ onClose }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("monthly");
  const [showExerciseDetail, setShowExerciseDetail] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [time, setTime] = useState(1);
  const [diffDays, setDiffDays] = useState(0);

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        if (!user) return;

        const workoutPlanRef = collection(
          DB,
          "users",
          user.uid,
          "workoutPlans"
        );
        const snapshot = await getDocs(workoutPlanRef);

        let date;
        const workoutNames = snapshot.docs.map((doc) => {
          date = doc.data().createdAt;
          return doc.data().schedule;
        });

        if (date) {
          const milliseconds =
            date.seconds * 1000 + Math.floor(date.nanoseconds / 1_000_000);

          const startDate = new Date(milliseconds);
          const today = new Date();

          const diffTime = today.getTime() - startDate.getTime();
          const calculatedDiffDays = Math.floor(
            diffTime / (1000 * 60 * 60 * 24)
          );

          const calculatedWeek = Math.floor(calculatedDiffDays / 7) + 1;

          setTime(calculatedWeek);
          setDiffDays(calculatedDiffDays);
          setScheduleDays(workoutNames[0] || []);
        }
      } catch (error) {
        console.error("Error fetching workout plans:", error);
      }
    };

    fetchWorkoutPlans();
  }, [user]);

  const handleWorkoutPress = (workout) => {
    setSelectedWorkout(workout);
    setShowExerciseDetail(true);
  };

  const handleBackToToday = () => {
    setShowExerciseDetail(false);
  };


  const totalWeeks = 4;

  const weeks = useMemo(() => {
    return Array.from({ length: totalWeeks }, (_, i) => {
      const weekNumber = i + 1;
      const daysIntoCurrentWeek = diffDays % 7;
      const activeWeekProgress = Math.min(
        Math.floor((daysIntoCurrentWeek / 7) * 100),
        100
      );

      return {
        week: weekNumber,
        progress:
          weekNumber < time
            ? 100
            : weekNumber === time
            ? activeWeekProgress
            : 0,
        active: weekNumber === time,
        completed: weekNumber < time,
      };
    });
  }, [time, diffDays]);

  const currentWeek = weeks.find((w) => w.active)?.week ?? 1;

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.handleBar} />

        <View style={styles.header}>
          <Text style={styles.title}>Workout plan</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={20} color="#344054" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "monthly" && styles.activeTabContainer,
            ]}
            onPress={() => {
              setActiveTab("monthly");
              setShowExerciseDetail(false);
            }}
          >
            {activeTab === "monthly" ? (
              <LinearGradient
                colors={["#ff5b7d", "#ff9057"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTabGradient}
              >
                <Text style={styles.activeTabText}>Monthly plan</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>Monthly plan</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "today" && styles.activeTabContainer,
            ]}
            onPress={() => {
              setActiveTab("today");
              setShowExerciseDetail(false);
            }}
          >
            {activeTab === "today" ? (
              <LinearGradient
                colors={["#ff5b7d", "#ff9057"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTabGradient}
              >
                <Text style={styles.activeTabText}>Today</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>Today</Text>
            )}
          </TouchableOpacity>
        </View>

        {activeTab === "monthly" && !showExerciseDetail && (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {weeks.map(({ week, progress, active, completed }) => (
              <WeekProgress
                schedule={scheduleDays}
                key={week}
                week={week}
                progress={progress}
                active={active}
                completed={completed}
                onPress={handleWorkoutPress}
              />
            ))}
          </ScrollView>
        )}

        {activeTab === "today" && !showExerciseDetail && (
          <ExerciseDetail
            setExerciseDetailstate={setShowExerciseDetail}
            // workout={selectedWorkout}
            onBackPress={handleBackToToday}
          />
        )}

        {showExerciseDetail && (
          <TodayWorkout
            setExerciseDetailstate={setShowExerciseDetail}
            onWorkoutPress={handleWorkoutPress}
            currentWeek={currentWeek}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    paddingHorizontal: 10,
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 12,
    height: "80%",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D0D5DD",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    position: "relative",
    alignItems: "center",
    marginBottom: 24,
    height: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D2939",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: "#F2F4F7",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderColor: "#EAECF0",
    borderWidth: 1,
    borderRadius: 100,
    padding: 1,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    borderRadius: 100,
    overflow: "hidden",
  },
  activeTabContainer: {
    borderRadius: 100,
  },
  activeTabGradient: {
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabText: {
    color: "white",
    fontWeight: "600",
  },
  tabText: {
    color: "#344054",
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
  },
  scrollContent: {
    flex: 1,
  },
});
