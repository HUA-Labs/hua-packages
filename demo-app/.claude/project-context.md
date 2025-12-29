# hua-ux 프로젝트 컨텍스트
# hua-ux Project Context

이 문서는 Claude가 이 프로젝트의 구조와 사용법을 이해하기 위한 가이드입니다.
This document is a guide for Claude to understand the structure and usage of this project.

## 프로젝트 개요 / Project Overview

이 프로젝트는 **hua-ux 프레임워크**를 사용하는 Next.js 애플리케이션입니다.
This project uses the **hua-ux framework** for Next.js applications.

**핵심 철학 / Core Philosophy**: "Next.js 몰라도 됨. 그냥 설정하고 AI한테 말하면 됨."
**Core Philosophy**: "You don't need to know Next.js. Just configure and tell AI what to do."

## 아키텍처 계층 / Architecture Layers

### 상단 레이어: AI Context & CLI
- `.cursorrules`: Cursor IDE용 규칙
- `.claude/project-context.md`: 이 문서 (Claude용)
- `ai-context.md`: 범용 AI 컨텍스트

### 중간 레이어: Framework & Config
- `hua-ux.config.ts`: 프레임워크 설정
- `HuaUxLayout`: 자동 Provider 설정
- `HuaUxPage`: 페이지 래퍼 (Motion, i18n 자동 적용)

### 하단 레이어: Core & Types
- `@hua-labs/state`: 상태 관리
- `@hua-labs/motion-core`: 모션/애니메이션
- `@hua-labs/i18n-core`: 다국어 지원

## 프로젝트 구조 / Project Structure

```
프로젝트 루트/
├── app/                    # Next.js App Router 페이지
│   ├── layout.tsx          # 루트 레이아웃 (HuaUxLayout 사용)
│   ├── page.tsx            # 홈 페이지 (HuaUxPage 사용)
│   └── api/                # API Routes
│       └── translations/   # i18n 번역 API
├── components/             # 재사용 가능한 컴포넌트
├── lib/                    # 유틸리티 함수
│   └── i18n-setup.ts      # i18n 설정
├── store/                  # Zustand 스토어
│   └── useAppStore.ts     # 전역 상태
├── translations/           # 번역 파일
│   ├── ko/                # 한국어
│   └── en/                # 영어
└── hua-ux.config.ts        # 프레임워크 설정
```

## 주요 패턴 / Key Patterns

### 1. 페이지 생성 패턴 / Page Creation Pattern

```tsx
// app/my-page/page.tsx
import { HuaUxPage } from '@hua-labs/hua-ux/framework';
import { useTranslation } from '@hua-labs/i18n-core';

export default function MyPage() {
  const { t } = useTranslation('my-page');
  
  return (
    <HuaUxPage title={t('title')} description={t('description')}>
      <h1>{t('title')}</h1>
      {/* 내용 */}
    </HuaUxPage>
  );
}
```

**중요 / Important**: 
- `HuaUxPage`로 감싸면 Motion, i18n 자동 적용
- 번역 키는 `translations/{언어}/my-page.json`에 추가

### 2. 컴포넌트 생성 패턴 / Component Creation Pattern

```tsx
// components/MyComponent.tsx
'use client';

import { Card } from '@hua-labs/ui';
import { useFadeIn } from '@hua-labs/motion-core';

export function MyComponent() {
  const motion = useFadeIn();
  
  return (
    <Card ref={motion.ref} style={motion.style}>
      {/* 내용 */}
    </Card>
  );
}
```

**중요 / Important**:
- 클라이언트 컴포넌트는 `'use client'` 필수
- 프레임워크 컴포넌트 활용 (`@hua-labs/ui`, `@hua-labs/motion-core`)

### 3. 번역 파일 패턴 / Translation File Pattern

```json
// translations/ko/my-page.json
{
  "title": "제목",
  "description": "설명",
  "button": "버튼"
}

// translations/en/my-page.json
{
  "title": "Title",
  "description": "Description",
  "button": "Button"
}
```

**중요 / Important**:
- 모든 번역 키는 한국어와 영어 모두에 추가
- 네임스페이스는 페이지 이름과 동일하게

## 설정 파일 이해하기 / Understanding Configuration

### hua-ux.config.ts

```typescript
export default defineConfig({
  preset: 'product',  // 'product' 또는 'marketing'
  
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
  },
  
  motion: {
    defaultPreset: 'product',
    enableAnimations: true,
  },
});
```

**Preset 선택 / Preset Selection**:
- `'product'`: 제품 페이지용 (전문적, 효율적) / Product pages (professional, efficient)
- `'marketing'`: 마케팅 페이지용 (화려함, 눈에 띄는) / Marketing pages (dramatic, eye-catching)

## Claude가 코드 생성할 때 주의사항 / Guidelines for Claude Code Generation

1. **페이지 생성 시 / When Creating Pages**:
   - `HuaUxPage`로 감싸기
   - 번역 파일도 함께 생성
   - `useTranslation` 훅 사용

2. **컴포넌트 생성 시 / When Creating Components**:
   - `'use client'` 지시어 추가
   - 프레임워크 컴포넌트 활용
   - Motion 적용 고려

3. **번역 추가 시 / When Adding Translations**:
   - 한국어와 영어 모두 추가
   - 네임스페이스 일관성 유지

4. **설정 변경 시 / When Changing Configuration**:
   - `hua-ux.config.ts`만 수정
   - Preset 활용 (직접 설정보다 Preset 우선)

## 바이브 코딩 친화적 / Vibe Coding Friendly

이 프로젝트는 **바이브 코딩**을 지원합니다:
This project supports **vibe coding**:

- **명사 중심 설정 / Noun-centered configuration**: `preset: 'product'` (의도 표현)
- **한 파일에서 많은 것 결정 / Many decisions in one file**: `HuaUxPage`에 SEO, Motion, i18n 모두
- **AI 친화적 문서 / AI-friendly documentation**: 한글과 영어 모두 포함

## 참고 자료 / References

- `ai-context.md`: 상세한 프로젝트 구조 설명
- 프레임워크 문서: `node_modules/@hua-labs/hua-ux/README.md`
- UI 컴포넌트: `node_modules/@hua-labs/ui/README.md`
- 모션: `node_modules/@hua-labs/motion-core/README.md`
- i18n: `node_modules/@hua-labs/i18n-core-zustand/README.md`