import type { StyleObject, DotOptions } from './types';

// ─── Types ──────────────────────────────────────────────────────

type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;

/** Variant definition: each key maps to named style strings */
type VariantShape = Record<string, Record<string, string>>;

/** Compound variant definition */
interface CompoundVariant<V extends VariantShape> {
  /** Conditions that must all match for this compound to apply */
  conditions: {
    [K in keyof V]?: StringToBoolean<keyof V[K]>;
  };
  /** Dot utility string to apply when conditions match */
  dot: string;
}

/** Configuration for dotVariants() */
interface DotVariantsConfig<V extends VariantShape> {
  /** Base dot utility string applied to all variants */
  base?: string;
  /** Variant definitions */
  variants?: V;
  /** Default variant values */
  defaultVariants?: {
    [K in keyof V]?: StringToBoolean<keyof V[K]>;
  };
  /** Compound variants: apply additional styles when multiple variants match */
  compoundVariants?: CompoundVariant<V>[];
}

/** Props passed to the generated variant function */
type VariantProps<V extends VariantShape> = {
  [K in keyof V]?: StringToBoolean<keyof V[K]>;
};

/** Return type of dotVariants: a callable function with a variants type helper */
interface DotVariantsFn<V extends VariantShape> {
  (props?: VariantProps<V>): StyleObject;
}

// ─── Core ───────────────────────────────────────────────────────

// dot() is injected by index.ts via _setDotFn() to avoid circular imports
let dotFn: ((input: string, options?: DotOptions) => StyleObject) | null = null;

/** @internal Used by index.ts to inject the dot function, avoiding circular import */
export function _setDotFn(fn: (input: string, options?: DotOptions) => StyleObject): void {
  dotFn = fn;
}

// Runtime config accessor injected alongside dotFn
let getRuntimeFn: (() => string) | null = null;

/** @internal Used by index.ts to inject the runtime accessor */
export function _setGetRuntime(fn: () => string): void {
  getRuntimeFn = fn;
}

function resolveDot(input: string): StyleObject {
  if (!dotFn) {
    throw new Error('[dotVariants] dot function not initialized. Import from @hua-labs/dot root.');
  }
  if (getRuntimeFn?.() === 'flutter') {
    throw new Error(
      '[dotVariants] Flutter target is not supported. FlutterRecipe uses nested objects ' +
      'that are incompatible with dotVariants\' shallow merge. Use dot(input, { target: "flutter" }) directly.',
    );
  }
  return dotFn(input) as StyleObject;
}

/**
 * Create a variant-based style function — a drop-in replacement for CVA
 * that outputs StyleObject instead of className strings.
 *
 * @example
 * const badge = dotVariants({
 *   base: 'inline-flex items-center rounded-full border px-2.5 py-0.5',
 *   variants: {
 *     variant: {
 *       default: 'bg-primary text-white',
 *       secondary: 'bg-secondary text-secondary-foreground',
 *       outline: 'border-border',
 *     },
 *     size: {
 *       sm: 'text-xs px-2 py-0.5',
 *       md: 'text-sm px-2.5 py-0.5',
 *     },
 *   },
 *   defaultVariants: { variant: 'default', size: 'md' },
 * });
 *
 * // Usage:
 * badge()                          // base + default variant + default size
 * badge({ variant: 'outline' })    // base + outline variant + default size
 */
export function dotVariants<V extends VariantShape>(
  config: DotVariantsConfig<V>,
): DotVariantsFn<V> {
  const { base, variants, defaultVariants, compoundVariants } = config;

  // Pre-compute base styles (immutable)
  const baseStyles: StyleObject = base ? resolveDot(base) : {};

  // Cache variant style resolutions
  const variantCache = new Map<string, StyleObject>();

  function resolveVariantCached(key: string): StyleObject {
    const cached = variantCache.get(key);
    if (cached) return cached;
    const result = resolveDot(key);
    variantCache.set(key, result);
    return result;
  }

  return function variantFn(props?: VariantProps<V>): StyleObject {
    const result: StyleObject = { ...baseStyles };

    if (!variants) return result;

    // Resolve each variant axis
    for (const variantKey of Object.keys(variants)) {
      const variantDef = variants[variantKey];
      // Get the selected value: props > defaultVariants > skip
      const selectedRaw = props?.[variantKey] ?? defaultVariants?.[variantKey as keyof V];
      if (selectedRaw === undefined || selectedRaw === null) continue;

      const selected = String(selectedRaw);
      const dotStr = variantDef[selected];
      if (!dotStr) continue;

      const resolved = resolveVariantCached(dotStr);
      Object.assign(result, resolved);
    }

    // Resolve compound variants
    if (compoundVariants) {
      for (const compound of compoundVariants) {
        const matches = Object.entries(compound.conditions).every(([key, condValue]) => {
          const actual = props?.[key] ?? defaultVariants?.[key as keyof V];
          return String(actual) === String(condValue);
        });

        if (matches) {
          const resolved = resolveVariantCached(compound.dot);
          Object.assign(result, resolved);
        }
      }
    }

    return result;
  };
}

// Re-export types for consumers
export type { VariantProps, DotVariantsConfig, DotVariantsFn, CompoundVariant, VariantShape };
