// Core entry: Stage 1 preset motions and basic easing/types
export { useSimpleMotion } from '../hooks/useSimpleMotion';
export { useCustomMotion } from '../hooks/useSimpleMotion';
export { useFadeIn } from '../hooks/useFadeIn';
export { useSlideUp } from '../hooks/useSlideUp';
export { useSlideLeft } from '../hooks/useSlideLeft';
export { useSlideRight } from '../hooks/useSlideRight';
export { useScaleIn } from '../hooks/useScaleIn';
export { useBounceIn } from '../hooks/useBounceIn';
export { useFlipIn } from '../hooks/useFlipIn';
export { usePulse } from '../hooks/usePulse';
export { useAutoFade } from '../hooks/useAutoFade';
export { useAutoSlide } from '../hooks/useAutoSlide';
export { useAutoScale } from '../hooks/useAutoScale';
export { useAutoPlay } from '../hooks/useAutoPlay';
export { useMotion } from '../hooks/useMotion';

export {
  linear, easeIn, easeOut, easeInOut, easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart,
  easeInQuint, easeOutQuint, easeInOutQuint, easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo, easeInOutExpo, easeInCirc, easeOutCirc, easeInOutCirc,
  easeInBounce, easeOutBounce, easeInOutBounce, easeInBack, easeOutBack, easeInOutBack,
  easeInElastic, easeOutElastic, easeInOutElastic,
  pulse as easingPulse, pulseSmooth, skeletonWave, blink,
  getEasing, applyEasing, safeApplyEasing, isValidEasing, getAvailableEasings,
  isEasingFunction, easingPresets, getPresetEasing
} from '../utils/easing';

export type {
  BaseMotionOptions,
  BaseMotionReturn,
  FadeInOptions,
  SlideOptions,
  ScaleOptions,
  BounceOptions,
  PulseOptions,
  MotionDirection,
  MotionEasing,
  MotionConfig,
  MotionPreset,
  PresetConfig,
} from '../types';

export { getPagePreset, getMotionPreset, mergeWithPreset } from '../presets';

