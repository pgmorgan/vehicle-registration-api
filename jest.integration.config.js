/* eslint-disable */
module.exports = {
  ...require("./jest.config.js"),
  testPathIgnorePatterns: [
    "./dist/",
    "./node_modules/",
    "./test/unit/",
  ],
};
