#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJsonPath = path.join(projectRoot, "package.json");

if (!existsSync(packageJsonPath)) {
  console.error("Run this script from a complete project checkout.");
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const [nodeMajor, nodeMinor] = process.versions.node.split(".").map(Number);

if (nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 13)) {
  console.error(
    `Node.js ${packageJson.engines?.node ?? ">=22.13.0"} is required; current version is ${process.versions.node}.`,
  );
  process.exit(1);
}

const forwardedArgs = process.argv.slice(2);
const isPreview = forwardedArgs.includes("--preview");
const vercelArgs = ["--yes", "vercel@latest", "deploy", "--yes", "--archive=tgz"];

if (!isPreview) {
  vercelArgs.push("--prod");
}

for (const argument of forwardedArgs) {
  if (argument !== "--preview") vercelArgs.push(argument);
}

if (process.env.VERCEL_TOKEN && !forwardedArgs.includes("--token")) {
  vercelArgs.push("--token", process.env.VERCEL_TOKEN);
}

console.warn(
  "Note: this project currently uses Cloudflare Vinext and D1. Its database-backed API routes require a Vercel-compatible database adapter before they will work on Vercel.",
);
console.log(`Deploying ${isPreview ? "a preview" : "to production"} with Vercel...`);

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(npxCommand, vercelArgs, {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  console.error(`Unable to start the Vercel CLI: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
