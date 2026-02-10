import { asyncHandler } from "../utils/asyncHandler";
import { calculateEndTime } from "../utils/calculateEndTime";
import Appointment from "../models/appointment.model";
import { logger } from "../utils/logger";

// --------------------- CREATE APPOINTMENT -------------------------
export const createAppointment = asyncHandler(async (req, res) => {
  const { clientInfo, service, date, startTime } = req.body;

  console.log(req.body);

  if (!clientInfo || !service || !date || !startTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const endTime = calculateEndTime(startTime, service.duration);

  const appointment = await Appointment.create({
    clientInfo,
    service,
    date,
    startTime,
    endTime,
  });

  logger.info(
    `Appointment created for ${clientInfo.fullName} on ${date} at ${startTime} - ${endTime}`,
  );

  res.status(201).json(appointment);
});

// --------------------- GET ALL APPOINTMENTS -------------------------
export const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find().sort({ date: 1, startTime: 1 });
  res.json(appointments);
});

// --------------------- DELETE APPOINTMENT {id} -------------------------
export const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findByIdAndDelete(id);

  if (!appointment) {
    logger.warn(`Attempted to delete non-existing appointment: ${id}`);
    return res.status(404).json({ message: "Appointment not found" });
  }

  logger.info(
    `Appointment deleted for ${appointment.clientInfo.fullName} on ${appointment.date} at ${appointment.startTime}`,
  );

  res.json({ message: "Appointment deleted" });
});

// --------------------- GET APPOINTMENTS by DATE {dd-mm-yyyy} -------------------------
export const getAppointmentsByDate = asyncHandler(async (req, res) => {
  const { date } = req.params; // ex: "10-05-2026"
  const appointments = await Appointment.find({ date }).sort({ startTime: 1 });
  logger.info(`Fetched ${appointments.length} appointments for date ${date}`);
  res.json(appointments);
});
