import { asyncHandler } from "../utils/asyncHandler";
import { calculateEndTime } from "../utils/calculateEndTime";
import Appointment from "../models/appointment.model";
import { logger } from "../utils/logger";
import { appointmentConfirmationTemplate, sendEmail } from "../utils/email";
import { generateCancelToken } from "../utils/generateCancelToken";
import jwt from "jsonwebtoken";

// --------------------- CREATE APPOINTMENT -------------------------
export const createAppointment = asyncHandler(async (req, res) => {
  const { clientInfo, service, date, startTime } = req.body;

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

  const cancelToken = generateCancelToken(appointment);
  const cancelLink = `${process.env.FRONTEND_URL}/cancel-appointment?token=${cancelToken}`;

  const html = appointmentConfirmationTemplate({
    fullName: appointment.clientInfo.fullName,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    serviceName: appointment.service.name,
    phoneNumber: process.env.SALON_PHONE || "+40 700 000 000",
    cancelLink: cancelLink,
  });

  try {
    await sendEmail(
      appointment.clientInfo.email,
      "Your Appointment Confirmation",
      html,
    );
  } catch (err) {
    console.error("Email sending failed:", err);
  }

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

// --------------------- DELETE APPOINTMENT {client with token} -------------------------
export const cancelAppointment = asyncHandler(async (req, res) => {
  console.log("-----------------------------");
  const token = req.query.token as string;
  if (!token) {
    return res.status(400).json("Missing token");
  }
  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.CANCEL_SECRET!);
  } catch {
    return res.status(400).json("Invalid or expired token");
  }

  console.log("appointmentId:", decoded + " ----------------");

  const appointment = await Appointment.findById(decoded.appointmentId);
  if (!appointment) {
    logger.warn(
      `Attempted cancel with invalid appointmentId: ${decoded.appointmentId}`,
    );
    return res.status(404).json("Appointment not found");
  }
  const [day, month, year] = appointment.date.split("-");
  const [hour, minute] = appointment.startTime.split(":");
  const start = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
  const now = new Date();
  const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

  console.log((diffHours < 6) + "_____________________________");

  if (diffHours < 6) {
    return res
      .status(400)
      .json(
        `The Appointment can be cancelled only if the time before the appointment is at least 6 hours. Please contact us: ${process.env.SALON_PHONE}`,
      );
  }
  await appointment.deleteOne();
  logger.info(
    `Appointment cancelled by client for ${appointment.clientInfo.fullName} on ${appointment.date} at ${appointment.startTime}`,
  );
  res.json("Apointment was successfully cancelled.");
});
