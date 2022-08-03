/*  This file prepopulates a local test database with data for integration tests.
 *  See the script `npm run fixture` */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ObjectID: ObjectId } = require("mongodb");

module.exports = [
  {
    _id: ObjectId(),
    vehicleId: "cl6e3jnxu000009mk0jlkdqqi",
    registration: {
      licensePlate: "345CDE",
      registrationNumber: 345678,
      registrationState: "NY",
      nameOnRegistration: "Optimus Prime",
    },
    vinDetails: {
      vinNumber: "JH4DB1650MS013392",
      make: "ACURA",
      model: "Integra",
      year: 1991,
    },
    ownerReportedCarValue: 1500000,
    ownerReportedCurrentMileage: 400000,
    vehicleColor: "red",
    vehicleDescription: "'Til all are one.",
  },
  {
    _id: ObjectId(),
    vehicleId: "cl6e3kit1000109mk71mwfv85",
    registration: {
      licensePlate: "456DEF",
      registrationNumber: 987654,
      registrationState: "CA",
      nameOnRegistration: "Megatron",
    },
    vinDetails: {
      vinNumber: "5FNRL38679B039269",
      make: "HONDA",
      model: "Odyssey",
      year: 2009,
    },
    ownerReportedCarValue: 1500000,
    ownerReportedCurrentMileage: 400000,
    vehicleColor: "white",
    vehicleDescription: "Not technically a car.",
  },
  {
    _id: ObjectId(),
    vehicleId: "cl6e3kyye000209mk7alh40fu",
    registration: {
      licensePlate: "123ABC",
      registrationNumber: 654321,
      registrationState: "CA",
      nameOnRegistration: "Bumblebee",
    },
    vinDetails: {
      vinNumber: "JH4DB8580SS001230",
      make: "ACURA",
      model: "Integra",
      year: 1995,
    },
    ownerReportedCarValue: 15000,
    ownerReportedCurrentMileage: 50000,
    vehicleColor: "yellow",
    vehicleDescription: "Small but powerful.",
  },
  {
    _id: ObjectId(),
    vehicleId: "cl6e3l8us000309mk4n091675",
    registration: {
      licensePlate: "234BCD",
      registrationNumber: 765432,
      registrationState: "NB",
      nameOnRegistration: "Starscream",
    },
    vinDetails: {
      vinNumber: "SAJWA0HEXDMS56024",
      make: "JAGUAR",
      model: "XF",
      year: 2013,
    },
    ownerReportedCarValue: 20000,
    ownerReportedCurrentMileage: 30000,
    vehicleColor: "red",
    vehicleDescription: "Again, not a car.",
  },
];
