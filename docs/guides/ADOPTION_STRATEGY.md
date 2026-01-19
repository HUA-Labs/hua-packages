# HUA Framework 도입 전략 가이드

> 프로젝트 규모와 상황에 맞는 HUA Framework 도입 방법

## 개요

HUA Framework는 **전면 교체** 없이 **필요한 부분만 선택적으로 도입**할 수 있도록 설계되었습니다. 레거시 프로젝트, 소규모 팀, 기존 기술 스택이 있는 프로젝트 모두 부담 없이 시작할 수 있습니다.

## 도입 방식 비교

| 방식 | 적합한 상황 | 난이도 | 소요 시간 |
|------|------------|--------|----------|
| 신규 프로젝트 | 새로 시작하는 프로젝트 | 쉬움 | 즉시 |
| 부분 도입 | 레거시에 기능 추가 | 쉬움 | 기능당 1-2시간 |
| 점진적 마이그레이션 | 기존 스택 교체 | 중간 | 수 주 |
| 전면 마이그레이션 | 완전한 전환 | 높음 | 수 개월 |

---

## 1. 신규 프로젝트

가장 쉬운 방법. CLI로 바로 시작:

```bash
npx create-hua-ux my-app
cd my-app
pnpm dev
```

포함되는 것:
- Next.js 16+ 설정
- HUA UI 컴포넌트
- i18n (한국어/영어 기본)
- 모션 시스템
- Tailwind v4

---

## 2. 부분 도입 (권장)

기존 프로젝트에 필요한 패키지만 설치해서 사용합니다.

### 2.1 모션만 추가하기

**상황**: 기존 앱에 애니메이션/인터랙션을 추가하고 싶을 때

```bash
pnpm add @hua-labs/motion-core
```

```tsx
// 기존 컴포넌트에 모션 추가
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core';

function ExistingCard({ children }) {
  const fadeIn = useFadeIn({ duration: 500 });

  return (
    <div ref={fadeIn.ref} style={fadeIn.style}>
      {children}
    </div>
  );
}
```

```tsx
// 스크롤 애니메이션
import { useScrollReveal } from '@hua-labs/motion-core';

function Section() {
  const reveal = useScrollReveal({ threshold: 0.2 });

  return (
    <section ref={reveal.ref} style={reveal.style}>
      스크롤하면 나타나요
    </section>
  );
}
```

**장점**:
- 기존 코드 수정 없음
- 컴포넌트 단위로 적용
- 번들 사이즈 작음 (~5KB)

### 2.2 i18n만 추가하기

**상황**: 다국어 지원이 필요할 때

```bash
pnpm add @hua-labs/i18n-core
```

```tsx
// app/layout.tsx 또는 최상위 컴포넌트
import { I18nProvider } from '@hua-labs/i18n-core';

export default function Layout({ children }) {
  return (
    <I18nProvider
      defaultLanguage="ko"
      supportedLanguages={['ko', 'en']}
    >
      {children}
    </I18nProvider>
  );
}
```

```tsx
// 컴포넌트에서 사용
import { useTranslation } from '@hua-labs/i18n-core';

function Header() {
  const { t, currentLanguage, setLanguage } = useTranslation();

  return (
    <header>
      <h1>{t('common:title')}</h1>
      <button onClick={() => setLanguage('en')}>English</button>
    </header>
  );
}
```

**번역 파일 구조**:
```
public/translations/
├── ko/
│   └── common.json
└── en/
    └── common.json
```

### 2.3 UI 컴포넌트 일부만 사용하기

**상황**: 특정 컴포넌트만 필요할 때

```bash
pnpm add @hua-labs/ui
```

```tsx
// 필요한 컴포넌트만 import
import { Button, Card, Badge } from '@hua-labs/ui';

// 기존 MUI/Chakra 등과 공존 가능
import { TextField } from '@mui/material';  // 기존
import { Button } from '@hua-labs/ui';       // HUA

function MyForm() {
  return (
    <form>
      <TextField label="이름" />      {/* 기존 MUI */}
      <Button variant="primary">      {/* HUA */}
        제출
      </Button>
    </form>
  );
}
```

**점진적 교체 패턴**:
```tsx
// components/Button.tsx - 래퍼로 점진적 교체
import { Button as HuaButton } from '@hua-labs/ui';

// 기존 API 유지하면서 내부 구현만 교체
export function Button({ children, onClick, variant }) {
  const huaVariant = variant === 'contained' ? 'primary' : 'secondary';

  return (
    <HuaButton variant={huaVariant} onClick={onClick}>
      {children}
    </HuaButton>
  );
}
```

---

## 3. 점진적 마이그레이션

기존 기술 스택을 HUA로 교체하는 경우

### 3.1 마이그레이션 순서 (권장)

```
1단계: 모션 추가 (가장 쉬움, 충돌 없음)
   ↓
2단계: i18n 교체 (기존 i18n 라이브러리 제거)
   ↓
3단계: UI 컴포넌트 점진적 교체
   ↓
4단계: hua-ux 통합 (선택)
```

### 3.2 i18n 마이그레이션 예시

**next-intl에서 마이그레이션**:

```tsx
// Before (next-intl)
import { useTranslations } from 'next-intl';
const t = useTranslations('common');
t('title')

// After (hua i18n-core)
import { useTranslation } from '@hua-labs/i18n-core';
const { t } = useTranslation('common');
t('common:title')
```

**주요 차이점**:
- 네임스페이스 지정 방식: `useTranslations('ns')` → `t('ns:key')`
- Provider 설정 방식 변경

### 3.3 기존 테마 시스템과 공존

```tsx
// 기존 테마 Provider 유지
<ThemeProvider theme={existingTheme}>
  {/* HUA 컴포넌트는 CSS 변수 사용 */}
  <style>{`
    :root {
      --color-primary: ${existingTheme.primary};
      --color-secondary: ${existingTheme.secondary};
    }
  `}</style>

  {children}
</ThemeProvider>
```

---

## 4. 패키지별 상세

### 독립 사용 가능한 패키지

| 패키지 | 용도 | 의존성 | 번들 크기 |
|--------|------|--------|----------|
| `@hua-labs/motion-core` | 애니메이션 훅 | React만 | ~5KB |
| `@hua-labs/i18n-core` | 다국어 지원 | React만 | ~8KB |
| `@hua-labs/ui` | UI 컴포넌트 | React, Tailwind | ~50KB |
| `@hua-labs/state` | 상태 관리 | Zustand | ~3KB |

### 통합 패키지

| 패키지 | 용도 | 포함 |
|--------|------|------|
| `@hua-labs/hua-ux` | 풀 프레임워크 | 위 패키지 모두 + 설정 시스템 |

---

## 5. 소규모 팀을 위한 권장 사항

### 디자이너 없는 팀

```tsx
// HUA UI 컴포넌트 그대로 사용
// 일관된 디자인 시스템 자동 적용
import { Button, Card, Input, Badge } from '@hua-labs/ui';
```

### 빠른 프로토타이핑

```tsx
// 모션 + UI 조합으로 빠르게 구현
import { Card } from '@hua-labs/ui';
import { useSlideUp } from '@hua-labs/motion-core';

function FeatureCard({ title, description }) {
  const motion = useSlideUp({ delay: 100 });

  return (
    <Card ref={motion.ref} style={motion.style}>
      <h3>{title}</h3>
      <p>{description}</p>
    </Card>
  );
}
```

### 다국어 MVP

```tsx
// 최소 설정으로 다국어 지원
// 1. Provider 추가
// 2. 번역 JSON 파일 생성
// 3. t() 함수 사용

// 나중에 언어 추가는 JSON 파일만 추가하면 됨
```

---

## 6. 레거시 프로젝트 체크리스트

도입 전 확인사항:

- [ ] React 18+ 사용 중인가?
- [ ] Node.js 18+ 환경인가?
- [ ] Tailwind CSS 사용 가능한가? (UI 컴포넌트 사용 시)
- [ ] 기존 i18n 라이브러리가 있는가? (교체 계획 필요)
- [ ] CSS-in-JS 사용 중인가? (스타일 충돌 가능성)

### 호환성 매트릭스

| 기존 스택 | 공존 가능 | 권장 접근법 |
|-----------|----------|------------|
| MUI | O | UI 점진적 교체 |
| Chakra UI | O | UI 점진적 교체 |
| styled-components | O | CSS 변수로 연결 |
| next-intl | △ | i18n 교체 권장 |
| react-i18next | △ | i18n 교체 권장 |
| Framer Motion | O | 공존 가능, 필요시 교체 |
| Redux | O | 공존 가능 |
| Jotai/Recoil | O | 공존 가능 |

---

## 7. 향후 로드맵: SDUI (Server-Driven UI)

> 현재 개발 중인 기능입니다.

SDUI가 완성되면 레거시 마이그레이션이 더 쉬워집니다:

```tsx
// 레거시 앱 어디든 삽입 가능
<SDUIRenderer endpoint="/api/sdui/new-feature" />
```

**SDUI 장점**:
- 기존 코드 수정 최소화
- 서버에서 UI 조합
- 실시간 업데이트 가능
- 비개발자도 UI 수정 가능

자세한 내용은 SDUI 문서 완성 후 업데이트 예정.

---

## 요약

1. **신규 프로젝트** → `create-hua-ux` 사용
2. **레거시 + 기능 추가** → 필요한 패키지만 설치
3. **점진적 전환** → 모션 → i18n → UI 순서로
4. **소규모 팀** → UI + 모션 조합으로 빠른 개발

**핵심 원칙**: 전면 교체 NO, 필요한 곳에 꽂아쓰기 YES

---

*작성일: 2026-01-16*
*버전: 0.1.0*
