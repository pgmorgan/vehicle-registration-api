import Boom from "@hapi/boom";
import _ from "lodash";
import fetch from "node-fetch";
import { SortOrder } from "mongoose";
import { InboundVehicleData } from "../controllers/v1/VehicleController";
import { stdColors, USAStates } from "../lib/enums/vehicleRegistrationEnums";
import { OrderBy, OrderByDirection } from "../lib/enums/vehicleQueryEnums";
import IPagedOutput from "../lib/interfaces/IPagedOutput";
import Vehicle, { IVehicleDocument, IVinDetails } from "../models/Vehicle";
import cuid from "cuid";

const DEFAULT_PAGE_SIZE = 50;

interface INhtsaDotGovResult {
  Value: string;
  ValueId: string;
  Variable: string;
  VariableId: number;
}

export default class VehicleService {
  public async getMany(
    query: {
      registrationStates?: USAStates[];
      nameOnRegistration?: string;
      ownerReportedCarValueGreaterThan?: number;
      ownerReportedCarValueLessThan?: number;
      ownerReportedMileageGreaterThan?: number;
      ownerReportedMileageLessThan?: number;
      make?: string,
      model?: string,
      year?: string,
      vehicleColor?: stdColors | string;
      createdAfter?: Date;
      createdBefore?: Date;
      updatedAfter?: Date;
      updatedBefore?: Date;
      archived?: boolean;
    },
    options?: {
      page?: number;
      perPage?: number;
      orderBy?: OrderBy;
      orderByDirection?: OrderByDirection;
    },
  ): Promise<IPagedOutput<IVehicleDocument>> {
    const page = options?.page ?? 0;
    const perPage = options?.perPage ?? DEFAULT_PAGE_SIZE;
    const orderBy = options?.orderBy ?? OrderBy.UpdatedAt;
    const orderByDirection = options?.orderByDirection ?? OrderByDirection.ASC;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findQuery: Record<string, any> = {};

    /* I get the type checking provided by tsoa, including checking values against enums */
    this.addField(findQuery, ["registration.registrationState", "$in"], query.registrationStates);
    this.addField(findQuery, ["registration.nameOnRegistration"], query.nameOnRegistration);
    this.addField(
      findQuery,
      ["ownerReportedCarValue", "$gt"],
      query.ownerReportedCarValueGreaterThan,
    );
    this.addField(findQuery, ["ownerReportedCarValue", "$lt"], query.ownerReportedCarValueLessThan);
    this.addField(
      findQuery,
      ["ownerReportedMileage", "$gt"],
      query.ownerReportedMileageGreaterThan,
    );
    this.addField(findQuery, ["ownerReportedMileage", "$lt"], query.ownerReportedMileageLessThan);
    this.addField(findQuery, ["createdAt", "$gt"], query.createdAfter);
    this.addField(findQuery, ["createdAt", "$lt"], query.createdBefore);
    this.addField(findQuery, ["updatedAt", "$gt"], query.updatedAfter);
    this.addField(findQuery, ["updatedAt", "$lt"], query.updatedBefore);
    if (Object.values<string>(stdColors).includes(query.vehicleColor)) {
      this.addField(findQuery, ["vehicleColor"], query.vehicleColor);
    } else {
      this.addField(findQuery, ["otherColor"], query?.vehicleColor?.trim().toLowerCase());
    }
    this.addField(findQuery, ["vinDetails.make"], query.make);
    this.addField(findQuery, ["vinDetails.model"], query.model);
    this.addField(findQuery, ["vinDetails.year"], query.year);
    if (query.archived) {
      this.addField(findQuery, ["archived"], query.archived);
    } else {
      this.addField(findQuery, ["archived", "$exists"], false);
    }

    const customSort = {
      [orderBy]: orderByDirection === OrderByDirection.ASC ? (1 as SortOrder) : (-1 as SortOrder),
    };

    const vehicles = await Vehicle.find(findQuery)
      .sort(customSort)
      .skip(page * perPage)
      .limit(perPage)
      .lean();

    const totalCount = await Vehicle.count(findQuery);

    return {
      data: vehicles,
      page,
      perPage,
      totalCount,
    };
  }

  public async post(inboundVehicleData: InboundVehicleData): Promise<void> {
    const vehicle = {
      vehicleId: cuid(),
      ...inboundVehicleData,
      vinDetails: this.getVinDetails(inboundVehicleData?.vinDetails?.vinNumber)
    };

    /*  When the database save call is issued, the uniqueness constraint on vinNumber
     *  would throw an error and abort the save if the vinNumber was already registered.
     *  This is a tricky situation if a previous owner registered a vehicle on the platform.
     *  The easy solution for the new owner would be to allow immediate registration.
     *  With success of the platform in the longrun this could create many duplicate
     *  vehicles in the database.  For the purpose of this assessment I will throw an error */
    await new Vehicle(vehicle).save();
  }

  private async getVinDetails(vinNumber: string): Promise<Partial<IVinDetails>> {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vinNumber}?format=json`);
    const make: string | undefined = response?.Results?.find((obj: INhtsaDotGovResult) => obj.Variable === "Make");
    const model: string | undefined = response?.Results?.find((obj: INhtsaDotGovResult) => obj.Variable === "Model");
    const year: number | undefined = response?.Results?.find((obj: INhtsaDotGovResult) => obj.Variable === "Model Year");

    const vinDetails: Partial<IVinDetails> = Object.assign({ vinNumber },
      make ? { make } : null,
      model ? { model } : null,
      year ? { year } : null,
    );
    return vinDetails;
  }

  public async getOne(query: {
    licensePlate?: string;
    registrationNumber?: string;
    registrationState?: string;
    vinNumber?: string;
  }): Promise<IVehicleDocument | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findQuery: Record<string, any> = {};

    this.addField(findQuery, ["vinDetails.vinNumber"], query.vinNumber);
    if (
      (query.registrationNumber || query.licensePlate) &&
      !(query.registrationState && (query.registrationNumber || query.licensePlate))
    ) {
      throw new Error(
        "Incomplete search query.  State of Registration must be accompanied by Registration Number or License Plate.",
      );
    }

    this.addField(findQuery, ["registration.registrationNumber"], query.registrationNumber);
    this.addField(findQuery, ["registration.registrationState"], query.registrationState);
    this.addField(findQuery, ["registration.licensePlate"], query.licensePlate);

    const vehicle = await Vehicle.findOne(findQuery).lean();
    if (!vehicle) {
      throw Boom.notFound("Vehicle not found");
    }
    return vehicle;
  }

  public async getById(vehicleId: string): Promise<IVehicleDocument | null> {
    const vehicle = await Vehicle.findOne({ vehicleId }).lean();
    if (!vehicle) {
      throw Boom.notFound("Vehicle not found");
    }
    return vehicle;
  }

  /*  The _.merge() function allows us to use the same method for either PUT or PATCH calls.
   *  The PUT calls will require the entire vehicle body, while the PATCH calls can
   *  have a subset.  That differentiation happens at the controller level automatically by tsoa.
   *  tsoa also takes care of validating body fields to ensure no extraneous fields are inserted.
   *  Here the code is identical */
  public async putOrPatch(
    vehicleId: string,
    body: InboundVehicleData | Partial<InboundVehicleData>,
  ): Promise<IVehicleDocument | null> {
    const vehicle = Vehicle.findOneAndUpdate({ vehicleId }, body, {
      new: true,
      upsert: false,
    });

    if (!vehicle) {
      throw Boom.notFound("Vehicle not found");
    }
    return vehicle;
  }

  public async archive(vehicleId: string): Promise<void> {
    const vehicle = await Vehicle.findOneAndUpdate(
      { vehicleId },
      { $set: { archived: true, archivedAt: new Date() } },
      {
        upsert: false,
      },
    );
    if (!vehicle) {
      throw Boom.notFound("Vehicle not found");
    }
  }

  public async unarchive(vehicleId: string): Promise<void> {
    const vehicle = await Vehicle.findOneAndUpdate(
      { vehicleId },
      { $unset: { archived: 1, archivedAt: 1 } },
      {
        upsert: false,
      },
    );
    if (!vehicle) {
      throw Boom.notFound("Vehicle not found");
    }
  }

  /*  This array path syntax allows the following permutations:
   *    const obj = {};
   *    _.set(obj, ['a', 'b'], 1);    // obj = { a: { b: 1 } }
   *    _.set(obj, ['c.d'], 2);       // obj = { a: { b: 1 }, 'c.d': 2 }
   *    _.set(obj, ['a', 'e'], 3);    // obj = { a: { b: 1, e: 3 }, 'c.d': 2 }
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addField(object: Record<string, any>, path: string[], value: any) {
    value !== undefined && _.set(object, path, value);
  }
}
