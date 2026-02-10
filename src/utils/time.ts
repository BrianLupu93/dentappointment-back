export const parseTime = (time: string) => {
  const [h, m] = time.split("-").map(Number);
  return { h, m };
};
export const timeToMinutes = (time: string): number => {
  const { h, m } = parseTime(time);
  return h * 60 + m;
};

export const addMinutes = (time: string, minutesToAdd: number): string => {
  let { h, m } = parseTime(time);
  m += minutesToAdd;
  while (m >= 60) {
    m -= 60;
    h += 1;
  }
  if (h >= 24) h = h % 24;
  return `${String(h).padStart(2, "0")}-${String(m).padStart(2, "0")}`;
};
