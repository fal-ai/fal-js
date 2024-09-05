import { AvailableStack, PackageManagerId, ViewFramework } from "./types";

export type Context = {
  name: string;
  stack: AvailableStack;
  viewFramework: ViewFramework;
  packageManager: PackageManagerId;
  typescript: boolean;
};
