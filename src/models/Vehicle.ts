import mongoose from "mongoose";
import { stdColors, USAStates } from "../lib/enums/vehicleRegistrationEnums";

export interface IRegistrationDetails {
  licensePlate: string;
  registrationNumber: number;
  registrationState: USAStates;
  nameOnRegistration: string;
}

export interface IVinDetails {
  vinNumber: string;
  make: string;
  model: string;
  year: number;
}

export interface IVehicle {
  vehicleId: string;
  registration: IRegistrationDetails;
  vinDetails: IVinDetails;
  ownerReportedCarValue: number;
  /* In a real application we could add a currency enum field */
  ownerReportedCurrentMileage: number;
  /* In a real application we could add unit of distance enum field */
  vehicleColor: stdColors;
  otherColor?: string;
  vehicleDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  archived?: boolean;
  archivedAt?: Date;
}

export interface IVehicleDocument extends IVehicle, mongoose.Document {}

const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    vinDetails: {
      vinNumber: {
        type: String,
        required: true,
        unique: true,
      },
      make: {
        type: String,
        required: false,
      },
      model: {
        type: String,
        required: false,
      },
      year: {
        type: Number,
        required: false,
      },
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
    archived: {
      type: Boolean,
      required: false,
    },
    archivedAt: {
      type: Date,
      required: false,
    }
  },
  {
    /*  This option automatically creates a createdAt and updatedAt field
     *  set to UTC timezone */
    timestamps: true,
  },
);

const Vehicle = mongoose.model<IVehicleDocument>("Vehicle", VehicleSchema);

export default Vehicle;
