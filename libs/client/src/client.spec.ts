import { buildUrl } from "./client";

describe("The function test suite", () => {
  it("should build the URL with a function username/app-alias", () => {
    const alias = "fal-ai/text-to-image";
    const url = buildUrl(alias);
    expect(url).toMatch(`fal.run/${alias}`);
  });
});
