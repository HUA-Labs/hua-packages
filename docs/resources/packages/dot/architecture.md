# dot Architecture

**작성일**: 2026-03-13
**버전**: 0.1.0

---

## 목차

1. [개요](#개요)
2. [아키텍처](#아키텍처)
3. [디렉토리 구조](#디렉토리-구조)
4. [파이프라인](#파이프라인)
5. [리졸버](#리졸버)
6. [런타임](#런타임)
7. [변형(Variants)](#변형variants)
8. [Export 경로](#export-경로)
9. [테스트](#테스트)

---

## 개요

dot은 유틸리티 문자열을 플랫폼별 스타일 객체로 변환하는 크로스플랫폼 스타일 엔진입니다.

### 핵심 API

```typescript
import { dot } from "@hua-labs/dot";

// Web: CSSProperties 반환
const styles = dot("p-4 rounded-lg bg-blue-500 text-white");
// → { padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#3b82f6', color: '#fff' }

// React Native
import { dot } from "@hua-labs/dot/native";
const styles = dot("p-4 rounded-lg bg-blue-500");
// → { padding: 16, borderRadius: 8, backgroundColor: '#3b82f6' }
```

### 설계 원칙

1. **제로 의존성** — 외부 패키지 없음
2. **Tailwind 호환** — ~90% 유틸리티 문법 지원
3. **크로스플랫폼** — 동일 API로 Web/RN/Flutter 지원
4. **타입 안전** — 완전한 TypeScript 지원
5. **성능** — LRU 캐시, 파서 최적화

---

## 아키텍처

```
입력: "p-4 rounded-lg bg-blue-500 dark:bg-blue-700 hover:opacity-80"
  │
  ▼
┌─────────────┐
│   Parser     │  유틸리티 문자열을 토큰으로 분리
│  parser.ts   │  variant 접두사 분리 (dark:, hover:, sm:)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Resolver    │  각 토큰을 스타일 속성으로 변환
│ resolver.ts  │  27개 리졸버 패밀리 순회
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Variants    │  dark:, hover:, responsive 등 조건부 스타일 처리
│ variants.ts  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Runtime     │  플랫폼별 출력 생성
│ web / native │  Web: CSSProperties, RN: StyleSheet, Flutter: Recipe
└─────────────┘
```

---

## 디렉토리 구조

```
packages/hua-dot/
├── src/
│   ├── index.ts          # Web 엔트리
│   ├── native.ts         # React Native 엔트리
│   ├── class.ts          # CSS 클래스 모드 엔트리
│   ├── parser.ts         # 유틸리티 문자열 파서
│   ├── resolver.ts       # 리졸버 오케스트레이터
│   ├── variants.ts       # 변형 처리 (dark:, hover:, sm:)
│   ├── cache.ts          # LRU 캐시
│   ├── capabilities.ts   # 기능 메타데이터
│   ├── cx.ts             # 클래스 조합 유틸리티
│   ├── config.ts         # 설정
│   ├── types.ts          # TypeScript 타입
│   ├── resolvers/        # 27개 리졸버
│   │   ├── spacing.ts    # p-*, m-*, gap-*
│   │   ├── color.ts      # bg-*, text-*, border-*
│   │   ├── layout.ts     # display, overflow, position
│   │   ├── typography.ts # font-*, text-*, leading-*
│   │   ├── border.ts     # border, rounded-*
│   │   ├── shadow.ts     # shadow-*
│   │   ├── gradient.ts   # bg-gradient-*, from-*, via-*, to-*
│   │   ├── flexbox.ts    # flex, justify-*, items-*, gap-*
│   │   ├── grid.ts       # grid, grid-cols-*, col-span-*
│   │   ├── positioning.ts # top-*, right-*, inset-*
│   │   ├── opacity.ts    # opacity-*
│   │   ├── transform.ts  # rotate-*, scale-*, translate-*
│   │   ├── transition.ts # transition-*, duration-*, ease-*
│   │   ├── animation.ts  # animate-*
│   │   ├── filter.ts     # blur-*, brightness-*
│   │   ├── ring.ts       # ring-*
│   │   ├── outline.ts    # outline-*
│   │   ├── z-index.ts    # z-*
│   │   ├── divide.ts     # divide-*
│   │   ├── object-fit.ts # object-*
│   │   ├── interactivity.ts # cursor-*, select-*, touch-*
│   │   ├── scroll.ts     # scroll-*, overflow-*
│   │   ├── table.ts      # table-*, border-collapse
│   │   ├── list.ts       # list-*
│   │   ├── line-clamp.ts # line-clamp-*
│   │   ├── backdrop.ts   # backdrop-*
│   │   └── utils.ts      # 공용 유틸리티
│   ├── tokens/           # 디자인 토큰 정의
│   ├── adapters/         # Flutter 어댑터
│   └── __tests__/        # 16개 테스트 파일
├── package.json
├── tsup.config.ts
└── tsconfig.json
```

---

## 파이프라인

### 1. 파서 (parser.ts)

유틸리티 문자열을 토큰으로 분리하고, variant 접두사를 감지합니다.

```typescript
// "dark:hover:bg-blue-500" → { variants: ['dark', 'hover'], utility: 'bg-blue-500' }
```

보안: 위험한 패턴(스크립트 인젝션 등) 차단

### 2. 리졸버 (resolver.ts)

27개 리졸버를 순회하며 토큰을 스타일 속성으로 변환합니다.

### 3. 캐시 (cache.ts)

동일한 유틸리티 문자열의 반복 파싱을 방지하는 LRU 캐시.

---

## 리졸버

27개 리졸버 패밀리:

| 카테고리     | 리졸버        | 지원 유틸리티                              |
| ------------ | ------------- | ------------------------------------------ |
| 스페이싱     | spacing       | p-_, m-_, gap-_, space-_                   |
| 색상         | color         | bg-_, text-_, border-_, ring-_ 색상        |
| 레이아웃     | layout        | block, flex, grid, hidden, overflow-\*     |
| 타이포그래피 | typography    | font-_, text-_, leading-_, tracking-_      |
| 테두리       | border        | border-_, rounded-_                        |
| 그림자       | shadow        | shadow-_, shadow-color-_                   |
| 그라데이션   | gradient      | bg-gradient-_, from-_, via-_, to-_         |
| 플렉스박스   | flexbox       | flex-_, justify-_, items-_, self-_         |
| 그리드       | grid          | grid-cols-_, col-span-_, row-span-\*       |
| 포지셔닝     | positioning   | top-_, right-_, bottom-_, left-_, inset-\* |
| 투명도       | opacity       | opacity-\*                                 |
| 변환         | transform     | rotate-_, scale-_, translate-\*            |
| 전환         | transition    | transition-_, duration-_, ease-\*          |
| 애니메이션   | animation     | animate-\*                                 |
| 필터         | filter        | blur-_, brightness-_, contrast-\*          |
| 링           | ring          | ring-_, ring-offset-_                      |
| 아웃라인     | outline       | outline-\*                                 |
| Z 인덱스     | z-index       | z-\*                                       |
| 분할선       | divide        | divide-x, divide-y, divide-\*              |
| 오브젝트     | object-fit    | object-cover, object-contain 등            |
| 인터랙티비티 | interactivity | cursor-_, select-_, touch-\*               |
| 스크롤       | scroll        | scroll-_, overflow-_                       |
| 테이블       | table         | table-auto, table-fixed, border-collapse   |
| 리스트       | list          | list-disc, list-decimal, list-none         |
| 라인 클램프  | line-clamp    | line-clamp-\*                              |
| 배경 필터    | backdrop      | backdrop-blur-_, backdrop-brightness-_     |

---

## 런타임

### Web (index.ts)

```typescript
import { dot } from "@hua-labs/dot";
const style = dot("p-4 flex items-center"); // → CSSProperties
```

### React Native (native.ts)

```typescript
import { dot } from "@hua-labs/dot/native";
const style = dot("p-4 flex items-center");
// → { padding: 16, display: 'flex', alignItems: 'center' }
// px → number 변환, web-only 속성 SKIP
```

### Class Mode (class.ts)

```typescript
import { dotCSS } from "@hua-labs/dot/class";
// CSS 클래스 기반 스타일 생성 (RSC 호환)
```

### Flutter (adapters/)

```typescript
// FlutterRecipe 구조체 생성 — Flutter 위젯 매핑용
```

---

## 변형(Variants)

### 상태 변형

- `hover:` — 호버 상태
- `focus:` — 포커스 상태
- `active:` — 활성 상태

### 다크 모드

- `dark:` — 다크 모드 전용 스타일

### 반응형

- `sm:` — 640px+
- `md:` — 768px+
- `lg:` — 1024px+

---

## Export 경로

| 경로                   | 설명            | 용도                      |
| ---------------------- | --------------- | ------------------------- |
| `@hua-labs/dot`        | Web 런타임      | CSSProperties 출력        |
| `@hua-labs/dot/native` | RN 런타임       | StyleSheet 출력           |
| `@hua-labs/dot/class`  | CSS 클래스 모드 | RSC 호환, CSS 클래스 생성 |

---

## 테스트

- 테스트 파일: 16개
- 테스트 프레임워크: Vitest
- 총 테스트 수: 1,176+

```bash
pnpm test        # 테스트 실행
pnpm test:watch  # 워치 모드
pnpm test:coverage # 커버리지
```

---

**작성자**: Auto (AI Assistant)
**최종 업데이트**: 2026-03-13
