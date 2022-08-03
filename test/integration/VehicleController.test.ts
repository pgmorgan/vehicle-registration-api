import App from "../../src/App";
import { get, patch, post, put } from "../lib/httpHelpers";

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
      const response = await get(path + "/cl6e3jnxu000009mk0jlkdqqi");
      expect(response.status).toEqual(200);
    });
  });

  describe("GET one by fields Vehicle Endpoint works as expected", () => {
    test("GET inexistant document returns 404", async () => {
      const response = await get(path + "/find-one?registrationState=HI");
      expect(response.status).toEqual(404);
    });

    test("GET existing document succeeds", async () => {
      const response = await get(path + "/find-one?registrationState=CA");
      expect(response.status).toEqual(200);
    });
  });

  describe("GET many by fields Vehicle Endpoint works as expected", () => {
    test("Search query that should return no documents, returns no documents", async () => {
      const response = await get(path + "?vehicleColor=black");
      const jsonData = await response.json();
      expect(response.status).toEqual(200);
      expect(jsonData.data).toHaveLength(0);
      expect(jsonData.totalCount).toEqual(0);
    });

    test("GET existing document succeeds", async () => {
      const response = await get(path + "?ownerReportedCarValueGreaterThan=100000");
      const jsonData = await response.json();
      expect(response.status).toEqual(200);
      expect(jsonData.data).toHaveLength(2);
      expect(jsonData.totalCount).toEqual(2);
    });
  });

  describe("POST Vehicle Endpoint works as expected", () => {
    test("POST a new valid document allows us to subsequently fetch it", async () => {
      const newVehicle = {
        registration: {
          licensePlate: "678FGH",
          registrationNumber: 111111,
          registrationState: "OH",
          nameOnRegistration: "Galvatron",
        },
        vinDetails: {
          vinNumber: "1GKEV16K8LF538649",
        },
        ownerReportedCarValue: 30000,
        ownerReportedCurrentMileage: 400000,
        vehicleColor: "blue",
        vehicleDescription: "",
      };

      const response = await post(path, newVehicle);
      expect(response.status).toEqual(201);

      const response2 = await get(path + "/find-one?registrationState=OH&licensePlate=678FGH");
      expect(response2.status).toEqual(200);
      const jsonData = await response2.json();
      expect(jsonData?.registration?.nameOnRegistration).toEqual("Galvatron");
      expect(jsonData?.vinDetails?.make).toEqual("GMC");
      expect(jsonData?.vinDetails?.model).toEqual("Suburban");
      expect(jsonData?.vinDetails?.year).toEqual(1990);
    });
  });

  describe("PATCH Vehicle Endpoint works as expected", () => {
    test("PATCH an existing vehicle returns a 200 response and we can identify the change", async () => {
      const modifiedField = {
        vehicleColor: "white",
      };

      const response1 = await get(path + "/cl6e3l8us000309mk4n091675");
      const jsonData1 = await response1.json();
      expect(jsonData1?.vehicleColor).toEqual("red");
      const response2 = await patch(path + "/cl6e3l8us000309mk4n091675", undefined, modifiedField);
      const jsonData2 = await response2.json();
      expect(jsonData2?.vehicleColor).toEqual("white");
    });
  });

  describe("PUT Vehicle Endpoint works as expected", () => {
    test("PUT an existing vehicle returns a 200 response and we can identify the change", async () => {
      const modifiedVehicle = {
        vehicleId: "cl6e3jnxu000009mk0jlkdqqi",
        registration: {
          licensePlate: "345CDE",
          registrationNumber: 345678,
          registrationState: "NY",
          nameOnRegistration: "Optimus Prime",
        },
        vinDetails: {
          vinNumber: "JH4DB1650MS013392",
          make: "ACURA",
          model: "Integra",
          year: 1991,
        },
        ownerReportedCarValue: 1500000,
        ownerReportedCurrentMileage: 400000,
        vehicleColor: "other",
        otherColor: "THIS FIELD HAS BEEN MODIFIED",
        vehicleDescription: "'Til all are one.",
      };

      const response1 = await get(path + "/cl6e3jnxu000009mk0jlkdqqi");
      const jsonData1 = await response1.json();
      expect(jsonData1?.vehicleColor).toEqual("red");
      expect(jsonData1?.otherColor).toBeUndefined();
      const response2 = await put(path + "/cl6e3jnxu000009mk0jlkdqqi", undefined, modifiedVehicle);
      const jsonData2 = await response2.json();
      expect(jsonData2?.vehicleColor).toEqual("other");
      expect(jsonData2?.otherColor).toEqual("THIS FIELD HAS BEEN MODIFIED");
    });
  });

  describe("ARCHIVE Vehicle Endpoint works as expected", () => {
    test("ARCHIVE an existing vehicle returns a 200 response and we can identify the change", async () => {
      const response1 = await get(path + "/cl6e3kyye000209mk7alh40fu");
      const jsonData1 = await response1.json();
      expect(jsonData1?.archived).toBeUndefined();
      await put(path + "/archive/cl6e3kyye000209mk7alh40fu");
      const response2 = await get(path + "/cl6e3kyye000209mk7alh40fu");
      const jsonData2 = await response2.json();
      expect(jsonData2?.archived).toEqual(true);
    });
  });
});
