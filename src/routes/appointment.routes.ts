import { Router } from "express";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getAppointmentsByDate,
} from "../controllers/appointment.controller";
import { auth } from "../middlewares/auth.middlewares";

const router = Router();

router.post("/", createAppointment);
router.get("/", auth, getAppointments);
router.get("/:date", getAppointmentsByDate);
router.delete("/:id", auth, deleteAppointment);

export default router;
