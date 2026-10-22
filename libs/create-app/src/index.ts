#!/usr/bin/env node

import { input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { execa } from "execa";
import fs from "fs";
import open from "open";
import ora from "ora";
import path from "path";
import {
  createInstallSecurity,
  FIXED_NODE_RANGE,
  requireFixedNode,
} from "./security.js";

const program = new Command();
const log = console.log;
const repoUrl = "https://github.com/fal-ai/fal-nextjs-template.git";
const green = chalk.green;
const purple = chalk.hex("#6e40c9");

async function main() {
  const spinner = ora({
    text: "Creating codebase",
  });
  let security: ReturnType<typeof createInstallSecurity> | undefined;
  try {
    requireFixedNode();
    const kebabRegez = /^([a-z]+)(-[a-z0-9]+)*$/;

    program
      .name("The fal.ai App Generator")
      .description("Generate full stack AI apps integrated with fal.ai");

    program.parse(process.argv);

    const args = program.args;
    let appName = args[0];

    if (!appName || !kebabRegez.test(args[0])) {
      appName = await input({
        message: "Enter your app name",
        default: "model-playground",
        validate: (d) => {
          if (!kebabRegez.test(d)) {
            return "please enter your app name in the format of my-app-name";
          }
          return true;
        },
      });
    }

    const hasFalEnv = await select({
      message: "Do you have a fal.ai API key?",
      choices: [
        {
          name: "Yes",
          value: true,
        },
        {
          name: "No",
          value: false,
        },
      ],
    });

    if (!hasFalEnv) {
      await open("https://www.fal.ai/dashboard");
    }

    const fal_api_key = await input({ message: "Fal AI API Key" });

    const envs = `
    # environment, either PRODUCTION or DEVELOPMENT
    ENVIRONMENT="PRODUCTION"

    # FAL AI API Key
    FAL_KEY="${fal_api_key}"
    `;

    log(`\nInitializing project. \n`);

    spinner.start();
    security = createInstallSecurity();
    await execa(
      "git",
      [
        "-c",
        "http.sslVerify=true",
        "-c",
        "http.schannelUseSSLCAInfo=true",
        "-c",
        `http.sslCAInfo=${security.gitCA}`,
        "-c",
        `http.sslCAPath=${security.empty}`,
        "clone",
        repoUrl,
        appName,
      ],
      { env: security.env },
    );

    let packageJson = fs.readFileSync(`${appName}/package.json`, "utf8");
    const packageObj = JSON.parse(packageJson);
    packageObj.name = appName;
    packageObj.engines = { ...packageObj.engines, node: FIXED_NODE_RANGE };
    packageObj.packageManager = `npm@${security.npmVersion}`;
    if (packageObj.volta?.node) packageObj.volta.node = process.versions.node;
    fs.writeFileSync(`${appName}/.node-version`, `${process.versions.node}\n`);
    if (fs.existsSync(`${appName}/.nvmrc`)) {
      fs.writeFileSync(`${appName}/.nvmrc`, `${process.versions.node}\n`);
    }
    packageJson = JSON.stringify(packageObj, null, 2);
    fs.writeFileSync(`${appName}/package.json`, packageJson);
    fs.writeFileSync(`${appName}/.env.local`, envs);

    process.chdir(path.join(process.cwd(), appName));
    await execa("rm", ["-rf", ".git"]);
    await execa("git", ["init"]);

    spinner.text = "";
    const startCommand = "npm run dev";
    spinner.text = "Installing dependencies";
    await execa(
      process.execPath,
      [
        security.npmCli,
        "install",
        "--verbose",
        "--cafile",
        security.npmCA,
        "--strict-ssl=true",
      ],
      { env: security.env },
    ).pipeStdout(process.stdout);
    spinner.text = "";

    spinner.stop();
    await execa("git", ["add", "."]);
    await execa("git", ["commit", "-m", "Initial commit"]);

    process.chdir("../");
    log(
      `${green.bold("Success!")} Created ${purple.bold(
        appName,
      )} at ${process.cwd()} \n`,
    );
    log(
      `To get started, change into the new directory and run ${chalk.cyan(
        startCommand,
      )}\n`,
    );
  } catch (err) {
    log("\n");
    log(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
    spinner.stop();
  } finally {
    security?.dispose();
  }
}

main();
