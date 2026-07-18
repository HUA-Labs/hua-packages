#!/usr/bin/env node

const path = require("node:path");
const { pathToFileURL } = require("node:url");

async function main() {
  const modulePath = pathToFileURL(
    path.join(__dirname, "safe-release.mjs"),
  ).href;
  const { checkPolicyCommand } = await import(modulePath);
  const result = checkPolicyCommand(path.resolve(__dirname, ".."));
  console.log(
    `Publish policy check passed: ${result.packageCount} workspace package(s), ${result.eligibleCount} release-eligible.`,
  );
  console.log(`Policy SHA-256: ${result.policySha256}`);
}

main().catch((error) => {
  const code =
    typeof error?.code === "string" ? error.code : "publish-policy-failed";
  console.error(`Publish policy check failed: ${code}`);
  process.exitCode = 1;
});
