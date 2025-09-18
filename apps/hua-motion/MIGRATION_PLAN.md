# HUA Motion 사이트 마이그레이션 & 플레이그라운드 정리 계획서

## 🎯 목표
- **기존 `@hua-labs/motion` 패키지**를 **새로운 패키지 구조**로 마이그레이션
- **플레이그라운드 페이지 분기** 및 **체계적인 구조화**
- **새로운 패키지들** (`hua-motion-core`, `hua-motion-advanced`) **직접 적용 테스트**

## 📋 전체 마이그레이션 계획

### 🔥 1단계: 패키지 마이그레이션 (최우선)

#### 1.1 의존성 업데이트
- [x] **`package.json` 의존성 변경**
  - `@hua-labs/motion` → `@hua-labs/motion-core` (기본 기능)
  - `@hua-labs/motion-advanced` 추가 (고급 기능)
- [x] **import 경로 수정**
  - 모든 컴포넌트에서 새로운 패키지 경로로 변경
  - 타입 import 경로 수정

#### 1.2 패키지별 기능 분리
- [ ] **Core 패키지 기능**
  - 3단계 추상화: `useSimplePageMotion`, `usePageMotions`, `useSmartMotion`
  - 기본 모션: `useFadeIn`, `useSlideUp`, `useSlideLeft`, `useSlideRight`, `useScaleIn`, `useBounceIn`, `usePulse`, `useSpringMotion`
  - 기본 인터랙션: `useHoverMotion`, `useClickToggle`, `useFocusToggle`
  - 기본 스크롤: `useScrollReveal`, `useScrollProgress`
  - 기본 유틸리티: `useMotionState`, `useRepeat`, `useToggleMotion`
  - 기본 제스처: `useGesture`, `useGestureMotion`
  - 프리셋 시스템 및 이징 함수들

- [ ] **Advanced 패키지 기능**
  - 고급 모션 (Auto 시리즈): `useAutoSlide`, `useAutoScale`, `useAutoFade`, `useAutoPlay`
  - 오케스트레이션: `useMotionOrchestra`, `useOrchestration`, `useSequence`
  - 고급 인터랙션: `useLayoutMotion`, `useKeyboardToggle`, `useScrollDirection`, `useStickyToggle`, `useScrollToggle`, `useVisibilityToggle`, `useInteractive`
  - 성능 최적화: `usePerformanceMonitor`
  - 국제화: `useLanguageAwareMotion`
  - 게임 엔진: `useGameLoop`

### 🎯 2단계: 플레이그라운드 구조화 (고우선)

#### 2.1 현재 플레이그라운드 분석
- **현재 상태**: 601줄의 거대한 단일 페이지
- **포함된 기능**: 25개 개별 훅 + 5개 고급 기능
- **문제점**: 
  - 페이지가 너무 큼 (번들 크기 문제)
  - 모든 기능이 한 페이지에 집중
  - 유지보수 어려움
  - 사용자 경험 복잡함

#### 2.2 플레이그라운드 분기 전략

##### **A안: 서브페이지 분기**
```
/playground/
├── /core/           # Core 패키지 기능
│   ├── /basic/      # 기본 모션 훅들
│   ├── /interaction/ # 기본 인터랙션
│   ├── /scroll/     # 기본 스크롤
│   ├── /utility/    # 기본 유틸리티
│   ├── /gesture/    # 기본 제스처
│   └── /abstraction/ # 3단계 추상화
├── /advanced/       # Advanced 패키지 기능
│   ├── /auto/       # Auto 시리즈
│   ├── /orchestration/ # 오케스트레이션
│   ├── /interaction/ # 고급 인터랙션
│   ├── /performance/ # 성능 최적화
│   ├── /i18n/       # 국제화
│   └── /game/       # 게임 엔진
└── /enterprise/     # Enterprise 패키지 기능 (향후)
```

##### **B안: 컴포넌트 분리**
```
/playground/
├── page.tsx         # 메인 플레이그라운드 (탭 네비게이션)
├── components/
│   ├── CorePlayground.tsx      # Core 패키지 플레이그라운드
│   ├── AdvancedPlayground.tsx  # Advanced 패키지 플레이그라운드
│   ├── EnterprisePlayground.tsx # Enterprise 패키지 플레이그라운드
│   └── shared/
│       ├── CodeEditor.tsx      # 코드 편집기
│       ├── LivePreview.tsx     # 라이브 미리보기
│       ├── ParameterControls.tsx # 파라미터 조정
│       └── HookSelector.tsx    # 훅 선택기
```

#### 2.3 실행 방식 결정

##### **옵션 1: 단순 데모 실행**
- **장점**: 빠른 로딩, 간단한 구조
- **단점**: 실제 사용법 학습 어려움
- **구현**: 미리 정의된 예제만 실행

##### **옵션 2: 코드 편집 + 실행**
- **장점**: 실제 사용법 학습, 실험 가능
- **단점**: 복잡한 구현, 보안 고려사항
- **구현**: Monaco Editor + 코드 실행 환경

##### **옵션 3: 하이브리드 방식** ⭐ **추천**
- **기본**: 단순 데모 실행
- **고급**: 코드 편집 + 실행 (Advanced 패키지)
- **장점**: 사용자 수준별 맞춤형 경험

### 📚 3단계: 문서 및 테스트 정리 (준비 작업)

#### 3.1 문서 업데이트
- [ ] **README.md 업데이트**
  - 새로운 패키지 구조 반영
  - 사용법 가이드 업데이트
- [ ] **API 문서 정리**
  - Core vs Advanced vs Enterprise 구분
  - 각 패키지별 기능 설명

#### 3.2 테스트 환경 구축
- [ ] **단위 테스트**
  - 각 패키지별 테스트 코드
  - 훅별 동작 검증
- [ ] **통합 테스트**
  - 모션 사이트 전체 동작 검증
  - 패키지 간 호환성 테스트

## 🚀 구현 우선순위

### **🔥 최우선 (1차 마무리 전)**
1. ✅ **패키지 마이그레이션** - 새로운 패키지들 적용 완료
2. **플레이그라운드 분기** - Core/Advanced 구분
3. **기본 기능 동작 확인** - 마이그레이션 검증

### **🎯 고우선 (1차 마무리 후)**
1. **사용자 경험 개선** - 플레이그라운드 UX
2. **성능 최적화** - 번들 크기 최적화
3. **고급 기능 추가** - Enterprise 패키지

### **📚 준비 작업**
1. **문서 정리** - 각 패키지별 가이드
2. **테스트 코드** - 품질 보장
3. **데모 사이트** - 실제 사용 예시

## 📊 예상 효과

### **개발자 경험**
- **패키지 선택의 자유**: 필요한 기능만 선택적 사용
- **명확한 기능 구분**: Core/Advanced/Enterprise 레벨별 이해
- **체계적인 학습**: 단계별 기능 습득

### **성능**
- **번들 크기 감소**: 필요한 패키지만 번들링
- **로딩 속도 개선**: 플레이그라운드 페이지 분기
- **메모리 사용량 최적화**: 사용하지 않는 기능 제외

### **유지보수**
- **코드 구조화**: 기능별 명확한 분리
- **의존성 관리**: 패키지별 독립적 업데이트
- **테스트 용이성**: 각 패키지별 독립적 테스트

## 🎯 다음 단계

1. **패키지 마이그레이션 시작** - `package.json` 의존성 변경
2. **플레이그라운드 분기 계획 세부화** - A안 vs B안 결정
3. **실행 방식 결정** - 단순 데모 vs 코드 편집 vs 하이브리드
4. **단계별 구현** - 투두 리스트 기반 체크리스트 진행

---

## 📝 작업 로그

### 2024-12-19
- **15:30**: 마이그레이션 계획서 작성
- **15:35**: 현재 플레이그라운드 구조 분석 완료
- **15:40**: 패키지별 기능 분리 계획 수립
- **15:45**: 플레이그라운드 분기 전략 수립
