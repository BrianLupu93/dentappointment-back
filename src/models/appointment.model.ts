import mongoose, { Schema, Document } from "mongoose";

export interface IClientInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface IAppointment extends Document {
  clientInfo: IClientInfo;
  service: {
    _id: string;
    name: string;
    duration: number;
  };
  date: string; // format 10-05-2026
  startTime: string; // format 08-00
  endTime: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    clientInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    service: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      duration: { type: Number, required: true },
    },

    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IAppointment>("Appointment", appointmentSchema);
