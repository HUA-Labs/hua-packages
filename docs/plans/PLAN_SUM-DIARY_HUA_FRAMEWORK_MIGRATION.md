# Sum-Diary HUA Framework 마이그레이션 계획

## 개요

숨다이어리(my-app)를 HUA UX Framework로 마이그레이션하여 코드 일관성을 확보하고, 프레임워크 레벨의 기능(i18n, motion, state, icons)을 통합 사용하도록 한다.

## 현재 상태 분석

### Sum-Diary 현재 구조
```
layout.tsx
├── Providers (SessionProvider + ToastProvider)
│   └── ClientI18nProvider (커스텀 i18n)
│       └── LanguageSync
│           └── IconProvider (@hua-labs/ui)
│               └── SumdiThemeProvider (paper/minimal 테마)
│                   └── Header + Main + Footer + BottomNavigation + PWA
```

### HUA Framework 구조 (hua-docs 기준)
```
layout.tsx
├── ThemeProvider (@hua-labs/ui)
│   └── ToastProvider (@hua-labs/ui)
│       └── HuaUxLayout (통합 Provider)
│           └── Header + Main + Footer
```

### 주요 차이점

| 항목 | Sum-Diary | HUA Framework |
|------|-----------|---------------|
| 설정 방식 | 개별 Provider 옵션 | `hua-ux.config.ts` 중앙 설정 |
| i18n | 커스텀 ClientI18nProvider | HuaUxLayout 내장 |
| SSR 번역 | getTranslations 수동 로드 | getSSRTranslations 자동 |
| 테마 | SumdiThemeProvider (paper/minimal) | ThemeProvider (light/dark/system) |
| 인증 | SessionProvider (NextAuth) | 없음 (추가 필요) |
| PWA | ServiceWorkerRegistration, PWAInstallPrompt | 없음 (유지 필요) |
| 모바일 | BottomNavigation | 없음 (유지 필요) |

## 마이그레이션 전략: 하이브리드 접근

Sum-Diary의 고유 기능(인증, PWA, 모바일 네비게이션)을 유지하면서 HUA Framework를 통합하는 하이브리드 접근법을 사용한다.

## 단계별 실행 계획

### Phase 1: 설정 파일 생성 및 기반 구축

#### 1.1 hua-ux.config.ts 생성
```typescript
// apps/my-app/hua-ux.config.ts
import { defineConfig } from '@hua-labs/hua-ux/framework/config';

export default defineConfig({
  preset: 'product',

  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en', 'ja'],
    namespaces: ['common', 'navigation', 'footer', 'diary', 'analysis', 'landing', 'settings'],
    translationLoader: 'static',
    debug: false,
  },

  icons: {
    set: 'phosphor',
    weight: 'regular',
    size: 20,
  },

  motion: {
    style: 'gentle',  // 다이어리 앱에 맞는 부드러운 모션
    enableAnimations: true,
  },

  state: {
    persist: true,
    ssr: true,
  },

  branding: {
    name: '숨 다이어리',
    colors: {
      primary: '#8B7355',    // 따뜻한 브라운 (종이 느낌)
      secondary: '#A89078',  // 보조 브라운
      accent: '#6B8E6B',     // 자연스러운 그린 (성장, 치유)
    },
  },
});
```

#### 1.2 번역 파일 구조 조정
현재 위치: `app/lib/translations/{lang}/{namespace}.json`
HUA 표준: `public/translations/{lang}/{namespace}.json`

```bash
# 번역 파일 이동 (선택적 - 현재 위치 유지 가능)
mkdir -p public/translations
cp -r app/lib/translations/* public/translations/
```

### Phase 2: Layout 마이그레이션

#### 2.1 신규 layout.tsx 구조
```typescript
// apps/my-app/app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider, ToastProvider } from "@hua-labs/ui";
import { HuaUxLayout } from "@hua-labs/hua-ux/framework";
import { setConfig } from "@hua-labs/hua-ux/framework/config";
import { getSSRTranslations } from "@hua-labs/hua-ux/framework/server";
import { SessionProvider } from "next-auth/react";
import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";
import { BottomNavigation } from "@/app/components/layout/BottomNavigation";
import { PWAInstallPrompt } from "@/app/components/service/PWAInstallPrompt";
import { ServiceWorkerRegistration } from "@/app/components/service/ServiceWorkerRegistration";
import { ScrollToTopWrapper } from "@/app/components/layout/ScrollToTopWrapper";
import huaUxConfig from "../hua-ux.config";
import "./globals.css";

setConfig(huaUxConfig);

export const metadata: Metadata = { /* 기존 유지 */ };

export default async function RootLayout({ children }) {
  const initialTranslations = await getSSRTranslations(
    huaUxConfig,
    'app/lib/translations'  // 기존 경로 유지
  );

  const configWithSSR = {
    ...huaUxConfig,
    i18n: huaUxConfig.i18n ? {
      ...huaUxConfig.i18n,
      initialTranslations,
    } : undefined,
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        {/* SessionProvider - NextAuth 전용 (최상위) */}
        <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus>
          <ThemeProvider defaultTheme="system" enableSystem enableTransition>
            <ToastProvider position="bottom-center">
              <HuaUxLayout config={configWithSSR}>
                <div className="flex flex-col min-h-[100dvh]">
                  <Header />
                  <main className="flex-1 pt-20 max-w-7xl mx-auto px-10 w-full">
                    {children}
                  </main>
                  <Footer />
                  <BottomNavigation />
                  <PWAInstallPrompt />
                  <ScrollToTopWrapper />
                </div>
                <ServiceWorkerRegistration />
              </HuaUxLayout>
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Phase 3: 컴포넌트 마이그레이션

#### 3.1 삭제 대상 파일
- `app/components/layout/providers.tsx` - HuaUxLayout으로 대체
- `app/components/layout/ClientI18nProvider.tsx` - HuaUxLayout 내장
- `app/components/layout/LanguageSync.tsx` - HuaUxLayout 내장
- `app/lib/i18n-config.ts` - hua-ux.config.ts로 통합

#### 3.2 수정 대상 컴포넌트
i18n Hook 변경: `useI18n` → `useTranslation`

```typescript
// Before
import { useI18n } from '@/app/hooks/useI18n';
const { t, language, changeLanguage } = useI18n();

// After
import { useTranslation, useLanguage } from '@hua-labs/i18n-core';
const { t } = useTranslation('common');
const { language, setLanguage } = useLanguage();
```

영향받는 주요 컴포넌트:
- `Header.tsx`
- `Footer.tsx`
- `GeneralSettingsTab.tsx`
- `LandingPage.tsx`
- 기타 번역 사용 컴포넌트들

#### 3.3 SumdiThemeProvider 처리
**옵션 A**: 완전 제거 (권장)
- paper/minimal 스타일을 CSS 변수로 전환
- ThemeProvider의 light/dark 시스템 사용

**옵션 B**: 유지 + 래핑
- HuaUxLayout 내부에 SumdiThemeProvider 유지
- 점진적 마이그레이션

### Phase 4: 스타일 시스템 정리

#### 4.1 Tailwind v4 마이그레이션
HUA Framework는 Tailwind v4를 사용. Sum-Diary도 동일하게 맞춤.

```css
/* globals.css */
@import "tailwindcss";

/* HUA Design Tokens */
@theme {
  --color-sum-primary: #8B7355;
  --color-sum-secondary: #A89078;
  --color-sum-accent: #6B8E6B;

  /* Paper 테마 변수 */
  --color-paper-bg: #FDF8F3;
  --color-paper-text: #4A4A4A;
  --color-paper-border: #E8E0D8;
}
```

#### 4.2 Paper 테마 CSS 통합
```css
/* Paper 스타일 (기존 SumdiThemeProvider 대체) */
[data-theme="paper"] {
  --background: var(--color-paper-bg);
  --foreground: var(--color-paper-text);
  --border: var(--color-paper-border);
}
```

### Phase 5: 테스트 및 검증

#### 5.1 기능 체크리스트
- [ ] 소셜 로그인 (Google, Kakao, Naver)
- [ ] 세션 유지/갱신
- [ ] 다크/라이트 모드 전환
- [ ] 언어 변경 (ko/en/ja)
- [ ] PWA 설치 프롬프트
- [ ] 오프라인 기능
- [ ] 모바일 하단 네비게이션
- [ ] 일기 작성/조회/분석
- [ ] 설정 페이지 전체 기능

#### 5.2 성능 검증
- 번들 사이즈 비교 (Before/After)
- First Contentful Paint
- Time to Interactive
- SSR 플리커링 없음 확인

## 파일 변경 요약

### 신규 생성
- `hua-ux.config.ts`

### 삭제
- `app/components/layout/providers.tsx`
- `app/components/layout/ClientI18nProvider.tsx`
- `app/components/layout/LanguageSync.tsx`
- `app/lib/i18n-config.ts`
- `app/providers/SumdiThemeProvider.tsx` (Phase 4 완료 후)

### 수정
- `app/layout.tsx` (전면 재구성)
- `app/globals.css` (테마 변수 추가)
- i18n 사용하는 모든 컴포넌트 (약 15-20개)

## 리스크 및 완화 방안

| 리스크 | 영향도 | 완화 방안 |
|--------|--------|-----------|
| 기존 테마 스타일 손실 | 높음 | CSS 변수로 사전 추출 |
| 번역 키 불일치 | 중간 | 마이그레이션 전 키 매핑 검증 |
| SSR Hydration 오류 | 중간 | suppressHydrationWarning 적용 |
| PWA 기능 영향 | 낮음 | Provider 순서 유지 |

## 롤백 계획

1. Git 브랜치: `feat/hua-framework-migration` 에서 작업
2. 기존 코드 백업: 삭제 전 `_backup` 폴더에 복사
3. 단계별 커밋으로 원하는 지점 복원 가능

## 일정 (예상)

- Phase 1: 설정 파일 및 기반 (1단계)
- Phase 2: Layout 마이그레이션 (1단계)
- Phase 3: 컴포넌트 마이그레이션 (2-3단계)
- Phase 4: 스타일 시스템 (1단계)
- Phase 5: 테스트 및 검증 (1단계)

---

**작성일**: 2026-01-16
**작성자**: Claude (Plan Mode)
**상태**: 승인 대기
