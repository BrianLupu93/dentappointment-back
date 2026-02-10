import { asyncHandler } from "../utils/asyncHandler";
import Appointment from "../models/appointment.model";
import Service from "../models/service.model";
import { addMinutes, timeToMinutes } from "../utils/time";
import { logger } from "../utils/logger";

//  ------------------- GET MONTH AVAILABILITY -----------------------
export const getMonthlyAvailability = asyncHandler(async (req, res) => {
  const startDate = req.query.startDate as string; // dd-mm-yyyy

  if (!startDate) {
    return res.status(400).json({ message: "startDate is required" });
  }

  const [day, month, year] = startDate.split("-").map(Number);
  const start = new Date(year, month - 1, day);

  // Shortest Service
  const shortestService = await Service.findOne().sort({ duration: 1 });
  if (!shortestService) {
    return res.status(500).json({ message: "No services found" });
  }

  const duration = shortestService.duration;

  // Last Day of the month
  const end = new Date(year, month, 0).getDate();

  const results: { date: string; full: boolean }[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize

  for (let d = 1; d <= end; d++) {
    const current = new Date(year, month - 1, d);
    current.setHours(0, 0, 0, 0);

    const weekday = current.getDay(); // 0=Sun, 6=Sat
    const formatted = `${String(d).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;

    // ❗ Mark weekend OR past days as full
    if (weekday === 0 || weekday === 6 || current < today) {
      results.push({ date: formatted, full: true });
      continue;
    }

    // The Day appointments
    const appointments = await Appointment.find({ date: formatted });

    // Possible Slots
    const slots: string[] = [];

    const generateSlots = (start: string, end: string) => {
      let t = start;
      while (timeToMinutes(t) + duration <= timeToMinutes(end)) {
        slots.push(t);
        t = addMinutes(t, duration);
      }
    };

    generateSlots("08-00", "12-00");
    generateSlots("13-00", "17-00");

    let dayFull = true;

    for (const slot of slots) {
      const slotEnd = addMinutes(slot, duration);

      const overlaps = appointments.some((a) => {
        const apStart = timeToMinutes(a.startTime);
        const apEnd = timeToMinutes(a.endTime);
        const sStart = timeToMinutes(slot);
        const sEnd = timeToMinutes(slotEnd);

        return !(sEnd <= apStart || sStart >= apEnd);
      });

      if (!overlaps) {
        dayFull = false;
        break;
      }
    }

    results.push({ date: formatted, full: dayFull });
  }

  console.log(results);
  logger.info(`Monthly availability calculated from ${startDate}`);

  res.json(results);
});

//  ------------------- GET DAILLY AVAILABILITY -----------------------

export const getDailyAvailability = asyncHandler(async (req, res) => {
  const date = req.query.date as string; // dd-mm-yyyy
  const serviceId = req.query.serviceId as string;

  if (!date || !serviceId) {
    return res.status(400).json({ message: "date and serviceId are required" });
  }

  // 1. Find selected service
  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  const duration = service.duration;

  // 2. Get all appointments for that day
  const appointments = await Appointment.find({ date });

  // 3. Generate all possible slots
  const slots: string[] = [];

  const generateSlots = (start: string, end: string) => {
    let t = start;
    while (timeToMinutes(t) + duration <= timeToMinutes(end)) {
      slots.push(t);
      t = addMinutes(t, duration);
    }
  };

  generateSlots("08-00", "12-00");
  generateSlots("13-00", "17-00");

  // 4. Filter out slots that overlap with existing appointments
  const availableSlots = slots.filter((slot) => {
    const slotEnd = addMinutes(slot, duration);

    const sStart = timeToMinutes(slot);
    const sEnd = timeToMinutes(slotEnd);

    const overlaps = appointments.some((a) => {
      const apStart = timeToMinutes(a.startTime);
      const apEnd = timeToMinutes(a.endTime);

      return !(sEnd <= apStart || sStart >= apEnd);
    });

    return !overlaps;
  });

  logger.info(
    `Daily availability calculated for ${date} and service ${serviceId}`,
  );

  res.json(availableSlots);
});
