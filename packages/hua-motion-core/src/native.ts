// ========================================
// HUA Motion Core - Native (React Native) Entry Point
// ========================================
// Platform-agnostic code (shared with web) + RN Animated hooks

// ========================================
// Platform-Agnostic: Core Engine
// ========================================
export {
  MotionEngine,
  motionEngine,
  type MotionFrame,
  type MotionOptions,
  type Motion as MotionInstance,
} from './core/MotionEngine'

export {
  TransitionEffects,
  transitionEffects,
  type TransitionType,
  type TransitionOptions,
} from './core/TransitionEffects'

// ========================================
// Platform-Agnostic: Easing & Spring Physics
// ========================================
export {
  linear, easeIn, easeOut, easeInOut,
  easeInQuad, easeOutQuad, easeInOutQuad,
  type EasingFunction, type EasingType,
  getEasing, applyEasing, safeApplyEasing, isValidEasing,
  getAvailableEasings, isEasingFunction, easingPresets, getPresetEasing,
} from './utils/easing'

export { calculateSpring } from './utils/springPhysics'
export type { SpringConfig as SpringPhysicsConfig, SpringResult } from './utils/springPhysics'

// ========================================
// Platform-Agnostic: Presets & Profiles
// ========================================
export * from './presets'

export {
  neutral,
  hua,
  resolveProfile,
  mergeProfileOverrides,
  MotionProfileProvider,
  useMotionProfile,
} from './profiles'

export type {
  MotionProfile,
  MotionProfileBase,
  MotionProfileEntrance,
  MotionProfileStagger,
  MotionProfileInteraction,
  MotionProfileSpring,
  ReducedMotionStrategy,
  BuiltInProfileName,
  MotionProfileProviderProps,
  DeepPartial,
} from './profiles'

// ========================================
// Platform-Agnostic: State Manager
// ========================================
export { MotionStateManager } from './managers/MotionStateManager'

// ========================================
// Platform-Agnostic: Types
// ========================================
export type {
  BaseMotionOptions,
  FadeInOptions,
  SlideOptions,
  ScaleOptions,
  BounceOptions,
  PulseOptions,
  SpringOptions,
  SpringConfig,
  MotionDirection,
  MotionEasing,
  MotionTrigger,
  MotionCallback,
  MotionProgressCallback,
} from './types'

// ========================================
// Native Hooks (React Native Animated API)
// ========================================
export {
  useFadeIn,
  useSlideUp,
  useSlideDown,
  useSlideLeft,
  useSlideRight,
  useScaleIn,
  useBounceIn,
  useSpringMotion,
  usePulse,
  useStagger,
} from './hooks-native'

export type {
  NativeMotionReturn,
  NativeMotionOptions,
  NativeFadeInOptions,
  NativeSlideOptions,
  NativeScaleInOptions,
  NativeBounceInOptions,
  NativeSpringMotionOptions,
  NativeSpringMotionReturn,
  NativePulseOptions,
  NativeStaggerOptions,
  NativeStaggerItem,
  NativeStaggerReturn,
} from './hooks-native'
