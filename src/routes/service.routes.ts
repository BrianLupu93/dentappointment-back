import { Router } from "express";
import {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
} from "../controllers/service.controller";
import { auth } from "../middlewares/auth.middlewares";

const router = Router();

router.post("/", auth, createService);
router.get("/", getServices);
router.get("/:id", getService);
router.put("/:id", auth, updateService);
router.delete("/:id", auth, deleteService);

export default router;
