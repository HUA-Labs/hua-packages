/**
 * @hua-labs/hua/motion
 *
 * Motion hooks subpath export
 */

'use client';

// Named exports to avoid CJS export * warnings with Turbopack
export {
  MotionEngine, motionEngine,
  TransitionEffects, transitionEffects,
  useSimplePageMotion, usePageMotions, useSmartMotion, useUnifiedMotion,
  useFadeIn, useSlideUp, useSlideLeft, useSlideRight, useSlideDown,
  useScaleIn, useBounceIn, usePulse, useSpringMotion, useGradient,
  useHoverMotion, useClickToggle, useFocusToggle,
  useScrollReveal, useScrollProgress,
  useMotionState, useRepeat, useToggleMotion,
  useInView, useMouse, useReducedMotion, useWindowSize,
  useGesture, useGestureMotion,
  useTypewriter, useCustomCursor, useMagneticCursor, useSmoothScroll, useElementProgress,
  useStagger,
  MOTION_PRESETS, PAGE_MOTIONS, mergeWithPreset, getPagePreset, getMotionPreset,
  neutral, hua, resolveProfile, mergeProfileOverrides,
  MotionProfileProvider, useMotionProfile,
  linear, easeIn, easeOut, easeInOut,
  easeInQuad, easeOutQuad, easeInOutQuad,
  getEasing, applyEasing, safeApplyEasing, isValidEasing,
  getAvailableEasings, isEasingFunction, easingPresets, getPresetEasing,
  Motion,
} from '@hua-labs/motion-core'
export type {
  MotionFrame, MotionOptions, Motion as MotionInstance,
  TransitionType, TransitionOptions,
  UseUnifiedMotionOptions, MotionEffects,
  TypewriterOptions, TypewriterReturn,
  CustomCursorOptions, CustomCursorReturn,
  MagneticCursorOptions, MagneticCursorReturn,
  SmoothScrollOptions, SmoothScrollReturn,
  ElementProgressOptions, ElementProgressReturn,
  UseStaggerOptions, UseStaggerReturn,
  EasingFunction, EasingType,
  MotionProps,
  MotionProfile, MotionProfileBase, MotionProfileEntrance, MotionProfileStagger,
  MotionProfileInteraction, MotionProfileSpring, ReducedMotionStrategy,
  BuiltInProfileName, MotionProfileProviderProps, DeepPartial,
  PageType, MotionType, EntranceType,
  PageMotionElement, PageMotionsConfig, MotionState, PageMotionRef,
  BaseMotionOptions, BaseMotionReturn, MotionElement,
  MotionPreset, PresetConfig,
  SpringConfig, GestureConfig, OrchestrationConfig,
  FadeInOptions, SlideOptions, ScaleOptions, BounceOptions,
  PulseOptions, SpringOptions, GestureOptions,
  ScrollRevealOptions, ScrollRevealMotionType, GradientOptions,
  ToggleMotionOptions, RepeatOptions, HoverMotionOptions, InteractionReturn,
  InViewOptions, InViewReturn, MouseOptions, MouseReturn,
  ReducedMotionReturn, WindowSizeOptions, WindowSizeReturn,
  PerformanceMetrics, MotionConfig,
  MotionDirection, MotionEasing, MotionTrigger,
  MotionCallback, MotionProgressCallback, MotionStateCallback,
} from '@hua-labs/motion-core'
