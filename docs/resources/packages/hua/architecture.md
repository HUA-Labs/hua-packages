# hua 프레임워크 아키텍처

**작성일**: 2026-03-13
**버전**: 1.1.0

---

## 목차

1. [개요](#개요)
2. [아키텍처 레이어](#아키텍처-레이어)
3. [Export 경로](#export-경로)
4. [의존 관계](#의존-관계)
5. [사용 패턴](#사용-패턴)
6. [설계 원칙](#설계-원칙)

---

## 개요

`@hua-labs/hua`는 UI + motion + i18n + state + dot을 하나로 묶는 프레임워크 통합 레이어. 단일 패키지에서 18개의 서브패스 export를 제공하며, 각 기능을 독립적으로 또는 통합해서 사용할 수 있다.

---

## 아키텍처 레이어

```
┌─────────────────────────────────────────┐
│  Top: AI Context & CLI                  │
│  .cursorrules, ai-context.md            │
│  create-hua (CLI scaffolder)            │
├─────────────────────────────────────────┤
│  Middle: Framework & Config             │
│  @hua-labs/hua/framework                │
│  @hua-labs/hua/presets                   │
│  @hua-labs/hua/pro                      │
├─────────────────────────────────────────┤
│  Bottom: Core & Types                   │
│  @hua-labs/hua/ui                       │
│  @hua-labs/hua/motion                   │
│  @hua-labs/hua/i18n                     │
│  @hua-labs/hua/state                    │
│  @hua-labs/hua/dot                      │
└─────────────────────────────────────────┘
```

- **Bottom**: 개별 패키지 직접 제어 (시니어 개발자)
- **Middle**: 선언적 설정 + Provider 자동 구성 (빠른 프로토타이핑)
- **Top**: AI 도구 연동 (Cursor, Claude Code)

---

## Export 경로

| 경로                  | 소스 패키지                   | 설명                                                       |
| --------------------- | ----------------------------- | ---------------------------------------------------------- |
| `.`                   | 통합                          | 전체 통합 (UI+Motion+i18n+State+Pro)                       |
| `./framework`         | 자체                          | HuaProvider, HuaPage, WelcomePage, defineConfig, useMotion |
| `./framework/shared`  | 자체                          | 프레임워크 공용 유틸리티                                   |
| `./framework/server`  | 자체                          | 서버 전용 (SSR 번역 등)                                    |
| `./framework/config`  | 자체                          | 설정 시스템                                                |
| `./framework/seo/geo` | 자체                          | SEO/지역 최적화                                            |
| `./presets`           | 자체                          | product, marketing 프리셋                                  |
| `./ui`                | @hua-labs/ui                  | UI 컴포넌트 re-export                                      |
| `./i18n`              | @hua-labs/i18n-core + zustand | i18n re-export                                             |
| `./motion`            | @hua-labs/motion-core         | 모션 훅 re-export                                          |
| `./state`             | @hua-labs/state               | 상태관리 re-export                                         |
| `./pro`               | @hua-labs/hua-pro             | Pro 기능 (optional, private)                               |
| `./formatters`        | @hua-labs/i18n-formatters     | 포매터 re-export                                           |
| `./utils`             | 자체                          | 공용 유틸리티                                              |
| `./hooks`             | 자체                          | 공용 훅                                                    |
| `./loaders`           | @hua-labs/i18n-loaders        | 로더 re-export                                             |
| `./dot`               | @hua-labs/dot                 | 스타일 엔진 re-export                                      |
| `./dot/react`         | @hua-labs/dot                 | dot React 바인딩                                           |

---

## 의존 관계

```
@hua-labs/hua (v1.1.0)
├── @hua-labs/ui (v2.2.0)
├── @hua-labs/motion-core (v2.3.0)
├── @hua-labs/i18n-core (v2.1.0)
├── @hua-labs/i18n-core-zustand (v2.1.0)
├── @hua-labs/i18n-formatters (v2.1.0)
├── @hua-labs/i18n-loaders (v2.1.0)
├── @hua-labs/state
├── @hua-labs/dot (v0.1.0)
├── @hua-labs/hooks
├── @hua-labs/utils
└── @hua-labs/hua-pro (optional, private)
```

---

## 사용 패턴

### 1. 빠른 시작 (Framework 레이어)

```tsx
import { HuaProvider, HuaPage } from "@hua-labs/hua/framework";
import { defineConfig } from "@hua-labs/hua/framework";

export default defineConfig({
  preset: "product",
  branding: { primaryColor: "#3B82F6" },
});
```

### 2. 세밀한 제어 (Core 레이어)

```tsx
import { Button, Card } from "@hua-labs/hua/ui";
import { useTranslation } from "@hua-labs/hua/i18n";
import { useFadeIn } from "@hua-labs/hua/motion";
import { dot } from "@hua-labs/hua/dot";
```

### 3. 단일 진입점

```tsx
// tree-shaking 지원
import { Button, useTranslation, useFadeIn, HuaProvider } from "@hua-labs/hua";
```

### 4. 직접 패키지 사용 (Escape Hatch)

```tsx
import { Button } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { useFadeIn } from "@hua-labs/motion-core";
import { dot } from "@hua-labs/dot";
```

---

## 설계 원칙

### 1. 단일 패키지, 멀티 진입점

하나의 `@hua-labs/hua`에서 서브패스 export로 기능 분리. tree-shaking으로 번들 최적화.

### 2. Escape Hatch

모든 레이어에서 하위 레이어로 내려갈 수 있어야 함:

- Framework → Core subpaths
- Config → 직접 제어
- Preset → 커스텀 설정

### 3. className 주의

hua-ui 컴포넌트들이 `Omit<..., 'className'>` 사용 중. hua 래퍼에서 className 대신 `dot` 또는 `style` prop 사용할 것.

---

**작성자**: Auto (AI Assistant)
**최종 업데이트**: 2026-03-13
