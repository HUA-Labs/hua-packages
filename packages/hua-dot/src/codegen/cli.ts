#!/usr/bin/env node
/**
 * dot-codegen CLI
 *
 * Usage:
 *   dot-codegen --target swift --input styles.ts --output Generated/
 *   dot-codegen --target compose --input styles.json --output Generated/
 *   dot-codegen --target swift --input styles.ts --module AppStyles --watch
 *
 * Input formats:
 *   .ts/.js  — scans for `const name = dot('...')` patterns
 *   .json    — expects `{ "styles": { "name": "utility string" } }`
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, watch } from 'node:fs';
import { resolve, extname, join } from 'node:path';
import type { DotEmitter, CodegenTarget } from './emitter';
import type { DotStyleDefinition } from './ir';
import { extractStylesFromSource, extractStylesFromJSON, codegen } from './pipeline';
import { SwiftEmitter } from './swift-emitter';
import { ComposeEmitter } from './compose-emitter';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

interface CLIArgs {
  target: CodegenTarget;
  input: string;
  output: string;
  module: string;
  remBase: number;
  watch: boolean;
}

function parseArgs(argv: string[]): CLIArgs {
  const args: Partial<CLIArgs> = {
    module: 'DotStyles',
    remBase: 16,
    output: './',
    watch: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--target':
      case '-t':
        args.target = argv[++i] as CodegenTarget;
        break;
      case '--input':
      case '-i':
        args.input = argv[++i];
        break;
      case '--output':
      case '-o':
        args.output = argv[++i];
        break;
      case '--module':
      case '-m':
        args.module = argv[++i];
        break;
      case '--rem-base': {
        const v = parseInt(argv[++i], 10);
        if (!v || v <= 0) {
          console.error('Error: --rem-base must be a positive number');
          process.exit(1);
        }
        args.remBase = v;
        break;
      }
      case '--watch':
      case '-w':
        args.watch = true;
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
    }
  }

  if (!args.target) {
    console.error('Error: --target is required (swift | compose)');
    process.exit(1);
  }
  if (args.target !== 'swift' && args.target !== 'compose') {
    console.error(`Error: unsupported target "${args.target}". Use: swift | compose`);
    process.exit(1);
  }
  if (!args.input) {
    console.error('Error: --input is required');
    process.exit(1);
  }

  return args as CLIArgs;
}

function printUsage(): void {
  console.log(`
dot-codegen — Generate native Swift/Compose code from dot utility strings

Usage:
  dot-codegen --target <swift|compose> --input <file> [options]

Options:
  -t, --target     Target platform: swift | compose
  -i, --input      Input file (.ts, .js, or .json)
  -o, --output     Output directory (default: ./)
  -m, --module     Module name for generated file (default: DotStyles)
      --rem-base   Base pixel value for rem conversion (default: 16)
  -w, --watch      Watch input file for changes and regenerate
  -h, --help       Show this help message

Input formats:
  .ts/.js   Scans for: export const name = dot('...')
  .json     Expects:   { "styles": { "name": "utility string" } }

Examples:
  dot-codegen -t swift -i src/styles.ts -o ios/Generated/
  dot-codegen -t compose -i styles.json -o android/theme/ -m AppTheme
  dot-codegen -t swift -i src/styles.ts -o ios/Generated/ --watch
`);
}

// ---------------------------------------------------------------------------
// Emitter factory
// ---------------------------------------------------------------------------

function createEmitter(target: CodegenTarget): DotEmitter {
  switch (target) {
    case 'swift':
      return new SwiftEmitter();
    case 'compose':
      return new ComposeEmitter();
  }
}

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------

function generate(args: CLIArgs): void {
  const inputPath = resolve(args.input);

  if (!existsSync(inputPath)) {
    console.error(`Error: input file not found: ${inputPath}`);
    process.exit(1);
  }

  // Read and extract style definitions
  const source = readFileSync(inputPath, 'utf-8');
  const ext = extname(inputPath).toLowerCase();
  let definitions: DotStyleDefinition[] | undefined;

  if (ext === '.json') {
    definitions = extractStylesFromJSON(source);
  } else if (ext === '.ts' || ext === '.js' || ext === '.tsx' || ext === '.jsx') {
    definitions = extractStylesFromSource(source);
  }

  if (!definitions) {
    console.error(`Error: unsupported file type "${ext}". Use .ts, .js, or .json`);
    process.exit(1);
  }

  if (definitions.length === 0) {
    console.warn('Warning: no style definitions found in input file');
    return;
  }

  // Create emitter and run pipeline
  const emitter = createEmitter(args.target);
  const result = codegen(definitions, emitter, {
    target: args.target,
    moduleName: args.module,
    remBase: args.remBase,
  });

  // Write output
  const outputDir = resolve(args.output);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, result.fileName);
  writeFileSync(outputPath, result.content, 'utf-8');

  console.log(`[dot-codegen] ${result.styleCount} styles → ${outputPath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function main(argv: string[] = process.argv.slice(2)): void {
  if (argv.length === 0) {
    printUsage();
    return;
  }
  const args = parseArgs(argv);

  // Initial generation
  generate(args);

  // Watch mode
  if (args.watch) {
    const inputPath = resolve(args.input);
    console.log(`[dot-codegen] Watching ${inputPath} for changes...`);

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    watch(inputPath, () => {
      // Debounce rapid changes (e.g., editor save)
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`[dot-codegen] Change detected, regenerating...`);
        try {
          generate(args);
        } catch (err) {
          console.error(`[dot-codegen] Error:`, err instanceof Error ? err.message : err);
        }
      }, 100);
    });
  }
}

// Auto-run when executed as CLI binary
main();
