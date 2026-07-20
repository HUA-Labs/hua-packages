import { dotExplain } from "./index";
import type { FlutterRecipe } from "./adapters/flutter-types";
import type { CapabilityLevel, DotCapabilityReport, DotOptions } from "./types";

export const DOT_FLUTTER_RECIPE_WIRE_SCHEMA = "hua.dot.flutter.recipe" as const;
export const DOT_FLUTTER_RECIPE_WIRE_VERSION = 1 as const;

/** JSON-safe capability evidence retained alongside a Flutter recipe. */
export interface FlutterRecipeWireMetadata {
  dropped: string[];
  approximated: string[];
  capabilities: Record<string, CapabilityLevel>;
  details: Record<string, string[]>;
}

/**
 * Versioned wire envelope produced by `@hua-labs/dot/flutter`.
 *
 * This is recipe data for a future Dart consumer. It is not a Flutter widget,
 * renderer, or proof that a Dart runtime consumed the recipe.
 */
export interface FlutterRecipeWireEnvelope {
  schema: typeof DOT_FLUTTER_RECIPE_WIRE_SCHEMA;
  version: typeof DOT_FLUTTER_RECIPE_WIRE_VERSION;
  target: "flutter";
  recipe: FlutterRecipe;
  metadata: FlutterRecipeWireMetadata;
}

function copyReport(report: DotCapabilityReport): FlutterRecipeWireMetadata {
  return {
    dropped: [...(report._dropped ?? [])],
    approximated: [...(report._approximated ?? [])],
    capabilities: { ...(report._capabilities ?? {}) },
    details: Object.fromEntries(
      Object.entries(report._details ?? {}).map(([key, values]) => [
        key,
        [...values],
      ]),
    ),
  };
}

/** Create a versioned Flutter recipe envelope from the existing dot pipeline. */
export function createFlutterRecipeWire(
  input: string | undefined | null,
  options?: Omit<DotOptions, "target">,
): FlutterRecipeWireEnvelope {
  const explained = dotExplain(input, { ...options, target: "flutter" });

  return {
    schema: DOT_FLUTTER_RECIPE_WIRE_SCHEMA,
    version: DOT_FLUTTER_RECIPE_WIRE_VERSION,
    target: "flutter",
    recipe: snapshotWireData(explained.styles) as FlutterRecipe,
    metadata: copyReport(explained.report),
  };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function isCanonicalArrayIndex(key: string): boolean {
  const index = Number(key);
  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index < 2 ** 32 - 1 &&
    String(index) === key
  );
}

function assertEnvelope(
  value: unknown,
): asserts value is FlutterRecipeWireEnvelope {
  const capabilityLevels = new Set<CapabilityLevel>([
    "native",
    "approximate",
    "recipe-only",
    "plugin-backed",
    "unsupported",
  ]);
  if (
    !isPlainRecord(value) ||
    !hasExactKeys(value, [
      "schema",
      "version",
      "target",
      "recipe",
      "metadata",
    ]) ||
    value.schema !== DOT_FLUTTER_RECIPE_WIRE_SCHEMA ||
    value.version !== DOT_FLUTTER_RECIPE_WIRE_VERSION ||
    value.target !== "flutter" ||
    !isPlainRecord(value.recipe) ||
    !isPlainRecord(value.metadata) ||
    !hasExactKeys(value.metadata, [
      "dropped",
      "approximated",
      "capabilities",
      "details",
    ]) ||
    !Array.isArray(value.metadata.dropped) ||
    !Array.isArray(value.metadata.approximated) ||
    !isPlainRecord(value.metadata.capabilities) ||
    !isPlainRecord(value.metadata.details) ||
    value.metadata.dropped.some((entry) => typeof entry !== "string") ||
    value.metadata.approximated.some((entry) => typeof entry !== "string") ||
    Object.values(value.metadata.capabilities).some(
      (entry) =>
        typeof entry !== "string" ||
        !capabilityLevels.has(entry as CapabilityLevel),
    ) ||
    Object.values(value.metadata.details).some(
      (entry) =>
        !Array.isArray(entry) ||
        entry.some((detail) => typeof detail !== "string"),
    )
  ) {
    throw new TypeError("Invalid Flutter recipe wire envelope");
  }
}

function canonicalizeJson(value: unknown, ancestors: Set<object>): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Flutter recipe wire values must be JSON-safe");
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (ancestors.has(value)) {
      throw new TypeError("Flutter recipe wire values must be JSON-safe");
    }
    ancestors.add(value);
    try {
      const ownKeys = Reflect.ownKeys(value);
      const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
      if (
        !lengthDescriptor ||
        !("value" in lengthDescriptor) ||
        lengthDescriptor.enumerable ||
        typeof lengthDescriptor.value !== "number" ||
        !Number.isInteger(lengthDescriptor.value) ||
        lengthDescriptor.value < 0 ||
        lengthDescriptor.value > 2 ** 32 - 1
      ) {
        throw new TypeError("Flutter recipe wire values must be JSON-safe");
      }
      const length = lengthDescriptor.value;
      const indexKeys = ownKeys.filter(
        (key): key is string => typeof key === "string" && key !== "length",
      );
      const indexKeySet = new Set(indexKeys);
      if (
        ownKeys.some(
          (key) =>
            key !== "length" &&
            (typeof key !== "string" || !isCanonicalArrayIndex(key)),
        ) ||
        indexKeys.length !== length ||
        indexKeySet.size !== length
      ) {
        throw new TypeError("Flutter recipe wire values must be JSON-safe");
      }
      for (let index = 0; index < length; index += 1) {
        if (!indexKeySet.has(String(index))) {
          throw new TypeError("Flutter recipe wire values must be JSON-safe");
        }
      }
      const result: unknown[] = [];
      for (let index = 0; index < length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(
          value,
          String(index),
        );
        if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
          throw new TypeError("Flutter recipe wire values must be JSON-safe");
        }
        result.push(canonicalizeJson(descriptor.value, ancestors));
      }
      return result;
    } finally {
      ancestors.delete(value);
    }
  }
  if (!isPlainRecord(value)) {
    throw new TypeError("Flutter recipe wire values must be JSON-safe");
  }
  if (ancestors.has(value)) {
    throw new TypeError("Flutter recipe wire values must be JSON-safe");
  }

  ancestors.add(value);
  try {
    const result = Object.create(null) as Record<string, unknown>;
    const keys = Reflect.ownKeys(value);
    if (keys.some((key) => typeof key !== "string")) {
      throw new TypeError("Flutter recipe wire values must be JSON-safe");
    }
    for (const key of (keys as string[]).sort()) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
        throw new TypeError("Flutter recipe wire values must be JSON-safe");
      }
      Object.defineProperty(result, key, {
        value: canonicalizeJson(descriptor.value, ancestors),
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
    return result;
  } finally {
    ancestors.delete(value);
  }
}

function snapshotWireData<T>(value: T): T {
  try {
    return canonicalizeJson(value, new Set<object>()) as T;
  } catch {
    throw new TypeError("Flutter recipe wire values must be JSON-safe");
  }
}

/** Serialize an exact v1 envelope to deterministic canonical JSON bytes. */
export function serializeFlutterRecipeWire(
  envelope: FlutterRecipeWireEnvelope,
): string {
  let canonical: unknown;
  try {
    canonical = canonicalizeJson(envelope, new Set<object>());
  } catch {
    throw new TypeError("Flutter recipe wire values must be JSON-safe");
  }
  assertEnvelope(canonical);
  return JSON.stringify(canonical);
}
