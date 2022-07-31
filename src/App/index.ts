import winston from "winston";
import Process from "../lib/Process";
import configureExpress from "./configureExpress";
import configureLogging from "./configureLogging";
import { configureMongoose, dbDisconnect } from "./configureMongoose";
import { Express } from "express";
import { Server } from "http";

export default class App extends Process {
  public httpServer?: Server;
  public expressApp?: Express;

  public async start(): Promise<void> {
    await super.start();

    configureLogging();
    configureMongoose();

    const { expressApp, httpServer } = configureExpress();
    this.expressApp = expressApp;
    this.httpServer = httpServer;

    const port = Number(process.env.PORT);
    this.expressApp.set("port", port);
    this.httpServer.listen(port);

    const { NODE_ENV, PACKAGE_NAME, PACKAGE_VERSION } = process.env;
    winston.info(`Starting ${PACKAGE_NAME} v${PACKAGE_VERSION} in "${NODE_ENV}" mode...`);
  }

  public async exitGracefully(signal: NodeJS.Signals, code: number): Promise<void> {
    /* Stop the app */
    winston.info(`Graceful exit triggered by ${signal} with code ${code}...`);
    this.httpServer?.close();
    await dbDisconnect();
    /* Call Process.exitGracefully() last to facilitate process.exit() */
    await super.exitGracefully(signal, code);
  }


  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public exitWithError(message: string, error?: unknown): void {
    /* Log the error */
    winston.error(`${message}: `, error);

    /* Call Process.exitWithError() last to facilitate process.exit() */
    super.exitWithError(message, error);
  }
}
