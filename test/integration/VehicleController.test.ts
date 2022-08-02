import App from "../../src/App";
// import { get, post, put, patch } from "../lib/httpHelpers";
import { get } from "../lib/httpHelpers";

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
  describe("GET Endpoints work as expected", () => {
    test("GET by Id with invalid Id should return 404", async () => {
      const response = await get(path + "/invalid_123");
      const jsonData = await response.json();
      expect(response.status).toEqual(404);
      expect(jsonData).toHaveProperty("code", 404);
    });
  });
});
