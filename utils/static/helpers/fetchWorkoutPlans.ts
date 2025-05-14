// helpers/fetchWorkoutPlans.ts
import { collection, getDocs } from "firebase/firestore";
import { httpsCallable } from "@firebase/functions";
import { DB } from "@/firebaseConfig";

export const fetchWorkoutPlans = async (
  userId: string,
  getAgentData: ReturnType<typeof httpsCallable>
) => {
  if (!userId) {
    console.warn("userId not available.");
    return { userData: null, userName: "" };
  }

  let userData = null;
  let userName = "";

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const workoutPlanRef = collection(DB, "users", userId, "workoutPlans");
      const snapshot = await getDocs(workoutPlanRef);

      const workoutDocs = snapshot.docs.map((doc) => doc.data());
      if (!workoutDocs.length) throw new Error("No workout plan found");

      userName = workoutDocs[0]?.name || "";

      const response = await getAgentData({
        conversationId: workoutDocs[0]?.conversationId,
        userId,
      });

      const data = response.data;

      if (data?.latestOpenAIPlan) {
        userData = {
          plan: data.latestOpenAIPlan.cleanedWorkoutPlan,
          conversation: data?.transcript,
          history: data?.workoutHistory,
        };
        return { userData, userName };
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  return { userData: null, userName: "" };
};
