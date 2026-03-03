import type { StyleObject } from '../types';
import { Z_INDEX } from '../tokens/z-index';

/**
 * Resolve z-index tokens: z-10 → { zIndex: '10' }
 */
export function resolveZIndex(_prefix: string, value: string): StyleObject {
  if (Z_INDEX[value as keyof typeof Z_INDEX]) {
    return { zIndex: Z_INDEX[value as keyof typeof Z_INDEX] };
  }
  return {};
}
