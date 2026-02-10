import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(`Error on ${req.method} ${req.originalUrl}: ${err.message}`);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
};
