import http, { Server } from "http";
import cors from "cors";
import express, { Express } from "express";
import morgan from "morgan";
// import swaggerUi from "swagger-ui-express";
import winston from "winston";

import internalServerError from "../lib/middleware/internalServerError";
import logInternalServerError from "../lib/middleware/logInternalServerError";
import notFound from "../lib/middleware/notFound";
import * as tsoaRoutes from "./tsoaRoutes";

export default function configureExpress(bullboard?: BullBoardExpress): {
  expressApp: Express;
  httpServer: Server;
} {
  const expressApp = express();
  const httpServer = http.createServer(expressApp);

  expressApp.use(express.json({ limit: "50mb" }));
  expressApp.use(express.urlencoded({ extended: true }));

  /* istanbul ignore next */
  if (process.env.NODE_ENV === "development") {
    expressApp.use(cors());
  }

  /* istanbul ignore next */
  if (process.env.LOG_REQUESTS === "true") {
    expressApp.use(
      morgan("combined", {
        stream: {
          write: winston.info,
        },
      }),
    );
  }

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swaggerJson = require("../../build/public/swagger.json");
    expressApp.get("/api-docs/openapi.json", (_req, res) => res.send(swaggerJson));
    const swaggerOptions = {
      swaggerOptions: {
        url: "/api-docs/openapi.json",
      },
    };
    expressApp.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined, swaggerOptions));
  }

  tsoaRoutes.RegisterRoutes(expressApp);

  expressApp.use(notFound);
  expressApp.use(logInternalServerError, internalServerError);

  const { HEADERS_TIMEOUT_MS, KEEP_ALIVE_TIMEOUT_MS } = process.env;
  httpServer.keepAliveTimeout = Number(KEEP_ALIVE_TIMEOUT_MS);
  httpServer.headersTimeout = Number(HEADERS_TIMEOUT_MS);

  return { expressApp, httpServer };
}
