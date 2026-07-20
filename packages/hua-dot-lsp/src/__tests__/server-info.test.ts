import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createDotLspServerInfo,
  DOT_LSP_SERVER_INFO,
  MAX_DOT_LSP_VERSION_LENGTH,
} from "../server-info.js";

const packageRoot = join(import.meta.dirname, "../..");
const manifest = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
) as { version: string };

describe("Dot LSP server info authority", () => {
  it("binds the frozen server identity to the producing package manifest", () => {
    expect(DOT_LSP_SERVER_INFO).toEqual({
      name: "dot-lsp",
      version: manifest.version,
    });
    expect(Object.isFrozen(DOT_LSP_SERVER_INFO)).toBe(true);
  });

  it.each(["0.1.1", "1.0.0-rc.0", "2.3.4+build.01"])(
    "admits bounded semantic version %s",
    (version) => {
      expect(createDotLspServerInfo(version)).toEqual({
        name: "dot-lsp",
        version,
      });
    },
  );

  it.each([
    undefined,
    null,
    1,
    "",
    " 0.1.1",
    "0.1.1 ",
    "01.1.1",
    "1.0",
    "1.0.0-01",
    "1.0.0/private",
    `1.0.0\nprivate`,
    `1.0.0-${"a".repeat(MAX_DOT_LSP_VERSION_LENGTH)}`,
  ])("rejects malformed or unbounded version authority %#", (version) => {
    expect(() => createDotLspServerInfo(version)).toThrowError(
      "DOT_LSP_MANIFEST_VERSION_INVALID",
    );
  });
});
