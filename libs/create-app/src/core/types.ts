export const AvailableStacks = [
  "next",
  "vite",
  "remix",
  "svelte",
  "express",
] as const;

export type AvailableStack = (typeof AvailableStacks)[number];

export const PackageManagers = ["npm", "yarn", "pnpm", "bun"] as const;

export type PackageManagerId = (typeof PackageManagers)[number];

const ViewFrameworks = ["react", "vue", "svelte", "none"] as const;

export type ViewFramework = (typeof ViewFrameworks)[number];
