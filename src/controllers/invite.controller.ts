import crypto from "crypto";
import Invite from "../models/invite.model";
import { asyncHandler } from "../utils/asyncHandler";
import { sendEmail } from "../utils/email";

export const createInvite = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await Invite.create({ email, token, expiresAt });

  const link = `${process.env.FRONTEND_URL}/register?invite=${token}`;
  console.log(link);

  await sendEmail(
    email,
    "Your Registration Invite",
    `<p>Click the link to register:</p><a href="${link}">${link}</a>`,
  );

  res.json({ message: "Invite sent" });
});

export const validateInvite = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const invite = await Invite.findOne({ token });

  if (!invite || invite.used || invite.expiresAt < new Date()) {
    return res.status(400).json({ valid: false });
  }

  res.json({ valid: true, email: invite.email });
});
