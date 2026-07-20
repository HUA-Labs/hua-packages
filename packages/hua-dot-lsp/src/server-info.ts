import packageManifest from "../package.json" with { type: "json" };

export const MAX_DOT_LSP_VERSION_LENGTH = 64;

const SEMVER_PATTERN =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+(?:[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/u;

export type DotLspServerInfo = Readonly<{
  name: "dot-lsp";
  version: string;
}>;

export function createDotLspServerInfo(version: unknown): DotLspServerInfo {
  if (
    typeof version !== "string" ||
    version.length === 0 ||
    version.length > MAX_DOT_LSP_VERSION_LENGTH ||
    version !== version.trim() ||
    !SEMVER_PATTERN.test(version)
  ) {
    throw new Error("DOT_LSP_MANIFEST_VERSION_INVALID");
  }

  return Object.freeze({ name: "dot-lsp", version });
}

export const DOT_LSP_SERVER_INFO = createDotLspServerInfo(
  packageManifest.version,
);
