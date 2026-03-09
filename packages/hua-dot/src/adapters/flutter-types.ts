/**
 * Flutter recipe types — structured output that maps to Flutter widget composition.
 *
 * Unlike web (CSSProperties) or RN (StyleSheet), Flutter needs a recipe
 * that maps to widget tree concepts: BoxDecoration, EdgeInsets, TextStyle, etc.
 *
 * The dot engine produces this recipe; the SDUI renderer / hua-ui-flutter
 * is responsible for turning it into actual Flutter widgets.
 */

/** EdgeInsets — maps to Flutter EdgeInsets.only() */
export interface FlutterEdgeInsets {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/** BoxShadow entry — maps to Flutter BoxShadow() */
export interface FlutterBoxShadow {
  color: string;
  offset: { dx: number; dy: number };
  blurRadius: number;
  spreadRadius: number;
}

/** Border side — maps to Flutter BorderSide() */
export interface FlutterBorderSide {
  width?: number;
  color?: string;
  style?: 'solid' | 'none';
}

/** Border radius — maps to Flutter BorderRadius.only() */
export interface FlutterBorderRadius {
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
}

/** LinearGradient — maps to Flutter LinearGradient() */
export interface FlutterGradient {
  type: 'linear';
  begin: string;
  end: string;
  colors: string[];
  stops?: number[];
}

/** BoxDecoration — maps to Flutter BoxDecoration() */
export interface FlutterDecoration {
  color?: string;
  gradient?: FlutterGradient;
  borderRadius?: FlutterBorderRadius;
  border?: FlutterBorderSide;
  boxShadow?: FlutterBoxShadow[];
}

/** BoxConstraints + explicit size — maps to SizedBox / ConstrainedBox */
export interface FlutterConstraints {
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  /** Width should fill parent (100%, w-full) — maps to double.infinity */
  expandWidth?: boolean;
  /** Height should fill parent (100%, h-full) — maps to double.infinity */
  expandHeight?: boolean;
}

/** Flex layout props — maps to Row/Column/Wrap */
export interface FlutterLayout {
  direction?: 'row' | 'column';
  mainAxisAlignment?: string;
  crossAxisAlignment?: string;
  wrap?: boolean;
}

/** Flex child props — maps to Flexible/Expanded */
export interface FlutterFlexChild {
  flex?: number;
  flexFit?: 'tight' | 'loose';
  order?: number;
}

/** Position inside a Stack */
export interface FlutterPositioning {
  type?: 'relative' | 'absolute';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/** TextStyle — maps to Flutter TextStyle() + Text widget props */
export interface FlutterTextStyle {
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  letterSpacing?: number;
  height?: number; // lineHeight as multiplier
  decoration?: string;
  fontStyle?: string;
  textAlign?: string;
  /** Max lines for text overflow — maps to Text.maxLines */
  maxLines?: number;
  /** Text overflow behavior when maxLines is set — maps to Text.overflow */
  overflow?: 'clip' | 'ellipsis' | 'fade';
}

/** 2D Transform — maps to Matrix4 / Transform widget */
export interface FlutterTransform {
  rotate?: number; // radians
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
  skewX?: number;
  skewY?: number;
  origin?: string;
}

/**
 * FlutterRecipe — the complete structured output from dot(target: 'flutter').
 *
 * Each field maps to a Flutter widget or widget property:
 * - decoration → Container/DecoratedBox
 * - padding/margin → Container or Padding widget
 * - constraints → SizedBox/ConstrainedBox
 * - layout → Row/Column/Wrap
 * - flexChild → Flexible/Expanded
 * - positioning → Positioned (inside Stack)
 * - textStyle → DefaultTextStyle/Text
 * - transform → Transform widget
 * - opacity → Opacity widget
 * - visible → Visibility widget
 * - aspectRatio → AspectRatio widget
 * - zIndex → ordering in Stack
 */
export interface FlutterRecipe {
  decoration?: FlutterDecoration;
  padding?: FlutterEdgeInsets;
  margin?: FlutterEdgeInsets;
  constraints?: FlutterConstraints;
  layout?: FlutterLayout;
  flexChild?: FlutterFlexChild;
  positioning?: FlutterPositioning;
  textStyle?: FlutterTextStyle;
  transform?: FlutterTransform;
  opacity?: number;
  visible?: boolean;
  aspectRatio?: number;
  zIndex?: number;
  /** Properties dropped because Flutter doesn't support them */
  _dropped?: string[];
}
