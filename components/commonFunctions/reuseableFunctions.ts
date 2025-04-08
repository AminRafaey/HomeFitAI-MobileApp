export const getCurrentDate = () => {
  const date = new Date();
  const weekday = date.toLocaleString("default", { weekday: "long" });
  const month = date.toLocaleString("default", { month: "long" });
  const day = date.getDate();
  return `${month} ${day}, ${weekday}`;
};
