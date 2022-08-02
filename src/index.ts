import "reflect-metadata";
import App from "./App/index";
import loadPackageEnv from "./lib/loadPackageEnv";
import winston from "winston";
import dotenv from "dotenv";

async function init(): Promise<void> {
  process.env.NODE_ENV = process.env.NODE_ENV || "development";
  if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: "./.env.test" });
  } else {
    dotenv.config();
  }

  loadPackageEnv();

  const app = new App();

  try {
    await app.start();
    winston.info(
      `[server] ${process.env.NODE_ENV} API Server is running on port: ${process.env.PORT}`,
    );
  } catch (err) {
    app.exitWithError("Error during start()", err);
  }
}

init();
