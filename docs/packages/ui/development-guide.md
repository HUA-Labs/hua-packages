# 개발 가이드

**작성일**: 2026-01-11
**버전**: 1.1.0

---

## 목차

1. [시작하기](#시작하기)
2. [컴포넌트 추가](#컴포넌트-추가)
3. [스타일 가이드](#스타일-가이드)
4. [접근성 가이드](#접근성-가이드)
5. [테스트](#테스트)
6. [빌드](#빌드)
7. [코드 스타일](#코드-스타일)

---

## 시작하기

### 환경 설정

```bash
# 의존성 설치
pnpm install

# 개발 모드 시작
pnpm dev

# 타입 체크
pnpm type-check
```

### 프로젝트 구조 이해

- `src/components/` - 컴포넌트 소스
- `src/lib/` - 유틸리티 및 헬퍼
- `src/hooks/` - 커스텀 훅
- `src/styles/` - CSS 파일

---

## 컴포넌트 추가

### 1. 컴포넌트 파일 생성

```tsx
// src/components/MyComponent.tsx
"use client";

import React from "react";
import { merge } from "../lib/utils";

/**
 * MyComponent 컴포넌트의 props
 * @typedef {Object} MyComponentProps
 * @property {string} [className] - 추가 CSS 클래스
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * MyComponent 컴포넌트
 *
 * 컴포넌트 설명을 여기에 작성합니다.
 *
 * @component
 * @example
 * <MyComponent className="custom-class">
 *   Content
 * </MyComponent>
 *
 * @param {MyComponentProps} props - MyComponent 컴포넌트의 props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref
 * @returns {JSX.Element} MyComponent 컴포넌트
 */
export const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={merge("base-classes", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MyComponent.displayName = "MyComponent";
```

### 2. 엔트리 포인트에 추가

```typescript
// src/index.ts
export { MyComponent } from './components/MyComponent';
export type { MyComponentProps } from './components/MyComponent';
```

### 3. JSDoc 작성 규칙

- 한영 병기 (Korean/English bilingual)
- `@component` 태그 필수
- `@example` 최소 1개 이상
- `@param`, `@returns` 명시

---

## 스타일 가이드

### Tailwind CSS 사용

```tsx
import { merge } from '../lib/utils';

const className = merge(
  "base-classes",
  "conditional-classes",
  props.className
);
```

### 다크 모드 지원

```tsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```

### 반응형 디자인

```tsx
className="w-full md:w-1/2 lg:w-1/3"
```

### 유틸리티 함수 활용

```tsx
import { merge, mergeIf, mergeMap } from '../lib/utils';

// 조건부 클래스
const className = mergeIf(isActive, "bg-blue-500", "bg-gray-200");

// 객체 기반
const className = mergeMap({
  "bg-blue-500": isPrimary,
  "text-white": true,
  "opacity-50": isDisabled
});
```

---

## 접근성 가이드

### ARIA 속성

```tsx
// 버튼
<button
  aria-label="닫기"
  aria-expanded={isOpen}
  aria-controls="menu-id"
>
  Close
</button>

// 모달
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Title</h2>
  <p id="modal-description">Description</p>
</div>

// 리스트
<ul role="list">
  <li role="listitem">Item 1</li>
</ul>
```

### 키보드 네비게이션

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
  if (e.key === 'Escape') {
    handleClose();
  }
};

<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
>
  Clickable
</div>
```

### 시맨틱 HTML

```tsx
// 시간 정보
<time dateTime="2024-01-01T00:00:00Z">
  {formatRelativeTime(date)}
</time>

// 메타데이터
<dl>
  <dt>Label</dt>
  <dd>Value</dd>
</dl>
```

---

## 테스트

### 테스트 작성

```tsx
// MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent>Content</MyComponent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
```

### 테스트 실행

```bash
# 모든 테스트
pnpm test

# UI 모드
pnpm test:ui

# 커버리지
pnpm test:coverage
```

---

## 빌드

### 빌드 명령어

```bash
# 프로덕션 빌드
pnpm build

# 개발 모드 (watch)
pnpm dev

# 번들 분석
pnpm build:analyze
```

### 빌드 출력

- `dist/` 디렉토리에 생성
- ESM (`.mjs`) + CJS (`.js`) 이중 빌드
- TypeScript 타입 정의 (`.d.ts`)

---

## 코드 스타일

### React Import

```tsx
// 권장
import React from "react";

// 비권장
import * as React from "react";
```

### 컴포넌트 정의

```tsx
// 권장: forwardRef 사용
export const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ ...props }, ref) => {
    // ...
  }
);

Component.displayName = "Component";
```

### 타입 정의

```tsx
// 권장: interface 사용
export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // props
}

// 비권장: type 사용 (확장 불가)
export type ComponentProps = {
  // props
};
```

### 파일 구조

```tsx
// 1. "use client" 지시어 (필요시)
"use client";

// 2. Imports
import React from "react";
import { merge } from "../lib/utils";

// 3. Types/Interfaces
export interface ComponentProps {
  // ...
}

// 4. Component
export const Component = React.forwardRef(/* ... */);

// 5. displayName
Component.displayName = "Component";
```

---

## 체크리스트

### 컴포넌트 추가 시

- [ ] 컴포넌트 파일 생성
- [ ] TypeScript 타입 정의
- [ ] JSDoc 문서 작성 (한영 병기)
- [ ] 엔트리 포인트에 export 추가
- [ ] 접근성 속성 추가
- [ ] 다크 모드 지원
- [ ] 테스트 작성
- [ ] 빌드 테스트

### 코드 리뷰 시

- [ ] TypeScript 타입 안정성
- [ ] 접근성 속성 확인
- [ ] 다크 모드 지원 확인
- [ ] JSDoc 문서 완성도
- [ ] 코드 스타일 일관성
- [ ] 성능 최적화 (필요시)

---

## 참고 문서

- [아키텍처 문서](./ARCHITECTURE.md)
- [패키지 구조](./PACKAGE_STRUCTURE.md)
- [서브패키지 분석](./SUBPACKAGE_ANALYSIS.md)

---

**작성자**: Auto (AI Assistant)
**최종 업데이트**: 2026-01-11
