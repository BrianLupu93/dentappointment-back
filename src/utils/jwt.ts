import jwt, { Secret, SignOptions } from "jsonwebtoken";
const JWT_SECRET: Secret = process.env.JWT_SECRET || "default_secret";
export const signToken = (payload: object): string => {
  const expiresIn = Number(process.env.JWT_EXPIRES_IN) || 60 * 60 * 24 * 7;
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
};
export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
