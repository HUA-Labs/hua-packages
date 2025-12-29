# HUA UX 프레임워크 문제 해결 가이드

**작성일**: 2025-12-29  
**프로젝트**: demo-app (HUA UX 프레임워크 검증 데모)

---

## 📋 목차

1. [버튼 스타일이 보이지 않는 문제](#버튼-스타일이-보이지-않는-문제)
2. [페이지 생성 시 체크리스트](#페이지-생성-시-체크리스트)
3. [시행착오 요약](#시행착오-요약)

---

## 🔴 버튼 스타일이 보이지 않는 문제

### 증상

- Button 컴포넌트의 클래스는 모두 적용되어 있음 (개발자 도구에서 확인 가능)
- 하지만 실제 스타일이 화면에 표시되지 않음
- 예: `bg-blue-600`, `text-white`, `hover:bg-blue-700` 등의 클래스가 적용되어 있지만 파란색 배경이 보이지 않음

### 원인 분석

#### 1. Tailwind CSS 4의 클래스 스캔 문제

**문제**: Tailwind CSS 4는 `content` 경로에 지정된 파일들에서 클래스를 스캔합니다. 하지만 Button 컴포넌트의 클래스들이 **문자열로 하드코딩**되어 있어서, Tailwind가 이 클래스들을 제대로 감지하지 못할 수 있습니다.

**Button 컴포넌트 구조**:
```typescript
// packages/hua-ui/src/components/Button.tsx
const variantClasses: Record<Variant, string> = {
  default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
  outline: "border-2 border-blue-600 bg-transparent text-blue-600 ...",
  // ...
};
```

이런 방식으로 클래스가 정의되면, Tailwind CSS가 파일을 스캔할 때 문자열 내부의 클래스를 제대로 인식하지 못할 수 있습니다.

#### 2. Tailwind CSS 4의 동적 클래스 처리

Tailwind CSS 4는 이전 버전과 달리 더 엄격하게 클래스를 스캔합니다. 동적으로 생성되는 클래스나 문자열로 정의된 클래스는 `safelist`에 명시적으로 추가해야 할 수 있습니다.

### 해결 방법

#### ✅ 해결책: `tailwind.config.js`에 `safelist` 추가

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    // Include hua-ux package components
    '../../packages/hua-ux/src/**/*.{ts,tsx}',
    '../../packages/hua-ui/src/**/*.{ts,tsx}',
  ],
  // Safelist for Button component classes
  safelist: [
    // Button variant classes
    'bg-blue-600',
    'text-white',
    'hover:bg-blue-700',
    'dark:bg-blue-500',
    'dark:hover:bg-blue-600',
    'border-2',
    'border-blue-600',
    'bg-transparent',
    'text-blue-600',
    'hover:bg-blue-50',
    'dark:border-blue-400',
    'dark:text-blue-400',
    'dark:hover:bg-blue-900/20',
    // Button size classes
    'h-8', 'h-10', 'h-12', 'h-14',
    'px-3', 'px-4', 'px-6', 'px-8',
    'py-1', 'py-2', 'py-3', 'py-4',
    'text-sm', 'text-base', 'text-lg', 'text-xl',
    // Button hover effects
    'hover:scale-105',
    'transition-transform',
    'duration-200',
  ],
}
```

**작동 원리**:
- `safelist`는 Tailwind CSS에게 "이 클래스들은 반드시 생성해야 한다"고 알려줍니다.
- `content` 스캔에서 발견되지 않더라도 `safelist`에 있는 클래스는 항상 CSS에 포함됩니다.

### 추가 확인 사항

#### 1. PostCSS 설정 확인

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},  // Tailwind CSS 4용
    autoprefixer: {},
  },
};
```

#### 2. globals.css 확인

```css
/* app/globals.css */
@import "tailwindcss";  /* Tailwind CSS 4 방식 */
```

#### 3. 개발 서버 재시작

설정 변경 후 **반드시 개발 서버를 재시작**해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
pnpm dev  # 재시작
```

---

## ✅ 페이지 생성 시 체크리스트

새로운 HUA UX 프로젝트를 만들거나 페이지를 추가할 때 확인해야 할 사항들입니다.

### 1. 프로젝트 생성 단계

#### ✅ CLI로 프로젝트 생성

```bash
pnpm create hua-ux my-app
cd my-app
pnpm install
```

#### ✅ 모노레포에 추가 (필요시)

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*
  - tools/*
  - my-app  # 추가
```

```bash
# 루트에서 실행
pnpm install
```

### 2. Tailwind CSS 설정

#### ✅ `tailwind.config.js` 확인

```javascript
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    // ⚠️ 중요: hua-ux, hua-ui 패키지 경로 포함
    '../../packages/hua-ux/src/**/*.{ts,tsx}',
    '../../packages/hua-ui/src/**/*.{ts,tsx}',
  ],
  // ⚠️ 중요: Button 컴포넌트 클래스를 위한 safelist
  safelist: [
    // Button variant classes
    'bg-blue-600', 'text-white', 'hover:bg-blue-700',
    'border-2', 'border-blue-600', 'bg-transparent',
    // ... (위의 해결 방법 참고)
  ],
}
```

#### ✅ `postcss.config.js` 확인

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},  // Tailwind CSS 4
    autoprefixer: {},
  },
};
```

#### ✅ `globals.css` 확인

```css
@import "tailwindcss";  /* Tailwind CSS 4 방식 */
```

### 3. 번역 API 설정

#### ✅ 번역 API 라우트 생성

```typescript
// app/api/translations/[language]/[namespace]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string; namespace: string }> }
) {
  const { language, namespace } = await params;  // ⚠️ Next.js 16: await 필요
  // ...
}
```

#### ✅ 번역 파일 구조

```
translations/
├── ko/
│   └── common.json
└── en/
    └── common.json
```

### 4. 컴포넌트 사용

#### ✅ Button 컴포넌트 import

```typescript
// ✅ 올바른 방법
import { Button } from '@hua-labs/hua-ux';

// ❌ 잘못된 방법
import { Button } from '@hua-labs/i18n-core';  // X
```

#### ✅ useTranslation 사용

```typescript
// ✅ 올바른 방법
import { useTranslation } from '@hua-labs/hua-ux';

const { t, currentLanguage, setLanguage } = useTranslation('common');
```

#### ✅ HuaUxPage 사용

```typescript
import { HuaUxPage } from '@hua-labs/hua-ux/framework';

export default function MyPage() {
  return (
    <HuaUxPage title="제목" description="설명">
      {/* 내용 */}
    </HuaUxPage>
  );
}
```

### 5. 모션 애니메이션

#### ✅ 페이지 전환 모션

`HuaUxPage`를 사용하면 자동으로 페이지 전환 모션이 적용됩니다.

```typescript
// 자동으로 "스륵~" 하는 모션이 적용됨
<HuaUxPage title="제목">
  {/* 내용 */}
</HuaUxPage>
```

#### ✅ 버튼 클릭 모션 (선택사항)

```typescript
const [clickedButton, setClickedButton] = useState<string | null>(null);

const handleClick = () => {
  setClickedButton('button-id');
  setTimeout(() => setClickedButton(null), 200);
};

<Button
  className={`transition-transform duration-200 ease-out ${
    clickedButton === 'button-id' ? 'scale-95' : 'scale-100'
  }`}
  onClick={handleClick}
>
  클릭
</Button>
```

**참고**: `hover:scale-105` 같은 호버 애니메이션은 **Tailwind CSS 기능**이며, 모션 코어와는 별개입니다. 모션 코어는 페이지 전환 애니메이션용입니다.

### 6. 개발 서버 실행

#### ✅ 개발 서버 시작

```bash
pnpm dev
```

#### ✅ 문제 발생 시 확인 사항

1. **버튼 스타일이 안 보임**
   - `tailwind.config.js`에 `safelist` 추가 확인
   - 개발 서버 재시작

2. **번역이 안 됨**
   - API 라우트 경로 확인: `/api/translations/[language]/[namespace]`
   - 번역 파일 경로 확인: `translations/ko/common.json`

3. **모션이 안 보임**
   - `hua-ux.config.ts`에서 `motion.enableAnimations: true` 확인
   - `HuaUxPage` 사용 여부 확인

---

## 📝 시행착오 요약

### 1. 버튼 스타일 문제

**문제**: 버튼 클래스는 적용되어 있지만 스타일이 보이지 않음

**원인**: Tailwind CSS 4가 Button 컴포넌트의 동적 클래스를 제대로 스캔하지 못함

**해결**: `tailwind.config.js`에 `safelist` 추가

### 2. 번역 API 404 에러

**문제**: `/api/translations/ko/common` 요청 시 404 에러

**원인**: API 라우트가 `route.ts` (query params)로 되어 있었는데, 클라이언트는 path params로 요청

**해결**: API 라우트를 `[language]/[namespace]/route.ts`로 변경

### 3. 언어 토글 버튼 모션

**문제**: 언어 토글 버튼 클릭 시 모션이 투박함

**원인**: `scale-90`으로 너무 많이 축소되고, 인라인 스타일 사용

**해결**: `scale-95`로 변경하고 Tailwind 클래스 사용

### 4. Button 컴포넌트 className 병합

**문제**: Button에 전달한 `className`이 적용되지 않음

**원인**: `{...btnProps}`가 `className={base}`를 덮어씀

**해결**: `className`을 분리하여 `merge(base, buttonClassName)`로 병합

### 5. Tailwind CSS 4 설정

**문제**: Tailwind CSS 클래스가 생성되지 않음

**원인**: Tailwind CSS 4 방식으로 설정이 안 되어 있음

**해결**: 
- `@import "tailwindcss"` 사용
- `@tailwindcss/postcss` 플러그인 사용
- `content` 경로에 패키지 경로 포함

---

## 🎯 핵심 교훈

1. **Tailwind CSS 4는 더 엄격함**: 동적 클래스는 `safelist`에 명시적으로 추가 필요
2. **개발 서버 재시작 필수**: Tailwind 설정 변경 후 반드시 재시작
3. **모션 코어 vs Tailwind**: 
   - 모션 코어 = 페이지 전환 애니메이션
   - Tailwind = 호버, 클릭 등의 인터랙션 효과
4. **Next.js 16**: API 라우트의 `params`는 `Promise`로 래핑되어 `await` 필요

---

## 📊 페이지 생성 경험 평가

### ✅ 잘된 점 (Good Parts)

#### 1. 프레임워크 사용이 직관적

**HuaUxPage 사용**:
```typescript
<HuaUxPage title="제목" description="설명">
  {/* 내용 */}
</HuaUxPage>
```

- 한 줄로 페이지 전환 모션, SEO, 에러 바운더리가 모두 적용됨
- "스륵~" 하는 모션이 자동으로 적용되어 매우 편리함
- 별도 설정 없이 바로 작동

#### 2. 컴포넌트 API가 간단함

```typescript
import { Button, Card, useTranslation } from '@hua-labs/hua-ux';

// 버튼 사용
<Button variant="default">클릭</Button>
<Button variant="outline">취소</Button>

// 카드 사용
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>내용</CardContent>
</Card>

// 번역 사용
const { t, currentLanguage, setLanguage } = useTranslation('common');
```

- 모든 것이 `@hua-labs/hua-ux`에서 한 번에 import 가능
- 타입 안전성도 좋음
- 컴포넌트 prop이 직관적

#### 3. 번역 시스템이 깔끔함

```typescript
// 번역 파일만 작성하면 끝
// translations/ko/common.json
{
  "welcome": "환영합니다"
}

// 컴포넌트에서 사용
const { t } = useTranslation('common');
<h1>{t('welcome')}</h1>
```

- 파일 기반 번역이 명확함
- API 라우트만 제대로 설정하면 자동으로 작동

### ⚠️ 개선이 필요한 점 (Areas for Improvement)

#### 1. 초기 설정이 복잡함

**문제점**:
- Tailwind CSS 설정이 복잡함 (`safelist` 필요)
- 번역 API 라우트 경로를 정확히 알아야 함
- 모노레포에 추가하는 과정이 명확하지 않음

**개선 제안**:
- CLI가 자동으로 `tailwind.config.js`에 `safelist` 추가
- 번역 API 라우트를 CLI가 자동 생성
- 모노레포 감지 후 자동으로 `pnpm-workspace.yaml` 업데이트

#### 2. 에러 메시지가 명확하지 않음

**문제점**:
- 버튼 스타일이 안 보여도 에러가 없음
- 번역 API 404 에러가 발생해도 원인 파악이 어려움
- Tailwind 클래스가 생성되지 않아도 경고가 없음

**개선 제안**:
- 개발 모드에서 Tailwind 클래스 누락 감지 및 경고
- 번역 API 경로 불일치 시 명확한 에러 메시지
- Button 컴포넌트에서 스타일이 적용되지 않으면 경고

#### 3. 문서화 부족

**문제점**:
- Tailwind CSS 4 설정 방법이 명확하지 않음
- 번역 API 라우트 구조 설명이 부족함
- 모션 코어 vs Tailwind CSS 차이점이 불명확함

**개선 제안**:
- CLI 생성 시 `TROUBLESHOOTING.md` 자동 생성
- README에 "자주 발생하는 문제" 섹션 추가
- 각 설정 파일에 주석으로 설명 추가

### 📈 전체적인 평가

#### 개발 경험 점수: 7/10

**점수 구성**:
- ✅ 프레임워크 사용 편의성: 9/10 (매우 좋음)
- ⚠️ 초기 설정: 5/10 (개선 필요)
- ✅ 컴포넌트 API: 9/10 (매우 직관적)
- ⚠️ 에러 처리: 6/10 (명확하지 않음)
- ✅ 문서화: 7/10 (기본은 있지만 개선 여지)

#### 핵심 인사이트

1. **프레임워크 자체는 훌륭함**: 사용하기 시작하면 매우 편리하고 직관적
2. **초기 진입 장벽이 있음**: 첫 설정에서 시행착오가 많음
3. **자동화가 필요함**: CLI가 더 많은 것을 자동으로 처리해야 함

#### 추천 개선 사항 (우선순위)

1. **높음**: CLI가 `tailwind.config.js`에 `safelist` 자동 추가
2. **높음**: 번역 API 라우트 자동 생성
3. **중간**: 개발 모드에서 Tailwind 클래스 누락 감지
4. **중간**: 에러 메시지 개선
5. **낮음**: 문서화 보강

---

## 📚 참고 자료

- [Tailwind CSS 4 마이그레이션 가이드](../../docs/TAILWIND_CSS_4_MIGRATION.md)
- [HUA UX 프레임워크 문서](../../packages/hua-ux/README.md)
- [Next.js 16 검증 가이드](../../docs/NEXTJS_16_VERIFICATION_GUIDE.md)
