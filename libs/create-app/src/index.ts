import { input, select } from "@inquirer/prompts";
import { Args, Command, Flags } from "@oclif/core";
import { Context } from "./core/context";
import {
  AvailableStacks,
  PackageManagerId,
  PackageManagers,
} from "./core/types";
import { resolveInstalledPackageManagers } from "./core/utils";

export default class CreateAppCommand extends Command {
  static args = {
    name: Args.string({ description: "Name of the app", required: false }),
  };

  static description = "Create a new app using popular frameworks + fal.ai";

  static flags = {
    stack: Flags.string({
      char: "s",
      description: "What stack to use",
      required: false,
      options: AvailableStacks,
      default: "next",
    }),
    packageManager: Flags.string({
      char: "p",
      description: "What package manager to use",
      required: false,
      options: PackageManagers,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CreateAppCommand);
    console.log(args, flags);
    console.log(AvailableStacks);

    const a = await resolveInstalledPackageManagers();
    const installedPackageManagers = Object.entries(a)
      .filter(([, value]) => value)
      .map(([key]) => key) as PackageManagerId[];

    const promptProjectName = async () =>
      input({ message: "Enter project name" });
    const name = args.name || (await promptProjectName());

    const selectPackageManager = async () =>
      select<PackageManagerId>({
        choices: installedPackageManagers as any,
        message: "Select a package manager to use",
        default: installedPackageManagers[0],
      });

    const selectedPackageManager =
      !flags.packageManager && installedPackageManagers.length > 1
        ? await selectPackageManager()
        : (flags.packageManager as PackageManagerId) ||
          installedPackageManagers[0];
    if (PackageManagers.indexOf(selectedPackageManager) === -1) {
      this.error(`Invalid package manager: ${selectedPackageManager}`);
    }
    // console.log(selectedPackageManager);
    // this.log(`hello ${args.name} from ${flags.stack}`);
    // console.log(JSON.stringify(this.config, null, 2));
    const context: Context = {
      name,
      packageManager: selectedPackageManager,
      stack: "next",
      typescript: false,
      viewFramework: "react",
    };
    console.log(context);
  }
}
