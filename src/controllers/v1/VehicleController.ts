import {
  Body,
  Controller,
  Get,
  Patch,
  Path,
  Post,
  Put,
  Query,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import IPagedOutput from "../../lib/interfaces/IPagedOutput";
import { stdColors, USAStates } from "../../lib/enums/vehicleRegistrationEnums";
import { OrderBy, OrderByDirection } from "../../lib/enums/vehicleQueryEnums";
import VehicleService from "../../services/vehicleService";
import { injectable } from "tsyringe";
import { IVehicle } from "../../models/Vehicle";

export type InboundVehicleData = Omit<
  IVehicle,
  "vehicleId" | "createdAt" | "updatedAt" | "vinDetails"
> & { vinDetails: { vinNumber: string }};

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
    @Query() registrationStates?: USAStates[],
    @Query() nameOnRegistration?: string,
    @Query() ownerReportedCarValueGreaterThan?: number,
    @Query() ownerReportedCarValueLessThan?: number,
    @Query() ownerReportedMileageGreaterThan?: number,
    @Query() ownerReportedMileageLessThan?: number,
    @Query() make?: string,
    @Query() model?: string,
    @Query() year?: string,
    @Query() vehicleColor?: stdColors | string,
    @Query() createdAfter?: Date,
    @Query() createdBefore?: Date,
    @Query() updatedAfter?: Date,
    @Query() updatedBefore?: Date,
    @Query() page?: number,
    @Query() perPage?: number,
    @Query() orderBy?: OrderBy,
    @Query() orderByDirection?: OrderByDirection,
  ): Promise<IPagedOutput<IVehicle>> {
    return await this.vehicleService.getMany(
      {
        registrationStates,
        nameOnRegistration,
        ownerReportedCarValueGreaterThan,
        ownerReportedCarValueLessThan,
        ownerReportedMileageGreaterThan,
        ownerReportedMileageLessThan,
        make,
        model,
        year,
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
  }

  @Get("/find-one")
  @SuccessResponse(200)
  public async getOne(
    @Query() licensePlate?: string,
    @Query() registrationNumber?: string,
    @Query() registrationState?: string,
    @Query() vinNumber?: string,
  ): Promise<IVehicle | null> {
    return await this.vehicleService.getOne({
      licensePlate,
      registrationNumber,
      registrationState,
      vinNumber,
    });
  }

  @Get("/{vehicleId}")
  @SuccessResponse(200)
  public async getById(@Path() vehicleId: string): Promise<IVehicle | null> {
    return await this.vehicleService.getById(vehicleId);
  }

  @Post()
  @SuccessResponse(201)
  public async post(@Body() body: InboundVehicleData): Promise<void> {
    /*  tsoa does body validation for me, ensuring fields are of the correct type,
     *  no required fields are missing, and no extraneous fields are included. */
    await this.vehicleService.post(body);

    /*  It may be considered best practice to return some JSON payload along with the
     *  201 status code, but the content of that payload might depend on the needs of
     *  the client.  For the purpose of this assessment I will only return a status code. */
  }

  @Patch("/{vehicleId}")
  @SuccessResponse(200)
  public async patch(
    @Path() vehicleId: string,
    @Body() body: Partial<InboundVehicleData>,
  ): Promise<Partial<IVehicle | null>> {
    return await this.vehicleService.putOrPatch(vehicleId, body);
  }

  @Put("/{vehicleId}")
  @SuccessResponse(200)
  public async put(
    @Path() vehicleId: string,
    @Body() body: InboundVehicleData,
  ): Promise<IVehicle | null> {
    return await this.vehicleService.putOrPatch(vehicleId, body);
  }

  @Put("/archive/{vehicleId}")
  @SuccessResponse(200)
  public async archive(@Path() vehicleId: string): Promise<void> {
    await this.vehicleService.archive(vehicleId);
  }

  @Put("/unarchive/{vehicleId}")
  @SuccessResponse(200)
  public async unarchive(@Path() vehicleId: string): Promise<void> {
    await this.vehicleService.unarchive(vehicleId);
  }
}
