import "reflect-metadata";
import App from "./App/index";
import loadPackageEnv from "./lib/loadPackageEnv";
import winston from "winston";

async function init(): Promise<void> {
  loadPackageEnv();
  process.env.NODE_ENV = process.env.NODE_ENV || "development";

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
