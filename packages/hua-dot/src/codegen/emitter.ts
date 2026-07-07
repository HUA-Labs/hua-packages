/**
 * Emitter interface — the contract for platform-specific code generators.
 *
 * Each emitter (Swift, Compose) implements this interface to produce
 * source code from DotIR nodes.
 */

import type { DotIR } from './ir';

/** Target platform for code generation */
export type CodegenTarget = 'swift' | 'compose';

/**
 * Emitter — transforms DotIR into platform-specific source code.
 *
 * Usage:
 * 1. Create an emitter instance
 * 2. Call emit() for each style definition
 * 3. Call finalize() to get the complete source file(s)
 */
export interface DotEmitter {
  /** Target platform identifier */
  readonly target: CodegenTarget;

  /**
   * Emit code for a single DotIR node.
   * Returns the generated code fragment for this style.
   */
  emit(ir: DotIR): string;

  /**
   * Finalize and return the complete source file content.
   * Wraps all emitted fragments with imports, namespace, etc.
   *
   * @param moduleName - Name for the generated module/file
   */
  finalize(moduleName: string): string;
}

/**
 * Codegen result — output of the pipeline.
 */
export interface CodegenResult {
  /** Target platform */
  target: CodegenTarget;
  /** Generated file name (e.g., "DotStyles.swift", "DotStyles.kt") */
  fileName: string;
  /** Complete file content */
  content: string;
  /** Number of styles processed */
  styleCount: number;
}

/**
 * Codegen options for the pipeline.
 */
export interface CodegenOptions {
  /** Target platform */
  target: CodegenTarget;
  /** Module name for the generated file */
  moduleName?: string;
  /** Base pixel value for rem conversion */
  remBase?: number;
}
