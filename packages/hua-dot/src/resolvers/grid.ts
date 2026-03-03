import type { StyleObject, DotConfig } from '../types';
import {
  COL_SPAN,
  ROW_SPAN,
  COL_START_END,
  ROW_START_END,
  AUTO_TRACK,
} from '../tokens/grid';

/**
 * Resolve grid tokens: grid-cols-3 → { gridTemplateColumns: 'repeat(3, ...)' }
 *
 * grid-cols/grid-rows use config.tokens for customizability.
 * span/start/end/auto use fixed token maps.
 */
export function resolveGrid(prefix: string, value: string, config: DotConfig): StyleObject {
  switch (prefix) {
    case 'grid-cols': {
      const v = config.tokens.gridCols[value];
      return v !== undefined ? { gridTemplateColumns: v } : {};
    }
    case 'grid-rows': {
      const v = config.tokens.gridRows[value];
      return v !== undefined ? { gridTemplateRows: v } : {};
    }
    case 'col-span': {
      const v = COL_SPAN[value];
      return v !== undefined ? { gridColumn: v } : {};
    }
    case 'row-span': {
      const v = ROW_SPAN[value];
      return v !== undefined ? { gridRow: v } : {};
    }
    case 'col-start': {
      const v = COL_START_END[value];
      return v !== undefined ? { gridColumnStart: v } : {};
    }
    case 'col-end': {
      const v = COL_START_END[value];
      return v !== undefined ? { gridColumnEnd: v } : {};
    }
    case 'row-start': {
      const v = ROW_START_END[value];
      return v !== undefined ? { gridRowStart: v } : {};
    }
    case 'row-end': {
      const v = ROW_START_END[value];
      return v !== undefined ? { gridRowEnd: v } : {};
    }
    case 'auto-cols': {
      const v = AUTO_TRACK[value];
      return v !== undefined ? { gridAutoColumns: v } : {};
    }
    case 'auto-rows': {
      const v = AUTO_TRACK[value];
      return v !== undefined ? { gridAutoRows: v } : {};
    }
    default:
      return {};
  }
}
