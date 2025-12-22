---
name: Create React Component
description: HUA Platform의 컨벤션에 맞는 React 컴포넌트를 생성합니다
license: MIT
compatibility:
  - cursor
---

# React 컴포넌트 생성 스킬

이 스킬은 HUA Platform의 컨벤션에 맞는 React 컴포넌트를 생성하는 방법을 안내합니다.

## 네이밍 규칙

- **파일명**: PascalCase 사용 (예: `DiaryList.tsx`, `InfoCard.tsx`)
- **컴포넌트명**: 파일명과 동일한 PascalCase 사용
- **폴더**: 컴포넌트명과 동일한 이름의 폴더 생성 (선택사항)

## 파일 구조

### 기본 구조

```typescript
'use client' // 클라이언트 컴포넌트인 경우

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

## SDK-First 원칙

1. **먼저 확인**: `@hua-labs/ui` 패키지에 필요한 컴포넌트가 있는지 확인
2. **SDK 사용**: SDK에 있으면 SDK 컴포넌트 사용
3. **로컬 생성**: SDK에 없을 때만 로컬에 생성
4. **SDK 제안**: 로컬에 생성한 컴포넌트는 SDK에 제안 고려

**참고**: SDK 사용 방법은 `.cursor/skills/use-sdk/SKILL.md` 스킬을 참고하세요.

## 위치 결정

- **공유 컴포넌트**: `packages/hua-ui/src/components/` (SDK)
- **앱 전용 컴포넌트**: `apps/{app-name}/app/components/` 또는 `apps/{app-name}/components/`
- **로컬 UI 래퍼**: `apps/{app-name}/app/ui/` (SDK 래퍼만)

## 타입 정의

- **Props 인터페이스**: 컴포넌트 파일 내부에 정의
- **공유 타입**: `types/` 폴더에 정의
- **타입 확장**: `ComponentProps` 유틸리티 타입 활용

## 예시

### 기본 컴포넌트

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

### Server Component

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

## 체크리스트

컴포넌트 생성 시 다음을 확인하세요:

- [ ] 파일명이 PascalCase인가?
- [ ] 컴포넌트명이 파일명과 일치하는가?
- [ ] SDK 컴포넌트를 우선 사용했는가?
- [ ] Props 타입이 명시적으로 정의되었는가?
- [ ] 'use client' 지시어가 필요한가? (클라이언트 컴포넌트인 경우)
- [ ] 적절한 폴더에 위치하는가?
