import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

// --------------------- CREATE USER -------------------------

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email already in use");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// --------------------- LOGIN -------------------------

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");
  const accessToken = signAccessToken({ userId: user._id });
  const refreshToken = signRefreshToken({ userId: user._id });
  user.refreshToken = refreshToken;
  await user.save();
  res.json({
    user: { id: user._id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  });
});

// --------------------- REFRESH -------------------------

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Missing refresh token" });
  }
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
  try {
    verifyRefreshToken(refreshToken);
  } catch {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
  const newAccessToken = signAccessToken({ userId: user._id });
  res.json({ accessToken: newAccessToken });
});

// --------------------- LOGOUT -------------------------

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.json({ message: "Logged out" });
  const user = await User.findOne({ refreshToken });
  if (!user) return res.json({ message: "Logged out" });
  user.refreshToken = null;
  await user.save();
  res.json({ message: "Logged out" });
});
