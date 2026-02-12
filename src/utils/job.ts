import cron from "node-cron";
import Appointment from "../models/appointment.model";
import dayjs from "./dayX";
import { logger } from "./logger";

cron.schedule("*/10 7-23 * * *", async () => {
  logger.info("----------- CRON JOB STARTED -----------");
  try {
    const today = dayjs().format("DD-MM-YYYY");
    const now = dayjs();

    const appointments = await Appointment.find({
      date: today,
      done: false,
    });

    for (const appt of appointments) {
      const end = dayjs(`${appt.date} ${appt.endTime}`, "DD-MM-YYYY HH:mm");

      if (now.isAfter(end)) {
        appt.done = true;
        await appt.save();
        logger.info(`Marked appointment ${appt._id} as done`);
      }
    }
  } catch (err) {
    console.error("Cron job error:", err);
  }
  logger.info("----------- CRON JOB FINISHED -----------");
});
