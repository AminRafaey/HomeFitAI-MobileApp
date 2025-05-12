import {
  collection,
  getDocs,
  getDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { DB } from "@/firebaseConfig"; // your firebase config

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getTodayWorkoutDetails = async (user, exerciseDetailsRef) => {
  const userId = user?.uid;
  if (!userId) throw new Error("User not authenticated");

  const today = new Date();
  const todayName = dayNames[today.getDay()];

  const workoutPlansRef = collection(DB, "users", userId, "workoutPlans");
  const snapshot = await getDocs(workoutPlansRef);

  if (snapshot.empty) {
    console.log("No workout plans found");
    return null;
  }

  let latestPlan = null;
  let latestCreatedAt = null;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(data.createdAt);

    if (!latestCreatedAt || createdAt >= latestCreatedAt) {
      latestCreatedAt = createdAt;
      latestPlan = {
        docSnap,
        dayName: docSnap.id,
        createdAt,
      };
    }
  });

  if (!latestPlan) {
    console.log("Latest plan is not for today");
    return null;
  }

  const planDocRef = doc(DB, "users", userId, "workoutPlans", todayName);
  const planDocSnap = await getDoc(planDocRef);
  const latestPlanData = planDocSnap.data();

  if (!latestPlanData) return null;

  const exercisesRef = collection(planDocRef, "exercises");
  const exercisesSnap = await getDocs(exercisesRef);

  const warmup = latestPlanData?.warmup || [];
  const cooldown = latestPlanData?.cooldown || [];
  const equipment = latestPlanData?.equipment || [];

  const exerciseData = {
    name: `${todayName}'s Workout`,
    date: today.toDateString(),
    dayName: todayName,
    warmup: [],
    main: [],
    cooldown: [],
    equipment,
  };

  warmup.forEach((item, index) => {
    const minutes = item.duration_minutes || 1;
    const calories = item.calories || 8;
    exerciseData.warmup.push({
      id: item.id,
      name: item.name,
      duration: `${minutes.toString().padStart(2, "0")}:00`,
      sets: 1,
      reps: 10,
      note: "",
      image: item.image || "image",
      calories: `${calories} kcal`,
    });
  });

  cooldown.forEach((item, index) => {
    const minutes = item.duration_minutes || 1;
    const calories = item.calories || 8;
    exerciseData.cooldown.push({
      id: item.id,
      name: item.name,
      duration: `${minutes.toString().padStart(2, "0")}:00`,
      sets: 1,
      reps: 10,
      note: "",
      image: item.image || "image",
      calories: `${calories} kcal`,
    });
  });

  exercisesSnap.forEach((docSnap) => {
    const data = docSnap.data();
    const sets = data.sets || 3;
    const reps = data.reps || "8-10";

    let avgReps = 0;
    if (typeof reps === "string" && reps.includes("-")) {
      const [min, max] = reps.split("-").map(Number);
      avgReps = (min + max) / 2;
    } else {
      avgReps = parseInt(reps, 10) || 8;
    }

    let duration_minutes = data.duration_minutes;
    let calories = data.calories;

    if (!duration_minutes) {
      const secondsPerRep = 3;
      const restBetweenSets = 30;
      const totalSeconds =
        sets * avgReps * secondsPerRep + (sets - 1) * restBetweenSets;
      duration_minutes = Math.ceil(totalSeconds / 60);
    }

    if (!calories) {
      calories = duration_minutes * 8;
    }

    const minutes = Math.floor(duration_minutes);
    const seconds = (duration_minutes * 60) % 60;
    const duration = `${minutes.toString().padStart(2, "0")}:${Math.round(
      seconds
    )
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

  const totalCalories = exerciseData.warmup
    .concat(exerciseData.main, exerciseData.cooldown)
    .reduce((sum, item) => {
      const value = parseInt(item.calories.replace(" kcal", ""), 10) || 0;
      return sum + value;
    }, 0);

  exerciseData.calories = totalCalories;

  exerciseDetailsRef.current = exerciseData;
  return exerciseData;
};
