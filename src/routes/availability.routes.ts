import { Router } from "express";
import {
  getDailyAvailability,
  getMonthlyAvailability,
} from "../controllers/availability.controller";

const router = Router();

router.get("/month", getMonthlyAvailability);
router.get("/day", getDailyAvailability);

export default router;
