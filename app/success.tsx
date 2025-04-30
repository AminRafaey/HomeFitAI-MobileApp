"use client";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native";
import { router } from "expo-router";
import SuccessMessage from "@/components/ui/SuccessMessage";

export default function SuccessScreen() {
  const { title, subtitle, action } = useLocalSearchParams();

  const handleAction = () => {
    const path = `/${action}`;
    router.push(path as any);
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
      />
    </SafeAreaView>
  );
}
