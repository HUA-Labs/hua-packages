/**
 * Static extraction engine for dot() calls.
 *
 * Analyzes source code to find `dot('...')` calls with string literal arguments,
 * evaluates them at build time using the real dot engine, and replaces them
 * with the resulting static style object.
 *
 * Limitations:
 * - Only extracts calls where the argument is a string literal (no variables/templates)
 * - Calls with breakpoint option are left as runtime (breakpoint is inherently dynamic)
 * - dotMap() is not extracted (state variants need runtime)
 */

import { parse } from "@babel/parser";
import { dot } from "@hua-labs/dot";
import type { DotOptions } from "@hua-labs/dot";

/** A single extraction result */
export interface ExtractedCall {
  /** Character offset of the full dot('...') expression start */
  start: number;
  /** Character offset of the full dot('...') expression end */
  end: number;
  /** The original utility string argument */
  input: string;
  /** Options passed as second argument (if static) */
  options?: DotOptions;
  /** The resolved style object (may contain nested structures for native/flutter) */
  result: Record<string, unknown>;
}

/** Options for the extractor */
export interface ExtractOptions {
  /** Allowed local names for a named `dot` import. Default: ['dot'] */
  functionNames?: string[];
  /** Default target for extraction. Default: 'web' */
  target?: "web" | "native" | "flutter";
}

type AstNode = {
  type: string;
  start?: number | null;
  end?: number | null;
  [key: string]: unknown;
};

type ParsedStaticOptions =
  | { admitted: true; opts: DotOptions }
  | { admitted: false };

const DOT_IMPORT_SOURCE = "@hua-labs/dot";
const STATIC_TARGETS = new Set(["web", "native", "flutter"]);

function admitConfiguredTarget(
  value: unknown,
): ExtractOptions["target"] | null {
  if (value === undefined) return "web";
  if (typeof value !== "string" || !STATIC_TARGETS.has(value)) return null;
  return value as NonNullable<ExtractOptions["target"]>;
}

const PARSER_PLUGIN_SETS = [
  ["jsx", "typescript", "decorators"],
  ["typescript", "decorators"],
] as const;

function parseModule(source: string): AstNode | null {
  for (const plugins of PARSER_PLUGIN_SETS) {
    try {
      return parse(source, {
        sourceType: "unambiguous",
        allowAwaitOutsideFunction: true,
        allowReturnOutsideFunction: true,
        plugins: [...plugins],
      }) as unknown as AstNode;
    } catch {
      // Try the next bounded parser shape, then fail closed.
    }
  }
  return null;
}

function walkAst(value: unknown, visit: (node: AstNode) => void): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) walkAst(item, visit);
    return;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.type === "string") visit(record as AstNode);

  for (const [key, child] of Object.entries(record)) {
    if (
      key === "loc" ||
      key === "start" ||
      key === "end" ||
      key === "extra" ||
      key === "comments" ||
      key === "tokens" ||
      key === "errors"
    ) {
      continue;
    }
    walkAst(child, visit);
  }
}

function identifierName(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const node = value as Record<string, unknown>;
  return node.type === "Identifier" && typeof node.name === "string"
    ? node.name
    : null;
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

function collectPatternNames(value: unknown, names: Set<string>): void {
  if (!value || typeof value !== "object") return;
  const node = value as Record<string, unknown>;

  const name = identifierName(node);
  if (name) {
    names.add(name);
    return;
  }

  switch (node.type) {
    case "RestElement":
      collectPatternNames(node.argument, names);
      return;
    case "AssignmentPattern":
      collectPatternNames(node.left, names);
      return;
    case "ArrayPattern":
      collectPatternNames(node.elements, names);
      return;
    case "ObjectPattern":
      collectPatternNames(node.properties, names);
      return;
    case "ObjectProperty":
      collectPatternNames(node.value, names);
      return;
    case "TSParameterProperty":
      collectPatternNames(node.parameter, names);
      return;
    default:
      if (Array.isArray(value)) {
        for (const item of value) collectPatternNames(item, names);
      }
  }
}

function collectBindingAuthority(
  ast: AstNode,
  configuredNames: Set<string>,
): Set<string> {
  const authorized = new Set<string>();
  const conflicting = new Set<string>();

  walkAst(ast, (node) => {
    const record = node as Record<string, unknown>;

    if (node.type === "ImportDeclaration") {
      const source = record.source as Record<string, unknown> | undefined;
      const isDotImport = source?.value === DOT_IMPORT_SOURCE;
      const declarationTypeOnly = record.importKind === "type";
      const specifiers = Array.isArray(record.specifiers)
        ? record.specifiers
        : [];

      for (const value of specifiers) {
        if (!value || typeof value !== "object") continue;
        const specifier = value as Record<string, unknown>;
        const local = identifierName(specifier.local);
        if (!local) continue;

        const isAuthorized =
          isDotImport &&
          !declarationTypeOnly &&
          specifier.type === "ImportSpecifier" &&
          specifier.importKind !== "type" &&
          importedName(specifier.imported) === "dot" &&
          configuredNames.has(local);

        if (isAuthorized) authorized.add(local);
        else conflicting.add(local);
      }
      return;
    }

    const bindings = new Set<string>();
    switch (node.type) {
      case "VariableDeclarator":
        collectPatternNames(record.id, bindings);
        break;
      case "FunctionDeclaration":
      case "FunctionExpression":
      case "ArrowFunctionExpression":
      case "ObjectMethod":
      case "ClassMethod":
      case "ClassPrivateMethod":
      case "TSDeclareFunction":
        collectPatternNames(record.id, bindings);
        collectPatternNames(record.params, bindings);
        break;
      case "ClassDeclaration":
      case "ClassExpression":
      case "TSEnumDeclaration":
      case "TSModuleDeclaration":
      case "TSImportEqualsDeclaration":
        collectPatternNames(record.id, bindings);
        break;
      case "CatchClause":
        collectPatternNames(record.param, bindings);
        break;
      default:
        return;
    }

    for (const binding of bindings) conflicting.add(binding);
  });

  for (const name of conflicting) authorized.delete(name);
  return authorized;
}

function staticPropertyKey(value: unknown): "target" | "dark" | null {
  if (!value || typeof value !== "object") return null;
  const node = value as Record<string, unknown>;
  const key =
    node.type === "Identifier" && typeof node.name === "string"
      ? node.name
      : node.type === "StringLiteral" && typeof node.value === "string"
        ? node.value
        : null;
  return key === "target" || key === "dark" ? key : null;
}

function parseStaticOptionsNode(value: unknown): ParsedStaticOptions {
  if (!value || typeof value !== "object") return { admitted: false };
  const node = value as Record<string, unknown>;
  if (node.type !== "ObjectExpression" || !Array.isArray(node.properties)) {
    return { admitted: false };
  }

  const opts: DotOptions = {};
  const seen = new Set<"target" | "dark">();

  for (const value of node.properties) {
    if (!value || typeof value !== "object") return { admitted: false };
    const property = value as Record<string, unknown>;
    if (
      property.type !== "ObjectProperty" ||
      property.computed === true ||
      property.shorthand === true
    ) {
      return { admitted: false };
    }

    const key = staticPropertyKey(property.key);
    if (!key || seen.has(key)) return { admitted: false };
    seen.add(key);

    const propertyValue = property.value as Record<string, unknown> | undefined;
    if (key === "target") {
      if (
        propertyValue?.type !== "StringLiteral" ||
        typeof propertyValue.value !== "string" ||
        !STATIC_TARGETS.has(propertyValue.value)
      ) {
        return { admitted: false };
      }
      opts.target = propertyValue.value as DotOptions["target"];
      continue;
    }

    if (
      propertyValue?.type !== "BooleanLiteral" ||
      typeof propertyValue.value !== "boolean"
    ) {
      return { admitted: false };
    }
    opts.dark = propertyValue.value;
  }

  return { admitted: true, opts };
}

// ---------------------------------------------------------------------------
// Value serialization — handles nested objects/arrays for native/flutter
// ---------------------------------------------------------------------------

/**
 * Convert any JS value to a source code literal string.
 * Handles primitives, arrays, and nested objects (RN transforms, Flutter recipes).
 */
function valueToLiteral(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string")
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return `[${value.map(valueToLiteral).join(", ")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const parts = entries.map(([k, v]) => {
      const safeKey = /^[a-zA-Z_$][\w$]*$/.test(k) ? k : `"${k}"`;
      return `${safeKey}: ${valueToLiteral(v)}`;
    });
    return `{${parts.join(", ")}}`;
  }

  return String(value);
}

/**
 * Convert a style result to a JavaScript object literal string.
 * Handles nested structures (RN transform arrays, Flutter recipe objects).
 */
export function styleToObjectLiteral(style: Record<string, unknown>): string {
  const entries = Object.entries(style);
  if (entries.length === 0) return "({})";

  const parts = entries.map(([key, value]) => {
    const safeKey = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `"${key}"`;
    return `${safeKey}: ${valueToLiteral(value)}`;
  });

  return `({${parts.join(", ")}})`;
}

// ---------------------------------------------------------------------------
// Core extraction
// ---------------------------------------------------------------------------

/**
 * Extract all static dot() calls from source code.
 *
 * Returns an array of extraction results sorted by position (last-first)
 * for safe string replacement without offset shifting.
 */
export function extractStaticCalls(
  source: string,
  options?: ExtractOptions,
): ExtractedCall[] {
  const ast = parseModule(source);
  if (!ast) return [];

  const fnNames = new Set(options?.functionNames ?? ["dot"]);
  const authorizedBindings = collectBindingAuthority(ast, fnNames);
  if (authorizedBindings.size === 0) return [];

  const defaultTarget = admitConfiguredTarget(options?.target as unknown);
  if (defaultTarget === null) return [];

  const results: ExtractedCall[] = [];
  walkAst(ast, (node) => {
    if (node.type !== "CallExpression") return;
    const record = node as Record<string, unknown>;
    const calleeName = identifierName(record.callee);
    if (!calleeName || !authorizedBindings.has(calleeName)) return;

    const args = Array.isArray(record.arguments) ? record.arguments : [];
    if (args.length === 0 || args.length > 2) return;

    const firstArg = args[0] as Record<string, unknown> | undefined;
    if (
      firstArg?.type !== "StringLiteral" ||
      typeof firstArg.value !== "string"
    ) {
      return;
    }

    const parsed =
      args.length === 2
        ? parseStaticOptionsNode(args[1])
        : { admitted: true as const, opts: {} };
    if (!parsed.admitted) return;

    const start = node.start;
    const end = node.end;
    if (typeof start !== "number" || typeof end !== "number") return;

    const input = firstArg.value;
    const callOpts =
      Object.keys(parsed.opts).length > 0 ? parsed.opts : undefined;
    const resolveOpts: DotOptions = {
      target: callOpts?.target ?? defaultTarget,
      ...(callOpts?.dark !== undefined ? { dark: callOpts.dark } : {}),
    };

    try {
      const result = dot(input, resolveOpts) as Record<string, unknown>;
      results.push({
        start,
        end,
        input,
        options: callOpts,
        result,
      });
    } catch {
      // Skip calls that fail to resolve (malformed input)
      return;
    }
  });

  // Sort last-first for safe replacement
  return results.sort((a, b) => b.start - a.start);
}

/**
 * Apply static extraction to source code — replace dot() calls with object literals.
 *
 * @returns Transformed source code, or null if no changes were made
 */
export function transformSource(
  source: string,
  options?: ExtractOptions,
): { code: string; extractions: number } | null {
  const calls = extractStaticCalls(source, options);
  if (calls.length === 0) return null;

  let code = source;
  for (const call of calls) {
    // calls are sorted last-first, so offsets remain valid
    code =
      code.slice(0, call.start) +
      styleToObjectLiteral(call.result) +
      code.slice(call.end);
  }

  return { code, extractions: calls.length };
}
