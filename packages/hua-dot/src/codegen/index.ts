/**
 * dot codegen — build-time native code generation from dot utility strings.
 *
 * @module @hua-labs/dot/codegen
 */

// IR types
export type {
  DotIR,
  DotStyleDefinition,
  IREdgeInsets,
  IRColors,
  IRTypography,
  IRBorder,
  IRBorderSide,
  IRBorderRadius,
  IRShadow,
  IRLayout,
  IRSizing,
  IRPositioning,
  IRTransform,
  IRGradient,
  IRFlexChild,
} from './ir';

// Emitter interface
export type {
  DotEmitter,
  CodegenTarget,
  CodegenResult,
  CodegenOptions,
} from './emitter';

// Conversion
export { toIR } from './to-ir';
export type { ToIROptions } from './to-ir';

// Pipeline
export {
  extractStylesFromSource,
  extractStylesFromJSON,
  resolveToIR,
  codegen,
} from './pipeline';

// Stub emitter (for testing / Phase 1)
export { StubEmitter } from './stub-emitter';

// Swift emitter (Phase 2)
export { SwiftEmitter } from './swift-emitter';

// Compose emitter (Phase 3)
export { ComposeEmitter } from './compose-emitter';
