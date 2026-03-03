import type { StyleObject } from '../types';
import { CURSOR, USER_SELECT, RESIZE, POINTER_EVENTS, APPEARANCE, WHITESPACE } from '../tokens/interactivity';

/**
 * Resolve standalone interactivity tokens.
 * Web-only utilities — RN adapter skips cursor, and userSelect/resize have no RN equivalent.
 */
export function resolveInteractivity(value: string): StyleObject {
  if (CURSOR[value]) return { cursor: CURSOR[value] };
  if (USER_SELECT[value]) return { userSelect: USER_SELECT[value] };
  if (RESIZE[value]) return { resize: RESIZE[value] };
  if (POINTER_EVENTS[value]) return { pointerEvents: POINTER_EVENTS[value] };
  if (APPEARANCE[value]) return { appearance: APPEARANCE[value] };
  if (WHITESPACE[value]) return { whiteSpace: WHITESPACE[value] };
  return {};
}
