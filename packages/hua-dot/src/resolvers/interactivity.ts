import type { StyleObject } from '../types';
import { CURSOR, USER_SELECT, RESIZE, POINTER_EVENTS, APPEARANCE, WHITESPACE, TOUCH_ACTION, WILL_CHANGE } from '../tokens/interactivity';

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
  // Word break — Tailwind-compatible mapping
  if (value === 'break-normal') return { overflowWrap: 'normal', wordBreak: 'normal' };
  if (value === 'break-words') return { overflowWrap: 'break-word' };
  if (value === 'break-all') return { wordBreak: 'break-all' };
  if (value === 'break-keep') return { wordBreak: 'keep-all' };
  if (TOUCH_ACTION[value]) return { touchAction: TOUCH_ACTION[value] };
  if (WILL_CHANGE[value]) return { willChange: WILL_CHANGE[value] };
  return {};
}
