import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  // Use the global setup/teardown for mongodb-memory-server
  globalSetup: "<rootDir>/src/__tests__/globalSetup.ts",
  globalTeardown: "<rootDir>/src/__tests__/globalTeardown.ts",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  // Provide the MONGODB_URI via env so setup.ts can connect
  testTimeout: 30000,
  collectCoverageFrom: [
    "src/services/**/*.ts",
    "src/middleware/**/*.ts",
    "src/lib/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  // Ignore the config/env.ts import that calls process.exit on missing env vars
  moduleNameMapper: {
    "^../config/env$": "<rootDir>/src/__tests__/mocks/env.ts",
    "^./config/env$": "<rootDir>/src/__tests__/mocks/env.ts",
  },
};

export default config;
