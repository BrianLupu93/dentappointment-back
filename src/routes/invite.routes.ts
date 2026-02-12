import { Router } from "express";
import { createInvite, validateInvite } from "../controllers/invite.controller";
import { auth } from "../middlewares/auth.middlewares";

const router = Router();

// Only authenticated users (admins) can send invites
router.post("/invite", auth, createInvite);

// Frontend uses this to check if token is valid
router.get("/validate-invite", validateInvite);

export default router;
