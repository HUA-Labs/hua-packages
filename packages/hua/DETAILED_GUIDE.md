# @hua-labs/hua Detailed Guide

Technical reference for the @hua-labs/hua framework architecture and features.
이 문서는 @hua-labs/hua 프레임워크의 아키텍처 및 세부 기능에 대한 기술 참조를 제공합니다.

---

## English

### Architecture Overview
hua is a framework layer built on Next.js. It integrates UI, motion, and internationalization libraries with pre-configured defaults to standardize product development.

### Framework Integration Strategies

#### Strategy 1: Framework Layer
Automates provider configuration through a central settings file. This method provides the full framework experience, including integrated state and i18n management.
- **UI Benefit**: Framework users gain access to a curated selection of General-purpose Dashboard components from the Pro suite (StatCard, MetricCard, etc.) without additional licensing.
```tsx
// hua.config.ts
export default defineConfig({
  preset: 'product',
  i18n: { defaultLanguage: 'ko', namespaces: ['common'] }
});

// app/layout.tsx
<HuaProvider>{children}</HuaProvider>
```

#### Strategy 2: Modular Usage
Manual integration of individual packages for projects requiring non-standard configurations. Pro/Advanced components are limited to their respective distribution tiers.

---

### Technical Features

#### 1. GEO (Generative Engine Optimization)
Generates structured metadata and JSON-LD to assist search engines and language models in indexing application content.

#### 2. Accessibility (A11y) Implementation
- **SkipToContent**: Provides a bypass mechanism for keyboard navigation to skip repeated elements.
- **Focus Management**: Automatically manages focus during page transitions or within modal dialogs.
- **LiveRegion**: Provides an interface for announcing dynamic content changes to assistive technologies.

#### 3. Operational Safety
- **HuaPage**: Implements a standard ErrorBoundary to manage component-level crashes.
- **Error Reporting**: Provides a centralized hook for connecting to error monitoring services.

#### 4. UX Optimization
- **useDelayedLoading**: Delays the display of loading indicators for short-duration asynchronous operations to limit visual noise.
- **SuspenseWrapper**: Integrates with React Suspense to provide structured loading states.

---

## Korean

### 아키텍처 개요
hua는 Next.js 기반의 프레임워크 레이어입니다. 일관된 제품 개발을 위해 UI, 모션, 다국어 라이브러리를 사전에 구성된 상태로 통합하여 제공합니다.

### 통합 전략

#### 방법 1: 프레임워크 레이어
중앙 설정 파일(`hua.config.ts`)을 통해 프로바이더 구성을 자동화합니다.

#### 방법 2: 모듈형 사용
표준 환경이 아닌 프로젝트의 경우 개별 패키지(`@hua-labs/ui`, `@hua-labs/state` 등)를 직접 수동으로 통합합니다.

---

### 기술 기능 상세

#### 1. GEO (생성형 엔진 최적화)
검색 엔진 및 대규모 언어 모델이 애플리케이션의 콘텐츠를 보다 효율적으로 인덱싱할 수 있도록 구조화된 메타데이터 및 JSON-LD를 생성합니다.

#### 2. 접근성(A11y) 구현
- **SkipToContent**: 반복되는 요소를 건너뛰고 본문으로 직접 이동할 수 있는 키보드 탐색 메커니즘을 제공합니다.
- **포커스 관리**: 페이지 전환이나 모달 대화 상자 내부에서 포커스 위치를 자동으로 제어합니다.
- **LiveRegion**: 동적인 콘텐츠 변경 사항을 보조 공학 기기에 알릴 수 있는 인터페이스를 지원합니다.

#### 3. 운영 안정성
- **HuaPage**: 컴포넌트 수준의 오류를 관리하기 위해 표준 에러 바운더리(ErrorBoundary)를 적용합니다.
- **에러 리포팅**: 에러 모니터링 서비스와 연동할 수 있는 중앙 집중식 훅을 제공합니다.

#### 4. UX 최적화
- **useDelayedLoading**: 처리 시간이 짧은 비동기 작업 시 로딩 표시기 노출을 지연시켜 시각적 방해를 줄입니다.
- **SuspenseWrapper**: React Suspense와 연동되어 구조화된 로딩 상태를 지원합니다.
