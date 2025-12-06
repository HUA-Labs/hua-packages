# HUA Motion 패키지 재편 - GPT 컨텍스트

## 상황 요약

**현재 상태**:
- `@hua-labs/motion-core`: 25개 필수 훅, Zero Dependencies ✅
- `@hua-labs/motion-advanced`: 17개 고급 훅, Core 의존 ✅
- `@hua-labs/motion`: 통합 패키지 (모든 기능 포함) ⚠️
- UI 패키지: `@hua-labs/motion` 의존하지만 실제로는 사용하지 않음 ❌

**목표**:
1. 통합 패키지를 Core + Advanced 재export로 재구성
2. UI 패키지 의존성을 `@hua-labs/motion-core`로 변경
3. 하위 호환성 유지하며 점진적 마이그레이션 지원

## 패키지 구조

### Core (필수)
- 3단계 추상화: `useSimplePageMotion`, `usePageMotions`, `useSmartMotion`
- 기본 모션: `useFadeIn`, `useSlideUp`, `useSlideLeft`, `useSlideRight`, `useScaleIn`, `useBounceIn`, `usePulse`, `useSpringMotion`, `useGradient`
- 인터랙션: `useHoverMotion`, `useClickToggle`, `useFocusToggle`, `useToggleMotion`
- 스크롤: `useScrollReveal`, `useScrollProgress`, `useScrollToggle`
- 유틸리티: `useMotionState`, `useRepeat`
- 제스처: `useGesture`, `useGestureMotion`

### Advanced (고급)
- Auto 시리즈: `useAutoSlide`, `useAutoScale`, `useAutoFade`, `useAutoPlay`
- 오케스트레이션: `useMotionOrchestra`, `useOrchestration`, `useSequence`
- 고급 인터랙션: `useLayoutMotion`, `useKeyboardToggle`, `useScrollDirection`, `useStickyToggle`, `useScrollToggle`, `useVisibilityToggle`, `useInteractive`
- 기타: `usePerformanceMonitor`, `useLanguageAwareMotion`, `useGameLoop`

## UI 패키지 마이그레이션

**현재**:
```json
{
  "dependencies": {
    "@hua-labs/motion": "workspace:*"
  }
}
```

**변경 후**:
```json
{
  "dependencies": {
    "@hua-labs/motion-core": "workspace:*"
  },
  "peerDependencies": {
    "@hua-labs/motion-advanced": "*"
  }
}
```

**빌드 설정**:
```typescript
external: [
  '@hua-labs/motion-core',
  '@hua-labs/motion-advanced'
]
```

## 핵심 원칙

1. **명확한 분리**: Core (필수) vs Advanced (고급)
2. **하위 호환성**: 통합 패키지로 기존 코드 지원
3. **점진적 마이그레이션**: 단계별 전환 가능
4. **최소 의존성**: 필요한 것만 의존

## 다음 단계

1. UI 패키지 `package.json` 의존성 변경
2. `tsup.config.ts` 빌드 설정 업데이트
3. 통합 패키지 Core + Advanced 재export로 재구성
4. 테스트 및 문서화

