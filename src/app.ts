import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import serviceRoutes from "./routes/service.routes";
import appointmentRoutes from "./routes/appointment.routes";
import availabilityRoutes from "./routes/availability.routes";

import { errorHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/requestLogger.middleware";

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: "Too many requests, slow down.",
});

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use(requestLogger);
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);

app.use(errorHandler);

export default app;
