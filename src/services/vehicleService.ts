import Boom from "@hapi/boom";
import _ from "lodash";
import { SortOrder } from "mongoose";
import { InboundVehicleData } from "../controllers/v1/VehicleController";
import { stdColors, USAStates } from "../lib/enums/vehicleRegistrationEnums";
import { OrderBy, OrderByDirection } from "../lib/enums/vehicleQueryEnums";
import IPagedOutput from "../lib/interfaces/IPagedOutput";
import Vehicle, { IVehicleDocument } from "../models/Vehicle";

const DEFAULT_PAGE_SIZE = 50;

export default class VehicleService {
  public async getMany(
    query: {
      registrationStates?: USAStates[];
      nameOnRegistration?: string;
      ownerReportedCarValueGreaterThan?: number;
      ownerReportedCarValueLessThan?: number;
      ownerReportedMileageGreaterThan?: number;
      ownerReportedMileageLessThan?: number;
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
    this.addField(findQuery, ["archived"], query.archived);

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

  public async getOne(query: {
    licensePlate?: string;
    registrationNumber?: string;
    registrationState?: string;
    vinNumber?: number;
  }): Promise<IVehicleDocument | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findQuery: Record<string, any> = {};

    this.addField(findQuery, ["vinNumber"], query.vinNumber);
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

    return await Vehicle.findOne(findQuery).lean();
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
    value && _.set(object, path, value);
  }
}
