/*  This file prepopulates a local test database with data for integration tests.
 *  See the script `npm run fixture` */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ObjectID: ObjectId } = require("mongodb");

module.exports = [
  {
    _id: ObjectId(),
    vehicleId: "1",
    registration: {
      licensePlate: "345CDE",
      registrationNumber: 345678,
      registrationState: "NY",
      nameOnRegistration: "Optimus Prime",
    },
    vinNumber: 876543,
    ownerReportedCarValue: 1500000,
    ownerReportedCurrentMileage: 400000,
    vehicleColor: "red",
    vehicleDescription: "'Til all are one.",
  },
  {
    _id: ObjectId(),
    vehicleId: "2",
    registration: {
      licensePlate: "456DEF",
      registrationNumber: 456789,
      registrationState: "CA",
      nameOnRegistration: "Megatron",
    },
    vinNumber: 987654,
    ownerReportedCarValue: 1500000,
    ownerReportedCurrentMileage: 400000,
    vehicleColor: "white",
    vehicleDescription: "Not technically a car.",
  },
  {
    _id: ObjectId(),
    vehicleId: "3",
    registration: {
      licensePlate: "123ABC",
      registrationNumber: 123456,
      registrationState: "CA",
      nameOnRegistration: "Bumblebee",
    },
    vinNumber: 654321,
    ownerReportedCarValue: 15000,
    ownerReportedCurrentMileage: 50000,
    vehicleColor: "yellow",
    vehicleDescription: "Volkswagen Beatle.",
  },
  {
    _id: ObjectId(),
    registration: {
      licensePlate: "234BCD",
      registrationNumber: 234567,
      registrationState: "NB",
      nameOnRegistration: "Starscream",
    },
    vinNumber: 765432,
    ownerReportedCarValue: 20000,
    ownerReportedCurrentMileage: 30000,
    vehicleColor: "red",
    vehicleDescription: "Again, not a car.",
  },
];
