import type { StyleObject } from '../types';
import { OBJECT_FIT, OBJECT_POSITION } from '../tokens/object-fit';

/**
 * Resolve object-fit/position standalone tokens.
 */
export function resolveObjectFit(value: string): StyleObject {
  if (OBJECT_FIT[value]) return { objectFit: OBJECT_FIT[value] };
  if (OBJECT_POSITION[value]) return { objectPosition: OBJECT_POSITION[value] };
  return {};
}
