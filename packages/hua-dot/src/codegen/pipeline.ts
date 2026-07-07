/**
 * Codegen pipeline — orchestrates the full flow:
 *   style definitions → resolve → IR → emit → source code
 */

import { dot, createDotConfig } from '../index';
import type { StyleObject, DotUserConfig } from '../types';
import type { DotStyleDefinition, DotIR } from './ir';
import type { DotEmitter, CodegenOptions, CodegenResult } from './emitter';
import { toIR } from './to-ir';

// ---------------------------------------------------------------------------
// Style extraction from source files
// ---------------------------------------------------------------------------

/**
 * Extract dot() style definitions from a TypeScript/JavaScript source string.
 *
 * Matches patterns like:
 *   export const cardBase = dot('p-4 bg-white rounded-lg');
 *   const heading = dot("text-2xl font-bold");
 *
 * @returns Array of { name, input } pairs
 */
export function extractStylesFromSource(source: string): DotStyleDefinition[] {
  const results: DotStyleDefinition[] = [];

  // Match: (export )?(const|let) <name> = dot('...' or "...")
  const pattern = /(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*dot\(\s*(['"`])((?:(?!\2).)*)\2/g;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    const name = match[1];
    const input = match[3];
    if (name && input) {
      results.push({ name, input });
    }
  }

  return results;
}

/**
 * Parse a JSON style definitions file.
 *
 * Expected format:
 * {
 *   "styles": {
 *     "cardBase": "p-4 bg-white rounded-lg",
 *     "heading": "text-2xl font-bold"
 *   }
 * }
 */
export function extractStylesFromJSON(json: string): DotStyleDefinition[] {
  const parsed = JSON.parse(json) as { styles?: Record<string, string> };
  if (!parsed.styles || typeof parsed.styles !== 'object') {
    throw new Error('Invalid style definitions: expected { "styles": { ... } }');
  }

  return Object.entries(parsed.styles).map(([name, input]) => ({
    name,
    input,
  }));
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

/**
 * Resolve a list of style definitions into DotIR nodes.
 *
 * @param definitions - Named style definitions
 * @param config - Optional dot config for token resolution
 */
export function resolveToIR(
  definitions: DotStyleDefinition[],
  config?: { remBase?: number; dotConfig?: DotUserConfig },
): DotIR[] {
  // Apply custom config if provided
  if (config?.dotConfig) {
    createDotConfig(config.dotConfig);
  }

  const remBase = config?.remBase ?? 16;

  return definitions.map(({ name, input }) => {
    const style = dot(input, { target: 'web' }) as StyleObject;
    return toIR(name, input, style, { remBase });
  });
}

/**
 * Run the full codegen pipeline.
 *
 * @param definitions - Named style definitions (extracted from source or JSON)
 * @param emitter - Target-specific emitter (Swift or Compose)
 * @param options - Pipeline options
 */
export function codegen(
  definitions: DotStyleDefinition[],
  emitter: DotEmitter,
  options?: CodegenOptions,
): CodegenResult {
  const moduleName = options?.moduleName ?? 'DotStyles';
  const remBase = options?.remBase;

  // Resolve all definitions to IR
  const irNodes = resolveToIR(definitions, { remBase });

  // Emit each IR node
  for (const ir of irNodes) {
    emitter.emit(ir);
  }

  // Finalize
  const content = emitter.finalize(moduleName);

  // Determine file extension
  const ext = emitter.target === 'swift' ? '.swift' : '.kt';

  return {
    target: emitter.target,
    fileName: `${moduleName}${ext}`,
    content,
    styleCount: irNodes.length,
  };
}
