import type { DotToken, StyleObject, ResolverFn, DotConfig } from './types';
import { resolveSpacing } from './resolvers/spacing';
import { resolveColor } from './resolvers/color';
import { resolveTypography } from './resolvers/typography';
import { resolveLayout, resolveSizing } from './resolvers/layout';
import { resolveBorder, resolveBorderStyle, resolveBorderRadius } from './resolvers/border';
import { resolveFlexbox, resolveFlexboxStandalone } from './resolvers/flexbox';
import { resolveZIndex } from './resolvers/z-index';
import { resolveShadow } from './resolvers/shadow';
import { resolveOpacity } from './resolvers/opacity';
import { resolveTransform } from './resolvers/transform';
import { resolveTransition } from './resolvers/transition';
import { resolveAnimation } from './resolvers/animation';
import { resolveBackdrop } from './resolvers/backdrop';
import { resolvePositioning } from './resolvers/positioning';
import { resolveGrid } from './resolvers/grid';
import { resolveInteractivity } from './resolvers/interactivity';
import { BORDER_STYLES } from './tokens/borders';

/** Maps prefix → resolver function for prefix-value tokens */
const PREFIX_RESOLVER_MAP: Record<string, ResolverFn> = {
  // spacing
  p: resolveSpacing,
  px: resolveSpacing,
  py: resolveSpacing,
  pt: resolveSpacing,
  pr: resolveSpacing,
  pb: resolveSpacing,
  pl: resolveSpacing,
  m: resolveSpacing,
  mx: resolveSpacing,
  my: resolveSpacing,
  mt: resolveSpacing,
  mr: resolveSpacing,
  mb: resolveSpacing,
  ml: resolveSpacing,
  gap: resolveSpacing,
  'gap-x': resolveSpacing,
  'gap-y': resolveSpacing,

  // color
  bg: resolveColor,

  // typography (text- handles ambiguity internally)
  text: resolveTypography,
  font: resolveTypography,
  leading: resolveTypography,
  tracking: resolveTypography,

  // sizing
  w: resolveSizing,
  h: resolveSizing,
  'min-w': resolveSizing,
  'min-h': resolveSizing,
  'max-w': resolveSizing,
  'max-h': resolveSizing,

  // border width (border- handles width > color ambiguity internally)
  border: resolveBorder,
  'border-t': resolveBorder,
  'border-r': resolveBorder,
  'border-b': resolveBorder,
  'border-l': resolveBorder,
  'border-x': resolveBorder,
  'border-y': resolveBorder,

  // border radius
  rounded: resolveBorderRadius,
  'rounded-t': resolveBorderRadius,
  'rounded-r': resolveBorderRadius,
  'rounded-b': resolveBorderRadius,
  'rounded-l': resolveBorderRadius,
  'rounded-tl': resolveBorderRadius,
  'rounded-tr': resolveBorderRadius,
  'rounded-bl': resolveBorderRadius,
  'rounded-br': resolveBorderRadius,

  // flexbox prefix
  flex: resolveFlexbox,
  order: resolveFlexbox,

  // z-index
  z: resolveZIndex,

  // Phase 2: shadow
  shadow: resolveShadow,

  // Phase 2: opacity
  opacity: resolveOpacity,

  // Phase 2: transform
  rotate: resolveTransform,
  scale: resolveTransform,
  'scale-x': resolveTransform,
  'scale-y': resolveTransform,
  'translate-x': resolveTransform,
  'translate-y': resolveTransform,
  'skew-x': resolveTransform,
  'skew-y': resolveTransform,

  // Phase 2: transition
  transition: resolveTransition,
  duration: resolveTransition,
  ease: resolveTransition,
  delay: resolveTransition,

  // Phase 2: animation
  animate: resolveAnimation,

  // Phase 2: backdrop
  'backdrop-blur': resolveBackdrop,

  // Phase 3a: positioning
  top: resolvePositioning,
  right: resolvePositioning,
  bottom: resolvePositioning,
  left: resolvePositioning,
  inset: resolvePositioning,
  'inset-x': resolvePositioning,
  'inset-y': resolvePositioning,
  start: resolvePositioning,
  end: resolvePositioning,

  // Phase 3a: grid
  'grid-cols': resolveGrid,
  'grid-rows': resolveGrid,
  'col-span': resolveGrid,
  'row-span': resolveGrid,
  'col-start': resolveGrid,
  'col-end': resolveGrid,
  'row-start': resolveGrid,
  'row-end': resolveGrid,
  'auto-cols': resolveGrid,
  'auto-rows': resolveGrid,
};

/** Negate a CSS value: '16px' → '-16px', 'translateX(16px)' → 'translateX(-16px)' */
function negateValue(val: string | number): string | number {
  if (typeof val === 'number') return val === 0 ? 0 : -val;

  // Transform function: translateX(16px) → translateX(-16px)
  const fnMatch = val.match(/^([a-zA-Z]+)\((.+)\)$/);
  if (fnMatch) {
    const inner = fnMatch[2];
    if (parseFloat(inner) === 0) return val;
    if (/^[\d.]/.test(inner)) return `${fnMatch[1]}(-${inner})`;
    return val;
  }

  // Simple CSS value: 16px → -16px, 50% → -50%
  if (parseFloat(val) === 0) return val;
  if (/^[\d.]/.test(val)) return `-${val}`;
  return val;
}

function negateStyleObject(style: StyleObject): StyleObject {
  const result: StyleObject = {};
  for (const [key, val] of Object.entries(style)) {
    result[key] = negateValue(val);
  }
  return result;
}

/**
 * Resolve a parsed DotToken into a StyleObject.
 *
 * For standalone tokens (prefix === ''), dispatches to standalone resolvers.
 * For prefix-value tokens, looks up PREFIX_RESOLVER_MAP.
 *
 * Handles special cases:
 * - `border-{style}` → borderStyle (e.g., border-solid, border-dashed)
 * - Negative tokens: `-m-4` → negate resolved value
 *
 * strictMode: throws Error on unknown tokens when config.strictMode === true.
 */
export function resolveToken(token: DotToken, config: DotConfig): StyleObject {
  const { prefix, value } = token;

  // Standalone tokens (no prefix)
  if (prefix === '') {
    // Try flexbox standalone first (most common standalone tokens)
    const flexResult = resolveFlexboxStandalone(value);
    if (Object.keys(flexResult).length > 0) return flexResult;

    // Layout standalone (display, position, text-transform, overflow)
    const layoutResult = resolveLayout(value);
    if (Object.keys(layoutResult).length > 0) return layoutResult;

    // Interactivity standalone (cursor, select, resize, pointer-events)
    const interactivityResult = resolveInteractivity(value);
    if (Object.keys(interactivityResult).length > 0) return interactivityResult;

    if (config.strictMode) {
      throw new Error(`[dot] Unknown token: "${token.raw}"`);
    }
    return {};
  }

  // Special case: border-{style} like border-solid, border-dashed
  if (prefix === 'border' && BORDER_STYLES[value]) {
    return resolveBorderStyle(value);
  }

  // Look up prefix resolver
  const resolver = PREFIX_RESOLVER_MAP[prefix];
  if (resolver) {
    const result = resolver(prefix, value, config);
    if (Object.keys(result).length > 0) {
      return token.negative ? negateStyleObject(result) : result;
    }

    // Resolver found but returned empty — value not recognized
    if (config.strictMode) {
      throw new Error(`[dot] Unknown token: "${token.raw}"`);
    }
    return {};
  }

  if (config.strictMode) {
    throw new Error(`[dot] Unknown token: "${token.raw}"`);
  }
  return {};
}
