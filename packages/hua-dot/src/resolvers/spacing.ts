import type { StyleObject, DotConfig } from "../types";
import { SPACING_PROP_MAP } from "../tokens/spacing";
import { parseArbitrary } from "./utils";

/**
 * Resolve spacing tokens: p-4 → { padding: '16px' }, mx-auto → { marginLeft: 'auto', marginRight: 'auto' }
 *
 * space-y / space-x emit internal markers (__dot_spaceY / __dot_spaceX) so that
 * finalizeStyle() can auto-inject display:flex when no explicit display is set.
 * This makes `space-y-4` work without requiring `flex flex-col` — matching
 * Tailwind DX while staying cross-platform (RN defaults to flex-column).
 */
export function resolveSpacing(
  prefix: string,
  value: string,
  config: DotConfig,
): StyleObject {
  const props = SPACING_PROP_MAP[prefix];
  if (!props) return {};

  // Arbitrary value: p-[20px], m-[2rem]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) {
    const result: StyleObject = {};
    for (const prop of props) {
      result[prop] = arbitrary;
    }
    if (prefix === "space-y") result.__dot_spaceY = "1";
    if (prefix === "space-x") result.__dot_spaceX = "1";
    return result;
  }

  const cssValue = config.tokens.spacing[value];
  if (cssValue === undefined) return {};

  const result: StyleObject = {};
  for (const prop of props) {
    result[prop] = cssValue;
  }
  if (prefix === "space-y") result.__dot_spaceY = "1";
  if (prefix === "space-x") result.__dot_spaceX = "1";
  return result;
}
