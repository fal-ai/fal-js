import { execa, execaCommand } from "execa";
import { PackageManagerId } from "./types";

export async function isCommandAvailable(command: string) {
  try {
    await execaCommand(command);
    return true;
  } catch {
    return false;
  }
}

export const isYarnInstalled = () => isCommandAvailable("yarn --version");

export const isBunInstalled = () => isCommandAvailable("bun --version");

export const isPnpmInstalled = () => isCommandAvailable("pnpm --version");

export async function resolveInstalledPackageManagers(): Promise<
  Record<PackageManagerId, boolean>
> {
  const [yarn, bun, pnpm] = await Promise.all([
    isYarnInstalled(),
    isBunInstalled(),
    isPnpmInstalled(),
  ]);
  return { npm: true, yarn, bun, pnpm };
}

interface PackageManager {
  id: PackageManagerId;
  install: () => Promise<void>;
  addDependency: (packages: string[]) => Promise<void>;
}

export function createPackageManager(id: PackageManagerId): PackageManager {
  const install = async () => {
    await execa(id, ["install"]);
  };

  const addDependency = async (packages: string[]) => {
    const installCommand = id === "npm" ? ["install", "--save"] : ["add"];
    await execa(id, [...installCommand, ...packages]);
  };

  return { id, install, addDependency };
}
