import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

export const asyncHandler = (fn: ControllerFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      logger.error(`Error in ${req.method} ${req.originalUrl}: ${err.message}`);
      next(err);
    });
  };
};
