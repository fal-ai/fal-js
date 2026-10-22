import { execFileSync } from "node:child_process";
import { X509Certificate } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as tls from "node:tls";

export const FIXED_NODE_RANGE = "^22.23.4 || ^24.22.1 || >=26.12.1";
const distrusted = new Set([
  "86A1ECBA089C4A8D3BBE2734C612BA341D813E043CF9E8A862CD5C57A36BBE6B",
  "D7A7A0FB5D7E2731D771E9484EBCDEF71D5F0C3E0A2948782BC83EE0EA699EF4",
  "125609AA301DA0A249B97A8239CB6A34216F44DCAC9F3954B14292F2E8C8608F",
  "BC4D809B15189D78DB3E1D8CF4F9726A795DA1643CA5F1358E1DDB0EDC0D7EB3",
]);

export function isFixedNode(version: string): boolean {
  const [major, minor, patch] = version
    .replace(/^v/, "")
    .split(".")
    .map(Number);
  if (![major, minor, patch].every(Number.isInteger)) return false;
  if (major > 26) return true;
  const minimum = new Map<number, number[]>([
    [22, [23, 4]],
    [24, [22, 1]],
    [26, [12, 1]],
  ]).get(major);
  return Boolean(
    minimum &&
      (minor > minimum[0] || (minor === minimum[0] && patch >= minimum[1])),
  );
}

export function requireFixedNode(): void {
  if (
    (process.versions as Record<string, string>).bun ||
    !isFixedNode(process.versions.node)
  ) {
    throw new Error(
      `Use fixed Node ${FIXED_NODE_RANGE} to run create-app; the runtime must be updated before any downloads.`,
    );
  }
}

export function cleanCertificates(certificates: readonly string[]): string[] {
  return [
    ...new Set(
      certificates
        .map((pem) => new X509Certificate(pem))
        .filter(
          (cert) => !distrusted.has(cert.fingerprint256.replace(/:/g, "")),
        )
        .map((cert) => cert.toString()),
    ),
  ];
}

function certificatesInFile(filename: string, required = true): string[] {
  try {
    const data = fs.readFileSync(filename);
    const pem = data
      .toString("utf8")
      .match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g);
    return pem
      ? pem.map((value) => new X509Certificate(value).toString())
      : [new X509Certificate(data).toString()];
  } catch (error) {
    if (required) throw new Error(`Invalid CA file: ${filename}`);
    return [];
  }
}

function configuredCertificates(
  env: NodeJS.ProcessEnv,
  files: string[],
  directories: string[],
): string[] {
  const certificates: string[] = [];
  for (const key of files)
    if (env[key]) certificates.push(...certificatesInFile(env[key] as string));
  for (const key of directories)
    for (const directory of (env[key] ?? "")
      .split(path.delimiter)
      .filter(Boolean)) {
      if (!fs.existsSync(directory)) continue;
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.isFile() || entry.isSymbolicLink())
          certificates.push(
            ...certificatesInFile(path.join(directory, entry.name), false),
          );
      }
    }
  return certificates;
}

export function resolveNpmCli(env: NodeJS.ProcessEnv = process.env): string {
  const fromNpm =
    env.npm_execpath && path.join(path.dirname(env.npm_execpath), "npm-cli.js");
  const candidates = [
    fromNpm,
    path.resolve(
      path.dirname(process.execPath),
      "../lib/node_modules/npm/bin/npm-cli.js",
    ),
    path.resolve(
      path.dirname(process.execPath),
      "node_modules/npm/bin/npm-cli.js",
    ),
  ];
  const cli = candidates.find(
    (candidate) => candidate && fs.existsSync(candidate),
  );
  if (!cli)
    throw new Error(
      "Launch create-app with npm/npx on fixed Node, or install npm beside that Node executable.",
    );
  return fs.realpathSync(cli);
}

export function createInstallSecurity(env: NodeJS.ProcessEnv = process.env) {
  requireFixedNode();
  const api = tls as typeof tls & {
    getCACertificates(type: "default" | "system"): string[];
  };
  const base = [
    ...api.getCACertificates("default"),
    ...api.getCACertificates("system"),
    ...configuredCertificates(
      env,
      ["SSL_CERT_FILE", "NODE_EXTRA_CA_CERTS"],
      ["SSL_CERT_DIR"],
    ),
  ];
  const npmCli = resolveNpmCli(env);
  const npmVersion: string = JSON.parse(
    fs.readFileSync(
      path.resolve(path.dirname(npmCli), "../package.json"),
      "utf8",
    ),
  ).version;
  // Preserve the Git configuration before overriding its CA file.
  let gitCAFile = "";
  try {
    gitCAFile = execFileSync(
      "git",
      [
        "config",
        "--path",
        "--get-urlmatch",
        "http.sslCAInfo",
        "https://github.com/fal-ai/fal-nextjs-template.git",
      ],
      { env, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch (error) {
    if ((error as { status?: number }).status !== 1) throw error;
  }
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "fal-create-app-ca-"),
  );
  const empty = path.join(directory, "empty");
  fs.mkdirSync(empty);
  try {
    const store = (name: string, extra: string[]) => {
      const certificates = cleanCertificates([...base, ...extra]);
      if (!certificates.length)
        throw new Error("The configured CA store has no trusted certificates");
      const filename = path.join(directory, name);
      fs.writeFileSync(filename, certificates.join("\n") + "\n", {
        mode: 0o600,
      });
      return filename;
    };
    const gitCA = store("git.pem", [
      ...configuredCertificates(
        env,
        ["GIT_SSL_CAINFO", "CURL_CA_BUNDLE"],
        ["GIT_SSL_CAPATH"],
      ),
      ...(gitCAFile ? certificatesInFile(gitCAFile) : []),
    ]);
    return {
      npmCli,
      npmVersion,
      gitCA,
      empty,
      env: {
        ...env,
        PATH: `${path.dirname(process.execPath)}${path.delimiter}${env.PATH ?? ""}`,
        NODE_TLS_REJECT_UNAUTHORIZED: "1",
        GIT_SSL_CAINFO: gitCA,
        GIT_SSL_CAPATH: empty,
        GIT_SSL_NO_VERIFY: "false",
      } as NodeJS.ProcessEnv,
      dispose: () => fs.rmSync(directory, { recursive: true, force: true }),
    };
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    throw error;
  }
}
