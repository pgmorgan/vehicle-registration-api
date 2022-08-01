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
import { stdColors, USAStates } from "../../lib";
import { OrderBy, OrderByDirection } from "../../lib/enums/vehicleQueryEnums";
import VehicleService from "../../services/vehicleService";
import { VehicleTransformer } from "../../transformers/VehicleTransformer";
import { injectable } from "tsyringe";
import Vehicle, { IVehicle } from "../../models/Vehicle";

/*  @TODO:  I need to add some try-catch blocks in this codebase */

export type InboundVehicleData = Omit<IVehicle, "id" | "createdAt" | "updatedAt">;

@injectable()
@Route("/v1/vehicles")
@Tags("Vehicle")
export class VehicleController extends Controller {
  constructor(
    private vehicleService: VehicleService,
    private vehicleTransformer: VehicleTransformer,
  ) {
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

    const data = vehicleResults.data.map(this.vehicleTransformer.transformOutgoing);

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
    @Query() licensePlate?: string,
    @Query() registrationNumber?: string,
    @Query() registrationState?: string,
    @Query() vinNumber?: number,
  ): Promise<IVehicle | null> {
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
    return this.vehicleTransformer.transformOutgoing(vehicleResult);
  }

  @Get("/{clientId}")
  @SuccessResponse(200)
  public async getById(@Path() clientId: string): Promise<IVehicle | null> {
    const vehicleResult = await this.vehicleService.getById(clientId);
    if (!vehicleResult) {
      this.setStatus(404);
      return;
    }
    return this.vehicleTransformer.transformOutgoing(vehicleResult);
  }

  @Post()
  @SuccessResponse(201)
  public async post(@Body() body: InboundVehicleData): Promise<void> {
    /*  tsoa does body validation for me, ensuring fields are of the correct type,
     *  no required fields are missing, and no extraneous fields are included. */

    /*  When the database save call is issued, the uniqueness constraint on vinNumber
     *  would throw an error and abort the save if the vinNumber was already registered.
     *  This is a tricky situation if a previous owner registered a vehicle on the platform.
     *  The easy solution for the new owner would be to allow immediate registration.
     *  With success of the platform in the longrun this could create many duplicate
     *  vehicles in the database.  For the purpose of this assessment I will throw an error */
    await new Vehicle(body).save();

    /*  It may be considered best practice to return some JSON payload along with the
     *  201 status code, but the content of that payload might depend on the needs of
     *  the client.  For the purpose of this assessment I will only return a status code. */
  }

  @Patch()
  @SuccessResponse(200)
  public async patch(@Path() id: string, @Body() body: Partial<InboundVehicleData>): Promise<Partial<IVehicle | null>> {
    const vehicleDocument = await this.vehicleService.putOrPatch(id, body)
    return this.vehicleTransformer.transformOutgoing(vehicleDocument);
  }

  @Put()
  @SuccessResponse(200)
  public async put(@Path() id: string, @Body() body: InboundVehicleData): Promise<IVehicle | null> {
    const vehicleDocument = await this.vehicleService.putOrPatch(id, body)
    return this.vehicleTransformer.transformOutgoing(vehicleDocument);
  }

  @Put()
  @SuccessResponse(200)
  public async archive(@Path() id: string): Promise<void> {
    const vehicleDocument = await this.vehicleService.archive(id);
    if (!vehicleDocument) {
      this.setStatus(404);
    }
  }
}
