import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  name: string;
  duration: number;
  active: boolean;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IService>("Service", serviceSchema);
