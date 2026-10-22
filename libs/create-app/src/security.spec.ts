import { X509Certificate } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { rootCertificates } from "node:tls";
import {
  cleanCertificates,
  createInstallSecurity,
  isFixedNode,
} from "./security";

const affected = ["aaa.pem", "emsign-g3.pem"].map((file) =>
  fs.readFileSync(path.join(__dirname, "fixtures", file), "utf8"),
);

describe("create-app runtime and installer trust", () => {
  test.each(["22.23.4", "22.24.0", "24.22.1", "26.12.1", "27.0.0"])(
    "accepts fixed Node %s",
    (version) => {
      expect(isFixedNode(version)).toBe(true);
    },
  );
  test.each([
    "18.20.0",
    "20.20.2",
    "22.23.3",
    "24.22.0",
    "26.12.0",
    "23.5.0",
    "25.5.0",
    "invalid",
  ])("rejects unsupported Node %s", (version) => {
    expect(isFixedNode(version)).toBe(false);
  });
  it("removes both affected root families and retains unrelated trust", () => {
    const good = rootCertificates.find(
      (pem) => !new X509Certificate(pem).subject.includes("emSign"),
    );
    if (!good) throw new Error("No unrelated CA fixture");
    expect(cleanCertificates([...affected, good, good])).toEqual([
      new X509Certificate(good).toString(),
    ]);
    expect(() => cleanCertificates(["invalid certificate"])).toThrow();
  });
  it("builds an exclusive Git store and cleans up", () => {
    const security = createInstallSecurity();
    try {
      for (const file of [security.gitCA]) {
        const certs = fs
          .readFileSync(file, "utf8")
          .match(
            /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g,
          );
        if (!certs) throw new Error("No CA certificates in generated store");
        const fingerprints = certs.map(
          (pem) => new X509Certificate(pem).fingerprint256,
        );
        expect(fingerprints).not.toEqual([]);
        for (const bad of affected)
          expect(fingerprints).not.toContain(
            new X509Certificate(bad).fingerprint256,
          );
      }
      expect(fs.readdirSync(security.empty)).toEqual([]);
      expect(security.env.GIT_SSL_NO_VERIFY).toBe("false");
      expect(security.npmCli).toMatch(/npm-cli\.js$/);
    } finally {
      security.dispose();
    }
    expect(fs.existsSync(security.gitCA)).toBe(false);
  });
  it("preserves configured private CAs while overriding unsafe TLS settings", () => {
    const fixture = fs.readFileSync(
      path.join(__dirname, "fixtures", "private-test.pem"),
      "utf8",
    );
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "fal-create-app-test-"),
    );
    const bundle = path.join(directory, "custom.pem");
    fs.writeFileSync(bundle, [...affected, fixture].join("\n"));
    const security = createInstallSecurity({
      ...process.env,
      NODE_EXTRA_CA_CERTS: bundle,
      GIT_SSL_CAINFO: bundle,
      npm_config_cafile: bundle,
      GIT_SSL_NO_VERIFY: "true",
      npm_config_strict_ssl: "false",
    });
    try {
      for (const file of [security.gitCA]) {
        expect(fs.readFileSync(file, "utf8")).toContain(
          new X509Certificate(fixture).toString(),
        );
        for (const bad of affected)
          expect(fs.readFileSync(file, "utf8")).not.toContain(
            new X509Certificate(bad).toString(),
          );
      }
      expect(security.env.GIT_SSL_NO_VERIFY).toBe("false");
    } finally {
      security.dispose();
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
  it("leaves npm inline CA configuration intact and ignores missing CA directories", () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "fal-create-app-links-"),
    );
    fs.symlinkSync(
      path.join(directory, "deleted.pem"),
      path.join(directory, "dangling.pem"),
    );
    const security = createInstallSecurity({
      ...process.env,
      SSL_CERT_DIR: `${directory}${path.delimiter}${directory}/missing`,
      npm_config_ca: "custom-inline-ca",
    });
    try {
      expect(security.env.npm_config_ca).toBe("custom-inline-ca");
      expect(security.env.npm_config_cafile).toBe(
        process.env.npm_config_cafile,
      );
    } finally {
      security.dispose();
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
