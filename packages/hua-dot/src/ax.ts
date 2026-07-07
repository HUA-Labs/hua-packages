import { CAPABILITY_MATRIX, PROPERTY_TO_FAMILY } from "./capabilities";
import type { CapabilityLevel, DotTarget } from "./types";

export const DOT_AX_CATALOG_SCHEMA_VERSION = "dot-ax-catalog.v1";

export const DOT_AX_CATALOG_SOURCE_PACKAGE = "@hua-labs/dot";

export const DOT_AX_TARGETS = [
  "web",
  "native",
  "flutter",
] as const satisfies readonly DotTarget[];

export const DOT_AX_SURFACES = [
  "core",
  "class",
  "aot",
  "mcp",
  "lsp",
  "vscode",
  "docs",
] as const;

export type DotAxTarget = (typeof DOT_AX_TARGETS)[number];

export type DotAxSurface = (typeof DOT_AX_SURFACES)[number];

export type DotAxCategory =
  | "box-model"
  | "color"
  | "layout"
  | "typography"
  | "visual-effect"
  | "interaction"
  | "platform-detail";

export interface DotAxTargetSupport {
  readonly target: DotAxTarget;
  readonly level: CapabilityLevel;
  readonly notes?: string;
}

export type DotAxTargetSupportMap = Readonly<
  Record<DotAxTarget, DotAxTargetSupport>
>;

export type DotAxSurfaceSupportLevel =
  | "source"
  | "read-only-projection"
  | "diagnostic-projection"
  | "documentation";

export interface DotAxSurfaceSupport {
  readonly surface: DotAxSurface;
  readonly level: DotAxSurfaceSupportLevel;
  readonly notes: string;
}

export type DotAxCompositionKind = "finalized-style" | "class-child-selector";

export interface DotAxComposition {
  readonly kind: DotAxCompositionKind;
  readonly markers: readonly string[];
  readonly outputProperties: readonly string[];
  readonly notes: readonly string[];
}

export interface DotAxCatalogEntry {
  readonly id: string;
  readonly label: string;
  readonly category: DotAxCategory;
  readonly description: string;
  readonly targets: readonly DotAxTarget[];
  readonly support: DotAxTargetSupportMap;
  readonly surfaces: readonly DotAxSurfaceSupport[];
  readonly properties: readonly string[];
  readonly composition?: DotAxComposition;
  readonly examples: readonly string[];
  readonly caveats: readonly string[];
  readonly provenance: readonly string[];
}

export interface DotAxCatalog {
  readonly schemaVersion: typeof DOT_AX_CATALOG_SCHEMA_VERSION;
  readonly sourcePackage: typeof DOT_AX_CATALOG_SOURCE_PACKAGE;
  readonly targets: readonly DotAxTarget[];
  readonly surfaces: readonly DotAxSurface[];
  readonly entries: readonly DotAxCatalogEntry[];
}

const FAMILY_CATEGORIES: Record<string, DotAxCategory> = {
  spacing: "box-model",
  border: "box-model",
  borderRadius: "box-model",
  divide: "box-model",
  color: "color",
  bgClip: "color",
  gradient: "color",
  typography: "typography",
  textIndent: "typography",
  textDecorationDetail: "typography",
  textDecorationStyle: "typography",
  fontSmoothing: "typography",
  lineClamp: "typography",
  wordBreak: "typography",
  layout: "layout",
  sizing: "layout",
  flexbox: "layout",
  grid: "layout",
  display: "layout",
  visibility: "layout",
  positioning: "layout",
  zIndex: "layout",
  overflowAxis: "layout",
  float: "layout",
  table: "layout",
  list: "layout",
  scroll: "layout",
  placeAlignment: "layout",
  flexShrinkDetail: "layout",
  alignSelfDetail: "layout",
  shadow: "visual-effect",
  ring: "visual-effect",
  opacity: "visual-effect",
  transform: "visual-effect",
  transition: "visual-effect",
  animation: "visual-effect",
  filter: "visual-effect",
  backdropFilter: "visual-effect",
  mixBlendMode: "visual-effect",
  objectFit: "visual-effect",
  objectPosition: "visual-effect",
  interactivity: "interaction",
  pointerEvents: "interaction",
  touchAction: "interaction",
  willChange: "platform-detail",
  isolation: "platform-detail",
};

const FAMILY_DESCRIPTIONS: Record<string, string> = {
  spacing: "Spacing, gap, margin, and padding utility family.",
  color: "Color utility family for text, background, and border color output.",
  typography: "Text style utility family for font and text properties.",
  layout:
    "Layout utility family for display, overflow, visibility, and aspect ratio.",
  sizing: "Sizing utility family for width, height, and constraints.",
  border: "Border width, style, and color utility family.",
  borderRadius: "Border radius utility family.",
  divide:
    "Divide utility family composed through class-mode child-combinator border rules.",
  flexbox: "Flexbox layout utility family.",
  opacity: "Opacity utility family.",
  zIndex: "Stacking order utility family.",
  positioning: "Positioning utility family.",
  ring: "Ring utility family composed through an internal shadow layer before boxShadow output.",
  shadow: "Shadow utility family.",
  transform: "Transform utility family.",
  transition: "Transition utility family.",
  animation: "Animation utility family.",
  filter: "Filter utility family.",
  backdropFilter: "Backdrop filter utility family.",
  grid: "Grid utility family.",
  lineClamp: "Line clamp utility family.",
  interactivity: "Cursor, selection, and pointer interaction utility family.",
  objectFit: "Object-fit utility family.",
  objectPosition: "Object-position utility family.",
  gradient: "Gradient direction and color stop utility family.",
};

const FAMILY_EXAMPLES: Record<string, readonly string[]> = {
  spacing: ["p-4", "m-2", "gap-3"],
  color: ["bg-red-500", "text-white", "border-blue-500"],
  typography: ["text-sm", "font-bold", "leading-6"],
  layout: ["block", "hidden", "overflow-hidden"],
  sizing: ["w-full", "h-12", "max-w-lg"],
  border: ["border-2", "border-solid", "border-red-500"],
  borderRadius: ["rounded-lg"],
  divide: ["divide-y-2", "divide-gray-200"],
  flexbox: ["flex", "items-center", "justify-between"],
  opacity: ["opacity-50"],
  zIndex: ["z-10"],
  positioning: ["absolute", "top-4", "left-0"],
  shadow: ["shadow-md"],
  transform: ["rotate-45", "scale-110"],
  transition: ["transition-all"],
  animation: ["animate-pulse"],
  filter: ["blur-md"],
  backdropFilter: ["backdrop-blur-sm"],
  grid: ["grid", "grid-cols-3"],
  ring: ["ring-2"],
  lineClamp: ["line-clamp-3"],
  interactivity: ["cursor-pointer", "select-none"],
  pointerEvents: ["pointer-events-none"],
  objectFit: ["object-cover"],
  objectPosition: ["object-left-bottom"],
  gradient: ["bg-gradient-to-r", "from-red-500", "to-blue-500"],
};

const SUPPORT_NOTES: Partial<Record<CapabilityLevel, string>> = {
  native: "Target supports this family directly as style or recipe data.",
  approximate: "Target can produce a similar but not identical result.",
  "recipe-only": "Target requires structured recipe or component composition.",
  "plugin-backed":
    "Target requires an ecosystem plugin or external renderer support.",
  unsupported: "Target does not support this family through dot output.",
};

const AX_SURFACE_SUPPORT: readonly DotAxSurfaceSupport[] = Object.freeze([
  Object.freeze({
    surface: "core",
    level: "source",
    notes: "Derived from CAPABILITY_MATRIX and PROPERTY_TO_FAMILY.",
  }),
  Object.freeze({
    surface: "class",
    level: "read-only-projection",
    notes:
      "Class mode remains a CSS generation surface, not runtime target support.",
  }),
  Object.freeze({
    surface: "aot",
    level: "read-only-projection",
    notes: "AOT should mirror package-owned dot capability metadata.",
  }),
  Object.freeze({
    surface: "mcp",
    level: "read-only-projection",
    notes:
      "MCP must read package metadata instead of becoming source of truth.",
  }),
  Object.freeze({
    surface: "lsp",
    level: "diagnostic-projection",
    notes:
      "LSP diagnostics should project target caveats from package metadata.",
  }),
  Object.freeze({
    surface: "vscode",
    level: "diagnostic-projection",
    notes: "VS Code surfaces LSP diagnostics and completion guidance.",
  }),
  Object.freeze({
    surface: "docs",
    level: "documentation",
    notes:
      "Generated docs and AI guides should explain the package-owned contract.",
  }),
]);

const COMPOSED_FAMILY_METADATA: Record<string, DotAxComposition> = {
  ring: Object.freeze({
    kind: "finalized-style",
    markers: Object.freeze(["__dot_ringLayer"]),
    outputProperties: Object.freeze(["boxShadow"]),
    notes: Object.freeze([
      "Ring tokens resolve to an internal ring layer before final boxShadow composition.",
      "The CSS property lookup remains boxShadow=shadow; ring capability stays family-level metadata.",
    ]),
  }),
  divide: Object.freeze({
    kind: "class-child-selector",
    markers: Object.freeze([
      "__dot_divideX",
      "__dot_divideXReverse",
      "__dot_divideY",
      "__dot_divideYReverse",
    ]),
    outputProperties: Object.freeze([
      "borderBottomWidth",
      "borderColor",
      "borderLeftWidth",
      "borderRightWidth",
      "borderStyle",
      "borderTopWidth",
    ]),
    notes: Object.freeze([
      "Divide width and reverse tokens resolve to internal markers consumed by class-mode child-combinator CSS.",
      "Divide color tokens resolve through borderColor and are propagated to generated child rules when divide markers are present.",
    ]),
  }),
};

const COMPOSED_FAMILY_PROVENANCE: Record<string, readonly string[]> = {
  ring: Object.freeze([
    "packages/hua-dot/src/resolvers/ring.ts",
    "packages/hua-dot/src/index.ts#finalizeStyle",
    "packages/hua-dot/src/adapters/class.ts#finalizeStyle",
  ]),
  divide: Object.freeze([
    "packages/hua-dot/src/resolvers/divide.ts",
    "packages/hua-dot/src/adapters/class.ts#buildRules",
  ]),
};

const freezeReadonlyArray = <T>(items: readonly T[]): readonly T[] =>
  Object.freeze([...items]);

const titleizeFamily = (family: string): string =>
  family
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

const propertiesByFamily = Object.entries(PROPERTY_TO_FAMILY).reduce<
  Record<string, string[]>
>((acc, [property, family]) => {
  (acc[family] ??= []).push(property);
  return acc;
}, {});

const sortedPropertiesForFamily = (family: string): readonly string[] =>
  freezeReadonlyArray([...(propertiesByFamily[family] ?? [])].sort());

const buildTargetSupport = (
  family: string,
  target: DotAxTarget,
): DotAxTargetSupport => {
  const level = CAPABILITY_MATRIX[family]?.[target] ?? "unsupported";
  const note = SUPPORT_NOTES[level];
  return Object.freeze(
    note ? { target, level, notes: note } : { target, level },
  );
};

const buildSupportMap = (family: string): DotAxTargetSupportMap =>
  Object.freeze({
    web: buildTargetSupport(family, "web"),
    native: buildTargetSupport(family, "native"),
    flutter: buildTargetSupport(family, "flutter"),
  });

const buildCaveats = (support: DotAxTargetSupportMap): readonly string[] =>
  freezeReadonlyArray(
    DOT_AX_TARGETS.flatMap((target) => {
      const level = support[target].level;
      return level === "native" ? [] : [`${target}: ${level}`];
    }),
  );

const buildComposition = (family: string): DotAxComposition | undefined => {
  const composition = COMPOSED_FAMILY_METADATA[family];
  if (!composition) return undefined;
  return Object.freeze({
    kind: composition.kind,
    markers: freezeReadonlyArray(composition.markers),
    outputProperties: freezeReadonlyArray(composition.outputProperties),
    notes: freezeReadonlyArray(composition.notes),
  });
};

const buildProvenance = (family: string): readonly string[] =>
  freezeReadonlyArray([
    "packages/hua-dot/src/capabilities.ts#CAPABILITY_MATRIX",
    "packages/hua-dot/src/capabilities.ts#PROPERTY_TO_FAMILY",
    ...(COMPOSED_FAMILY_PROVENANCE[family] ?? []),
    `capability-family:${family}`,
  ]);

const buildEntry = (family: string): DotAxCatalogEntry => {
  const support = buildSupportMap(family);
  const composition = buildComposition(family);
  return Object.freeze({
    id: family,
    label: titleizeFamily(family),
    category: FAMILY_CATEGORIES[family] ?? "platform-detail",
    description:
      FAMILY_DESCRIPTIONS[family] ??
      `${titleizeFamily(family)} utility family.`,
    targets: freezeReadonlyArray(DOT_AX_TARGETS),
    support,
    surfaces: freezeReadonlyArray(AX_SURFACE_SUPPORT),
    properties: sortedPropertiesForFamily(family),
    ...(composition ? { composition } : {}),
    examples: freezeReadonlyArray(FAMILY_EXAMPLES[family] ?? []),
    caveats: buildCaveats(support),
    provenance: buildProvenance(family),
  });
};

export const dotAxCatalog = Object.freeze({
  schemaVersion: DOT_AX_CATALOG_SCHEMA_VERSION,
  sourcePackage: DOT_AX_CATALOG_SOURCE_PACKAGE,
  targets: freezeReadonlyArray(DOT_AX_TARGETS),
  surfaces: freezeReadonlyArray(DOT_AX_SURFACES),
  entries: freezeReadonlyArray(
    Object.keys(CAPABILITY_MATRIX).sort().map(buildEntry),
  ),
}) satisfies DotAxCatalog;

export function getDotAxCatalog(): DotAxCatalog {
  return dotAxCatalog;
}
