// ========================================
// HUA Motion - 통합 패키지
// Core + Advanced re-export
// ========================================

// Core 패키지 재export
export * from '@hua-labs/motion-core'

// Advanced 패키지 재export
// 충돌하는 타입은 Advanced 버전 우선
export {
  // Auto 시리즈
  useAutoSlide,
  useAutoScale,
  useAutoFade,
  useAutoPlay,
  // 고급 제어
  useMotion,
  // 오케스트레이션
  useMotionOrchestra,
  useOrchestration,
  useSequence,
  // 고급 인터랙션
  useLayoutMotion,
  useKeyboardToggle,
  useScrollDirection,
  useStickyToggle,
  useScrollToggle,
  useVisibilityToggle,
  useInteractive,
  // 성능 최적화
  usePerformanceMonitor,
  // 국제화
  useLanguageAwareMotion,
  // 게임 엔진
  useGameLoop,
} from '@hua-labs/motion-advanced'

// Advanced 타입 재export (충돌하는 타입은 Advanced 버전 사용)
export type {
  OrchestrationConfig,
  SequenceConfig,
  LayoutMotionConfig,
  KeyboardToggleConfig,
  ScrollDirectionConfig,
  StickyToggleConfig,
  ScrollToggleConfig,
  VisibilityToggleConfig,
  InteractiveConfig,
  PerformanceConfig,
  PerformanceMetrics,
  LanguageConfig,
  GameLoopConfig,
  GameState,
  AutoMotionConfig,
  AutoSlideConfig,
  AutoScaleConfig,
  AutoFadeConfig,
  AutoPlayConfig,
} from '@hua-labs/motion-advanced'