import { stdColors, USAStates } from "../../../lib";

interface IVehicleResponse {
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

export default IVehicleResponse;
