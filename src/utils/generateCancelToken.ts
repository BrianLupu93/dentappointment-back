import jwt from "jsonwebtoken";
import type { IAppointment } from "../models/appointment.model";

export function generateCancelToken(appointment: IAppointment) {
  const payload = {
    appointmentId: appointment._id.toString(),
    date: appointment.date,
    startTime: appointment.startTime,
  };

  return jwt.sign(payload, process.env.CANCEL_SECRET!);
}
