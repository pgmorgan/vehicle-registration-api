import { Controller, Get, Query, Request, Route, Tags } from "tsoa";
import express from "express";
import IPagedOutput from "../../lib/interfaces/IPagedOutput";
import IVehicleResponse from "../../lib/interfaces/responses/IVehicleResponse";
import { stdColors, USAStates } from "../../lib";
import { OrderBy, OrderByDirection } from "../../lib/enums/vehicleQueryEnums";
import VehicleService from "../../services/vehicleService";
import { VehicleTransformer } from "../../transformers/VehicleTransformer";
import { injectable } from "tsyringe";

@injectable()
@Route("/v1/vehicles")
@Tags("Vehicle")
export class VehicleController extends Controller {
  constructor(private vehicleService: VehicleService) {
    super();
  }

  @Get("/")
  public async getMany(
    @Request() req: express.Request,
    @Query() registrationStates?: USAStates[],
    @Query() nameOnRegistration?: string,
    @Query() ownerReportedCarValueGreaterThan?: number,
    @Query() ownerReportedCarValueLessThan?: number,
    @Query() ownerReportedMileageGreaterThan?: number,
    @Query() ownerReportedMileageLessThan?: number,
    @Query() vehicleColor?: stdColors | string,
    @Query() createdAfter?: Date,
    @Query() createdBefore?: Date,
    @Query() updatedAfter?: Date,
    @Query() updatedBefore?: Date,
    @Query() page?: number,
    @Query() perPage?: number,
    @Query() orderBy?: OrderBy,
    @Query() orderByDirection?: OrderByDirection,
  ): Promise<IPagedOutput<IVehicleResponse>> {
    const vehicleResults = await this.vehicleService.getVehicles(
      {
        registrationStates,
        nameOnRegistration,
        ownerReportedCarValueGreaterThan,
        ownerReportedCarValueLessThan,
        ownerReportedMileageGreaterThan,
        ownerReportedMileageLessThan,
        vehicleColor,
        createdAfter,
        createdBefore,
        updatedAfter,
        updatedBefore,
      },
      {
        page,
        perPage,
        orderBy,
        orderByDirection,
      },
    );

    const vehicleTransformer = new VehicleTransformer();
    const data = vehicleResults.data.map(vehicleTransformer.transformOutgoing);

    return {
      data,
      page: vehicleResults.page,
      perPage: vehicleResults.perPage,
      totalCount: vehicleResults.totalCount,
    }
  }
}
