import { createConfig } from "./config";

describe("The config test suite", () => {
  it("should set the config variables accordingly", () => {
    const newConfig = {
      credentials: "key-id:key-secret",
    };
    const currentConfig = createConfig(newConfig);
    expect(currentConfig.credentials).toEqual(newConfig.credentials);
  });
});
