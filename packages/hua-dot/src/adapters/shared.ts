/**
 * Shared helpers for native and flutter adapters.
 *
 * Extracted from native.ts and flutter.ts to eliminate duplication.
 */

// ---------------------------------------------------------------------------
// Unit conversion
// ---------------------------------------------------------------------------

/** Regex for relative/viewport CSS units */
const VIEWPORT_UNIT_RE =
  /^\d+(\.\d+)?(vh|vw|vmin|vmax|svh|dvh|lvh|svw|dvw|lvw)$/;
const RELATIVE_UNIT_RE =
  /(%|vh|vw|vmin|vmax|svh|dvh|lvh|svw|dvw|lvw)$/;

/**
 * Convert a CSS value string to a numeric value.
 * Strips px, converts rem/em via remBase.
 *
 * - `'16px'`  → `16`
 * - `'1.5rem'` → `24`  (rem × remBase)
 * - `'2em'`   → `32`  (em × remBase)
 * - `'50%'`   → `'50%'` (preserved as string)
 * - `'auto'`  → `'auto'` (preserved)
 * - `'100vh'` → `undefined` (viewport units — skip)
 */
export function toNumericValue(
  value: string | number,
  remBase = 16,
): string | number | undefined {
  if (typeof value === 'number') return value;
  const trimmed = value.trim();

  // Viewport units — can't convert without Dimensions API
  if (
    trimmed.endsWith('vh') ||
    trimmed.endsWith('vw') ||
    trimmed.endsWith('dvh') ||
    trimmed.endsWith('dvw')
  ) {
    return undefined;
  }

  // Percentage — keep as string
  if (trimmed.endsWith('%')) return trimmed;

  // Keywords — keep as string
  if (trimmed === 'auto' || trimmed === 'none') return trimmed;

  // px — strip suffix
  if (trimmed.endsWith('px')) {
    return parseFloat(trimmed);
  }

  // rem/em — multiply by remBase (default 16)
  if (trimmed.endsWith('rem') || trimmed.endsWith('em')) {
    return parseFloat(trimmed) * remBase;
  }

  // Pure number string
  const num = parseFloat(trimmed);
  if (!isNaN(num) && String(num) === trimmed) return num;

  // Fallback — keep as is
  return trimmed;
}

/**
 * Parse a CSS value to a plain number (strip px, rem, em).
 * Returns undefined if the value is relative/viewport or non-numeric.
 * Used by Flutter adapter where only absolute numbers make sense.
 */
export function toAbsoluteNumber(
  value: string | number,
  remBase = 16,
): number | undefined {
  if (typeof value === 'number') return value;
  const s = String(value).trim();
  if (RELATIVE_UNIT_RE.test(s)) return undefined;
  if (s.endsWith('px')) return parseFloat(s);
  if (s.endsWith('rem') || s.endsWith('em')) return parseFloat(s) * remBase;
  const num = parseFloat(s);
  return isNaN(num) ? undefined : num;
}

// ---------------------------------------------------------------------------
// Shadow parsing
// ---------------------------------------------------------------------------

/** Split shadow layers respecting parentheses (commas inside rgb() are not separators) */
export function splitShadowLayers(str: string): string[] {
  const layers: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') depth--;
    else if (str[i] === ',' && depth === 0) {
      layers.push(str.slice(start, i).trim());
      start = i + 1;
    }
  }
  layers.push(str.slice(start).trim());
  return layers;
}

/** Parsed RGB color result */
export interface ParsedColor {
  hex: string;
  opacity: number;
}

/** Parse rgb/rgba color string → { hex, opacity } */
export function parseRgbColor(str: string): ParsedColor {
  // Modern: rgb(0 0 0 / 0.1) or rgba(r, g, b, a)
  const match = str.match(
    /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*(?:[,/]\s*([\d.]+))?\s*\)/,
  );
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return { hex, opacity: a };
  }
  return { hex: '#000000', opacity: 1 };
}

/** Parsed shadow numeric values (platform-agnostic) */
export interface ParsedShadowLayer {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

/**
 * Parse a CSS box-shadow string into structured layers.
 * Each layer contains numeric values + color info — adapters do their own post-processing.
 */
export function parseShadowLayers(str: string): ParsedShadowLayer[] {
  if (!str || str === 'none') return [];

  const rawLayers = splitShadowLayers(str);
  const results: ParsedShadowLayer[] = [];

  for (const layer of rawLayers) {
    const trimmed = layer.replace(/ !important$/, '').trim();
    if (!trimmed) continue;

    const inset = trimmed.startsWith('inset');
    let rest = inset ? trimmed.slice(5).trim() : trimmed;

    // Extract color — look for rgb(...) or hex at end
    let color = '#000000';
    let opacity = 1;

    const rgbMatch = rest.match(/rgba?\([^)]+\)\s*$/);
    if (rgbMatch) {
      const colorStr = rgbMatch[0].trim();
      rest = rest.slice(0, rgbMatch.index).trim();
      const parsed = parseRgbColor(colorStr);
      color = parsed.hex;
      opacity = parsed.opacity;
    } else {
      const hexMatch = rest.match(/#[0-9a-fA-F]{3,8}\s*$/);
      if (hexMatch) {
        color = hexMatch[0].trim();
        rest = rest.slice(0, hexMatch.index).trim();
      }
    }

    const parts = rest.split(/\s+/).map((p) => parseFloat(p));
    results.push({
      offsetX: parts[0] || 0,
      offsetY: parts[1] || 0,
      blur: parts[2] || 0,
      spread: parts[3] || 0,
      color,
      opacity,
      inset,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Viewport / percent / angle helpers
// ---------------------------------------------------------------------------

/** Check if a CSS value is a viewport unit (e.g. 100vh, 100vw) */
export function isViewportUnit(value: string | number): boolean {
  if (typeof value === 'number') return false;
  return VIEWPORT_UNIT_RE.test(String(value).trim());
}

/** Check if a CSS value is a percentage fill value (e.g. 100%) */
export function isFullPercent(value: string | number): boolean {
  if (typeof value === 'number') return false;
  return String(value).trim() === '100%';
}

/** Convert degrees to radians */
export function degToRad(deg: string | number): number {
  const d = typeof deg === 'number' ? deg : parseFloat(String(deg));
  return (d * Math.PI) / 180;
}
