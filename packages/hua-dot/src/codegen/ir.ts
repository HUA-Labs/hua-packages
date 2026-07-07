/**
 * DotIR — Platform-neutral Intermediate Representation for code generation.
 *
 * Pipeline: utility string → parse → resolve → StyleObject → toIR() → DotIR → emitter → Swift/Compose
 *
 * Structurally similar to FlutterRecipe but designed for build-time codegen:
 * - Carries `name` for generated function/modifier naming
 * - Carries `input` for source comment traceability
 * - All numbers are absolute (px-equivalent, no rem/em/%)
 * - Colors are hex strings
 */

// ---------------------------------------------------------------------------
// Edge Insets (padding, margin)
// ---------------------------------------------------------------------------

export interface IREdgeInsets {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export interface IRColors {
  background?: string;
  text?: string;
  border?: string;
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export interface IRTypography {
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: string;
  textDecoration?: string;
  fontStyle?: string;
}

// ---------------------------------------------------------------------------
// Border
// ---------------------------------------------------------------------------

export interface IRBorderSide {
  width?: number;
  color?: string;
  style?: string;
}

export interface IRBorderRadius {
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
}

export interface IRBorder {
  /** Uniform or per-side border — simplified to uniform for codegen v1 */
  side?: IRBorderSide;
  radius?: IRBorderRadius;
}

// ---------------------------------------------------------------------------
// Shadow
// ---------------------------------------------------------------------------

export interface IRShadow {
  color: string;
  opacity: number;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export interface IRLayout {
  display?: 'flex' | 'grid' | 'none';
  direction?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  wrap?: boolean;
  gap?: number;
  rowGap?: number;
  columnGap?: number;
}

// ---------------------------------------------------------------------------
// Sizing
// ---------------------------------------------------------------------------

export interface IRSizing {
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  expandWidth?: boolean;
  expandHeight?: boolean;
}

// ---------------------------------------------------------------------------
// Positioning
// ---------------------------------------------------------------------------

export interface IRPositioning {
  type?: 'relative' | 'absolute';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

export interface IRTransform {
  rotate?: number; // degrees (emitters convert to platform format)
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
}

// ---------------------------------------------------------------------------
// Gradient
// ---------------------------------------------------------------------------

export interface IRGradient {
  type: 'linear';
  direction: string;
  stops: Array<{ color: string; position?: number }>;
}

// ---------------------------------------------------------------------------
// Flex Child
// ---------------------------------------------------------------------------

export interface IRFlexChild {
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  order?: number;
}

// ---------------------------------------------------------------------------
// DotIR — the complete intermediate representation
// ---------------------------------------------------------------------------

export interface DotIR {
  /** Generated function/modifier name (e.g., "cardBase", "heading") */
  name: string;
  /** Original utility string for traceability */
  input: string;

  // Structured properties
  padding?: IREdgeInsets;
  margin?: IREdgeInsets;
  colors?: IRColors;
  typography?: IRTypography;
  border?: IRBorder;
  shadows?: IRShadow[];
  layout?: IRLayout;
  sizing?: IRSizing;
  positioning?: IRPositioning;
  transform?: IRTransform;
  gradient?: IRGradient;
  flexChild?: IRFlexChild;

  // Scalar properties
  opacity?: number;
  visible?: boolean;
  aspectRatio?: number;
  zIndex?: number;
}

// ---------------------------------------------------------------------------
// Style definition — input to the codegen pipeline
// ---------------------------------------------------------------------------

/** A named style definition: name → utility string */
export interface DotStyleDefinition {
  name: string;
  input: string;
}
