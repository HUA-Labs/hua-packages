/**
 * Babel plugin for @hua-labs/dot AOT extraction.
 *
 * Replaces static `dot('...')` calls with pre-computed style objects at build time.
 * Works with Next.js SWC (via babel plugin compat), Metro, and any Babel pipeline.
 *
 * @example
 * ```json
 * // babel.config.js
 * module.exports = {
 *   plugins: [['@hua-labs/dot-aot/babel', { target: 'native' }]],
 * };
 * ```
 */

import { dot } from '@hua-labs/dot';
import type { DotOptions, DotTarget } from '@hua-labs/dot';

export interface DotAotBabelOptions {
  /** Function names to extract. Default: ['dot'] */
  functionNames?: string[];
  /** Default target. Default: 'web' */
  target?: DotTarget;
}

interface BabelTypes {
  isStringLiteral(node: unknown): node is { value: string };
  isObjectExpression(node: unknown): node is { properties: BabelObjectProperty[] };
  isObjectProperty(node: unknown): node is BabelObjectProperty;
  isIdentifier(node: unknown): node is { name: string };
  isBooleanLiteral(node: unknown): node is { value: boolean };
  isNullLiteral(node: unknown): boolean;
  objectExpression(properties: unknown[]): unknown;
  objectProperty(key: unknown, value: unknown): unknown;
  arrayExpression(elements: unknown[]): unknown;
  identifier(name: string): unknown;
  stringLiteral(value: string): unknown;
  numericLiteral(value: number): unknown;
  booleanLiteral(value: boolean): unknown;
  nullLiteral(): unknown;
}

interface BabelObjectProperty {
  key: { name?: string; value?: string };
  value: { value?: string | number | boolean };
}

interface BabelPath {
  node: {
    callee: { name?: string };
    arguments: unknown[];
  };
  replaceWith(node: unknown): void;
}

/** Parse options AST node. Returns null if breakpoint is present (skip extraction). */
function parseOptionsNode(
  node: unknown,
  t: BabelTypes,
): { opts: DotOptions; skip: boolean } {
  if (!t.isObjectExpression(node)) return { opts: {}, skip: false };
  const opts: DotOptions = {};
  let hasBreakpoint = false;

  for (const prop of (node as { properties: BabelObjectProperty[] }).properties) {
    if (!t.isObjectProperty(prop)) continue;
    const key = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;

    if (key === 'target' && t.isStringLiteral(prop.value)) {
      opts.target = (prop.value as { value: string }).value as DotTarget;
    }
    if (key === 'dark' && t.isBooleanLiteral(prop.value)) {
      opts.dark = (prop.value as { value: boolean }).value;
    }
    if (key === 'breakpoint') {
      hasBreakpoint = true;
    }
  }

  return { opts, skip: hasBreakpoint };
}

/**
 * Convert any JS value to a Babel AST node.
 * Handles primitives, arrays, and nested objects (RN transforms, Flutter recipes).
 */
function valueToAst(value: unknown, t: BabelTypes): unknown {
  if (value === null) return t.nullLiteral();
  if (value === undefined) return t.identifier('undefined');
  if (typeof value === 'string') return t.stringLiteral(value);
  if (typeof value === 'number') return t.numericLiteral(value);
  if (typeof value === 'boolean') return t.booleanLiteral(value);

  if (Array.isArray(value)) {
    return t.arrayExpression(value.map((v) => valueToAst(v, t)));
  }

  if (typeof value === 'object') {
    const properties = Object.entries(value as Record<string, unknown>).map(([k, v]) => {
      const keyNode = /^[a-zA-Z_$][\w$]*$/.test(k)
        ? t.identifier(k)
        : t.stringLiteral(k);
      return t.objectProperty(keyNode, valueToAst(v, t));
    });
    return t.objectExpression(properties);
  }

  return t.stringLiteral(String(value));
}

export default function dotAotBabel(
  _babel: { types: BabelTypes },
  pluginOptions?: DotAotBabelOptions,
) {
  const t = _babel.types;
  const fnNames = new Set(pluginOptions?.functionNames ?? ['dot']);
  const defaultTarget = pluginOptions?.target ?? 'web';

  return {
    name: 'dot-aot',
    visitor: {
      CallExpression(path: BabelPath) {
        const callee = path.node.callee;
        if (!t.isIdentifier(callee) || !fnNames.has(callee.name)) return;

        const args = path.node.arguments;
        if (args.length === 0) return;

        // First arg must be string literal
        const firstArg = args[0];
        if (!t.isStringLiteral(firstArg)) return;
        const input = (firstArg as { value: string }).value;

        // Parse static options from second arg (if present)
        const parsed = args.length >= 2 ? parseOptionsNode(args[1], t) : null;
        if (parsed?.skip) return; // breakpoint present — leave as runtime

        const callOpts = parsed?.opts;
        const resolveOpts: DotOptions = {
          target: callOpts?.target ?? defaultTarget,
          ...(callOpts?.dark !== undefined ? { dark: callOpts.dark } : {}),
        };

        try {
          const result = dot(input, resolveOpts) as Record<string, unknown>;
          path.replaceWith(valueToAst(result, t));
        } catch {
          // Skip — leave as runtime call
        }
      },
    },
  };
}
