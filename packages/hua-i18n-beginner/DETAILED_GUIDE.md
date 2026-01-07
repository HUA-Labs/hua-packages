# @hua-labs/i18n-beginner Detailed Guide

Technical reference for integrating internationalization with minimal configuration.
최소한의 설정으로 다국어를 도입하기 위한 기술 명세입니다.

---

## English

### Functional Overview
- **Minimal Configuration**: Designed to work without complex loader definitions or initial state setup.
- **Built-in Translations**: Includes 80+ standard UI translation keys (welcome, save, cancel, etc.) for rapid development.
- **State Synchronization**: Integrates with standard React state patterns for language persistence.

### Implementation Guide

#### 1. Setup
Wrap the application root with the `SimpleI18n` provider.
```tsx
import { SimpleI18n } from '@hua-labs/i18n-beginner';

function Root() {
  return <SimpleI18n>{/* components */}</SimpleI18n>;
}
```

#### 2. Component Integration
Access translation functions and state via the `useSimpleI18n` hook.
```tsx
const { t, language, setLanguage, toggleLanguage } = useSimpleI18n();
```

### Technical Customization

#### Dynamic Translation Injection
Add new keys or languages at runtime using the `addTranslation` utility.
```tsx
import { addTranslation } from '@hua-labs/i18n-beginner';

addTranslation('ja', 'welcome', 'ようこそ');
```

#### External Resource Loading
Manage translation data from external JSON or TypeScript files.
```tsx
const myTranslations = {
  ko: { hello: '안녕' },
  en: { hello: 'Hi' }
};
// Use with the useTranslationsFromFile hook to initialize data.
```

---

## Korean

### 기능 상세 사양
- **최소 설정**: 복잡한 로더 정의나 초기 상태 구성 없이 즉시 동작하도록 설계되었습니다.
- **표준 번역 내장**: 신속한 개발을 위해 80개 이상의 공통 UI 번역 키(환영, 저장, 취소 등)를 포함하고 있습니다.
- **상태 동기화**: 언어 상태 유지를 위해 표준 React 상태 관리 패턴과 연동됩니다.

### 구현 가이드

#### 1. 초기 구성
애플리케이션의 최상위 노드를 `SimpleI18n` 프로바이더로 감싸줍니다.

#### 2. 컴포넌트 통합
`useSimpleI18n` 훅을 통해 번역 함수 및 언어 상태에 접근할 수 있습니다.

### 기술적 커스텀

#### 런타임 번역 주입
`addTranslation` 유틸리티를 사용하여 실행 시점에 새로운 키나 언어를 추가할 수 있습니다.

#### 외부 리소스 로딩
외부 JSON 또는 TypeScript 파일에 정의된 번역 데이터를 관리할 수 있습니다. `useTranslationsFromFile` 훅을 사용하여 커스텀 데이터를 초기화합니다.
