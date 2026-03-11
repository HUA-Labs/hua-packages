import type { StyleObject, DotToken, DotConfig } from "../types";
import { parse } from "../parser";
import { resolveToken } from "../resolver";
import { getGlobalConfig } from "../config";

// ── Types ──

export interface DotClassOptions {
  /** Class naming strategy. Default: 'hash' */
  naming?: "hash" | "atomic";
  /** Dark mode strategy. Default: 'class' (.dark ancestor) */
  darkMode?: "class" | "media";
}

export interface DotClassResult {
  /** Generated class name(s) */
  className: string;
  /** Generated CSS rules */
  css: string;
}

// ── Selector Map ──

type SelectorBuilder = (cls: string) => string;

const SELECTOR_MAP: Record<string, SelectorBuilder> = {
  // State pseudo-classes
  hover: (cls) => `.${cls}:hover`,
  focus: (cls) => `.${cls}:focus`,
  active: (cls) => `.${cls}:active`,
  "focus-visible": (cls) => `.${cls}:focus-visible`,
  "focus-within": (cls) => `.${cls}:focus-within`,
  disabled: (cls) => `.${cls}:disabled`,

  // Group variants
  "group-hover": (cls) => `.group:hover .${cls}`,
  "group-focus": (cls) => `.group:focus .${cls}`,
  "group-active": (cls) => `.group:active .${cls}`,

  // Peer variants
  "peer-checked": (cls) => `.peer:checked ~ .${cls}`,
  "peer-focus": (cls) => `.peer:focus ~ .${cls}`,
  "peer-hover": (cls) => `.peer:hover ~ .${cls}`,
  "peer-disabled": (cls) => `.peer:disabled ~ .${cls}`,

  // Child position pseudo-classes
  first: (cls) => `.${cls}:first-child`,
  last: (cls) => `.${cls}:last-child`,
  odd: (cls) => `.${cls}:nth-child(odd)`,
  even: (cls) => `.${cls}:nth-child(even)`,
  "first-of-type": (cls) => `.${cls}:first-of-type`,
  "last-of-type": (cls) => `.${cls}:last-of-type`,
  only: (cls) => `.${cls}:only-child`,

  // Pseudo-elements
  before: (cls) => `.${cls}::before`,
  after: (cls) => `.${cls}::after`,
  placeholder: (cls) => `.${cls}::placeholder`,
};

// ── (Breakpoint widths now come from config.breakpointWidths) ──

// ── Helpers ──

/** Convert camelCase to kebab-case */
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** Convert StyleObject to CSS declaration block */
function styleToDeclarations(style: StyleObject): string {
  const decls: string[] = [];
  for (const [key, value] of Object.entries(style)) {
    decls.push(`${camelToKebab(key)}: ${value}`);
  }
  return decls.join("; ");
}

/** Simple hash function for class naming */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

/** Sanitize a token string for use as a CSS class name segment */
function tokenToClassName(raw: string): string {
  return raw
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Internal state ──

/** Collected CSS rules (for flush) */
const collectedRules: string[] = [];

/** Track emitted atomic class names to avoid duplicate CSS in collectedRules */
const emittedAtomicClasses = new Set<string>();

/** Cache: input string → DotClassResult */
const classCache = new Map<string, DotClassResult>();

// ── Shadow/Gradient finalization (mirrored from index.ts for standalone use) ──

const ACCUMULATE_KEYS = new Set(["transform", "filter", "backdropFilter"]);
const SHADOW_LAYER_KEYS = new Set(["__dot_shadowLayer", "__dot_ringLayer"]);
const GRADIENT_KEYS = new Set([
  "__dot_gradientDirection",
  "__dot_gradientFrom",
  "__dot_gradientFromPos",
  "__dot_gradientVia",
  "__dot_gradientViaPos",
  "__dot_gradientTo",
  "__dot_gradientToPos",
]);
const INTERNAL_KEYS = new Set([...SHADOW_LAYER_KEYS, ...GRADIENT_KEYS]);

function stripImportant(val: string | number): [string, boolean] {
  if (typeof val !== "string") return [String(val), false];
  if (val.endsWith(" !important")) {
    return [val.slice(0, -" !important".length), true];
  }
  return [val, false];
}

function mergeStyle(target: StyleObject, source: StyleObject): void {
  for (const key of Object.keys(source)) {
    if (ACCUMULATE_KEYS.has(key) && target[key]) {
      target[key] = `${target[key]} ${source[key]}`;
    } else {
      target[key] = source[key];
    }
  }
}

function applyImportant(style: StyleObject): StyleObject {
  const result: StyleObject = {};
  for (const [key, value] of Object.entries(style)) {
    result[key] =
      typeof value === "string" && !value.endsWith("!important")
        ? `${value} !important`
        : typeof value === "number"
          ? `${value} !important`
          : value;
  }
  return result;
}

function finalizeStyle(style: StyleObject): StyleObject {
  const ringLayer = style.__dot_ringLayer;
  const shadowLayer = style.__dot_shadowLayer;
  const hasGradient =
    style.__dot_gradientDirection !== undefined ||
    style.__dot_gradientFrom !== undefined;

  if (ringLayer === undefined && shadowLayer === undefined && !hasGradient)
    return style;

  const result: StyleObject = {};
  for (const [key, value] of Object.entries(style)) {
    if (!INTERNAL_KEYS.has(key)) {
      result[key] = value;
    }
  }

  if (ringLayer !== undefined || shadowLayer !== undefined) {
    const layers: string[] = [];
    let anyImp = false;

    if (ringLayer !== undefined) {
      const [clean, imp] = stripImportant(ringLayer);
      layers.push(clean);
      if (imp) anyImp = true;
    }
    if (shadowLayer !== undefined) {
      const [clean, imp] = stripImportant(shadowLayer);
      layers.push(clean);
      if (imp) anyImp = true;
    }

    result.boxShadow = layers.join(", ") + (anyImp ? " !important" : "");
  }

  if (hasGradient) {
    const direction = String(style.__dot_gradientDirection ?? "to bottom");
    const stops: string[] = [];
    let anyImp = false;

    if (style.__dot_gradientFrom !== undefined) {
      const [color, imp] = stripImportant(style.__dot_gradientFrom);
      if (imp) anyImp = true;
      const pos = style.__dot_gradientFromPos;
      stops.push(pos ? `${color} ${pos}` : color);
    }
    if (style.__dot_gradientVia !== undefined) {
      const [color, imp] = stripImportant(style.__dot_gradientVia);
      if (imp) anyImp = true;
      const pos = style.__dot_gradientViaPos;
      stops.push(pos ? `${color} ${pos}` : color);
    }
    if (style.__dot_gradientTo !== undefined) {
      const [color, imp] = stripImportant(style.__dot_gradientTo);
      if (imp) anyImp = true;
      const pos = style.__dot_gradientToPos;
      stops.push(pos ? `${color} ${pos}` : color);
    }

    if (stops.length > 0) {
      result.backgroundImage =
        `linear-gradient(${direction}, ${stops.join(", ")})` +
        (anyImp ? " !important" : "");
    }
  }

  return result;
}

// ── Core ──

interface ClassRule {
  selector: string;
  declarations: string;
  mediaWrapper?: string;
}

function buildRules(
  tokens: DotToken[],
  config: DotConfig,
  className: string,
  options: DotClassOptions,
): ClassRule[] {
  const rules: ClassRule[] = [];

  // Group tokens by variant combination
  type Bucket = { variants: string[]; styles: StyleObject };
  const buckets: Bucket[] = [];

  const bpSet = config.breakpointSet;

  for (const token of tokens) {
    // Strip variants from raw to resolve the utility
    let rawUtility = token.raw.includes(":")
      ? token.raw.slice(token.raw.lastIndexOf(":") + 1)
      : token.raw;
    if (rawUtility.startsWith("!")) rawUtility = rawUtility.slice(1);

    const resolveTarget = { ...token, variants: [], raw: rawUtility };
    let resolved = resolveToken(resolveTarget, config);

    if (token.important) {
      resolved = applyImportant(resolved);
    }

    // Find or create a bucket for this variant combo
    const variantKey = token.variants.join(":");
    let bucket = buckets.find((b) => b.variants.join(":") === variantKey);
    if (!bucket) {
      bucket = { variants: [...token.variants], styles: {} };
      buckets.push(bucket);
    }
    mergeStyle(bucket.styles, resolved);
  }

  // Convert buckets to CSS rules
  for (const bucket of buckets) {
    const finalized = finalizeStyle(bucket.styles);
    const declarations = styleToDeclarations(finalized);
    if (!declarations) continue;

    if (bucket.variants.length === 0) {
      // Base rule
      rules.push({ selector: `.${className}`, declarations });
      continue;
    }

    // Process variants — accumulate into one final selector + media wrapper
    let selector = className;
    let mediaWrapper: string | undefined;

    for (const variant of bucket.variants) {
      if (variant === "dark") {
        if (options.darkMode === "media") {
          mediaWrapper = "@media (prefers-color-scheme: dark)";
        } else {
          selector = `dark .${selector}`;
        }
      } else if (bpSet.has(variant)) {
        const width = config.breakpointWidths[variant];
        if (width) {
          mediaWrapper = `@media (min-width: ${width})`;
        }
      } else if (SELECTOR_MAP[variant]) {
        const built = SELECTOR_MAP[variant](selector);
        selector = built.startsWith(".") ? built.slice(1) : built;
      }
      // Unknown variant: skip silently
    }

    // Push exactly one rule per bucket
    const selectorStr = selector.startsWith(".") ? selector : `.${selector}`;
    rules.push({ selector: selectorStr, declarations, mediaWrapper });
  }

  return rules;
}

function rulesToCSS(rules: ClassRule[]): string {
  const lines: string[] = [];
  for (const rule of rules) {
    const ruleStr = `${rule.selector} { ${rule.declarations} }`;
    if (rule.mediaWrapper) {
      lines.push(`${rule.mediaWrapper} { ${ruleStr} }`);
    } else {
      lines.push(ruleStr);
    }
  }
  return lines.join("\n");
}

// ── Public API ──

let currentConfig: DotConfig = getGlobalConfig();

/**
 * Re-initialize the class mode config.
 * Call this after createDotConfig() to sync settings.
 */
export function syncClassConfig(): void {
  // Re-resolve from the module-level singleton
  currentConfig = getGlobalConfig();
}

/**
 * Generate a CSS class name for a utility string.
 *
 * @example
 * dotClass('p-4 hover:bg-red-500')
 * // → 'dot-a3f2b1'
 *
 * dotClass('p-4 group-hover:text-white first:mt-0')
 * // → 'dot-7c9e2d'
 */
export function dotClass(input: string, options?: DotClassOptions): string {
  if (!input || !input.trim()) return "";
  return dotCSS(input, options).className;
}

/**
 * Generate a CSS class name and its CSS rules.
 *
 * @example
 * dotCSS('p-4 hover:bg-red-500')
 * // → {
 * //   className: 'dot-a3f2b1',
 * //   css: '.dot-a3f2b1 { padding: 1rem }\n.dot-a3f2b1:hover { background-color: #ef4444 }'
 * // }
 */
export function dotCSS(
  input: string,
  options: DotClassOptions = {},
): DotClassResult {
  if (!input || !input.trim()) return { className: "", css: "" };

  const cacheKey = `${options.naming ?? "hash"}:${options.darkMode ?? "class"}:${input}`;
  const cached = classCache.get(cacheKey);
  if (cached) return cached;

  const tokens = parse(input);
  const naming = options.naming ?? "hash";

  let className: string;
  if (naming === "atomic") {
    // Atomic: each token gets its own class (Tailwind-like).
    // NOTE: Like Tailwind, per-element class attribute order does NOT determine
    // priority — CSS specificity + stylesheet order does. If two elements have
    // conflicting utility order (e.g. "p-8 p-4" vs "p-4 p-8"), the stylesheet
    // winner applies to both. Use hash mode for per-call ordering guarantees.
    const classNames: string[] = [];
    const cssRules: string[] = [];

    for (const token of tokens) {
      const atomicName = `dot-${tokenToClassName(token.raw)}`;
      const rules = buildRules([token], currentConfig, atomicName, options);
      const css = rulesToCSS(rules);
      if (css) {
        classNames.push(atomicName);
        cssRules.push(css);
        // Only push to global buffer if not already emitted (dedup)
        if (!emittedAtomicClasses.has(atomicName)) {
          emittedAtomicClasses.add(atomicName);
          collectedRules.push(css);
        }
      }
    }

    const result: DotClassResult = {
      className: classNames.join(" "),
      css: cssRules.join("\n"),
    };
    classCache.set(cacheKey, result);
    return result;
  }

  // Hash mode (default): single class for entire input
  className = `dot-${hashString(input)}`;
  const rules = buildRules(tokens, currentConfig, className, options);
  const css = rulesToCSS(rules);

  if (css) {
    collectedRules.push(css);
  }

  const result: DotClassResult = { className, css };
  classCache.set(cacheKey, result);
  return result;
}

/**
 * Return all collected CSS from dotClass/dotCSS calls and reset the buffer.
 * Use this for SSR to inject styles into the HTML head.
 *
 * @example
 * // In Next.js layout.tsx:
 * const css = dotFlush();
 * // <style data-dot>{css}</style>
 */
export function dotFlush(): string {
  const css = collectedRules.join("\n");
  collectedRules.length = 0;
  return css;
}

/**
 * Reset all collected CSS and the class cache.
 */
export function dotReset(): void {
  collectedRules.length = 0;
  classCache.clear();
  emittedAtomicClasses.clear();
}
