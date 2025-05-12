// src/utils/fetchWorkoutPlans.ts
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { DB } from "@/firebaseConfig";

export interface WorkoutPlanData {
  scheduleDays: string[];
  diffDays: number;
  week: number;
}

export const fetchWorkoutPlanModal = async (
  userId: string
): Promise<WorkoutPlanData | null> => {
  try {
    const workoutPlanRef = collection(DB, "users", userId, "workoutPlans");

    const q = query(workoutPlanRef, orderBy("createdAt", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const latestDoc = snapshot.docs[0];
    const data = latestDoc.data();
    const date = data.createdAt;

    if (!date) return null;

    const milliseconds =
      date.seconds * 1000 + Math.floor(date.nanoseconds / 1_000_000);
    const startDate = new Date(milliseconds);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const calculatedDiffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const calculatedWeek = Math.floor(calculatedDiffDays / 7) + 1;

    return {
      scheduleDays: data.schedule || [],
      diffDays: calculatedDiffDays,
      week: calculatedWeek,
    };
  } catch (error) {
    console.error("Error fetching workout plans:", error);
    return null;
  }
};
