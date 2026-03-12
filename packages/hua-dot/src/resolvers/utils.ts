/**
 * Shared resolver utilities.
 */

/**
 * Arbitrary value security validation.
 *
 * This is the SECURITY BOUNDARY for all dot adapters (web inline, web class,
 * native, flutter, compose, swiftui). Validated here once → trusted everywhere.
 *
 * Strategy: WHITELIST (allow known-safe, reject everything else).
 * - Simple values: alphanumeric, #, %, ., _, /, -, +, commas
 * - Function values: only whitelisted CSS function names allowed
 * - Always blocked: <, >, \, ;, @, {, }, quotes (HTML/CSS injection vectors)
 */

/** Simple (no-parens) values: numbers, units, hex colors, fractions, keywords */
const SAFE_SIMPLE_RE = /^[a-zA-Z0-9#%.,_/\-+\s]+$/;

/** Whitelisted CSS function names — only these may appear before '(' */
const SAFE_CSS_FUNCTIONS = new Set([
  // color functions
  'rgb', 'rgba', 'hsl', 'hsla', 'oklch', 'oklab', 'lch', 'lab',
  'color-mix', 'light-dark',
  // math functions
  'calc', 'min', 'max', 'clamp',
  // variable reference
  'var',
  // easing
  'cubic-bezier', 'linear',
  // gradient (rare in arbitrary but valid)
  'linear-gradient', 'radial-gradient', 'conic-gradient',
]);

/** Patterns that are NEVER safe inside arbitrary values, even within functions */
const INJECTION_RE = /[<>\\;@{}'"]/;

function isSafeArbitrary(value: string): boolean {
  if (!value) return false;

  // Hard block: HTML/CSS injection characters
  if (INJECTION_RE.test(value)) return false;

  // No parentheses → simple alphanumeric check
  if (!value.includes('(')) return SAFE_SIMPLE_RE.test(value);

  // Has parentheses → every function name must be whitelisted
  const funcMatches = [...value.matchAll(/([a-zA-Z-]+)\(/g)];
  if (funcMatches.length === 0) return false; // bare '(' with no name

  return funcMatches.every((m) => SAFE_CSS_FUNCTIONS.has(m[1].toLowerCase()));
}

/**
 * Parse arbitrary value from bracket notation.
 * Returns the inner value if brackets are detected and the value passes
 * the security whitelist, undefined otherwise.
 *
 * @example
 * parseArbitrary('[300px]')               → '300px'
 * parseArbitrary('[#ff0000]')             → '#ff0000'
 * parseArbitrary('[rgb(0,0,0)]')          → 'rgb(0,0,0)'
 * parseArbitrary('[var(--color-card)]')   → 'var(--color-card)'
 * parseArbitrary('4')                     → undefined
 * parseArbitrary('[url(evil)]')           → undefined (blocked)
 * parseArbitrary('[expression(alert(1))]') → undefined (blocked)
 * parseArbitrary('[</style>]')            → undefined (blocked)
 */
export function parseArbitrary(value: string): string | undefined {
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1);
    if (!isSafeArbitrary(inner)) {
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
        console.warn(`[dot] Rejected unsafe arbitrary value: "${inner}"`);
      }
      return undefined;
    }
    return inner;
  }
  return undefined;
}

/**
 * Convert a hex color to rgb() with optional alpha.
 *
 * @example
 * hexToRgb('#3b82f6')       → 'rgb(59 130 246)'
 * hexToRgb('#3b82f6', 0.5)  → 'rgb(59 130 246 / 0.5)'
 * hexToRgb('#fff', 0.75)    → 'rgb(255 255 255 / 0.75)'
 */
export function hexToRgb(hex: string, alpha?: number): string | undefined {
  // Remove # prefix
  let h = hex.startsWith('#') ? hex.slice(1) : hex;

  // Expand shorthand: #fff → ffffff
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }

  if (h.length !== 6) return undefined;

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return undefined;

  if (alpha !== undefined) {
    return `rgb(${r} ${g} ${b} / ${alpha})`;
  }
  return `rgb(${r} ${g} ${b})`;
}
