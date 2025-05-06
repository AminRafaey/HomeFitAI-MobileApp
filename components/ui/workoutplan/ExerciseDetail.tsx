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
import { collection, getDocs, doc } from "firebase/firestore";
import ExerciseItem from "./ExerciseItem";
import { DB } from "@/firebaseConfig";
import useAuth from "@/context/useAuth";

export default function ExerciseDetail({
  onBackPress,
  setExerciseDetailstate,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warmupEnabled, setWarmupEnabled] = useState(true);
  const [cooldownEnabled, setCooldownEnabled] = useState(true);
  const [exerciseDetails, setExerciseDetails] = useState(null);
  const exerciseDetailsRef = useRef(null);
  const exerciseCount = exerciseDetails?.main?.length;

  useEffect(() => {
    const fetchTodayWorkoutDetails = async () => {
      try {
        setLoading(true);
        const userId = user?.uid;
        if (!userId) throw new Error("User not authenticated");

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

        if (
          exerciseDetailsRef.current &&
          exerciseDetailsRef.current.dayName === todayName
        ) {
          setExerciseDetails(exerciseDetailsRef.current);
          setLoading(false);
          return;
        }

        // Fetch workout document
        const workoutDocRef = doc(
          DB,
          "users",
          userId,
          "workoutPlans",
          todayName
        );
        const exercisesRef = collection(workoutDocRef, "exercises");
        const exercisesSnapshot = await getDocs(exercisesRef);

        if (exercisesSnapshot.empty) {
          setExerciseDetails(null);
          return;
        }

        const workoutData = (
          await getDocs(collection(DB, "users", userId, "workoutPlans"))
        ).docs
          .find((doc) => doc.id === todayName)
          ?.data();

        const warmup = workoutData?.warmup || [];
        const cooldown = workoutData?.cooldown || [];
        const equipment = workoutData?.equipment || [];

        const exerciseData = {
          name: `${todayName}'s Workout`,
          date: today.toDateString(),
          dayName: todayName,
          warmup: [],
          main: [],
          cooldown: [],
          equipment,
        };

        // Warmup
        warmup.forEach((item, index) =>
          exerciseData.warmup.push({
            id: `warmup-${index}`,
            name: item.name,
            duration: "01:00",
            sets: 1,
            reps: 10,
            note: "",
          })
        );

        // Cooldown
        cooldown.forEach((item, index) =>
          exerciseData.cooldown.push({
            id: `cooldown-${index}`,
            name: item.name,
            duration: "01:00",
            sets: 1,
            reps: 10,
            note: "",
          })
        );

        // Main exercises
        exercisesSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const sets = data.sets || 3;
          const reps = data.reps || "8-10";

          let avgReps = 0;
          if (typeof reps === "string" && reps.includes("-")) {
            const [min, max] = reps
              .split("-")
              .map((num) => Number.parseInt(num, 10));
            avgReps = (min + max) / 2;
          } else {
            avgReps = Number.parseInt(reps, 10) || 8;
          }

          const secondsPerRep = 3;
          const restBetweenSets = 30;
          const totalSeconds =
            sets * avgReps * secondsPerRep + (sets - 1) * restBetweenSets;
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          const calories = minutes * 8;
          const duration = `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;

          exerciseData.main.push({
            id: docSnap.id,
            name: data.name || "Unnamed",
            duration,
            sets,
            reps,
            note: data.note || "",
            image: data.image || null,
            calories: `${calories} kcal`,
          });
        });
        const totalCalories = exerciseData.main
          .map((item) =>
            typeof item.calories === "string"
              ? parseInt(item.calories.replace(" kcal", ""), 10)
              : item.calories || 0
          )
          .reduce((acc, current) => acc + current, 0);

        exerciseData.calories = totalCalories;

        exerciseDetailsRef.current = exerciseData;
        setExerciseDetails(exerciseData);
      } catch (err) {
        console.error("Failed to fetch today's workout:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayWorkoutDetails();
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

  if (error) {
    return (
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setLoading(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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
          <Text style={styles.errorText}>No exercise details found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onBackPress}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
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
                ? `${exerciseDetails.warmup.length * 1} mins`
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
                ? `${exerciseDetails.cooldown.length * 1} mins`
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
