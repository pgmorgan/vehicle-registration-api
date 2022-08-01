import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Request,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import express from "express";
import IPagedOutput from "../../lib/interfaces/IPagedOutput";
import { stdColors, USAStates } from "../../lib";
import { OrderBy, OrderByDirection } from "../../lib/enums/vehicleQueryEnums";
import VehicleService from "../../services/vehicleService";
import { VehicleTransformer } from "../../transformers/VehicleTransformer";
import { injectable } from "tsyringe";
import Vehicle, { IVehicle } from "../../models/Vehicle";
import Boom from "@hapi/boom";

/*  @TODO:  I need to add some try-catch blocks in this codebase */

@injectable()
@Route("/v1/vehicles")
@Tags("Vehicle")
export class VehicleController extends Controller {
  constructor(private vehicleService: VehicleService) {
    super();
  }

  @Get()
  @SuccessResponse(200)
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
  ): Promise<IPagedOutput<IVehicle | void>> {
    const vehicleResults = await this.vehicleService.getMany(
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
    if (vehicleResults.totalCount === 0) {
      this.setStatus(404);
      return;
    }

    const vehicleTransformer = new VehicleTransformer();
    const data = vehicleResults.data
      .map(vehicleTransformer.transformOutgoing);

    return {
      data,
      page: vehicleResults.page,
      perPage: vehicleResults.perPage,
      totalCount: vehicleResults.totalCount,
    };
  }

  @Get("/find-one")
  @SuccessResponse(200)
  public async getOne(
    @Request() req: express.Request,
    @Query() licensePlate?: string,
    @Query() registrationNumber?: string,
    @Query() registrationState?: string,
    @Query() vinNumber?: number,
  ): Promise<IVehicle | void> {
    const vehicleResult = await this.vehicleService.getOne({
      licensePlate,
      registrationNumber,
      registrationState,
      vinNumber,
    });
    if (!vehicleResult) {
      this.setStatus(404);
      return;
    }

    this.setStatus(200);
    const vehicleTransformer = new VehicleTransformer();
    return vehicleTransformer.transformOutgoing(vehicleResult);
  }

  @Get("/{clientId}")
  @SuccessResponse(200)
  public async getById(
    @Request() req: express.Request,
    @Path() clientId: string,
  ): Promise<IVehicle | void> {
    const vehicleResult = await this.vehicleService.getById(clientId);
    if (!vehicleResult) {
      this.setStatus(404);
      return;
    }
    const vehicleTransformer = new VehicleTransformer();
    return vehicleTransformer.transformOutgoing(vehicleResult);
  }

  @Post()
  @SuccessResponse(201)
  public async postOne(
    @Body()  body: Omit<IVehicle, "id" | "createdAt" | "updatedAt">,
  ): Promise<void> {

    /*  A tricky situation when a previous owner registered a vehicle on the platform.
     *  The easy solution for the new owner would be to allow immediate registration.
     *  With success of the platform in the longrun this could create many duplicate
     *  vehicles in the database.  For the purpose of this assessment I will leave this to
     *  a customer support rep to remedy */
    const vehicleExists = await this.vehicleService.getOne({ vinNumber: body.vinNumber });
    if (vehicleExists) {
      throw Boom.conflict(
        "This vehicle has already been registered.  " +
          "Please make a PUT, PATCH, or DELETE call to update or remove the existing record",
      );
    }

    await new Vehicle(body).save();
  }
}
