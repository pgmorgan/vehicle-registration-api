/* eslint-disable */
module.exports = {
  collectCoverageFrom: ["src/**/*.ts", "!test"],
  restoreMocks: true,
  preset: "ts-jest",
  setupFiles: ["./test/setup.ts"],
  testEnvironment: "node",
  testPathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/node_modules/",
    "<rootDir>/test/integration/",
  ],
  watchPathIgnorePatterns: ["node_modules"],
};
