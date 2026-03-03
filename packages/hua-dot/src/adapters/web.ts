import type { StyleObject } from '../types';

/** Identity adapter — web styles need no conversion. */
export function adaptWeb(webStyle: StyleObject): StyleObject {
  return webStyle;
}
