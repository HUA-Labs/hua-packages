// ========================================
// HUA Motion Advanced - 메인 export 파일
// ========================================

// ========================================
// 고급 모션 훅들 (Auto 시리즈)
// ========================================

// 자동화된 모션 훅들
export { useAutoSlide } from './hooks/useAutoSlide'
export { useAutoScale } from './hooks/useAutoScale'
export { useAutoFade } from './hooks/useAutoFade'
export { useAutoPlay } from './hooks/useAutoPlay'

// ========================================
// 고급 제어 훅들
// ========================================

// 고급 모션 제어
export { useMotion } from './hooks/useMotion'

// ========================================
// 오케스트레이션 훅들
// ========================================

// 복잡한 애니메이션 시퀀스 관리
export { useMotionOrchestra } from './hooks/useMotionOrchestra'
export { useOrchestration } from './hooks/useOrchestration'
export { useSequence } from './hooks/useSequence'

// ========================================
// 고급 인터랙션 훅들
// ========================================

// 레이아웃 및 고급 인터랙션
export { useLayoutMotion } from './hooks/useLayoutMotion'
export { useKeyboardToggle } from './hooks/useKeyboardToggle'
export { useScrollDirection } from './hooks/useScrollDirection'
export { useStickyToggle } from './hooks/useStickyToggle'
export { useScrollToggle } from './hooks/useScrollToggle'
export { useVisibilityToggle } from './hooks/useVisibilityToggle'
export { useInteractive } from './hooks/useInteractive'

// ========================================
// 성능 최적화 훅들
// ========================================

// 성능 모니터링 및 최적화
export { usePerformanceMonitor } from './hooks/usePerformanceMonitor'

// ========================================
// 국제화 훅들
// ========================================

// 언어 인식 모션
export { useLanguageAwareMotion } from './hooks/useLanguageAwareMotion'

// ========================================
// 게임 엔진 훅들
// ========================================

// 게임 루프 및 게임 관련 모션
export { useGameLoop } from './hooks/useGameLoop'

// ========================================
// 타입들 (Core 패키지에서 확장)
// ========================================

// Advanced 패키지 전용 타입들
export type {
  // 오케스트레이션 타입들
  OrchestrationConfig,
  SequenceConfig,
  MotionSequence,
  
  // 고급 인터랙션 타입들
  LayoutMotionConfig,
  KeyboardToggleConfig,
  ScrollDirectionConfig,
  StickyToggleConfig,
  ScrollToggleConfig,
  VisibilityToggleConfig,
  InteractiveConfig,
  
  // 성능 최적화 타입들
  PerformanceMetrics,
  PerformanceConfig,
  
  // 국제화 타입들
  LanguageConfig,
  LocaleConfig,
  
  // 게임 엔진 타입들
  GameLoopConfig,
  GameState,
  
  // Auto 모션 타입들
  AutoMotionConfig,
  AutoSlideConfig,
  AutoScaleConfig,
  AutoFadeConfig,
  AutoPlayConfig
} from './types'
