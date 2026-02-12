import mongoose, { Schema, Document } from "mongoose";

export interface IInvite extends Document {
  email?: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

const inviteSchema = new Schema<IInvite>(
  {
    email: { type: String },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<IInvite>("Invite", inviteSchema);
