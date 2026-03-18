/**
 * 스타일 시스템 re-export
 * 모든 스타일 유틸리티를 한 곳에서 import할 수 있도록 합니다.
 */

// Colors
export {
  createColorStyles,
  useColorStyles,
  type ColorStyleConfig,
  type ColorStyles,
} from "./colors";

// Variants
export {
  createVariantStyles,
  createSizeStyles,
  createRoundedStyles,
  createShadowStyles,
  createHoverStyles,
  HUA_SPRING_EASING,
  type SizeStyles,
  type Rounded,
  type Shadow,
  type HoverEffect,
} from "./variants";

// Glass
export { createGlassStyle, type GlassIntensity } from "./glass";

// Animation
export {
  createSpringTransition,
  createEnterAnimation,
  type EnterPreset,
} from "./animation";

// Focus
export {
  FOCUS_RING_OFFSET,
  FOCUS_RING_THIN,
  FOCUS_RING_DESTRUCTIVE,
  FOCUS_RING_CONTROL,
  FOCUS_RING_CONTROL_SOFT,
  FORM_FOCUS_BASE,
  FORM_FOCUS_ERROR,
  FORM_FOCUS_SUCCESS,
  FORM_BORDER_ERROR,
  FORM_BORDER_SUCCESS,
  FORM_DISABLED,
  RADIO_FOCUS_SHADOW,
  getButtonFocusRing,
} from "./focus";

// Hover
export { FORM_HOVER, CONTROL_HOVER_BORDER } from "./hover";

// Disabled
export { DISABLED_INTERACTIVE, DISABLED_INPUT } from "./disabled";

// Transition
export {
  TRANSITIONS,
  createPropertyTransition,
  type TransitionPreset,
} from "./transition";

// Utils
export {
  withDarkMode,
  createGradient,
  withOpacity,
  isTextWhite,
  isGradientVariant,
  responsive,
  conditionalClass,
} from "./utils";
