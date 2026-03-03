import type { DotToken, StyleObject, ResolverFn } from './types';
import { resolveSpacing } from './resolvers/spacing';
import { resolveColor } from './resolvers/color';
import { resolveTypography } from './resolvers/typography';
import { resolveLayout, resolveSizing } from './resolvers/layout';
import { resolveBorder, resolveBorderStyle, resolveBorderRadius } from './resolvers/border';
import { resolveFlexbox, resolveFlexboxStandalone } from './resolvers/flexbox';
import { resolveZIndex } from './resolvers/z-index';
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
};

/**
 * Resolve a parsed DotToken into a StyleObject.
 *
 * For standalone tokens (prefix === ''), dispatches to standalone resolvers.
 * For prefix-value tokens, looks up PREFIX_RESOLVER_MAP.
 *
 * Handles special cases:
 * - `border-{style}` → borderStyle (e.g., border-solid, border-dashed)
 */
export function resolveToken(token: DotToken): StyleObject {
  const { prefix, value } = token;

  // Standalone tokens (no prefix)
  if (prefix === '') {
    // Try flexbox standalone first (most common standalone tokens)
    const flexResult = resolveFlexboxStandalone(value);
    if (Object.keys(flexResult).length > 0) return flexResult;

    // Layout standalone (display, position, text-transform, overflow)
    const layoutResult = resolveLayout(value);
    if (Object.keys(layoutResult).length > 0) return layoutResult;

    return {};
  }

  // Special case: border-{style} like border-solid, border-dashed
  if (prefix === 'border' && BORDER_STYLES[value]) {
    return resolveBorderStyle(value);
  }

  // Look up prefix resolver
  const resolver = PREFIX_RESOLVER_MAP[prefix];
  if (resolver) {
    return resolver(prefix, value);
  }

  return {};
}
