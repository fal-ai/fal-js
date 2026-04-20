import {
  buildObjectLifecycleHeaders,
  getExpirationDurationSeconds,
  OBJECT_LIFECYCYLE_PREFERENCE_HEADER,
} from "./storage";

describe("storage lifecycle settings", () => {
  it("converts expiresIn aliases to duration seconds", () => {
    expect(getExpirationDurationSeconds({ expiresIn: "1h" })).toBe(3600);
    expect(getExpirationDurationSeconds({ expiresIn: "immediate" })).toBe(60);
    expect(
      getExpirationDurationSeconds({ expiresIn: "never" }),
    ).toBeUndefined();
    expect(getExpirationDurationSeconds({ expiresIn: 120 })).toBe(120);
    expect(getExpirationDurationSeconds({})).toBeUndefined();
  });

  it("builds lifecycle headers for immediate expiration", () => {
    const headers = buildObjectLifecycleHeaders({ expiresIn: "immediate" });
    expect(headers).toEqual({
      [OBJECT_LIFECYCYLE_PREFERENCE_HEADER]: JSON.stringify({
        expiration_duration_seconds: 60,
      }),
    });
  });

  it("includes initialAcl in lifecycle headers", () => {
    const headers = buildObjectLifecycleHeaders({
      expiresIn: "immediate",
      initialAcl: {
        default: "forbid",
        rules: [{ user: "usr_123", decision: "allow" }],
      },
    });

    expect(headers).toEqual({
      [OBJECT_LIFECYCYLE_PREFERENCE_HEADER]: JSON.stringify({
        expiration_duration_seconds: 60,
        initial_acl: {
          default: "forbid",
          rules: [{ user: "usr_123", decision: "allow" }],
        },
      }),
    });
  });

  it("maps never to no expiration duration", () => {
    const headers = buildObjectLifecycleHeaders({ expiresIn: "never" });
    expect(headers).toEqual({});
  });

  it("omits lifecycle headers when no lifecycle fields are set", () => {
    expect(buildObjectLifecycleHeaders({})).toEqual({});
  });
});
