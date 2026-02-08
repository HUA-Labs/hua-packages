# create-hua-ux CLI 설계 문서

## 개요

`create-hua-ux`는 hua-ux 프로젝트를 빠르게 생성하는 스캐폴딩 도구입니다. 향후 확장 계획을 포함한 CLI 설계 문서입니다.

## 현재 구현 상태

### 기본 명령어

```bash
pnpm create hua-ux my-app
```

**기능**:
- 프로젝트 이름 입력
- Next.js 템플릿 복사
- 기본 설정 파일 생성 (`hua-ux.config.ts`)
- 의존성 설치 안내

## 향후 확장 계획

### 1. 코드 생성기 (Generate Command)

#### 명령어 구조

```bash
# 페이지 생성
pnpm hua-ux gen page DiaryList

# 컴포넌트 생성
pnpm hua-ux gen component UserCard

# 훅 생성
pnpm hua-ux gen hook useDiary

# API Route 생성
pnpm hua-ux gen api diaries
```

#### 구현 계획

**1.1 페이지 생성기**

```typescript
// 명령어: pnpm hua-ux gen page DiaryList
// 생성되는 파일:
// - app/diary-list/page.tsx
// - app/diary-list/loading.tsx (optional)
// - app/diary-list/error.tsx (optional)
// - translations/ko/diary-list.json
// - translations/en/diary-list.json
```

**템플릿 예시**:
```tsx
// app/diary-list/page.tsx
import { HuaUxPage } from '@hua-labs/hua-ux/framework';
import { useTranslation } from '@hua-labs/i18n-core';

export default function DiaryListPage() {
  const { t } = useTranslation('diary-list');

  return (
    <HuaUxPage
      title={t('title')}
      description={t('description')}
    >
      <h1>{t('title')}</h1>
      {/* Your content here */}
    </HuaUxPage>
  );
}
```

**1.2 컴포넌트 생성기**

```typescript
// 명령어: pnpm hua-ux gen component UserCard
// 생성되는 파일:
// - components/UserCard/UserCard.tsx
// - components/UserCard/UserCard.test.tsx (optional)
// - components/UserCard/index.ts
```

**템플릿 예시**:
```tsx
// components/UserCard/UserCard.tsx
'use client';

import { Card } from '@hua-labs/hua-ux';
import { useFadeIn } from '@hua-labs/hua-ux';

interface UserCardProps {
  name: string;
  email: string;
}

export function UserCard({ name, email }: UserCardProps) {
  const { ref } = useFadeIn();

  return (
    <Card ref={ref}>
      <h3>{name}</h3>
      <p>{email}</p>
    </Card>
  );
}
```

**1.3 훅 생성기**

```typescript
// 명령어: pnpm hua-ux gen hook useDiary
// 생성되는 파일:
// - hooks/useDiary.ts
```

**템플릿 예시**:
```typescript
// hooks/useDiary.ts
import { useState, useEffect } from 'react';
import { useData } from '@hua-labs/hua-ux/framework';

interface Diary {
  id: string;
  title: string;
  content: string;
}

export function useDiary(id: string) {
  const { data, loading, error } = useData<Diary>(`/api/diaries/${id}`);

  return {
    diary: data,
    isLoading: loading,
    error,
  };
}
```

**1.4 API Route 생성기**

```typescript
// 명령어: pnpm hua-ux gen api diaries
// 생성되는 파일:
// - app/api/diaries/route.ts
```

**템플릿 예시**:
```typescript
// app/api/diaries/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Your GET logic here
  return NextResponse.json({ message: 'Diaries API' });
}

export async function POST(request: NextRequest) {
  // Your POST logic here
  return NextResponse.json({ message: 'Diary created' });
}
```

### 2. 설정 검증 (Validate Command)

```bash
# 프로젝트 구조 검증
pnpm hua-ux validate

# 특정 규칙만 검증
pnpm hua-ux validate --rules=structure,i18n
```

**검증 항목**:
- 파일 구조 규칙 준수
- i18n 번역 파일 일관성
- 설정 파일 유효성
- 의존성 버전 호환성

### 3. 설정 자동완성 개선

#### 현재 상태

```typescript
// hua-ux.config.ts
import { defineConfig } from '@hua-labs/hua-ux/framework';

export default defineConfig({
  // Partial<HuaUxConfig> 타입으로 자동완성 지원
  i18n: {
    defaultLanguage: 'ko',
    // ...
  },
});
```

#### 개선 방안

**3.1 더 나은 타입 추론**

```typescript
// packages/hua-ux/src/framework/config/index.ts
export function defineConfig<T extends Partial<HuaUxConfig>>(
  config: T & {
    // 필수 필드 검증
    i18n: T['i18n'] extends undefined ? never : T['i18n'];
  }
): HuaUxConfig {
  return validateConfig(config);
}
```

**3.2 JSDoc 주석으로 설명 제공**

```typescript
/**
 * Define framework configuration
 *
 * @param config - Configuration object
 * @param config.i18n - Internationalization settings
 * @param config.i18n.defaultLanguage - Default language code (e.g., 'ko', 'en')
 * @param config.i18n.supportedLanguages - Array of supported language codes
 * @param config.motion - Motion/animation settings
 * @param config.motion.defaultPreset - Default motion preset ('product' | 'marketing')
 * @param config.motion.enableAnimations - Enable animations globally
 *
 * @example
 * ```ts
 * export default defineConfig({
 *   i18n: {
 *     defaultLanguage: 'ko',
 *     supportedLanguages: ['ko', 'en'],
 *   },
 * });
 * ```
 */
export function defineConfig(config: Partial<HuaUxConfig>): HuaUxConfig {
  return validateConfig(config);
}
```

### 4. Edge Runtime 최적화

#### 현재 상태

- 미들웨어 경고 추가됨
- `.example` 파일로 선택적 사용 가능

#### 개선 방안

**4.1 번역 데이터 최적화**

```typescript
// Edge Runtime에서 사용 가능한 경량화된 번역 로더
export function createEdgeTranslationLoader() {
  // JSON 파일을 경량화하거나
  // 별도의 Edge-optimized API route 활용
  return async (language: string, namespace: string) => {
    const response = await fetch(
      `/api/translations?language=${language}&namespace=${namespace}`,
      {
        // Edge 캐싱 설정
        next: { revalidate: 3600 },
      }
    );
    return response.json();
  };
}
```

**4.2 번역 파일 경량화**

```bash
# 번역 파일 최적화 스크립트
pnpm hua-ux optimize translations

# 결과: translations/ko/common.json → translations/ko/common.min.json
# - 불필요한 공백 제거
# - 키 이름 최적화
# - 중복 제거
```

## 구현 우선순위

### Phase 1 (Alpha → Beta)
- [x] 기본 프로젝트 생성
- [ ] Config Autocomplete 개선 (JSDoc 추가)
- [ ] Edge Runtime 최적화 문서화

### Phase 2 (Beta)
- [ ] 페이지 생성기 (`gen page`)
- [ ] 컴포넌트 생성기 (`gen component`)
- [ ] 설정 검증 (`validate`)

### Phase 3 (Stable)
- [ ] 훅 생성기 (`gen hook`)
- [ ] API Route 생성기 (`gen api`)
- [ ] 번역 파일 최적화 (`optimize translations`)

## CLI 명령어 체계

```
create-hua-ux
├── create <project-name>     # 프로젝트 생성 (현재 구현됨)
├── gen <type> <name>         # 코드 생성 (계획)
│   ├── page <name>
│   ├── component <name>
│   ├── hook <name>
│   └── api <name>
├── validate [--rules]        # 검증 (계획)
└── optimize <target>         # 최적화 (계획)
    └── translations
```

## 참고 자료

- [Next.js CLI Reference](https://nextjs.org/docs/app/api-reference/cli)
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html) (참고용)
- [TypeScript JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
