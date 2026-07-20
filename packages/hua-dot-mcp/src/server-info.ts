import packageManifest from "../package.json";

export const MAX_DOT_MCP_VERSION_LENGTH = 64;

const SEMVER_PATTERN =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+(?:[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/u;

export type DotMcpServerInfo = Readonly<{
  name: "dot-mcp";
  version: string;
}>;

export function createDotMcpServerInfo(version: unknown): DotMcpServerInfo {
  if (
    typeof version !== "string" ||
    version.length === 0 ||
    version.length > MAX_DOT_MCP_VERSION_LENGTH ||
    version !== version.trim() ||
    !SEMVER_PATTERN.test(version)
  ) {
    throw new Error("DOT_MCP_MANIFEST_VERSION_INVALID");
  }

  return Object.freeze({ name: "dot-mcp", version });
}

export const DOT_MCP_SERVER_INFO = createDotMcpServerInfo(
  packageManifest.version,
);
