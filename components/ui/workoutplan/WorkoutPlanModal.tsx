"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
import { fetchWorkoutPlanModal } from "@/utils/static/helpers/fetchWorkoutPlanModal";
import useWeeks from "@/hooks/useWeeks";

const TOTAL_WEEKS = 4;
const TAB_MONTHLY = "monthly";
const TAB_TODAY = "today";

export default function WorkoutPlanModal({ onClose }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(TAB_MONTHLY);
  const [showExerciseDetail, setShowExerciseDetail] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState({
    scheduleDays: [],
    diffDays: 0,
    time: 1,
  });

  useEffect(() => {
    if (!user?.uid) return;
    const getWorkoutPlans = async () => {
      const result = await fetchWorkoutPlanModal(user.uid);
      if (result) {
        setWorkoutPlan({
          scheduleDays: result.scheduleDays,
          diffDays: result.diffDays,
          time: result.week,
        });
      }
    };
    getWorkoutPlans();
  }, [user]);

  const handleMonthlyTabPress = () => {
    setActiveTab(TAB_MONTHLY);
    setShowExerciseDetail(false);
  };
  const handleTodayTabPress = () => {
    setActiveTab(TAB_TODAY);
    setShowExerciseDetail(false);
  };
  const handleWorkoutPress = useCallback((workout) => {
    setShowExerciseDetail(true);
  }, []);
  const handleBackToToday = () => setShowExerciseDetail(false);

  const weeks = useWeeks(workoutPlan);

  const currentWeek = weeks.find((w) => w.active)?.week ?? 1;
  const showMonthly = activeTab === TAB_MONTHLY && !showExerciseDetail;
  const showToday = activeTab === TAB_TODAY && !showExerciseDetail;

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
              activeTab === TAB_MONTHLY && styles.activeTabContainer,
            ]}
            onPress={handleMonthlyTabPress}
          >
            {activeTab === TAB_MONTHLY ? (
              <LinearGradient
                colors={["#ff5b7d", "#ff9057"]}
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
              activeTab === TAB_TODAY && styles.activeTabContainer,
            ]}
            onPress={handleTodayTabPress}
          >
            {activeTab === TAB_TODAY ? (
              <LinearGradient
                colors={["#ff5b7d", "#ff9057"]}
                style={styles.activeTabGradient}
              >
                <Text style={styles.activeTabText}>Today</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>Today</Text>
            )}
          </TouchableOpacity>
        </View>

        {showMonthly && (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {weeks.map(({ week, progress, active, completed }) => (
              <WeekProgress
                key={week}
                schedule={workoutPlan.scheduleDays}
                week={week}
                progress={progress}
                active={active}
                completed={completed}
                onPress={handleWorkoutPress}
              />
            ))}
          </ScrollView>
        )}

        {showToday && (
          <ExerciseDetail
            setExerciseDetailstate={setShowExerciseDetail}
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
  title: { fontSize: 18, fontWeight: "bold", color: "#1D2939" },
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
  tab: { flex: 1, borderRadius: 100, overflow: "hidden" },
  activeTabContainer: { borderRadius: 100 },
  activeTabGradient: {
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabText: { color: "white", fontWeight: "600" },
  tabText: {
    color: "#344054",
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
  },
  scrollContent: { flex: 1 },
});
