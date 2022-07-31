import mongoose from "mongoose";
import winston from "winston";

const retryAttempts = 10;

/**
 * Attempts Mongo Connection
 */
export async function dbConnect(): Promise<void> {
  winston.info("Creating new Mongo connection.");
  await dbConnectWithRetries(retryAttempts);
}

async function dbConnectWithRetries(counter: number): Promise<void> {
  try {
    await mongoose.connect(String(process.env.MONGO_CONNECTION_STRING));
    winston.info("Successfully connected to MongoDB.");
  } catch (err) {
    if (counter <= 0) {
      console.error(`Failed to connect to Mongo DB after ${retryAttempts} attempts`);
    } else {
      console.error(
        `Mongoose connection failed on attempt number ${
          retryAttempts - counter + 1
        }.  Retrying now:`,
        err,
      );
      await dbConnectWithRetries(--counter);
    }
  }
}

/**
 * Closes Database connection
 */
export async function dbDisconnect(): Promise<void> {
  await mongoose.disconnect();
}
