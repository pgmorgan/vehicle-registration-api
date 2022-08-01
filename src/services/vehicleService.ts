import _ from "lodash";
import { SortOrder } from "mongoose";
import { stdColors, USAStates } from "../lib";
import { OrderBy, OrderByDirection } from "../lib/enums/vehicleQueryEnums";
import IPagedOutput from "../lib/interfaces/IPagedOutput";
import Vehicle, { IVehicleDocument } from "../models/Vehicle";

const DEFAULT_PAGE_SIZE = 50;

export default class VehicleService {
  public async getManyVehicles(
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
      page?: number;
      perPage?: number;
      orderBy?: OrderBy;
      orderByDirection?: OrderByDirection;
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

  public async getOneVehicle(query: {
    licensePlate?: string;
    registrationNumber?: string;
    registrationState?: string;
    vinNumber?: number;
  }): Promise<IVehicleDocument> {
    const findQuery: Record<string, any> = {};

    this.addField(findQuery, ["registration.licensePlate"], query.licensePlate);
    this.addField(findQuery, ["vinNumber"], query.vinNumber);
    if (query.registrationNumber && query.registrationState) {
      this.addField(findQuery, ["registration.registrationNumber"], query.registrationNumber);
      this.addField(findQuery, ["registration.registrationState"], query.registrationState);
    } else if (query.registrationNumber || query.registrationState) {
      throw new Error(
        "Incomplete search query.  State of Registration must be accompanied by Registration Number and vice versa.",
      );
    }

    return await Vehicle.findOne(findQuery).lean();
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
