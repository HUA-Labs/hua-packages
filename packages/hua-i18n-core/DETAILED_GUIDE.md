# @hua-labs/i18n-core Detailed Guide

This document provides technical reference for the @hua-labs/i18n-core library.
이 문서는 @hua-labs/i18n-core 라이브러리에 대한 기술 참조를 제공합니다.

---

## English

### Technical Overview
@hua-labs/i18n-core is a lightweight (~2.8KB gzip) library for React applications that manages language state, hydration, and translation loading.

### Capabilities and Implementation
- **Flicker Reduction**: Maintains the previous language translation state until new data is fully loaded during a language switch.
- **Hydration Support**: Designed for SSR environments (Next.js, etc.) to prevent data mismatch errors between server and client.
- **State Management**: Supports external state stores via a dedicated Zustand adapter.
- **Memory Management**: Implements an LRU (Least Recently Used) cache for Translator instances to limit memory consumption.
- **Error Handling**: Uses exponential backoff for network request retries when using the API loader.

---

### Translation Loaders

#### 1. API Loader
Fetches translations via HTTP requests. Recommended for server-side managed translations.
```tsx
createCoreI18n({
  translationLoader: 'api',
  translationApiPath: '/api/translations',
  baseUrl: 'https://example.com', 
  defaultLanguage: 'ko',
  namespaces: ['common', 'pages']
})
```

#### 2. Static and Custom Loaders
Loaders for local storage or external data sources.

---

### Implementation Details

#### Interpolation (tWithParams)
Handles dynamic values within translation strings using a standard template format.
```tsx
// JSON: { "welcome": "Hello, {{name}}!" }
tWithParams('common:welcome', { name: 'John' });
```

#### Raw Value Access
Retrieves structured data (arrays or objects) directly from translation files.
```tsx
const features = getRawValue('common:features') as string[];
```

#### Server-Side Integration
Provides an interface for server-side rendering logic.
```tsx
import { Translator, ssrTranslate } from '@hua-labs/i18n-core';

// Translates on the server before client hydration
const text = ssrTranslate({ translations, key: 'common:hi', language: 'en' });
```

---

## Korean

### 기술 개요
@hua-labs/i18n-core는 React 애플리케이션의 언어 상태 관리, 하이드레이션 및 번역 로딩을 처리하는 경량 라이브러리(약 2.8KB gzip)입니다.

### 주요 기능 사양
- **깜빡임 억제**: 언어 전환 시 새로운 데이터 로드가 완료될 때까지 이전 언어 상태를 유지하여 시각적 중단을 방어합니다.
- **하이드레이션 지원**: 서버와 클라이언트 간의 데이터 불일치를 방지하도록 설계되어 SSR 환경(Next.js 등)에 대응합니다.
- **상태 관리 연동**: 전용 어댑터를 통해 Zustand 등 외부 스토어와 데이터 상태를 동기화할 수 있습니다.
- **메모리 관리**: Translator 인스턴스에 LRU(Least Recently Used) 캐시를 적용하여 메모리 점유를 제한합니다.
- **에러 처리**: API 로더 사용 시 네트워크 요청 실패에 대해 지수 백오프 기반의 재시도 로직을 적용합니다.

---

### 번역 로더(Loader) 구성

#### 1. API 로더
HTTP 요청을 통해 번역 데이터를 로드합니다. 서버에서 관리되는 번역 데이터 처리에 적합합니다.

#### 2. 정적 및 커스텀 로더
로컬 파일 시스템이나 외부 데이터 자원을 활용한 로딩 로직을 주입할 수 있습니다.

---

### 세부 활용법

#### 데이터 치환 (Interpolation)
번역 문자열 내의 변수(자리표시자)를 파라미터 값으로 변경합니다.

#### 로우 데이터 접근 (Raw Value Access)
단순 문자열이 아닌 배열이나 객체 형태의 구조화된 데이터를 JSON 파일에서 직접 호출합니다.

#### 서버 사이드 지원 (SSR)
`initialTranslations` 옵션을 통해 서버에서 로드된 데이터를 전달하여 초기 렌더링 시점에 번역을 즉시 적용합니다.

#### 디버깅 인터페이스
개발 환경에서 누락된 키를 확인하기 위한 오버레이 컴포넌트를 제공합니다.
