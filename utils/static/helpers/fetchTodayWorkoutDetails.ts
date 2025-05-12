import { collection, getDocs, doc, query, orderBy } from "firebase/firestore";
import { DB } from "../../../firebaseConfig";
import workoutCache from "@/components/ui/workoutplan/workoutcache";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
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

export default async function fetchTodayWorkoutDetails(userId) {
  if (!userId) throw new Error("User not authenticated");
  if (workoutCache.userId === userId && workoutCache.data) {
    return workoutCache.data;
  }
  const workoutPlansRef = collection(doc(DB, "users", userId), "workoutPlans");
  const plansSnapshot = await getDocs(workoutPlansRef);
  if (plansSnapshot.empty) return [];

  const allDayDocs = plansSnapshot.docs
    .map((docSnap) => ({
      id: docSnap.id,
      data: docSnap.data(),
      ref: docSnap.ref,
    }))
    .filter((doc) => doc.data.createdAt?.seconds)
    .sort((a, b) => b.data.createdAt.seconds - a.data.createdAt.seconds);

  const toDateString = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const latestDate = toDateString(allDayDocs[0]?.data.createdAt?.seconds);

  const latestPlanDocs = allDayDocs.filter((doc) => {
    const docDate = toDateString(doc.data.createdAt?.seconds);
    return docDate === latestDate;
  });

  const today = new Date();
  const todayName = dayNames[today.getDay()];
  const workoutDays = [];

  for (const docSnap of latestPlanDocs) {
    const dayName = docSnap.id;
    const isToday = dayName === todayName;

    const exercisesRef = collection(docSnap.ref, "exercises");
    const exercisesSnapshot = await getDocs(
      query(exercisesRef, orderBy("name"))
    );
    const workoutData = docSnap.data;

    if (exercisesSnapshot.empty) continue;

    const exercises = [];

    for (const exerciseDoc of exercisesSnapshot.docs) {
      const exerciseData = exerciseDoc.data();
      const sets = exerciseData.sets || 3;
      const reps = exerciseData.reps || "8-10";

      let avgReps = 0;
      if (typeof reps === "string" && reps.includes("-")) {
        const [min, max] = reps.split("-").map((n) => parseInt(n, 10));
        avgReps = (min + max) / 2;
      } else {
        avgReps = parseInt(reps, 10) || 8;
      }

      exercises.push({
        id: exerciseDoc.id,
        name: exerciseData.name || "Unnamed Exercise",
        duration: `${exerciseData.duration_minutes || 1} mins`,
        calories: `${exerciseData.calories || 5} kcal`,
        percentComplete: isToday ? 30 : 0,
        note: exerciseData.note,
        sets,
        reps,
        warmup: workoutData.warmup,
        cooldown: workoutData.cooldown,
        equipment: workoutData.equipment,
        goal: workoutData.goal,
        total_cal: workoutData.totalCalories || 146,
        total_time: workoutData.totalDuration || 26,
      });
    }

    const date = new Date();
    if (!isToday) {
      const currentDayIndex = today.getDay();
      const targetDayIndex = dayNames.indexOf(dayName);
      const daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7;
      date.setDate(today.getDate() + daysToAdd);
    }

    const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}, ${dayName.substring(0, 3)}`;

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
  return workoutDays;
}
