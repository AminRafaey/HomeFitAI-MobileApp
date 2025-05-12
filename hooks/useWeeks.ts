import { useMemo } from "react";

const TOTAL_WEEKS = 4;

export default function useWeeks(workoutPlan) {
  return useMemo(
    () =>
      Array.from({ length: TOTAL_WEEKS }, (_, i) => {
        const weekNumber = i + 1;
        const daysIntoCurrentWeek = workoutPlan.diffDays % 7;
        const activeWeekProgress = Math.min(
          Math.floor((daysIntoCurrentWeek / 7) * 100),
          100
        );
        return {
          week: weekNumber,
          progress:
            weekNumber < workoutPlan.time
              ? 100
              : weekNumber === workoutPlan.time
                ? activeWeekProgress
                : 0,
          active: weekNumber === workoutPlan.time,
          completed: weekNumber < workoutPlan.time,
        };
      }),
    [workoutPlan]
  );
}
