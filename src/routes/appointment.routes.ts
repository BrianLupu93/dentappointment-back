import { Router } from "express";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getAppointmentsByDate,
} from "../controllers/appointment.controller";

const router = Router();

router.post("/", createAppointment);
router.get("/", getAppointments);
router.get("/:date", getAppointmentsByDate);
router.delete("/:id", deleteAppointment);

export default router;
