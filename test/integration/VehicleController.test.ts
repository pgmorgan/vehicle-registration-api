import App from "../../src/App";
// import { get, post, put, patch } from "../lib/httpHelpers";
import { get, patch, post } from "../lib/httpHelpers";

let app: App;
const path = "/v1/vehicles";

beforeAll(async function foobar() {
  process.env.LOGGING_ENABLED = "true";
  process.env.LOG_LEVEL = "debug";
  process.env.PORT = "4000";
  app = new App();
  await app.start();
});

afterAll(() => {
  setTimeout(async () => {
    await app.exitGracefully("SIGTERM", 0);
  }, 1000);
});

describe("Vehicle Controller works as expected", () => {
  describe("GET by Id Vehicle Endpoint works as expected", () => {
    test("GET by Id with invalid Id should return 404", async () => {
      const response = await get(path + "/invalid_123");
      expect(response.status).toEqual(404);
    });

    test("GET by Id with valid Id should return 200", async () => {
      const response = await get(path + "/1");
      expect(response.status).toEqual(200);
    });
  });

  describe("GET one by fields Vehicle Endpoint works as expected", () => {
    test("GET inexistant document fails", async () => {
      const response = await get(path + "/find-one?registrationState=HI");
      expect(response.status).toEqual(404);
    });

    test("GET existant document succeeds", async () => {
      const response = await get(path + "/find-one?registrationState=CA");
      expect(response.status).toEqual(200);
    });
  });

  describe("POST Vehicle Endpoint works as expected", () => {
    test("POST a new valid document allows us to subsequently fetch it", async () => {
      const newVehicle = {
        vehicleId: "5",
        registration: {
          licensePlate: "678FGH",
          registrationNumber: 111111,
          registrationState: "OH",
          nameOnRegistration: "Galvatron",
        },
        vinNumber: 111111,
        ownerReportedCarValue: 1500000,
        ownerReportedCurrentMileage: 400000,
        vehicleColor: "blue",
        vehicleDescription: "",
      };

      const response = await post(path, newVehicle);
      expect(response.status).toEqual(201);

      const response2 = await get(path + "/5");
      expect(response2.status).toEqual(200);
      const jsonData = await response2.json()
      expect(jsonData?.registration?.nameOnRegistration).toEqual("Galvatron");
    });
  });

  describe("PATCH Vehicle Endpoint works as expected", () => {
    test("PATCH an existing vehicle returns a 200 response and we can identify the change", async () => {
      const modifiedField = {
        vehicleColor: "white",
      };

      const response1 = await get(path + "/1");
      const jsonData1 = await response1.json()
      expect(jsonData1?.vehicleColor).toEqual("red");
      const response2 = await patch(path + "/1", undefined, modifiedField);
      const jsonData2 = await response2.json();
      expect(jsonData2?.vehicleColor).toEqual("white");
    });
  });
});
