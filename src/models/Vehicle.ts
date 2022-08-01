import mongoose from "mongoose";
import { stdColors, USAStates } from "../lib/enums/vehicleRegistrationEnums";

export interface IRegistrationDetails {
  licensePlate: string;
  registrationNumber: number;
  registrationState: USAStates;
  nameOnRegistration: string;
}

export interface IVehicle {
  id: string;
  registration: IRegistrationDetails;
  vinNumber: number;
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

export interface IVehicleDocument extends Omit<IVehicle, "id">, mongoose.Document {}

const VehicleSchema = new mongoose.Schema(
  {
    /*  Mongo generates its own `_id` field per document, so I do not need
     *  to manually create one. Furthermore this `_id` field is automatically
     *  indexed, so I won't add additional indices. */

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
      unique: true,
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
