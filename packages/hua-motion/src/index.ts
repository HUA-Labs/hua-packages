// Core hooks
export { useSimpleMotion } from './hooks/useSimpleMotion'
export { usePageMotions } from './hooks/usePageMotions'
export { useSmartMotion } from './hooks/useSmartMotion'
export { useCustomMotion } from './hooks/useSimpleMotion'

// Individual motion hooks
export { useFadeIn } from './hooks/useFadeIn'
export { useSlideUp } from './hooks/useSlideUp'
export { useSlideLeft } from './hooks/useSlideLeft'
export { useSlideRight } from './hooks/useSlideRight'
export { useScaleIn } from './hooks/useScaleIn'
export { useBounceIn } from './hooks/useBounceIn'
export { useFlipIn } from './hooks/useFlipIn'
export { usePulse } from './hooks/usePulse'
export { useGradient } from './hooks/useGradient'
export { useSpringMotion } from './hooks/useSpringMotion'
export { useMotion } from './hooks/useMotion'
export { useHoverMotion } from './hooks/useHoverMotion'
export { useScrollReveal } from './hooks/useScrollReveal'
export { useScrollToggle } from './hooks/useScrollToggle'
export { useStickyToggle } from './hooks/useStickyToggle'
export { useScrollProgress } from './hooks/useScrollProgress'
export { useScrollDirection } from './hooks/useScrollDirection'
export { useVisibilityToggle } from './hooks/useVisibilityToggle'
export { useAutoPlay } from './hooks/useAutoPlay'
export { useMotionState } from './hooks/useMotionState'
export { useGameLoop } from './hooks/useGameLoop'
export { useClickToggle } from './hooks/useClickToggle'
export { useFocusToggle } from './hooks/useFocusToggle'
export { useKeyboardToggle } from './hooks/useKeyboardToggle'
export { useAutoFade } from './hooks/useAutoFade'
export { useAutoSlide } from './hooks/useAutoSlide'
export { useAutoScale } from './hooks/useAutoScale'
export { useGesture } from './hooks/useGesture'
export { useOrchestration } from './hooks/useOrchestration'
export { useLayoutMotion, createLayoutTransition } from './hooks/useLayoutMotion'
export { useSequence } from './hooks/useSequence'
export { useToggleMotion } from './hooks/useToggleMotion'
export { useMotionOrchestra } from './hooks/useMotionOrchestra'
export { useGestureMotion } from './hooks/useGestureMotion'
export { useLanguageAwareMotion } from './hooks/useLanguageAwareMotion'

// Easing functions - 개별 함수들을 명시적으로 export
export {
  linear, easeIn, easeOut, easeInOut, easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart,
  easeInQuint, easeOutQuint, easeInOutQuint, easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo, easeInOutExpo, easeInCirc, easeOutCirc, easeInOutCirc,
  easeInBounce, easeOutBounce, easeInOutBounce, easeInBack, easeOutBack, easeInOutBack,
  easeInElastic, easeOutElastic, easeInOutElastic,
  pulse, pulseSmooth, skeletonWave, blink,
  type EasingFunction, type EasingType
} from './utils/easing'

// Easing utilities
export { 
  getEasing, applyEasing, safeApplyEasing, isValidEasing, getAvailableEasings, 
  isEasingFunction, easingPresets, getPresetEasing 
} from './utils/easing'

// Types
export type {
  // 공통 타입들
  BaseMotionOptions,
  BaseMotionReturn,
  FadeInOptions,
  SlideOptions,
  ScaleOptions,
  BounceOptions,
  PulseOptions,
  SpringOptions,
  GestureOptions,
  OrchestrationOptions,
  MotionDirection,
  MotionEasing,
  MotionSequence,
  MotionTrigger,
  MotionCallback,
  MotionProgressCallback,
  MotionStateCallback,
  PerformanceMetrics,
  MotionConfig,
  
  // 기존 타입들
  PageType,
  MotionType,
  EntranceType,
  MotionElement,
  PageMotionElement,
  PageMotionsConfig,
  MotionState,
  MotionRef,
  SmartMotionOptions,
  SmartMotionReturn,
  MotionPreset,
  PresetConfig,
  SpringConfig,
  GestureConfig,
  OrchestrationConfig
} from './types'

// Presets
export { getPagePreset, getMotionPreset, mergeWithPreset } from './presets'

// Managers
export { MotionStateManager } from './managers/MotionStateManager' 