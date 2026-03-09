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

import { dot } from '@hua-labs/dot';
import type { DotOptions } from '@hua-labs/dot';

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
  /** Function names to extract. Default: ['dot'] */
  functionNames?: string[];
  /** Default target for extraction. Default: 'web' */
  target?: 'web' | 'native' | 'flutter';
}

/**
 * Regex to find dot('string literal') or dot("string literal") calls.
 *
 * Handles:
 *   dot('p-4 bg-red-500')
 *   dot("p-4 bg-red-500")
 *   dot('p-4 bg-red-500', { target: 'web' })
 *
 * Does NOT match:
 *   dot(variable)
 *   dot(`template ${literal}`)
 *   dot('...' + '...')
 *   obj.dot('...') — negative lookbehind blocks [.\w$]
 */
function buildPattern(fnNames: string[]): RegExp {
  const names = fnNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(
    `(?<![\\w$.])(?:${names})\\(\\s*(['"])([^'"]*)\\1\\s*(?:,\\s*(\\{[^}]*\\}))?\\s*\\)`,
    'g',
  );
}

// ---------------------------------------------------------------------------
// Context detection — skip matches inside strings or comments
// ---------------------------------------------------------------------------

/**
 * Check if a match position is inside a string literal or comment.
 * Simple heuristic that works for typical source code.
 */
function isInsideStringOrComment(source: string, matchIndex: number): boolean {
  // Get the line containing the match
  const lineStart = source.lastIndexOf('\n', matchIndex - 1) + 1;
  const beforeMatch = source.slice(lineStart, matchIndex);

  // Single-line comment: // appears before match on the same line
  const commentIdx = beforeMatch.indexOf('//');
  if (commentIdx !== -1) {
    // Make sure the // isn't inside a string on this line
    // Simple check: count quotes before //
    const beforeComment = beforeMatch.slice(0, commentIdx);
    const singles = (beforeComment.match(/(?<!\\)'/g) || []).length;
    const doubles = (beforeComment.match(/(?<!\\)"/g) || []).length;
    if (singles % 2 === 0 && doubles % 2 === 0) return true;
  }

  // Block comment: last /* before match has no matching */ after it
  const beforeAll = source.slice(0, matchIndex);
  const lastBlockOpen = beforeAll.lastIndexOf('/*');
  const lastBlockClose = beforeAll.lastIndexOf('*/');
  if (lastBlockOpen > lastBlockClose) return true;

  // String literal: odd number of unescaped quotes before match on same line
  let singleQuotes = 0;
  let doubleQuotes = 0;
  let backticks = 0;
  for (let i = 0; i < beforeMatch.length; i++) {
    if (beforeMatch[i] === '\\') { i++; continue; }
    if (beforeMatch[i] === "'") singleQuotes++;
    if (beforeMatch[i] === '"') doubleQuotes++;
    if (beforeMatch[i] === '`') backticks++;
  }
  if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0 || backticks % 2 !== 0) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Static options parsing
// ---------------------------------------------------------------------------

/** Parsed static options from source code */
interface ParsedStaticOptions {
  opts: DotOptions;
  /** Whether extraction should be skipped (e.g., breakpoint present) */
  skipExtraction: boolean;
}

/**
 * Try to parse a static options object literal.
 * Only handles simple { key: 'value' } patterns — no expressions.
 *
 * If breakpoint is present, signals to skip extraction (runtime-dependent).
 */
function parseStaticOptions(str: string): ParsedStaticOptions {
  const targetMatch = str.match(/target\s*:\s*['"](\w+)['"]/);
  const darkMatch = str.match(/dark\s*:\s*(true|false)/);
  const breakpointMatch = str.match(/breakpoint\s*:/);

  // Breakpoint is inherently dynamic — skip extraction
  if (breakpointMatch) return { opts: {}, skipExtraction: true };

  const opts: DotOptions = {};
  if (targetMatch) opts.target = targetMatch[1] as DotOptions['target'];
  if (darkMatch) opts.dark = darkMatch[1] === 'true';

  return { opts: Object.keys(opts).length > 0 ? opts : {}, skipExtraction: false };
}

// ---------------------------------------------------------------------------
// Value serialization — handles nested objects/arrays for native/flutter
// ---------------------------------------------------------------------------

/**
 * Convert any JS value to a source code literal string.
 * Handles primitives, arrays, and nested objects (RN transforms, Flutter recipes).
 */
function valueToLiteral(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    return `[${value.map(valueToLiteral).join(', ')}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const parts = entries.map(([k, v]) => {
      const safeKey = /^[a-zA-Z_$][\w$]*$/.test(k) ? k : `"${k}"`;
      return `${safeKey}: ${valueToLiteral(v)}`;
    });
    return `{${parts.join(', ')}}`;
  }

  return String(value);
}

/**
 * Convert a style result to a JavaScript object literal string.
 * Handles nested structures (RN transform arrays, Flutter recipe objects).
 */
export function styleToObjectLiteral(style: Record<string, unknown>): string {
  const entries = Object.entries(style);
  if (entries.length === 0) return '({})';

  const parts = entries.map(([key, value]) => {
    const safeKey = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `"${key}"`;
    return `${safeKey}: ${valueToLiteral(value)}`;
  });

  return `({${parts.join(', ')}})`;
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
  const fnNames = options?.functionNames ?? ['dot'];
  const defaultTarget = options?.target ?? 'web';
  const pattern = buildPattern(fnNames);

  const results: ExtractedCall[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    // Skip matches inside strings or comments
    if (isInsideStringOrComment(source, match.index)) continue;

    const input = match[2];
    const optionsStr = match[3];

    // Parse static options if present
    const parsed = optionsStr ? parseStaticOptions(optionsStr) : null;
    if (parsed?.skipExtraction) continue;

    const callOpts = parsed?.opts;
    const resolveOpts: DotOptions = {
      target: callOpts?.target ?? defaultTarget,
      ...(callOpts?.dark !== undefined ? { dark: callOpts.dark } : {}),
    };

    try {
      const result = dot(input, resolveOpts) as Record<string, unknown>;
      results.push({
        start: match.index,
        end: match.index + match[0].length,
        input,
        options: callOpts && Object.keys(callOpts).length > 0 ? callOpts : undefined,
        result,
      });
    } catch {
      // Skip calls that fail to resolve (malformed input)
      continue;
    }
  }

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
    code = code.slice(0, call.start) + styleToObjectLiteral(call.result) + code.slice(call.end);
  }

  return { code, extractions: calls.length };
}
