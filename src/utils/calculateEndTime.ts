export const calculateEndTime = (
  startTime: string,
  duration: number,
): string => {
  const [hoursStr, minutesStr] = startTime.split(":");
  let hours = parseInt(hoursStr, 10);
  let minutes = parseInt(minutesStr, 10);

  minutes += duration;

  while (minutes >= 60) {
    minutes -= 60;
    hours += 1;
  }

  if (hours >= 24) {
    hours = hours % 24;
  }

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");

  return `${hh}:${mm}`;
};
