/**
 * Babel plugin for @hua-labs/dot AOT extraction.
 *
 * Replaces static `dot('...')` calls with pre-computed style objects at build time.
 * Works with Metro and other pipelines that explicitly execute Babel plugins.
 *
 * @example
 * ```json
 * // babel.config.js
 * module.exports = {
 *   plugins: [['@hua-labs/dot-aot/babel', { target: 'native' }]],
 * };
 * ```
 */

import { dot } from "@hua-labs/dot";
import type { DotOptions, DotTarget } from "@hua-labs/dot";

export interface DotAotBabelOptions {
  /** Function names to extract. Default: ['dot'] */
  functionNames?: string[];
  /** Default target. Default: 'web' */
  target?: DotTarget;
}

interface BabelTypes {
  isStringLiteral(node: unknown): node is { value: string };
  isObjectExpression(
    node: unknown,
  ): node is { properties: BabelObjectProperty[] };
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
  computed?: boolean;
  shorthand?: boolean;
  key: unknown;
  value: unknown;
}

interface BabelBindingPath {
  node: Record<string, unknown>;
  parentPath?: { node: Record<string, unknown> };
}

interface BabelBinding {
  path: BabelBindingPath;
}

interface BabelPath {
  node: {
    callee: { name?: string };
    arguments: unknown[];
  };
  scope: {
    getBinding(name: string): BabelBinding | undefined;
  };
  replaceWith(node: unknown): void;
}

type ParsedOptionsNode =
  | { admitted: true; opts: DotOptions }
  | { admitted: false };

const DOT_IMPORT_SOURCE = "@hua-labs/dot";
const STATIC_TARGETS = new Set<DotTarget>(["web", "native", "flutter"]);

function admitConfiguredTarget(value: unknown): DotTarget | null {
  if (value === undefined) return "web";
  if (typeof value !== "string" || !STATIC_TARGETS.has(value as DotTarget)) {
    return null;
  }
  return value as DotTarget;
}

function importedName(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const node = value as Record<string, unknown>;
  if (node.type === "Identifier" && typeof node.name === "string") {
    return node.name;
  }
  if (node.type === "StringLiteral" && typeof node.value === "string") {
    return node.value;
  }
  return null;
}

function hasAuthorizedDotBinding(path: BabelPath, localName: string): boolean {
  const binding = path.scope.getBinding(localName);
  const specifier = binding?.path.node;
  const declaration = binding?.path.parentPath?.node;
  const source = declaration?.source as Record<string, unknown> | undefined;

  return (
    specifier?.type === "ImportSpecifier" &&
    specifier.importKind !== "type" &&
    importedName(specifier.imported) === "dot" &&
    declaration?.type === "ImportDeclaration" &&
    declaration.importKind !== "type" &&
    source?.value === DOT_IMPORT_SOURCE
  );
}

/** Admit only the exact flat literal option shape supported by AOT. */
function parseOptionsNode(node: unknown, t: BabelTypes): ParsedOptionsNode {
  if (!t.isObjectExpression(node)) return { admitted: false };

  const opts: DotOptions = {};
  const seen = new Set<"target" | "dark">();

  for (const prop of (node as { properties: BabelObjectProperty[] })
    .properties) {
    if (!t.isObjectProperty(prop) || prop.computed || prop.shorthand) {
      return { admitted: false };
    }

    const key = t.isIdentifier(prop.key)
      ? prop.key.name
      : t.isStringLiteral(prop.key)
        ? prop.key.value
        : null;

    if ((key !== "target" && key !== "dark") || seen.has(key)) {
      return { admitted: false };
    }
    seen.add(key);

    if (key === "target" && t.isStringLiteral(prop.value)) {
      const target = prop.value.value as DotTarget;
      if (!STATIC_TARGETS.has(target)) return { admitted: false };
      opts.target = target;
      continue;
    }

    if (key === "dark" && t.isBooleanLiteral(prop.value)) {
      opts.dark = prop.value.value;
      continue;
    }

    return { admitted: false };
  }

  return { admitted: true, opts };
}

/**
 * Convert any JS value to a Babel AST node.
 * Handles primitives, arrays, and nested objects (RN transforms, Flutter recipes).
 */
function valueToAst(value: unknown, t: BabelTypes): unknown {
  if (value === null) return t.nullLiteral();
  if (value === undefined) return t.identifier("undefined");
  if (typeof value === "string") return t.stringLiteral(value);
  if (typeof value === "number") return t.numericLiteral(value);
  if (typeof value === "boolean") return t.booleanLiteral(value);

  if (Array.isArray(value)) {
    return t.arrayExpression(value.map((v) => valueToAst(v, t)));
  }

  if (typeof value === "object") {
    const properties = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => {
        const keyNode = /^[a-zA-Z_$][\w$]*$/.test(k)
          ? t.identifier(k)
          : t.stringLiteral(k);
        return t.objectProperty(keyNode, valueToAst(v, t));
      },
    );
    return t.objectExpression(properties);
  }

  return t.stringLiteral(String(value));
}

export default function dotAotBabel(
  _babel: { types: BabelTypes },
  pluginOptions?: DotAotBabelOptions,
) {
  const t = _babel.types;
  const fnNames = new Set(pluginOptions?.functionNames ?? ["dot"]);
  const defaultTarget = admitConfiguredTarget(pluginOptions?.target as unknown);

  return {
    name: "dot-aot",
    visitor: {
      CallExpression(path: BabelPath) {
        if (defaultTarget === null) return;
        const callee = path.node.callee;
        if (!t.isIdentifier(callee) || !fnNames.has(callee.name)) return;
        if (!hasAuthorizedDotBinding(path, callee.name)) return;

        const args = path.node.arguments;
        if (args.length === 0 || args.length > 2) return;

        // First arg must be string literal
        const firstArg = args[0];
        if (!t.isStringLiteral(firstArg)) return;
        const input = (firstArg as { value: string }).value;

        // Parse static options from second arg (if present)
        const parsed =
          args.length === 2
            ? parseOptionsNode(args[1], t)
            : { admitted: true as const, opts: {} };
        if (!parsed.admitted) return;

        const callOpts =
          Object.keys(parsed.opts).length > 0 ? parsed.opts : undefined;
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
