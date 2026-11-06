import assert from "node:assert/strict";
import fs from "node:fs";
import https from "node:https";
import { createInstallSecurity } from "../dist/libs/create-app/src/security.js";

const bad = [
  "https://dv-g3b-emudhra.we-have-a-problem.com/",
  "https://dv-g3b-aaa-emudhra.we-have-a-problem.com/",
];
const certificateErrors = new Set([
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "CERT_UNTRUSTED",
  "CERT_REVOKED",
  "SELF_SIGNED_CERT_IN_CHAIN",
]);
function request(url, ca) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { ca, rejectUnauthorized: true, timeout: 60000 },
      (response) => {
        response.resume();
        resolve(response.statusCode);
      },
    );
    req.on("error", reject);
    req.on("timeout", () =>
      req.destroy(new Error("HTTPS timeout is inconclusive")),
    );
  });
}
const security = createInstallSecurity();
try {
  for (const [label, file] of [
    ["Node default", undefined],
    ["Git CA fixture", security.gitCA],
  ]) {
    const ca = file && fs.readFileSync(file);
    for (const url of bad) {
      await assert.rejects(
        request(url, ca),
        (error) => certificateErrors.has(error.code),
        `${label} must reject ${url} with a certificate error`,
      );
      console.log(`PASS ${label}: rejected ${url}`);
    }
    assert.equal(await request("https://example.com/", ca), 200);
    console.log(`PASS ${label}: legitimate HTTPS`);
  }
  console.log(
    `Node ${process.versions.node}; npm ${security.npmVersion}; npm executable ${security.npmCli}`,
  );
} finally {
  security.dispose();
}
