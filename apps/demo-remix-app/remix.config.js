import { createWatchPaths } from '@nx/remix';

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  watchPaths: () => createWatchPaths('apps/demo-remix-app'),
};
