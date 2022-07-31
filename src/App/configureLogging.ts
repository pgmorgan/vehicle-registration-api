import { Format, TransformableInfo } from "logform";
import winston from "winston";

/* This file contains some boilerplate code on configuring logging */

/**
 * Configure winston.
 */
export default function (): void {
  winston.configure({
    level: process.env.LOG_LEVEL,
    transports: [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL,
        format: winston.format.combine(
          winston.format.cli(), // Use colors
          winston.format.timestamp(),
          errorFormat(),
          logFormat(),
        ),
      }),
    ],
  });
}

/**
 * In the simplest case, winston sets `message` and `stack`, but when we want to
 * add more metadata we should support nesting the `error` object. Note that
 * both formats commented below can log error stack.
 *
 * ```ts
 * // Handled by winston to log message and error stack:
 * winston.error('My message', new Error('My error'));
 *
 * // Handled by this format to log message, error stack, tags and other args:
 * winston.error('My message', { error: new Error('My error'), tags: ['tag'] });
 * ```
 */
function errorFormat(): Format {
  return winston.format((info: TransformableInfo) => {
    const { error, message, stack = "", ...rest } = info;
    if (rest.level.includes("error")) {
      // Log the error stack for `error` property.
      if (error instanceof Error) {
        return {
          message: `${message} ${error.message}`,
          stack: `${stack} ${error.stack}`,
          ...rest,
        };
      } else {
        // Check whether there is an error instance using another property name,
        // and log its error stack.
        for (const key in rest) {
          if (rest[key] instanceof Error) {
            const errorStack = {
              message: `${message} ${rest[key].message}`,
              stack: `${stack} ${rest[key].stack}`,
            };
            delete rest[key];
            return {
              ...errorStack,
              ...rest,
            };
          }
        }
      }
    }
    return info;
  })();
}

/**
 * Defines the log format for winston.
 * e.g. `2020-12-16T16:29:46.876Z [info]: Starting marketplace-api v0.0.0 in
 * "development" mode... {"tags":["app.start"]}`
 */
function logFormat(): Format {
  return winston.format.printf((info: TransformableInfo) => {
    const { timestamp, level, message, ...args } = info;
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(args).length > 0 ? JSON.stringify(args) : ""
    }`;
  });
}
