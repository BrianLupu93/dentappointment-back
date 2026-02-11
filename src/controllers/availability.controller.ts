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

  // Get the shortest Service
  const shortestService = await Service.findOne().sort({ duration: 1 });
  if (!shortestService) {
    return res.status(500).json({ message: "No services found" });
  }

  const duration = shortestService.duration;

  // Last day of the month
  const end = new Date(year, month, 0).getDate();

  const results: { date: string; full: boolean }[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 1; d <= end; d++) {
    const current = new Date(year, month - 1, d);
    current.setHours(0, 0, 0, 0);

    const weekday = current.getDay(); // 0=Sun, 6=Sat
    const formatted = `${String(d).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;

    // Is weekend or past days
    if (weekday === 0 || weekday === 6 || current < today) {
      results.push({ date: formatted, full: true });
      continue;
    }

    // Appointments for the day
    const appointments = await Appointment.find({ date: formatted });

    // Possible slots
    const slots: string[] = [];

    const generateSlots = (start: string, end: string) => {
      let t = start;
      while (timeToMinutes(t) + duration <= timeToMinutes(end)) {
        slots.push(t);
        t = addMinutes(t, duration);
      }
    };

    // TODO: Move to the DB and implement front
    generateSlots("08:00", "12:00");
    generateSlots("13:00", "17:00");

    // Remove past slots if the day is today
    if (current.getTime() === today.getTime()) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const firstFutureIndex = slots.findIndex(
        (s) => timeToMinutes(s) > nowMinutes,
      );

      if (firstFutureIndex === -1) {
        // all slots are in the past then set the day full
        results.push({ date: formatted, full: true });
        continue;
      }

      // keep only future slots
      slots.splice(0, firstFutureIndex);
    }

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

// export const getDailyAvailability = asyncHandler(async (req, res) => {
//   const date = req.query.date as string;
//   const serviceId = req.query.serviceId as string;

//   if (!date || !serviceId) {
//     return res.status(400).json({ message: "date and serviceId are required" });
//   }

//   // 1. Selected service
//   const service = await Service.findById(serviceId);
//   if (!service) {
//     return res.status(404).json({ message: "Service not found" });
//   }

//   const duration = service.duration;

//   // 2. Get the shortest service
//   const minService = await Service.findOne().sort({ duration: 1 });
//   if (!minService) {
//     return res.status(404).json({ message: "Service not found" });
//   }
//   const MIN_SERVICE = minService.duration;

//   // 3. Appointments for that day
//   const appointments = await Appointment.find({ date });

//   // 4. Working hours
//   //   TODO: Move to the DB and implement front
//   const workingHours = [
//     { start: "08:00", end: "12:00" },
//     { start: "13:00", end: "17:00" },
//   ];

//   // 5. Generate candidate slots every MIN_SERVICE minutes
//   const candidateSlots: string[] = [];

//   const generateSlots = (start: string, end: string) => {
//     let t = start;

//     while (timeToMinutes(t) + duration <= timeToMinutes(end)) {
//       candidateSlots.push(t);
//       t = addMinutes(t, MIN_SERVICE);
//     }
//   };

//   workingHours.forEach(({ start, end }) => generateSlots(start, end));

//   // 6. Filter valid slots
//   const availableSlots = candidateSlots.filter((slot) => {
//     const slotStart = timeToMinutes(slot);
//     const slotEnd = slotStart + duration;

//     // must fit inside working hours
//     const fitsInWorkingHours = workingHours.some(({ start, end }) => {
//       return slotStart >= timeToMinutes(start) && slotEnd <= timeToMinutes(end);
//     });

//     if (!fitsInWorkingHours) return false;

//     // must not overlap existing appointments
//     const overlaps = appointments.some((a) => {
//       const apStart = timeToMinutes(a.startTime);
//       const apEnd = timeToMinutes(a.endTime);
//       return !(slotEnd <= apStart || slotStart >= apEnd);
//     });

//     if (overlaps) return false;

//     return true;
//   });

//   res.json(availableSlots);
// });
export const getDailyAvailability = asyncHandler(async (req, res) => {
  const date = req.query.date as string; // dd-mm-yyyy
  const serviceId = req.query.serviceId as string;

  if (!date || !serviceId) {
    return res.status(400).json({ message: "date and serviceId are required" });
  }

  // 1. Selected service
  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  const duration = service.duration;

  // 2. Get the shortest service
  const minService = await Service.findOne().sort({ duration: 1 });
  if (!minService) {
    return res.status(404).json({ message: "Service not found" });
  }
  const MIN_SERVICE = minService.duration;

  // 3. Appointments for the day
  const appointments = await Appointment.find({ date });

  // 4. Working hours
  const workingHours = [
    { start: "08:00", end: "12:00" },
    { start: "13:00", end: "17:00" },
  ];

  // 5. Generate candidate slots
  const candidateSlots: string[] = [];

  const generateSlots = (start: string, end: string) => {
    let t = start;

    while (timeToMinutes(t) + duration <= timeToMinutes(end)) {
      candidateSlots.push(t);
      t = addMinutes(t, MIN_SERVICE);
    }
  };

  workingHours.forEach(({ start, end }) => generateSlots(start, end));

  // 6. Filter valid slots (working hours + no overlap)
  let availableSlots = candidateSlots.filter((slot) => {
    const slotStart = timeToMinutes(slot);
    const slotEnd = slotStart + duration;

    // must fit inside working hours
    const fitsInWorkingHours = workingHours.some(({ start, end }) => {
      return slotStart >= timeToMinutes(start) && slotEnd <= timeToMinutes(end);
    });

    if (!fitsInWorkingHours) return false;

    // must not overlap existing appointments
    const overlaps = appointments.some((a) => {
      const apStart = timeToMinutes(a.startTime);
      const apEnd = timeToMinutes(a.endTime);
      return !(slotEnd <= apStart || slotStart >= apEnd);
    });

    if (overlaps) return false;

    return true;
  });

  // 7. If date is today → filter by current time
  const now = new Date();

  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;

  if (date === todayStr) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // ora finală a zilei (din workingHours)
    const lastEnd = Math.max(...workingHours.map((w) => timeToMinutes(w.end)));

    // dacă e deja după ora de închidere → nimic disponibil
    if (nowMinutes >= lastEnd) {
      return res.json([]);
    }

    // păstrăm doar sloturile după ora curentă
    availableSlots = availableSlots.filter(
      (slot) => timeToMinutes(slot) > nowMinutes,
    );
  }

  return res.json(availableSlots);
});
