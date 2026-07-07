import { getDotAxCatalog } from "@hua-labs/dot";
import type {
  CapabilityLevel,
  DotAxComposition,
  DotAxCatalogEntry,
  DotAxCategory,
  DotAxTarget,
  DotAxTargetSupport,
  DotAxTargetSupportMap,
} from "@hua-labs/dot";

export const DOT_CAPABILITY_CATEGORIES = [
  "box-model",
  "color",
  "layout",
  "typography",
  "visual-effect",
  "interaction",
  "platform-detail",
] as const satisfies readonly DotAxCategory[];

export const DOT_CAPABILITY_LEVELS = [
  "native",
  "approximate",
  "recipe-only",
  "plugin-backed",
  "unsupported",
] as const satisfies readonly CapabilityLevel[];

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export type DotCapabilityCategory = (typeof DOT_CAPABILITY_CATEGORIES)[number];

export type DotCapabilityLevel = (typeof DOT_CAPABILITY_LEVELS)[number];

export interface DotCapabilitiesArgs {
  readonly target?: DotAxTarget;
  readonly category?: DotCapabilityCategory;
  readonly level?: DotCapabilityLevel;
  readonly family?: string;
  readonly limit?: number;
  readonly includeProperties?: boolean;
  readonly includeExamples?: boolean;
  readonly includeComposition?: boolean;
}

interface DotCapabilitiesFilters {
  readonly target?: DotAxTarget;
  readonly category?: DotCapabilityCategory;
  readonly level?: DotCapabilityLevel;
  readonly family?: string;
  readonly limit: number;
  readonly includeProperties: boolean;
  readonly includeExamples: boolean;
  readonly includeComposition: boolean;
}

interface DotCapabilitiesEntry {
  readonly id: string;
  readonly label: string;
  readonly category: DotAxCategory;
  readonly description: string;
  readonly support: DotAxTargetSupport | DotAxTargetSupportMap;
  readonly caveats: readonly string[];
  readonly properties?: readonly string[];
  readonly examples?: readonly string[];
  readonly composition?: DotAxComposition;
}

export interface DotCapabilitiesResponse {
  readonly schemaVersion: string;
  readonly sourcePackage: string;
  readonly sourceExport: "getDotAxCatalog";
  readonly filters: DotCapabilitiesFilters;
  readonly totalEntries: number;
  readonly totalMatches: number;
  readonly count: number;
  readonly truncated: boolean;
  readonly targets: readonly DotAxTarget[];
  readonly surfaces: readonly string[];
  readonly entries: readonly DotCapabilitiesEntry[];
}

const clampLimit = (limit: number | undefined): number => {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
};

const normalizedFamily = (family: string | undefined): string | undefined => {
  const value = family?.trim();
  return value ? value : undefined;
};

const matchesLevel = (
  entry: DotAxCatalogEntry,
  target: DotAxTarget | undefined,
  level: DotCapabilityLevel | undefined,
): boolean => {
  if (!level) return true;
  if (target) return entry.support[target].level === level;
  return Object.values(entry.support).some(
    (support) => support.level === level,
  );
};

const matchesFilters = (
  entry: DotAxCatalogEntry,
  filters: DotCapabilitiesFilters,
): boolean => {
  return (
    (!filters.family || entry.id === filters.family) &&
    (!filters.category || entry.category === filters.category) &&
    matchesLevel(entry, filters.target, filters.level)
  );
};

const selectSupport = (
  entry: DotAxCatalogEntry,
  target: DotAxTarget | undefined,
): DotAxTargetSupport | DotAxTargetSupportMap => {
  return target ? entry.support[target] : entry.support;
};

const summarizeEntry = (
  entry: DotAxCatalogEntry,
  filters: DotCapabilitiesFilters,
): DotCapabilitiesEntry => {
  return {
    id: entry.id,
    label: entry.label,
    category: entry.category,
    description: entry.description,
    support: selectSupport(entry, filters.target),
    caveats: entry.caveats,
    ...(filters.includeProperties ? { properties: entry.properties } : {}),
    ...(filters.includeExamples ? { examples: entry.examples } : {}),
    ...(filters.includeComposition && entry.composition
      ? { composition: entry.composition }
      : {}),
  };
};

export function buildDotCapabilitiesResponse(
  args: DotCapabilitiesArgs = {},
): DotCapabilitiesResponse {
  const catalog = getDotAxCatalog();
  const filters: DotCapabilitiesFilters = {
    target: args.target,
    category: args.category,
    level: args.level,
    family: normalizedFamily(args.family),
    limit: clampLimit(args.limit),
    includeProperties: args.includeProperties ?? false,
    includeExamples: args.includeExamples ?? false,
    includeComposition: args.includeComposition ?? false,
  };
  const matches = catalog.entries.filter((entry) =>
    matchesFilters(entry, filters),
  );
  const entries = matches.slice(0, filters.limit);

  return {
    schemaVersion: catalog.schemaVersion,
    sourcePackage: catalog.sourcePackage,
    sourceExport: "getDotAxCatalog",
    filters,
    totalEntries: catalog.entries.length,
    totalMatches: matches.length,
    count: entries.length,
    truncated: matches.length > entries.length,
    targets: catalog.targets,
    surfaces: catalog.surfaces,
    entries: entries.map((entry) => summarizeEntry(entry, filters)),
  };
}
