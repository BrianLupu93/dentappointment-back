import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err: any) {
    // If the token expires the front will ask for
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};
