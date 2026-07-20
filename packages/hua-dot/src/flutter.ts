/**
 * Flutter recipe entry point.
 *
 * This entry produces structured recipe data. It does not provide Flutter
 * widgets, a Dart renderer, or an end-to-end Flutter runtime.
 */
import type { DotCapabilityReport, DotOptions, DotStyleMap } from "./types";
import type { FlutterRecipe } from "./adapters/flutter-types";
import {
  dot as dotCore,
  dotExplain as dotExplainCore,
  dotMap as dotMapCore,
} from "./index";

export interface FlutterDotExplainResult {
  styles: FlutterRecipe;
  report: DotCapabilityReport;
}

/** dot() pre-bound to the existing Flutter target adapter. */
export function dot(
  input: string | undefined | null,
  options?: Omit<DotOptions, "target">,
): FlutterRecipe {
  return dotCore(input, { ...options, target: "flutter" });
}

/** dotMap() pre-bound to Flutter recipe output. */
export function dotMap(
  input: string | undefined | null,
  options?: Omit<DotOptions, "target">,
): DotStyleMap<FlutterRecipe> {
  return dotMapCore(input, { ...options, target: "flutter" });
}

/** dotExplain() pre-bound to Flutter recipe and capability evidence. */
export function dotExplain(
  input: string | undefined | null,
  options?: Omit<DotOptions, "target">,
): FlutterDotExplainResult {
  return dotExplainCore(input, {
    ...options,
    target: "flutter",
  }) as FlutterDotExplainResult;
}

export {
  createDotConfig,
  clearDotCache,
  dotCx,
  semanticVars,
  adaptFlutter,
  CAPABILITY_MATRIX,
  PROPERTY_TO_FAMILY,
  getCapability,
  DOT_AX_CATALOG_SCHEMA_VERSION,
  DOT_AX_CATALOG_SOURCE_PACKAGE,
  DOT_AX_TARGETS,
  DOT_AX_SURFACES,
  dotAxCatalog,
  getDotAxCatalog,
} from "./index";

export {
  DOT_FLUTTER_RECIPE_WIRE_SCHEMA,
  DOT_FLUTTER_RECIPE_WIRE_VERSION,
  createFlutterRecipeWire,
  serializeFlutterRecipeWire,
} from "./flutter-wire";

export type {
  FlutterRecipeWireEnvelope,
  FlutterRecipeWireMetadata,
} from "./flutter-wire";

export type {
  DotToken,
  DotUserConfig,
  DotConfig,
  DotOptions,
  DotTarget,
  DotState,
  DotStyleMap,
  ResolverFn,
  ResolvedTokens,
  CapabilityLevel,
  TargetCapability,
  DotCapabilityReport,
} from "./types";

export type { AdaptFlutterOptions } from "./adapters/flutter";
export type {
  FlutterRecipe,
  FlutterDecoration,
  FlutterEdgeInsets,
  FlutterConstraints,
  FlutterLayout,
  FlutterFlexChild,
  FlutterPositioning,
  FlutterTextStyle,
  FlutterTransform,
  FlutterBoxShadow,
  FlutterBorderSide,
  FlutterBorderRadius,
  FlutterGradient,
} from "./adapters/flutter-types";

export type {
  DotAxCatalog,
  DotAxCatalogEntry,
  DotAxCategory,
  DotAxComposition,
  DotAxCompositionKind,
  DotAxSurface,
  DotAxSurfaceSupport,
  DotAxSurfaceSupportLevel,
  DotAxTarget,
  DotAxTargetSupport,
  DotAxTargetSupportMap,
} from "./ax";
