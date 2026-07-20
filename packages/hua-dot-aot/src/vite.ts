/**
 * Vite plugin for @hua-labs/dot AOT extraction.
 *
 * Replaces static `dot('...')` calls with pre-computed style objects at build time.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import dotAot from '@hua-labs/dot-aot/vite';
 *
 * export default defineConfig({
 *   plugins: [dotAot()],
 * });
 * ```
 */

import type { Plugin } from "vite";
import { transformSource, type ExtractOptions } from "./extract";

export interface DotAotViteOptions extends ExtractOptions {
  /** File extensions to process. Default: ['.ts', '.tsx', '.js', '.jsx'] */
  include?: string[];
  /** File patterns to exclude. Default: ['node_modules'] */
  exclude?: string[];
}

export default function dotAotVite(options?: DotAotViteOptions): Plugin {
  const include = options?.include ?? [".ts", ".tsx", ".js", ".jsx"];
  const exclude = options?.exclude ?? ["node_modules"];

  let totalExtractions = 0;

  return {
    name: "dot-aot",
    enforce: "pre",

    transform(code, id) {
      const queryIndex = id.search(/[?#]/u);
      const pathname = queryIndex === -1 ? id : id.slice(0, queryIndex);
      // Filter by extension
      if (!include.some((ext) => pathname.endsWith(ext))) return null;
      // Filter by exclude patterns
      if (exclude.some((pat) => pathname.includes(pat))) return null;

      const result = transformSource(code, {
        functionNames: options?.functionNames,
        target: options?.target,
      });

      if (!result) return null;

      totalExtractions += result.extractions;
      return { code: result.code, map: null };
    },

    buildEnd() {
      if (totalExtractions > 0) {
        console.log(
          `[dot-aot] Extracted ${totalExtractions} static dot() calls`,
        );
      }
    },
  };
}
