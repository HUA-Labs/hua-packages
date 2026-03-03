/**
 * Shared resolver utilities.
 */

/**
 * Parse arbitrary value from bracket notation.
 * Returns the inner value if brackets are detected, undefined otherwise.
 *
 * @example
 * parseArbitrary('[300px]')   → '300px'
 * parseArbitrary('[#ff0000]') → '#ff0000'
 * parseArbitrary('[2rem]')    → '2rem'
 * parseArbitrary('4')         → undefined
 */
export function parseArbitrary(value: string): string | undefined {
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1);
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
