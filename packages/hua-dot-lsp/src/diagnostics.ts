import {
  Diagnostic,
  DiagnosticSeverity,
  Range,
} from "vscode-languageserver/node.js";
import {
  dot,
  dotExplain,
  getDotAxCatalog,
  type DotAxCatalogEntry,
  type DotTarget,
} from "@hua-labs/dot";
import { findDotRegions } from "./dot-regions.js";
import type { CompletionEntry } from "./completions.js";

const CSS_ONLY_PREFIXES = new Set([
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "hover",
  "focus",
  "active",
  "visited",
  "focus-within",
  "focus-visible",
  "disabled",
  "enabled",
  "checked",
  "indeterminate",
  "placeholder",
  "required",
  "valid",
  "invalid",
  "read-only",
  "group-hover",
  "group-focus",
  "group-active",
  "group-focus-within",
  "group-focus-visible",
  "group-disabled",
  "peer-checked",
  "peer-focus",
  "peer-hover",
  "peer-active",
  "peer-disabled",
  "peer-focus-visible",
  "peer-placeholder-shown",
  "before",
  "after",
  "first",
  "last",
  "odd",
  "even",
  "first-child",
  "last-child",
  "first-of-type",
  "last-of-type",
  "only-child",
  "empty",
  "dark",
  "motion-safe",
  "motion-reduce",
  "contrast-more",
  "contrast-less",
  "print",
  "portrait",
  "landscape",
]);

interface DotAxPropertyDiagnosticMetadata {
  readonly label: string;
  readonly category: string;
}

const dotAxCatalog = getDotAxCatalog();

const DOT_AX_PROPERTY_METADATA = new Map<
  string,
  DotAxPropertyDiagnosticMetadata
>(
  dotAxCatalog.entries.flatMap((entry: DotAxCatalogEntry) =>
    entry.properties.map(
      (property) =>
        [
          property,
          {
            label: entry.label,
            category: entry.category,
          },
        ] as const,
    ),
  ),
);

const DOT_AX_COMPOSITION_METADATA = new Map<
  string,
  DotAxPropertyDiagnosticMetadata
>(
  dotAxCatalog.entries
    .filter((entry) => entry.composition)
    .map((entry) => [
      entry.id,
      {
        label: entry.label,
        category: entry.category,
      },
    ]),
);

/**
 * Check if a token has a CSS-only variant prefix (e.g., "md:hidden", "hover:bg-red").
 * Returns the prefix if found, null otherwise.
 */
export function getCssOnlyPrefix(token: string): string | null {
  const colonIdx = token.indexOf(":");
  if (colonIdx === -1) return null;
  const prefix = token.slice(0, colonIdx);
  return CSS_ONLY_PREFIXES.has(prefix) ? prefix : null;
}

export function buildDotDiagnostics(
  text: string,
  positionAt: (offset: number) => { line: number; character: number },
  completions: CompletionEntry[],
  options: { target?: DotTarget } = {},
): Diagnostic[] {
  const regions = findDotRegions(text);
  const diagnostics: Diagnostic[] = [];
  const validLabels = new Set(completions.map((entry) => entry.label));

  for (const region of regions) {
    const tokens = region.content.trim().split(/\s+/).filter(Boolean);
    const gradientRegionCaveat = options.target
      ? getGradientRegionCaveat(region.content, options.target)
      : null;
    let gradientRegionCaveatEmitted = false;
    let searchFrom = 0;
    for (const token of tokens) {
      // Check for CSS-only prefixes in dot() (responsive, state, pseudo)
      const cssPrefix = getCssOnlyPrefix(token);
      if (cssPrefix) {
        const tokenOffset = region.content.indexOf(token, searchFrom);
        if (tokenOffset !== -1) {
          const start = positionAt(region.contentStart + tokenOffset);
          const end = positionAt(
            region.contentStart + tokenOffset + token.length,
          );
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: Range.create(start, end),
            message: `"${token}" in dot() has no effect — ${cssPrefix}: variants require dotClass() or classDot prop.`,
            source: "dot-lsp",
          });
        }
        const idx = region.content.indexOf(token, searchFrom);
        if (idx !== -1) searchFrom = idx + token.length;
        continue;
      }

      // Strip variant prefixes and !important prefix for base token validation
      let baseToken = token;
      if (baseToken.includes(":")) {
        baseToken = baseToken.split(":").pop()!;
      }
      if (baseToken.startsWith("!")) {
        baseToken = baseToken.slice(1);
      }

      if (!validLabels.has(baseToken)) {
        // Try to resolve the base token via dot()
        let resolved: Record<string, unknown> = {};
        try {
          resolved = dot(baseToken) as Record<string, unknown>;
        } catch {
          // ignore
        }
        if (Object.keys(resolved).length === 0) {
          const tokenOffset = region.content.indexOf(token, searchFrom);
          if (tokenOffset === -1) continue;
          const start = positionAt(region.contentStart + tokenOffset);
          const end = positionAt(
            region.contentStart + tokenOffset + token.length,
          );
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: Range.create(start, end),
            message: `Unknown dot utility: "${token}"`,
            source: "dot-lsp",
          });
          const idx = region.content.indexOf(token, searchFrom);
          if (idx !== -1) searchFrom = idx + token.length;
          continue;
        }
      }

      if (options.target) {
        const tokenOffset = region.content.indexOf(token, searchFrom);
        if (tokenOffset !== -1) {
          const caveat =
            gradientRegionCaveat && isGradientToken(baseToken)
              ? gradientRegionCaveatEmitted
                ? null
                : gradientRegionCaveat
              : getTargetCaveat(baseToken, options.target);
          if (caveat) {
            const start = positionAt(region.contentStart + tokenOffset);
            const end = positionAt(
              region.contentStart + tokenOffset + token.length,
            );
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: Range.create(start, end),
              message: caveat,
              source: "dot-lsp",
            });
            if (gradientRegionCaveat && isGradientToken(baseToken)) {
              gradientRegionCaveatEmitted = true;
            }
          }
        }
      }

      // Always advance searchFrom regardless of validity
      const idx = region.content.indexOf(token, searchFrom);
      if (idx !== -1) searchFrom = idx + token.length;
    }
  }

  return diagnostics;
}

function isGradientToken(token: string): boolean {
  return (
    token.startsWith("bg-gradient-to-") ||
    token.startsWith("from-") ||
    token.startsWith("via-") ||
    token.startsWith("to-")
  );
}

function getGradientRegionCaveat(
  input: string,
  target: DotTarget,
): string | null {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (!tokens.some(isGradientToken)) return null;

  const result = dotExplain(input, { target });
  const report = result.report;
  const dropped = report._dropped ?? [];
  const approximated = report._approximated ?? [];
  const capabilities = report._capabilities ?? {};
  const backgroundCapability = capabilities.backgroundImage;
  const hasBackgroundCaveat =
    dropped.includes("backgroundImage") ||
    approximated.includes("backgroundImage") ||
    (backgroundCapability && backgroundCapability !== "native");

  if (!hasBackgroundCaveat) return null;

  if (dropped.includes("backgroundImage")) {
    return `"gradient utilities" have ${target} target caveats: drops backgroundImage; capabilities ${formatCapability(
      "backgroundImage",
      backgroundCapability ?? "unsupported",
    )}.`;
  }

  if (approximated.includes("backgroundImage")) {
    return `"gradient utilities" have ${target} target caveats: approximates backgroundImage; capabilities ${formatCapability(
      "backgroundImage",
      backgroundCapability ?? "approximate",
    )}.`;
  }

  return `"gradient utilities" have ${target} capability caveats: ${formatCapability(
    "backgroundImage",
    backgroundCapability,
  )}.`;
}

function getTargetCaveat(token: string, target: DotTarget): string | null {
  const result = dotExplain(token, { target });
  const report = result.report;
  const dropped = report._dropped ?? [];
  const approximated = report._approximated ?? [];
  const capabilities = report._capabilities ?? {};
  const compositionMetadata = getCompositionDiagnosticMetadata(token);

  if (dropped.length === 0 && approximated.length === 0) {
    const nonNative = Object.entries(capabilities).filter(
      ([, level]) => level !== "native",
    );
    if (nonNative.length === 0) return null;
    return `"${token}" has ${target} capability caveats: ${formatCapabilities(
      nonNative,
      compositionMetadata,
    )}.`;
  }

  const parts: string[] = [];
  if (dropped.length > 0) {
    parts.push(
      `drops ${formatCapabilityReferences(dropped, compositionMetadata)}`,
    );
  }
  if (approximated.length > 0) {
    parts.push(
      `approximates ${formatCapabilityReferences(
        approximated,
        compositionMetadata,
      )}`,
    );
  }
  const capabilityEntries = Object.entries(capabilities).filter(
    ([property]) =>
      dropped.includes(property) || approximated.includes(property),
  );
  if (capabilityEntries.length > 0) {
    parts.push(
      `capabilities ${formatCapabilities(
        capabilityEntries,
        compositionMetadata,
      )}`,
    );
  }

  return `"${token}" has ${target} target caveats: ${parts.join("; ")}.`;
}

function getCompositionDiagnosticMetadata(
  token: string,
): DotAxPropertyDiagnosticMetadata | undefined {
  if (isRingCompositionToken(token)) {
    return DOT_AX_COMPOSITION_METADATA.get("ring");
  }

  if (isDivideCompositionToken(token)) {
    return DOT_AX_COMPOSITION_METADATA.get("divide");
  }

  return undefined;
}

function isRingCompositionToken(token: string): boolean {
  if (token === "ring" || token === "ring-inset") return true;
  if (token.startsWith("ring-offset")) return false;
  return token.startsWith("ring-");
}

function isDivideCompositionToken(token: string): boolean {
  return (
    token === "divide-x" ||
    token === "divide-y" ||
    token.startsWith("divide-x-") ||
    token.startsWith("divide-y-")
  );
}

function formatCapabilities(
  entries: Array<[string, string]>,
  preferredMetadata?: DotAxPropertyDiagnosticMetadata,
): string {
  return entries
    .map(([property, level]) =>
      formatCapability(property, level, preferredMetadata),
    )
    .join(", ");
}

function formatCapabilityReferences(
  properties: readonly string[],
  preferredMetadata?: DotAxPropertyDiagnosticMetadata,
): string {
  return properties
    .map((property) => {
      const metadata = preferredMetadata;
      if (!metadata) return property;
      return `${property} (${metadata.label}, ${metadata.category})`;
    })
    .join(", ");
}

function formatCapability(
  property: string,
  level: unknown,
  preferredMetadata?: DotAxPropertyDiagnosticMetadata,
): string {
  const metadata = preferredMetadata ?? DOT_AX_PROPERTY_METADATA.get(property);
  const formatted = `${property}=${level}`;
  if (!metadata) return formatted;
  return `${formatted} (${metadata.label}, ${metadata.category})`;
}
