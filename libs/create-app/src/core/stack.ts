import { execa } from "execa";
import { Context } from "./context";
import { AvailableStack } from "./types";

type StackInitializer = {
  id: AvailableStack;
  create: (context: Context) => Promise<void>;
  postCreate?: () => Promise<void>;
};

export const availableStacks: Record<AvailableStack, StackInitializer> = {
  next: {
    id: "next",
    create: async (context) => {
      await execa("npx", [
        "create-next-app@latest",
        context.name,
        context.typescript ? "--ts" : "--js",
        "--eslint",
        "--tailwind",
        "--app",
        "--src-dir",
        `--use-${context.packageManager}`,
      ]);
    },
  },
  vite: {
    id: "vite",
    create: async () => {
      console.log("Creating Vite app...");
    },
  },
  remix: {
    id: "remix",
    create: async () => {
      console.log("Creating Remix app...");
    },
  },
  svelte: {
    id: "svelte",
    create: async (context) => {
      await execa("npm", [
        "create",
        "svelte@latest",
        context.name,
        "--types",
        context.typescript ? "typescript" : "false",
      ]);
    },
  },
  express: {
    id: "express",
    create: async () => {
      console.log("Creating Express app...");
    },
  },
};
