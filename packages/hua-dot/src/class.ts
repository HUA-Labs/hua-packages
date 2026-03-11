/**
 * dot Class Mode — CSS ruleset generation from utility strings.
 *
 * @example
 * import { dotClass, dotCSS, dotFlush } from '@hua-labs/dot/class';
 *
 * const cls = dotClass('p-4 hover:bg-red-500 group-hover:text-white');
 * // → 'dot-a3f2b1'
 *
 * const { className, css } = dotCSS('p-4 hover:bg-red-500');
 * // css → '.dot-a3f2b1 { padding: 1rem }\n.dot-a3f2b1:hover { ...'
 *
 * const allCSS = dotFlush(); // SSR: collect all generated CSS
 */
export {
  dotClass,
  dotCSS,
  dotFlush,
  dotReset,
  syncClassConfig,
} from "./adapters/class";
export type { DotClassOptions, DotClassResult } from "./adapters/class";
