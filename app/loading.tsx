import PlanLoader from "@/components/ui/PlanLoader";
import { useLocalSearchParams } from "expo-router";

export default function Loading() {
  const { text, time, nextRoute } = useLocalSearchParams();
  return (
    <PlanLoader
      duration={Number(time) || 30000}
      nextRoute={nextRoute?.toString() || "/success"}
      text={text?.toString() || "Loading..."}
    />
  );
}
