import mongoose from "mongoose";
import winston from "winston";

const retryAttempts = 10;

/**
 * Attempts Mongo Connection
 */
export async function configureMongoose(): Promise<void> {
  winston.info("Creating new Mongo connection.");
  await dbConnectWithRetries(retryAttempts);
}

async function dbConnectWithRetries(counter: number): Promise<void> {
  try {
    const { MONGO_HOST, MONGO_PORT, MONGO_DATABASE } = process.env;
    const connectionString = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`;
    await mongoose.connect(connectionString);
    winston.info("Successfully connected to MongoDB.");
  } catch (err) {
    if (counter <= 0) {
      winston.error(`Failed to connect to Mongo DB after ${retryAttempts} attempts`);
    } else {
      winston.error(
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
