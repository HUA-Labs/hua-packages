---
name: Create React Component
description: HUA Platform의 컨벤션에 맞는 React 컴포넌트를 생성합니다
license: MIT
compatibility:
  - cursor
---

# React 컴포넌트 생성 스킬

이 스킬은 HUA Platform의 컨벤션에 맞는 React 컴포넌트를 생성하는 방법을 안내합니다.

## 🚨 AI 어시스턴트 필수 준수 사항

### 컴포넌트 생성 전 필수 확인

```
IF (새 컴포넌트를 생성하려고 할 때) THEN
  1. SDK에 필요한 컴포넌트가 있는지 먼저 확인
     → `packages/hua-ui/src/index.ts` 확인
     → `packages/hua-ui/src/components/` 폴더 확인
  2. SDK에 있으면 SDK 사용 제안
  3. SDK에 없을 때만 로컬 생성 진행
END IF
```

### 컴포넌트 생성 시 자동 체크

```
IF (컴포넌트 생성 중) THEN
  1. 파일명이 PascalCase인지 확인
  2. 컴포넌트명이 파일명과 일치하는지 확인
  3. Props 타입이 명시적으로 정의되었는지 확인
  4. 'use client' 지시어가 필요한지 확인 (클라이언트 컴포넌트인 경우)
  5. 적절한 폴더에 위치하는지 확인
END IF
```

## 네이밍 규칙

- **파일명**: PascalCase 사용 (예: `DiaryList.tsx`, `InfoCard.tsx`)
- **컴포넌트명**: 파일명과 동일한 PascalCase 사용
- **폴더**: 컴포넌트명과 동일한 이름의 폴더 생성 (선택사항)

## SDK-First 원칙 (⚠️ 가장 중요!)

### 1단계: SDK 확인 (필수)

```
IF (컴포넌트가 필요할 때) THEN
  → 먼저 `@hua-labs/ui` 패키지 확인
  → `packages/hua-ui/src/index.ts` 파일 확인
  → `packages/hua-ui/src/components/` 폴더 확인
END IF
```

### 2단계: SDK 사용 또는 로컬 생성

```
IF (SDK에 컴포넌트가 있음) THEN
  → SDK 컴포넌트 사용 제안
  → import 예시 제공
ELSE
  → 로컬에 생성 진행
  → SDK에 제안 고려 안내
END IF
```

**참고**: SDK 사용 방법은 `.cursor/skills/use-sdk/SKILL.md` 스킬을 참고하세요.

## 파일 구조

### 기본 구조 (Client Component)

```typescript
'use client' // 클라이언트 컴포넌트인 경우 필수

import { ComponentProps } from 'react'
// 필요한 import들

interface ComponentNameProps {
  // props 타입 정의
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // 컴포넌트 로직
  return (
    // JSX
  )
}
```

### Server Component (기본)

```typescript
// 'use client' 없이 작성 (서버 컴포넌트)
import { ComponentProps } from 'react'

interface ComponentNameProps {
  // props 타입 정의
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // 컴포넌트 로직
  return (
    // JSX
  )
}
```

## 위치 결정

### 위치 선택 로직

```
IF (공유 컴포넌트) THEN
  → `packages/hua-ui/src/components/` (SDK)
ELSE IF (앱 전용 컴포넌트) THEN
  → `apps/{app-name}/app/components/` 또는 `apps/{app-name}/components/`
ELSE IF (SDK 래퍼만 필요) THEN
  → `apps/{app-name}/app/ui/` (SDK 래퍼만)
END IF
```

- **공유 컴포넌트**: `packages/hua-ui/src/components/` (SDK)
- **앱 전용 컴포넌트**: `apps/{app-name}/app/components/` 또는 `apps/{app-name}/components/`
- **로컬 UI 래퍼**: `apps/{app-name}/app/ui/` (SDK 래퍼만)

## 타입 정의

- **Props 인터페이스**: 컴포넌트 파일 내부에 정의
- **공유 타입**: `types/` 폴더에 정의
- **타입 확장**: `ComponentProps` 유틸리티 타입 활용

## 예시

### ✅ 올바른 예시: SDK 사용

```typescript
'use client'

import { Button } from '@hua-labs/ui'

interface ActionButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function ActionButton({ 
  label, 
  onClick, 
  variant = 'primary' 
}: ActionButtonProps) {
  return (
    <Button onClick={onClick} variant={variant}>
      {label}
    </Button>
  )
}
```

### ✅ 올바른 예시: Server Component

```typescript
import { Card } from '@hua-labs/ui'

interface InfoCardProps {
  title: string
  description: string
}

export function InfoCard({ title, description }: InfoCardProps) {
  return (
    <Card>
      <h2>{title}</h2>
      <p>{description}</p>
    </Card>
  )
}
```

### ❌ 잘못된 예시: SDK 재구현

```typescript
// ❌ SDK에 있는 Button을 로컬에서 재구현 (금지!)
function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>
}
```

## AI 어시스턴트 실행 체크리스트

컴포넌트 생성 시 다음을 자동으로 확인하세요:

### 생성 전 확인
- [ ] SDK에 필요한 컴포넌트가 있는지 확인했는가?
  - `packages/hua-ui/src/index.ts` 확인
  - `packages/hua-ui/src/components/` 확인
- [ ] SDK 컴포넌트를 사용할 수 있는가?
- [ ] SDK에 없어서 로컬에 생성해야 하는가?

### 생성 중 확인
- [ ] 파일명이 PascalCase인가? (예: `DiaryList.tsx`)
- [ ] 컴포넌트명이 파일명과 일치하는가?
- [ ] Props 타입이 명시적으로 정의되었는가?
- [ ] 'use client' 지시어가 필요한가? (클라이언트 컴포넌트인 경우)
- [ ] 적절한 폴더에 위치하는가?

### 생성 후 확인
- [ ] SDK 컴포넌트를 우선 사용했는가?
- [ ] 로컬 재구현을 하지 않았는가?
- [ ] 타입이 올바르게 정의되었는가?

## 자동 검증 로직

```
IF (컴포넌트 생성 요청) THEN
  IF (SDK에 컴포넌트가 있음) THEN
    → "SDK에 [컴포넌트명]이 있습니다. SDK 컴포넌트를 사용하시겠어요?"
    → import 예시 제공
  ELSE
    → "SDK에 없으므로 로컬에 생성하겠습니다."
    → 적절한 위치 제안
  END IF
  
  IF (파일명이 PascalCase가 아님) THEN
    → "파일명은 PascalCase로 작성해야 합니다. 예: 'DiaryList.tsx'"
  END IF
  
  IF (컴포넌트명이 파일명과 다름) THEN
    → "컴포넌트명은 파일명과 일치해야 합니다."
  END IF
  
  IF (Props 타입이 정의되지 않음) THEN
    → "Props 타입을 명시적으로 정의해야 합니다."
  END IF
END IF
```

## 참고

- SDK 사용 가이드: `.cursor/skills/use-sdk/SKILL.md`
- 타입 정의 가이드: `.cursor/skills/define-types/SKILL.md`
- Next.js 15 App Router: Server Components가 기본
