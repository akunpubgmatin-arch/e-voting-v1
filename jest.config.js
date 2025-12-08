module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/lib/prisma$": "<rootDir>/__mocks__/prisma.ts",
    "^@/lib/auth$": "<rootDir>/__mocks__/auth.ts",
    // Fix: Explicitly map session path to mock to prevent real file execution
    "^@/lib/auth/session$": "<rootDir>/__mocks__/auth.ts",
    "^@/(.*)$": "<rootDir>/$1",
  },
};