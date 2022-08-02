import "reflect-metadata";
import App from "./App/index";
import { config as dotenvCraConfig } from "dotenv-cra";
import loadPackageEnv from "./lib/loadPackageEnv";
import winston from "winston";

async function init(): Promise<void> {
  process.env.NODE_ENV = process.env.NODE_ENV || "development";
  dotenvCraConfig({ env: process.env.NODE_ENV });
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
