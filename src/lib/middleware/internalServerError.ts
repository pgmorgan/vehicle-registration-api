import Boom from "@hapi/boom";
import { NextFunction, Request, Response } from "express";
import { FieldErrors, ValidateError } from "tsoa";

import IErrorOutput from "../interfaces/IErrorOutput";

export interface IDebugErrorData {
  message?: string;
  stack?: string;
}

export interface IValidateErrorData {
  name?: string;
  fields?: FieldErrors;
}

export type InternalServerErrorOutput = IErrorOutput<IValidateErrorData & IDebugErrorData>;

/**
 * Note: All 4 parameters are required for the typings to detect this as the
 * express error handler
 */
export default async function internalServerError(
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
): Promise<void> {
  let errRes: InternalServerErrorOutput;

  if (err instanceof ValidateError) {
    errRes = {
      code: 400,
      message: "Bad Request",
      data: {
        fields: err.fields,
      },
    };
  } else if (err instanceof SyntaxError) {
    errRes = {
      code: 400,
      message: "Bad Request",
    };
  } else if (err.name && err.name === "ValidationError") {
    // mongoose validation error
    errRes = {
      code: 400,
      message: "Bad Request",
      data: {
        message: err.message,
        fields: err.errors,
      },
    };
  } else if (Boom.isBoom(err)) {
    errRes = {
      code: err.output.statusCode,
      message: err.message,
    };
  } else {
    errRes = {
      code: 500,
      message: "Internal Server Error",
    };
  }

  if (["development", "test"].includes(process.env.NODE_ENV)) {
    if (err.message !== undefined) {
      errRes.data = errRes.data || {};
      errRes.data.message = err.message;
    }
    if (err.stack !== undefined) {
      errRes.data = errRes.data || {};
      errRes.data.stack = err.stack;
    }
  }

  res.status(errRes.code).send(errRes);
}
