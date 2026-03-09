/**
 * @hua-labs/dot-aot — Build-time static extraction for @hua-labs/dot
 *
 * Replaces static `dot('...')` calls with pre-computed style objects,
 * eliminating runtime parsing overhead.
 *
 * Entry points:
 * - `@hua-labs/dot-aot` — Core extraction engine
 * - `@hua-labs/dot-aot/vite` — Vite plugin
 * - `@hua-labs/dot-aot/babel` — Babel plugin (works with Metro, Next.js, etc.)
 */

export {
  extractStaticCalls,
  transformSource,
  styleToObjectLiteral,
  type ExtractedCall,
  type ExtractOptions,
} from './extract';
