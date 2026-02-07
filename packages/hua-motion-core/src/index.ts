// ========================================
// HUA Motion Core - 메인 export 파일
// ========================================

// ========================================
// 핵심 모션 엔진 (의존성 제로)
// ========================================

// MotionEngine - 순수 JavaScript 모션 엔진
export { 
  MotionEngine, 
  motionEngine,
  type MotionFrame,
  type MotionOptions,
  type Motion
} from './core/MotionEngine'

// TransitionEffects - 전환 효과 시스템
export { 
  TransitionEffects, 
  transitionEffects,
  type TransitionType,
  type TransitionOptions
} from './core/TransitionEffects'

// PerformanceOptimizer - 성능 최적화
export {
  PerformanceOptimizer,
  performanceOptimizer,
  type PerformanceOptimizerMetrics,
  type OptimizationConfig
} from './core/PerformanceOptimizer'

// ========================================
// 3단계 추상화 (Core 패키지 핵심)
// ========================================

// 1단계: useSimplePageMotion (프리셋 기반)
export { useSimplePageMotion } from './hooks/useSimplePageMotion'

// 2단계: usePageMotions (페이지 레벨)
export { usePageMotions } from './hooks/usePageMotions'

// 3단계: useSmartMotion (개별 요소) - 기존 호환성 유지
export { useSmartMotion } from './hooks/useSmartMotion'

// 통합 Motion Hook (단일 타입으로 여러 hook 중 선택)
export { useUnifiedMotion } from './hooks/useUnifiedMotion'
export type { UseUnifiedMotionOptions } from './hooks/useUnifiedMotion'

// ========================================
// 기본 모션 훅들 (Core 패키지 범위)
// ========================================

// 기본 모션 (fade, slide, scale, bounce, pulse)
export { useFadeIn } from './hooks/useFadeIn'
export { useSlideUp } from './hooks/useSlideUp'
export { useSlideLeft } from './hooks/useSlideLeft'
export { useSlideRight } from './hooks/useSlideRight'
export { useScaleIn } from './hooks/useScaleIn'
export { useBounceIn } from './hooks/useBounceIn'
export { usePulse } from './hooks/usePulse'
export { useSpringMotion } from './hooks/useSpringMotion'
export { useGradient } from './hooks/useGradient'

// 기본 인터랙션 (hover, click, focus)
export { useHoverMotion } from './hooks/useHoverMotion'
export { useClickToggle } from './hooks/useClickToggle'
export { useFocusToggle } from './hooks/useFocusToggle'

// 기본 스크롤 (reveal, progress)
export { useScrollReveal } from './hooks/useScrollReveal'
export { useScrollProgress } from './hooks/useScrollProgress'

// 기본 유틸리티 (state, repeat, toggle)
export { useMotionState } from './hooks/useMotionState'
export { useRepeat } from './hooks/useRepeat'
export { useToggleMotion } from './hooks/useToggleMotion'

// ========================================
// 슬라이드 방향 훅 (추가)
export { useSlideDown } from './hooks/useSlideDown'

// 유틸리티 훅들 (신규 export)
export { useInView } from './hooks/useInView'
export { useMouse } from './hooks/useMouse'
export { useReducedMotion } from './hooks/useReducedMotion'
export { useWindowSize } from './hooks/useWindowSize'

// 기본 제스처 훅들 (Core 패키지 범위)
// ========================================

// 기본 제스처 (gesture, gestureMotion)
export { useGesture } from './hooks/useGesture'
export { useGestureMotion } from './hooks/useGestureMotion'

// ========================================
// 프리셋 시스템 (Core 패키지 범위)
// ========================================

export * from './presets'

// ========================================
// 기본 이징 함수들 (Core 패키지 범위)
// ========================================

export {
  linear, easeIn, easeOut, easeInOut,
  easeInQuad, easeOutQuad, easeInOutQuad,
  type EasingFunction, type EasingType
} from './utils/easing'

export { 
  getEasing, applyEasing, safeApplyEasing, isValidEasing, 
  getAvailableEasings, isEasingFunction, easingPresets, getPresetEasing 
} from './utils/easing'

// ========================================
// 기본 타입들 (Core 패키지 범위)
// ========================================

export type {
  // 3단계 추상화 타입들
  PageType,
  MotionType,
  EntranceType,
  PageMotionElement,
  PageMotionsConfig,
  MotionState,
  PageMotionRef,
  // SmartMotionOptions 제거 (useMotion으로 대체)
  // SmartMotionReturn 제거 (useMotion으로 대체)
  
  // 공통 타입들
  BaseMotionOptions,
  BaseMotionReturn,
  MotionElement, // MotionElement 추가
  
  // 프리셋 시스템
  MotionPreset,
  PresetConfig,
  
  // 고급 모션 타입들
  SpringConfig,
  GestureConfig,
  OrchestrationConfig,
  
  // 훅별 확장 옵션 타입들
  FadeInOptions,
  SlideOptions,
  ScaleOptions,
  BounceOptions,
  PulseOptions,
  SpringOptions,
  GestureOptions,
  ScrollRevealOptions,
  ScrollRevealMotionType,
  GradientOptions,
  ToggleMotionOptions,
  RepeatOptions,
  HoverMotionOptions,
  InteractionReturn,

  // 유틸리티 훅 타입들
  InViewOptions,
  InViewReturn,
  MouseOptions,
  MouseReturn,
  ReducedMotionReturn,
  WindowSizeOptions,
  WindowSizeReturn,

  // 성능 관련 타입들
  PerformanceMetrics,
  MotionConfig,

  // 기본 타입들
  MotionDirection,
  MotionEasing,
  MotionTrigger,
  MotionCallback,
  MotionProgressCallback,
  MotionStateCallback
} from './types'
