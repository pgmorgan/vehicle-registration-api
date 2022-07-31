/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import Boom from "@hapi/boom";
import { NextFunction, Request, Response } from "express";
import { ValidateError } from "tsoa";
import winston from "winston";

/**
 * Note all 4 parameters are required for the typings to detect this as the
 * express error handler
 */
export default async function logInternalServerError(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (
    err instanceof ValidateError ||
    err instanceof SyntaxError ||
    (err.name && err.name === "ValidationError")
  ) {
    winston.warn("400 Validation Error: ", err);
  } else if (Boom.isBoom(err)) {
    const level = err.output.statusCode < 500 ? "warn" : "error";
    winston.log(level, `${err.output.statusCode} ${err.output.payload.error}: `, err);
  } else {
    winston.error("500 Internal Server Error: ", err);
  }
  next(err);
}
