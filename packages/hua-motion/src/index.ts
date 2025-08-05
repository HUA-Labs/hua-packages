// Core hooks
export { useSimplePageAnimation } from './hooks/useSimplePageAnimation'
export { usePageAnimations } from './hooks/usePageAnimations'
export { useSmartAnimation } from './hooks/useSmartAnimation'

// Individual animation hooks
export { useFadeIn } from './hooks/useFadeIn'
export { useSlideUp } from './hooks/useSlideUp'
export { useSlideLeft } from './hooks/useSlideLeft'
export { useSlideRight } from './hooks/useSlideRight'
export { useScaleIn } from './hooks/useScaleIn'
export { useBounceIn } from './hooks/useBounceIn'
export { usePulse } from './hooks/usePulse'
export { useGradient } from './hooks/useGradient'
export { useSpring } from './hooks/useSpring'
export { useMotion } from './hooks/useMotion'
export { useHoverAnimation } from './hooks/useHoverAnimation'
export { useScrollReveal } from './hooks/useScrollReveal'
export { useGesture } from './hooks/useGesture'
export { useOrchestration, createAnimationChain } from './hooks/useOrchestration'
export { useLayoutAnimation, createLayoutTransition } from './hooks/useLayoutAnimation'
export { useSequence } from './hooks/useSequence'
export { useToggleAnimation } from './hooks/useToggleAnimation'

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
  PageType,
  AnimationType,
  EntranceType,
  AnimationElement,
  PageAnimationsConfig,
  AnimationState,
  AnimationRef,
  SmartAnimationOptions,
  SmartAnimationReturn,
  AnimationPreset,
  PresetConfig,
  SpringConfig,
  GestureConfig,
  OrchestrationConfig
} from './types'

// Managers
export { AnimationStateManager } from './managers/AnimationStateManager' 