import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.model";
import { signToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { generateResetToken } from "../utils/resetToken";
import { sendEmail } from "../utils/email";

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

  const token = signToken({ userId: user._id });

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  });
});

// --------------------- LOGIN -------------------------

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");
  const token = signToken({ userId: user._id });
  res.json({
    user: { id: user._id, name: user.name, email: user.email },
    token,
  });
});

// export const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   const user = await User.findOne({ email });

//   if (!user) {
//     logger.warn(`Forgot password requested for non-existing email: ${email}`);
//     return res
//       .status(200)
//       .json({ message: "If the email exists, a reset link was sent" });
//   }

//   const { token, hashed } = generateResetToken();

//   user.resetPasswordToken = hashed;
//   user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 10); // 10 minute
//   await user.save();

//   const resetLink = `http://localhost:6000/api/auth/reset-password/${token}`;

//   logger.info(`Password reset link generated for ${email}`);

//   await sendEmail(
//     user.email,
//     "Reset",
//     `<a href="${resetLink}">${resetLink}</a>`,
//   );

//   return res.json({
//     message: "Reset link generated",
//     resetLink, // only development
//   });
// });

// export const resetPassword = asyncHandler(async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   let checkedToken;

//   if (Array.isArray(token)) {
//     checkedToken = token[0];
//   }

//   if (!checkedToken) {
//     logger.warn("Token missing in request");
//     return res.status(400).json({ message: "Token missing" });
//   }

//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(checkedToken)
//     .digest("hex");
//   const user = await User.findOne({
//     resetPasswordToken: hashedToken,
//     resetPasswordExpires: { $gt: new Date() },
//   });
//   if (!user) {
//     logger.warn("Invalid or expired reset token");
//     return res.status(400).json({ message: "Invalid or expired token" });
//   }
//   user.password = await bcrypt.hash(password, 10);
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpires = undefined;
//   await user.save();
//   logger.info(`Password reset successful for ${user.email}`);
//   res.json({ message: "Password updated successfully" });
// });
