import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("../..", import.meta.url));

function text(relativePath) {
  return readFileSync(join(root, ...relativePath.split("/")), "utf8");
}

function manifest(relativePath) {
  return JSON.parse(text(relativePath));
}

test("the public MCP manifest preserves release fields and projects the effective Node floor", () => {
  const mcp = manifest("packages/hua-dot-mcp/package.json");
  const dot = manifest("packages/hua-dot/package.json");

  assert.equal(mcp.version, "0.1.3");
  assert.equal(mcp.dependencies["@hua-labs/dot"], "workspace:0.2.2");
  assert.equal(mcp.engines.node, ">=20.16.0");
  assert.equal(dot.engines.node, ">=20.16.0");
});

test("the projected source registers the exact six-tool surface", () => {
  const source = text("packages/hua-dot-mcp/src/index.ts");
  const names = [
    ...source.matchAll(/server\.(?:tool|registerTool)\(\s*\n?\s*["']([^"']+)["']/gu),
  ].map((match) => match[1]);

  assert.deepEqual(names, [
    "dot_resolve",
    "dot_explain",
    "dot_flutter_wire",
    "dot_complete",
    "dot_capabilities",
    "dot_validate",
  ]);
  assert.equal(new Set(names).size, names.length);
  assert.match(source, /\.object\([\s\S]*?\)\.strict\(\)/u);
});

test("manifest-derived server identity replaces the stale literal", () => {
  const source = text("packages/hua-dot-mcp/src/index.ts");
  assert.equal(
    existsSync(join(root, "packages/hua-dot-mcp/src/server-info.ts")),
    true,
  );
  assert.match(source, /new McpServer\(DOT_MCP_SERVER_INFO\)/u);
  assert.doesNotMatch(source, /version:\s*["']0\.1\.0["']/u);
});

test("Flutter wire source and focused evidence are present", () => {
  for (const relativePath of [
    "packages/hua-dot-mcp/src/flutter-wire.ts",
    "packages/hua-dot-mcp/src/__tests__/flutter-wire.test.ts",
    "packages/hua-dot-mcp/src/__tests__/server-info.test.ts",
  ]) {
    assert.equal(existsSync(join(root, relativePath)), true, relativePath);
  }
});

test("release docs bind the six tools, SDK boundary, identity, and Node floor", () => {
  const combined = [
    text("packages/hua-dot-mcp/doc.yaml"),
    text("packages/hua-dot-mcp/README.md"),
    text("packages/hua-dot-mcp/DETAILED_GUIDE.md"),
    text("ai-docs/dot-mcp.ai.yaml"),
  ].join("\n");

  for (const marker of [
    "dot_flutter_wire",
    "package-local bounded",
    "manifest-derived",
    "SDK",
  ]) {
    assert.ok(combined.includes(marker), marker);
  }
  assert.match(combined, />=20\.16\.0|Node\.js 20\.16\.0/u);
  assert.doesNotMatch(combined, /exit immediately|server crash/u);
});

test("the public pack boundary invokes a dedicated MCP authority checker", () => {
  assert.equal(
    existsSync(join(root, "config/dot-mcp-source-authority.json")),
    true,
  );
  assert.equal(
    existsSync(join(root, "scripts/check-dot-mcp-source-authority.mjs")),
    true,
  );
  assert.match(
    text("scripts/check-pack-artifacts.js"),
    /check-dot-mcp-source-authority\.mjs/u,
  );
});
