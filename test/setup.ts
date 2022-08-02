import loadPackageEnv from "../src/lib/loadPackageEnv";
import configureLogging from "../src/App/configureLogging";
import dotenv from "dotenv";

process.env.NODE_ENV = "test";
loadPackageEnv();
configureLogging();
dotenv.config({ path: "./.env.test" });
