import mongoose from "mongoose";
import { stdColors, USAStates } from "../lib";

export interface IVehicle {
  id: string;
  licensePlate: string;
  registrationNumber: number;
  registrationState: USAStates;
  nameOnRegistration: string;
  vinNumber: string;
  ownerReportedCarValue: number;
  ownerReportedCurrentMileage: number;
  vehicleColor: stdColors;
  otherColor?: string;
  vehicleDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVehicleDocument extends Omit<IVehicle, "id">, mongoose.Document {}

const VehicleSchema = new mongoose.Schema(
  {
    /*  Mongo generates its own `_id` field per document, so I do not need
     *  to manually create one. */
    registration: {
      licensePlate: {
        type: String,
        required: true,
      },
      registrationNumber: {
        type: Number,
        required: true,
      },
      registrationState: {
        type: String,
        enum: USAStates,
        required: true,
      },
      nameOnRegistration: {
        type: String,
        required: true,
      },
    },
    vinNumber: {
      type: Number,
      required: true,
    },
    ownerReportedCarValue: {
      type: Number,
      required: true,
    },
    ownerReportedCurrentMileage: {
      type: Number,
      required: true,
    },
    vehicleDescription: {
      type: String,
      required: false,
    },
    vehicleColor: {
      type: String,
      enum: stdColors,
      required: true,
    },
    otherColor: {
      type: String,
      required: false,
    },
  },
  {
    /*  This option automatically creates a createdAt and updatedAt field
     *  set to UTC timezone */
    timestamps: true,
  },
);

const Vehicle = mongoose.model<IVehicleDocument>("Vehicle", VehicleSchema);

export default Vehicle;
