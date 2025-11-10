#!/usr/bin/env node

import { execSync } from "node:child_process";

const timestamp = new Date().toLocaleTimeString();
console.log(`[auto-build] Rebuilding at ${timestamp}`);

try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("[auto-build] Build completed.");
} catch (error) {
  console.error("[auto-build] Build failed:", error);
  process.exitCode = 1;
}
