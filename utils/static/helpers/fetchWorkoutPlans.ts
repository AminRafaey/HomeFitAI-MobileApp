// helpers/fetchWorkoutPlans.ts
import { collection, getDocs } from "firebase/firestore";
import { httpsCallable } from "@firebase/functions";
import { DB } from "@/firebaseConfig";

export const fetchWorkoutPlans = async (
  userId: string,
  getAgentData: ReturnType<typeof httpsCallable>
) => {
  let success = false;
  let userData = null;
  let userName = "";
  if (!userId) {
    console.warn("userId not available yet.");
  }

  while (!success) {
    try {
      const workoutPlanRef = collection(DB, "users", userId, "workoutPlans");
      const snapshot = await getDocs(workoutPlanRef);

      const workoutNames = snapshot.docs.map((doc) => doc.data());
      userName = workoutNames[0]?.name || "";

      const response = await getAgentData({
        conversationId: workoutNames[0]?.conversationId,
        userId,
      });

      const data = response.data;

      if (data?.latestOpenAIPlan) {
        userData = {
          plan: data.latestOpenAIPlan.cleanedWorkoutPlan,
          conversation: data?.transcript,
          history: data?.workoutHistory,
        };
        success = true;
      } else {
        await new Promise((res) => setTimeout(res, 3000));
      }
    } catch (error) {
      // console.error("Error fetching workout plan:", error);
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  return { userData, userName };
};
