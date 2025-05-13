export function sumDurations(durations: string[]): string {
  let totalSeconds = durations?.reduce((sum, time) => {
    const [min, sec] = time.split(":").map(Number);
    return sum + min * 60 + sec;
  }, 0);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
