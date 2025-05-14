import { Alert, SafeAreaView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import SuccessMessage from "@/components/ui/SuccessMessage";
import useAuth from "@/context/useAuth";
import { fetchWorkoutPlans } from "@/utils/static/helpers/fetchWorkoutPlans";
import { useState } from "react";
import { httpsCallable } from "@firebase/functions";
import { cloudFunctions } from "@/firebaseConfig";

export default function SuccessScreen() {
  const { title, subtitle, action } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const getAgentData = httpsCallable(cloudFunctions, "getAgentData");
  const { user } = useAuth();

  const handleAction = async () => {
    try {
      setLoading(true);
      const { userData, userName } = await fetchWorkoutPlans(
        user?.uid,
        getAgentData
      );

      if (!userData) {
        Alert.alert(
          "Something went wrong",
          "Please try again after some time.",
          [{ text: "OK" }]
        );
        router.push("/orientation");
      }

      const path = `/${action}?userdata=${encodeURIComponent(
        JSON.stringify(userData)
      )}&username=${encodeURIComponent(userName)}`;

      router.push(path as any);
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Unexpected Error", "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SuccessMessage
        title={title || "Your Plan Has Been Created"}
        subtitle={
          subtitle ||
          "Your personalized plan is ready. Start your journey to success today!"
        }
        onPress={handleAction}
        loading={loading}
      />
    </SafeAreaView>
  );
}
