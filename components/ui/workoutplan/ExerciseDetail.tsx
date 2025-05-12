"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ExerciseItem from "./ExerciseItem";
import useAuth from "@/context/useAuth";
import { getTodayWorkoutDetails } from "@/utils/static/helpers/getTodayWorkoutDetails";

export default function ExerciseDetail({
  onBackPress,
  setExerciseDetailstate,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [warmupEnabled, setWarmupEnabled] = useState(true);
  const [cooldownEnabled, setCooldownEnabled] = useState(true);
  const [exerciseDetails, setExerciseDetails] = useState(null);
  const exerciseDetailsRef = useRef(null);
  const exerciseCount = exerciseDetails?.main?.length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const details = await getTodayWorkoutDetails(user, exerciseDetailsRef);
        setExerciseDetails(details);
      } catch (err) {
        console.error("Failed to fetch today's workout:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5B7D" />
          <Text style={styles.loadingText}>Loading exercise details...</Text>
        </View>
      </ScrollView>
    );
  }

  if (!exerciseDetails) {
    return (
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No exercise details found for today Please check your schedule
          </Text>
        </View>
      </ScrollView>
    );
  }
  return (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Calorie burn</Text>
          <Text style={styles.statValue}>{exerciseDetails.calories}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Exercise</Text>
          <Text style={styles.statValue}>{exerciseCount}</Text>
        </View>
      </View>

      <View style={styles.equipmentContainer}>
        <Text style={styles.sectionTitle}>Equipment</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {Array.from(exerciseDetails.equipment).length > 0 ? (
            Array.from(exerciseDetails.equipment).map((item, index) => (
              <View key={index} style={styles.equipmentTag}>
                <Text style={styles.equipmentTagText}>{item}</Text>
              </View>
            ))
          ) : (
            <View style={styles.equipmentTag}>
              <Text style={styles.equipmentTagText}>Bodyweight</Text>
            </View>
          )}
        </View>
      </View>

      <>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Warmup</Text>
            <Text style={styles.sectionDuration}>
              {exerciseDetails.warmup.length > 0
                ? `${exerciseDetails.warmup[0].duration} mins`
                : "3 mins"}
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#E4E7EC", true: "#ff5b7d" }}
            thumbColor={"#ffffff"}
            ios_backgroundColor="#E4E7EC"
            value={warmupEnabled}
            onValueChange={setWarmupEnabled}
          />
        </View>
        {warmupEnabled && (
          <View style={styles.exerciseSection}>
            {exerciseDetails.warmup.length > 0 ? (
              exerciseDetails.warmup.map((exercise, index) => (
                <ExerciseItem
                  id={exercise.id}
                  index={index}
                  key={`warmup-${index}`}
                  name={exercise.name}
                  duration={exercise.duration}
                  image={exercise.image}
                  length={exerciseDetails.warmup.length}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No warmup exercises</Text>
            )}
          </View>
        )}
      </>

      {/* Main exercises */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Muscle Building </Text>
          <Text style={styles.sectionDuration}>
            {exerciseDetails.main.length > 0
              ? `${exerciseDetails.main.length * 2} mins`
              : "0 mins"}
          </Text>
        </View>
      </View>
      <View style={styles.exerciseSection}>
        {exerciseDetails.main.length > 0 ? (
          exerciseDetails.main.map((exercise, index) => (
            <ExerciseItem
              id={exercise.id}
              index={index}
              key={index}
              name={exercise.name}
              duration={exercise.duration}
              image={exercise.image}
              length={exerciseDetails.main.length}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No exercises found</Text>
        )}
      </View>

      <>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Cool down</Text>
            <Text style={styles.sectionDuration}>
              {exerciseDetails.cooldown.length > 0
                ? `${exerciseDetails.cooldown[0].duration * 1} mins`
                : "5 mins"}
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#E4E7EC", true: "#ff5b7d" }}
            thumbColor={"#ffffff"}
            ios_backgroundColor="#E4E7EC"
            value={cooldownEnabled}
            onValueChange={setCooldownEnabled}
          />
        </View>
        {cooldownEnabled && (
          <View style={styles.exerciseSection}>
            {exerciseDetails.cooldown.length > 0 ? (
              exerciseDetails.cooldown.map((exercise, index) => (
                <ExerciseItem
                  id={exercise.id}
                  index={index}
                  key={`cooldown-${index}`}
                  name={exercise.name}
                  image={exercise.image}
                  duration={exercise.duration}
                  length={exerciseDetails.cooldown.length}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No cooldown exercises</Text>
            )}
          </View>
        )}
      </>

      {/* Go button */}
      <TouchableOpacity onPress={onBackPress}>
        <LinearGradient
          colors={["#ff5b7d", "#ff9057"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.goButton}
        >
          <Text style={styles.goButtonText}>Go</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderColor: "#E4E7EC",
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1D2939",
  },
  equipmentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderColor: "#E4E7EC",
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
  },
  equipmentTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  equipmentTagText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  exerciseSection: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    padding: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D2939",
  },
  sectionDuration: {
    fontSize: 14,
    color: "#6B7280",
  },
  goButton: {
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  goButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 16,
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
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
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#6B7280",
  },
});
