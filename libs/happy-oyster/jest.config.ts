export default {
  displayName: "happy-oyster",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleNameMapper: {
    "^@fal-ai/client/realtime$": "<rootDir>/../client/src/realtime/index.ts",
  },
  moduleFileExtensions: ["ts", "js"],
};
