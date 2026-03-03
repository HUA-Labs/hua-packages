import type { StyleObject, DotConfig } from '../types';
import {
  FLEX_DIRECTION,
  FLEX_WRAP,
  ALIGN_ITEMS,
  ALIGN_SELF,
  JUSTIFY_CONTENT,
  ALIGN_CONTENT,
  FLEX_VALUES,
  FLEX_GROW,
  FLEX_SHRINK,
  ORDER_VALUES,
} from '../tokens/flexbox';

/**
 * Resolve flexbox standalone tokens: flex-col → { flexDirection: 'column' }
 */
export function resolveFlexboxStandalone(value: string): StyleObject {
  if (FLEX_DIRECTION[value]) {
    return { flexDirection: FLEX_DIRECTION[value] };
  }
  if (FLEX_WRAP[value]) {
    return { flexWrap: FLEX_WRAP[value] };
  }
  if (ALIGN_ITEMS[value]) {
    return { alignItems: ALIGN_ITEMS[value] };
  }
  if (ALIGN_SELF[value]) {
    return { alignSelf: ALIGN_SELF[value] };
  }
  if (JUSTIFY_CONTENT[value]) {
    return { justifyContent: JUSTIFY_CONTENT[value] };
  }
  if (ALIGN_CONTENT[value]) {
    return { alignContent: ALIGN_CONTENT[value] };
  }
  if (FLEX_GROW[value]) {
    return { flexGrow: FLEX_GROW[value] };
  }
  if (FLEX_SHRINK[value]) {
    return { flexShrink: FLEX_SHRINK[value] };
  }
  return {};
}

/**
 * Resolve flex prefix tokens: flex-1 → { flex: '1 1 0%' }
 */
export function resolveFlexbox(_prefix: string, value: string, _config: DotConfig): StyleObject {
  if (_prefix === 'flex') {
    if (FLEX_VALUES[value]) {
      return { flex: FLEX_VALUES[value] };
    }
    return {};
  }
  if (_prefix === 'order') {
    if (ORDER_VALUES[value]) {
      return { order: ORDER_VALUES[value] };
    }
    return {};
  }
  return {};
}
