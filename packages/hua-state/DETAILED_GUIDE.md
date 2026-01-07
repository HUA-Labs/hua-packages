# @hua-labs/state Detailed Guide

State management solution for the HUA UX ecosystem.
HUA UX 생태계를 위한 상태 관리 라이브러리 가이드입니다.

---

## English

### Core Implementation
@hua-labs/state is built using Zustand, providing pre-integrated middlewares for common application requirements such as SSR hydration and localStorage persistence.

### Technical Utilities

#### 1. createHuaStore
Extends the standard Zustand creator with persistence and SSR compensation logic.
```tsx
const useStore = createHuaStore((set) => ({ ... }), {
  persist: true,
  persistKey: 'state-storage',
  ssr: true,
  partialize: (state) => ({ theme: state.theme })
});
```

#### 2. createI18nStore
Dedicated store for managing internationalization states, including current language, support list, and initialization status.

---

## Korean

### 핵심 구현
@hua-labs/state는 Zustand를 기반으로 설계되었습니다. 제품 개발에서 공통적으로 요구되는 SSR 하이드레이션 대응 및 로컬 스토리지 데이터 유지 로직이 사전에 통합되어 제공됩니다.

### 기술 유틸리티

#### 1. createHuaStore
기본 Zustand 스토어에 상태 유지(Persistence) 및 SSR 보정 로직을 추가한 확장형 생성기입니다.
- **partialize**: 로컬 저장소에 보관할 데이터 범위를 선택적으로 필터링할 수 있습니다.
- **SSR 하이드레이션**: 서버 사이드 렌더링 시 발생하는 하이드레이션 불일치를 관리합니다.

#### 2. createI18nStore
다국어 환경 처리에 특화된 스토어입니다. 현재 언어 설정, 지원 언어 목록 및 초기화 상태를 일관된 인터페이스로 관리합니다.

---

### Integration Technicalities
Serves as the internal state orchestration layer between `@hua-labs/state` and `@hua-labs/i18n-core-zustand`.
