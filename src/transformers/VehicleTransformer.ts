import { IVehicle, IVehicleDocument } from "../models/Vehicle";

/*  The purpose for this class is if we have a transformIncoming,
 *  it can be added as a method here */

export class VehicleTransformer {

  /*  The purpsoe of this transformOutgoing method is to strip away from
   *  IVehicleDocument all of the object fields inherited from mongoose's
   *  Document interface, which the frontend doesn't need */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public transformOutgoing(data: IVehicleDocument): IVehicle {
    return {
      id: data._id,
      registration: data.registration,
      vinNumber: data.vinNumber,
      ownerReportedCarValue: data.ownerReportedCarValue,
      ownerReportedCurrentMileage: data.ownerReportedCurrentMileage,
      vehicleColor: data.vehicleColor,
      otherColor: data.otherColor,
      vehicleDescription: data.vehicleDescription,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
