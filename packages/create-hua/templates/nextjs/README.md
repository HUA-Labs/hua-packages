# hua 프로젝트 / hua Project

이 프로젝트는 **hua** 프레임워크로 생성되었습니다.  
This project was created with the **hua** framework.

## 시작하기 / Getting Started

### 개발 서버 실행 / Run Development Server

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.  
Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### 빌드 / Build

```bash
pnpm build
pnpm start
```

## hua 사용 가이드 / hua Usage Guide

### 0. GEO (AI 검색 엔진 최적화) / GEO (Generative Engine Optimization)

**GEO**는 ChatGPT, Claude, Gemini, Perplexity 같은 AI 검색 엔진이 당신의 소프트웨어를 잘 찾고 추천하도록 최적화하는 기능입니다.

**GEO** helps AI search engines (ChatGPT, Claude, Gemini, Perplexity) discover and recommend your software.

**예제 파일**:
- `app/layout-with-geo.example.tsx` - GEO가 포함된 레이아웃 예제
- `app/page-with-geo.example.tsx` - GEO가 포함된 페이지 예제

### 1. 프로젝트 구조 / Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃 (HuaUxLayout 사용)
│   ├── page.tsx           # 홈 페이지
│   └── api/               # API 라우트
│       └── translations/  # 번역 API
├── lib/                   # 유틸리티
│   └── i18n-setup.ts     # i18n 설정
├── store/                 # 상태 관리
│   └── useAppStore.ts    # Zustand 스토어
├── translations/          # 번역 파일
│   ├── ko/
│   └── en/
└── hua.config.ts      # hua 설정 파일
```

### 2. 설정 파일 / Configuration File (`hua.config.ts`)

프로젝트 루트의 `hua.config.ts`에서 프레임워크를 설정합니다.  
Configure the framework in `hua.config.ts` at the project root:

```typescript
import { defineConfig } from '@hua-labs/hua/framework';

export default defineConfig({
  // 프리셋: 'product' (빠른 전환) 또는 'marketing' (드라마틱한 모션)
  preset: 'product',
  
  // i18n 설정
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
  
  // 모션 설정
  motion: {
    defaultPreset: 'product',
    enableAnimations: true,
  },
  
  // 상태 관리 설정
  state: {
    persist: true,
    ssr: true,
  },
  
  // 브랜딩 설정 (선택사항)
  branding: {
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
    },
  },
});
```

### 3. 페이지 작성하기 / Writing Pages

#### 기본 페이지 / Basic Page

```tsx
// app/page.tsx
'use client';

import { HuaUxPage } from '@hua-labs/hua/framework';
import { Button, Card } from '@hua-labs/hua';

export default function HomePage() {
  return (
    <HuaUxPage title="홈" description="환영합니다">
      <Card>
        <h1>안녕하세요!</h1>
        <Button>시작하기</Button>
      </Card>
    </HuaUxPage>
  );
}
```

#### SEO 메타데이터가 포함된 페이지 / Page with SEO Metadata

SEO를 위해 Next.js `metadata` export를 사용하는 것을 권장합니다:

```tsx
// app/page.tsx (Server Component)
import { generatePageMetadata } from '@hua-labs/hua/framework';
import { HomePageContent } from './HomePageContent';

export const metadata = generatePageMetadata({
  title: '홈',
  description: '환영합니다',
  seo: {
    keywords: ['키워드1', '키워드2'],
    ogImage: '/og-image.png',
  },
});

export default function HomePage() {
  return <HomePageContent />;
}
```

#### GEO (AI 검색 엔진 최적화)가 포함된 페이지 / Page with GEO

ChatGPT, Claude, Gemini, Perplexity 같은 AI 검색 엔진이 당신의 앱을 잘 찾고 추천하도록 GEO를 추가할 수 있습니다:

```tsx
// app/page.tsx (Server Component)
import { generateGEOMetadata, renderJSONLD } from '@hua-labs/hua/framework';
import Script from 'next/script';
import { HomePageContent } from './page-content';

// GEO 메타데이터 생성
const geoMeta = generateGEOMetadata({
  name: 'My App',
  description: 'Built with hua framework',
  version: '1.0.0',
  applicationCategory: ['UX Framework', 'Developer Tool'],
  programmingLanguage: ['TypeScript', 'React', 'Next.js'],
  features: ['i18n', 'Motion', 'Accessibility'],
  keywords: ['nextjs', 'react', 'ux'],
});

export const metadata = {
  title: 'My App',
  description: geoMeta.meta.find(m => m.name === 'description')?.content,
};

export default function HomePage() {
  return (
    <>
      <Script {...renderJSONLD(geoMeta.jsonLd[0])} />
      <HomePageContent />
    </>
  );
}
```

자세한 예제는 `app/layout-with-geo.example.tsx`와 `app/page-with-geo.example.tsx`를 참고하세요.

```tsx
// app/HomePageContent.tsx (Client Component)
'use client';

import { HuaUxPage } from '@hua-labs/hua/framework';

export function HomePageContent() {
  return (
    <HuaUxPage title="홈" description="환영합니다">
      <h1>안녕하세요!</h1>
    </HuaUxPage>
  );
}
```

#### SEO와 i18n이 포함된 페이지 / Page with SEO and i18n

```tsx
// app/about/page.tsx
'use client';

import { HuaUxPage } from '@hua-labs/hua/framework';

export default function AboutPage() {
  return (
    <HuaUxPage
      title="회사 소개"
      description="우리 회사에 대해 알아보세요"
      seo={{
        title: "회사 소개 | 우리 회사",
        description: "우리 회사의 역사와 비전을 소개합니다",
        keywords: ["회사", "소개", "비전"],
      }}
      i18nKey="about"
    >
      <div>
        <h1>회사 소개</h1>
        <p>우리 회사는...</p>
      </div>
    </HuaUxPage>
  );
}
```

### 4. UI 컴포넌트 사용하기 / Using UI Components

```tsx
import { Button, Card, Input, Modal } from '@hua-labs/hua';

// Button
<Button variant="default">기본 버튼</Button>
<Button variant="outline">아웃라인 버튼</Button>
<Button variant="ghost">고스트 버튼</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>내용</CardContent>
</Card>
```

**브랜딩 자동 적용 / Automatic Branding**: `hua.config.ts`에서 `branding.colors`를 설정하면 Button과 Card가 자동으로 브랜드 색상을 사용합니다.  
When you set `branding.colors` in `hua.config.ts`, Button and Card components automatically use your brand colors.

### 5. 모션 애니메이션 사용하기 / Using Motion Animations

```tsx
import { useFadeIn, useSlideUp, useScaleIn } from '@hua-labs/hua';

export default function AnimatedPage() {
  const fadeInRef = useFadeIn();
  const slideUpRef = useSlideUp();
  const scaleInRef = useScaleIn();

  return (
    <div>
      <div ref={fadeInRef}>페이드 인</div>
      <div ref={slideUpRef}>슬라이드 업</div>
      <div ref={scaleInRef}>스케일 인</div>
    </div>
  );
}
```

**사용 가능한 모션 훅 / Available Motion Hooks**:
- `useFadeIn` - 페이드 인 / Fade in
- `useSlideUp` - 아래에서 위로 슬라이드 / Slide up from bottom
- `useSlideDown` - 위에서 아래로 슬라이드 / Slide down from top
- `useScaleIn` - 스케일 인 / Scale in
- `useBounceIn` - 바운스 인 / Bounce in
- `useHoverMotion` - 호버 모션 / Hover motion
- `useScrollReveal` - 스크롤 리빌 / Scroll reveal

### 6. 다국어 지원 (i18n) / Internationalization (i18n)

#### 번역 파일 작성 / Writing Translation Files

```json
// translations/ko/common.json
{
  "welcome": "환영합니다",
  "getStarted": "시작하기",
  "learnMore": "더 알아보기"
}

// translations/en/common.json
{
  "welcome": "Welcome",
  "getStarted": "Get Started",
  "learnMore": "Learn More"
}
```

#### 컴포넌트에서 사용 / Using in Components

```tsx
import { useTranslation } from '@hua-labs/hua/i18n';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <Button>{t('common:getStarted')}</Button>
    </div>
  );
}
```

#### 언어 변경 / Changing Language

```tsx
import { useAppStore } from '@/store/useAppStore';

export default function LanguageSwitcher() {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  
  return (
    <button onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}>
      {language === 'ko' ? 'English' : '한국어'}
    </button>
  );
}
```

### 7. 상태 관리 (Zustand) / State Management (Zustand)

```tsx
// store/useAppStore.ts
import { createHuaStore } from '@hua-labs/hua/state';

interface AppState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useAppStore = createHuaStore<AppState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  {
    persist: true,
    persistKey: 'app-storage',
    ssr: true,
  }
);

// 사용 / Usage
import { useAppStore } from '@/store/useAppStore';

export default function Counter() {
  const count = useAppStore((state) => state.count);
  const increment = useAppStore((state) => state.increment);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

## 브랜딩 커스터마이징 / Branding Customization

`hua.config.ts`에서 브랜드 색상을 설정하면 Button과 Card가 자동으로 적용됩니다.  
Set brand colors in `hua.config.ts` and Button and Card will automatically use them:

```typescript
export default defineConfig({
  branding: {
    colors: {
      primary: '#FF5733',      // 메인 색상
      secondary: '#33C3F0',     // 보조 색상
      accent: '#FFC300',        // 강조 색상
    },
  },
});
```

## 더 알아보기 / Learn More

- [hua 공식 문서 / Official Documentation](https://github.com/HUA-Labs/HUA-Labs-public)
- [UI 컴포넌트 가이드 / UI Components Guide](https://github.com/HUA-Labs/HUA-Labs-public/tree/main/packages/hua-ui)
- [Motion 훅 가이드 / Motion Hooks Guide](https://github.com/HUA-Labs/HUA-Labs-public/tree/main/packages/hua-motion-core)
- [i18n 가이드 / i18n Guide](https://github.com/HUA-Labs/HUA-Labs-public/tree/main/packages/hua-i18n-core)

## 개발 팁 / Development Tips

### 프리셋 변경 / Changing Presets

- **product**: 빠른 전환, 최소 지연 (제품 페이지용) / Fast transitions, minimal delays (for product pages)
- **marketing**: 드라마틱한 모션, 긴 지연 (랜딩 페이지용) / Dramatic motions, longer delays (for landing pages)

```typescript
export default defineConfig({
  preset: 'marketing', // 또는 'product'
});
```

### 모션 비활성화 / Disabling Animations

개발 중 모션을 일시적으로 비활성화하려면:  
To temporarily disable animations during development:

```typescript
export default defineConfig({
  motion: {
    enableAnimations: false,
  },
});
```

### 번역 API 커스터마이징 / Customizing Translation API

`app/api/translations/route.ts`에서 번역 로딩 로직을 커스터마이징할 수 있습니다.  
You can customize the translation loading logic in `app/api/translations/route.ts`.

## 라이선스 / License

MIT
