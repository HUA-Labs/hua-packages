# @hua-labs/hua-ux/framework

**Framework layer for hua-ux** - Structure and rules enforcement with developer affordances.

A framework layer that wraps Next.js to enforce structure and conventions while providing maximum convenience through affordances.

## Installation

This is part of `@hua-labs/hua-ux`. Install the main package:

```bash
pnpm add @hua-labs/hua-ux zustand
```

## Features

- ✅ **Automatic Provider Setup**: `HuaUxLayout` automatically configures i18n, motion, and state
- ✅ **Configuration System**: Type-safe configuration via `hua-ux.config.ts`
- ✅ **Data Fetching**: Type-safe utilities for server and client components
- ✅ **Middleware System**: Built-in i18n middleware for language detection
- ✅ **File Structure Validation**: Ensures project follows framework conventions
- ✅ **Type Safe**: Full TypeScript support with autocomplete

## Quick Start

### 사용 방법 선택

**프레임워크 레이어를 사용하는 방법 (권장)**:
- `HuaUxLayout`을 사용하면 모든 Provider가 자동으로 설정됩니다
- 설정 파일만으로 간단하게 시작할 수 있습니다

**직접 사용하는 방법**:
- 더 세밀한 제어가 필요한 경우 `createI18nStore` + `createZustandI18n` 조합 사용
- 자세한 내용은 [메인 README](../../README.md)의 "방법 2: 직접 사용" 섹션 참고

### 1. Configuration

Create `hua-ux.config.ts` in your project root:

```tsx
import { defineConfig } from '@hua-labs/hua-ux/framework';

export default defineConfig({
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
  motion: {
    defaultPreset: 'product',
    enableAnimations: true,
  },
  state: {
    persist: true,
    ssr: true,
  },
});
```

### 2. Root Layout

```tsx
// app/layout.tsx
import { HuaUxLayout } from '@hua-labs/hua-ux/framework';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <HuaUxLayout>{children}</HuaUxLayout>
      </body>
    </html>
  );
}
```

### 3. Pages

#### Basic Page (Client Component)

```tsx
// app/page.tsx
'use client';

import { HuaUxPage } from '@hua-labs/hua-ux/framework';

export default function HomePage() {
  return (
    <HuaUxPage title="Home" description="Welcome page">
      <h1>Welcome</h1>
    </HuaUxPage>
  );
}
```

#### Page with SEO Metadata (Server Component + Client Component)

For better SEO, use Next.js `metadata` export in Server Components:

```tsx
// app/page.tsx
import { generatePageMetadata } from '@hua-labs/hua-ux/framework';
import { HomePageContent } from './HomePageContent';

export const metadata = generatePageMetadata({
  title: '홈',
  description: '환영합니다',
  seo: {
    keywords: ['키워드1', '키워드2'],
    ogImage: '/og-image.png',
    ogTitle: '홈 | 우리 회사',
    ogDescription: '우리 회사에 오신 것을 환영합니다',
  },
});

export default function HomePage() {
  return <HomePageContent />;
}
```

```tsx
// app/HomePageContent.tsx (Client Component)
'use client';

import { HuaUxPage } from '@hua-labs/hua-ux/framework';

export function HomePageContent() {
  return (
    <HuaUxPage title="Home" description="Welcome page">
      <h1>Welcome</h1>
    </HuaUxPage>
  );
}
```

## Import Paths

| Path | 환경 | 용도 |
|------|------|------|
| `@hua-labs/hua-ux/framework` | Client | 컴포넌트, 훅, 클라이언트 런타임 + shared re-export |
| `@hua-labs/hua-ux/framework/shared` | Server & Client | 타입, 순수 함수 (GEO, metadata, CSS vars 등) |
| `@hua-labs/hua-ux/framework/server` | Server only | SSR 번역, config 로딩 + shared re-export |

### `framework/shared` — "use client" 없는 순수 export

서버 컴포넌트에서 GEO 메타데이터나 CSS 변수 생성이 필요할 때 사용:

```tsx
// Server Component에서 안전하게 사용 가능
import {
  generateGEOMetadata,
  generatePageMetadata,
  generateCSSVariables,
  createI18nMiddleware,
} from '@hua-labs/hua-ux/framework/shared';

// 또는 server entrypoint에서 (shared 자동 re-export)
import {
  generateGEOMetadata,
  getSSRTranslations,
  loadConfig,
} from '@hua-labs/hua-ux/framework/server';
```

> **하위호환**: `@hua-labs/hua-ux/framework` (client)에서도 shared의 모든 export를 사용할 수 있음. 기존 import가 깨지지 않음.

## API

### Components

#### `HuaUxLayout`

Root layout wrapper that automatically sets up all providers.

```tsx
<HuaUxLayout config={overrideConfig}>
  {children}
</HuaUxLayout>
```

#### `HuaUxPage`

Page wrapper with automatic motion and i18n support.

```tsx
<HuaUxPage title="Page Title" enableMotion={true}>
  {children}
</HuaUxPage>
```

### Configuration

#### `defineConfig(config)`

Define framework configuration.

```tsx
export default defineConfig({
  i18n: { /* ... */ },
  motion: { /* ... */ },
  state: { /* ... */ },
});
```

### SSR Translations

#### `getSSRTranslations(config, translationsDir?)`

Load translations server-side to prevent language flickering. **Server Component only.**

**Import**: `@hua-labs/hua-ux/framework/server`

**Parameters**:
- `config`: HuaUxConfig object (reads `i18n.namespaces` and `i18n.supportedLanguages`)
- `translationsDir`: Path to translations directory (default: `'lib/translations'`)

**Returns**: `Promise<Record<string, Record<string, Record<string, string>>>>`

**File Structure**:
```
your-app/
├── lib/
│   └── translations/       ← Default location
│       ├── ko/
│       │   ├── common.json
│       │   └── navigation.json
│       └── en/
│           ├── common.json
│           └── navigation.json
└── app/
    └── layout.tsx
```

**Usage**:

```tsx
// app/layout.tsx (Server Component)
import { HuaUxLayout } from '@hua-labs/hua-ux/framework';
import { getSSRTranslations } from '@hua-labs/hua-ux/framework/server';
import huaUxConfig from '../hua-ux.config';

export default async function RootLayout({ children }) {
  // Load all translations server-side
  const initialTranslations = await getSSRTranslations(huaUxConfig);

  // Or with custom path
  // const initialTranslations = await getSSRTranslations(huaUxConfig, 'app/lib/translations');

  const configWithSSR = {
    ...huaUxConfig,
    i18n: {
      ...huaUxConfig.i18n,
      initialTranslations,
    },
  };

  return (
    <html lang="ko">
      <body>
        <HuaUxLayout config={configWithSSR}>
          {children}
        </HuaUxLayout>
      </body>
    </html>
  );
}
```

**Why use SSR Translations?**
- Prevents language flickering on page load
- SEO: Search engines see translated content immediately
- Better UX: No flash of wrong language

### Data Fetching

#### `useData<T>(url, options?)`

Client-side data fetching hook.

**Parameters**:
- `url`: API endpoint to fetch from
- `options`: Optional `RequestInit` configuration (standard fetch options)
  - **Note**: Currently supports standard `RequestInit` only. For advanced features like `revalidateOnFocus`, `revalidateOnReconnect`, or `refreshInterval`, consider using SWR or React Query.

**Returns**:
- `data`: Fetched data (or `null` if loading/error)
- `isLoading`: Loading state
- `error`: Error object (or `null`)
- `refetch`: Function to manually refetch data

**Usage in Client Components**:

```tsx
'use client';

import { useData } from '@hua-labs/hua-ux/framework';

interface Post {
  id: string;
  title: string;
}

export default function PostsPage() {
  const { data, isLoading, error, refetch } = useData<Post[]>('/api/posts');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

#### `fetchData<T>(url, options?)`

Server-side data fetching utility.

**Parameters**:
- `url`: API endpoint to fetch from
- `options`: Optional `RequestInit` configuration (standard fetch options)

**Returns**: Promise that resolves to the fetched data

**Throws**: `Error` if the request fails or response is not ok

**Usage in Server Components**:

```tsx
// app/posts/page.tsx (Server Component)
import { fetchData } from '@hua-labs/hua-ux/framework';

interface Post {
  id: string;
  title: string;
}

export default async function PostsPage() {
  try {
    const posts = await fetchData<Post[]>('/api/posts');
    
    return (
      <div>
        {posts.map(post => (
          <div key={post.id}>{post.title}</div>
        ))}
      </div>
    );
  } catch (error) {
    // Handle error appropriately
    console.error('Failed to fetch posts:', error);
    return <div>Error loading posts. Please try again later.</div>;
  }
}
```

**Error Handling**:
Always wrap `fetchData` calls in try-catch blocks in Server Components, as it throws errors on failure.

### Middleware

#### `createI18nMiddleware(config)`

Create i18n middleware for Next.js.

**⚠️ Edge Runtime Required**: Next.js middleware runs on Edge Runtime. Make sure to export the runtime config:

```tsx
// middleware.ts
import { createI18nMiddleware } from '@hua-labs/hua-ux/framework';

// Edge Runtime 명시 (권장)
// Next.js middleware는 기본적으로 Edge Runtime에서 실행됩니다.
// Vercel과 같은 플랫폼은 자동으로 Edge Runtime을 감지하지만,
// 명시적으로 설정하는 것이 좋습니다.
// Next.js middleware runs on Edge Runtime by default.
// Platforms like Vercel auto-detect Edge Runtime, but explicit configuration is recommended.
export const runtime = 'edge';

export default createI18nMiddleware({
  defaultLanguage: 'ko',
  supportedLanguages: ['ko', 'en'],
  detectionStrategy: 'header',
});
```

**Edge Runtime 제약사항 / Edge Runtime Limitations**:
- Node.js API 사용 불가 (fs, path 등) / Cannot use Node.js APIs (fs, path, etc.)
- 일부 npm 패키지가 Edge Runtime과 호환되지 않을 수 있음 / Some npm packages may not be compatible with Edge Runtime
- Next.js middleware는 기본적으로 Edge Runtime에서 실행됩니다 / Next.js middleware runs on Edge Runtime by default

**대안 / Alternatives**: 
- Edge Runtime을 사용하지 않으려면 API Route나 클라이언트 컴포넌트에서 언어 감지를 처리할 수 있습니다.  
- If you don't want to use Edge Runtime, you can handle language detection in API routes or client components.

**Edge Runtime에서 사용 불가능한 기능 / Features Not Available in Edge Runtime**:
- `loadConfig()`: 설정 파일 동적 로드 (서버 전용) / Dynamic config file loading (server-only)
- `validateFileStructure()`: 파일 구조 검증 (서버 전용) / File structure validation (server-only)
- Node.js 모듈 사용 (`fs`, `path` 등) / Using Node.js modules (`fs`, `path`, etc.)

**권장 사항 / Recommendations**:
- 미들웨어는 선택적 기능입니다. 사용하지 않아도 프레임워크는 정상 작동합니다.  
- Middleware is optional. The framework works fine without it.
- 언어 감지는 클라이언트 컴포넌트나 API Route에서 처리할 수 있습니다.  
- Language detection can be handled in client components or API routes.

### File Structure

#### `validateFileStructure(projectRoot)`

Validate project file structure.

```tsx
const result = validateFileStructure(process.cwd());
if (!result.valid) {
  console.error('Missing directories:', result.missing);
}
```

## License

MIT
