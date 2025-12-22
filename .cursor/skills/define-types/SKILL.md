---
name: Define Types
description: HUA Platform의 TypeScript 타입 정의 가이드를 따르는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# 타입 정의 스킬

이 스킬은 HUA Platform의 TypeScript 타입 정의 가이드를 따르는 방법을 안내합니다.

## 타입 정의 위치

### 공유 타입
- **앱 공유 타입**: `apps/{app-name}/app/types/`
- **예시**: `apps/my-app/app/types/api.ts`

### 패키지 타입
- **패키지 타입**: `packages/{package-name}/src/types/`
- **예시**: `packages/hua-i18n-sdk/src/types/index.ts`

### 로컬 타입
- **컴포넌트 타입**: 컴포넌트 파일 내부에 정의
- **함수 타입**: 함수 파일 내부에 정의

## 타입 정의 규칙

### 1. 명시적 타입 정의
- `any` 타입 사용 금지
- `unknown` 타입 사용 권장 (에러 처리 등)
- 가능한 한 명시적으로 타입 작성

### 2. 공유 vs 로컬
- **공유 타입**: 여러 파일에서 사용하는 타입 → `types/` 폴더
- **로컬 타입**: 단일 파일에서만 사용하는 타입 → 파일 내부

### 3. 타입 네이밍
- **인터페이스**: PascalCase (예: `UserProfile`, `ApiResponse`)
- **타입 별칭**: PascalCase (예: `UserId`, `ApiError`)
- **제네릭**: 단일 대문자 (예: `T`, `K`, `V`)

## 기본 타입 정의

### 인터페이스

```typescript
// apps/my-app/app/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  error: string
  message?: string
  details?: unknown
}
```

### 타입 별칭

```typescript
export type UserId = string
export type Email = string
export type Timestamp = number

export type Status = 'pending' | 'completed' | 'failed'
```

### 유니온 타입

```typescript
export type Theme = 'light' | 'dark' | 'system'

export type UserRole = 'user' | 'admin' | 'moderator'
```

## Prisma 타입 활용

### Prisma Enum 타입

```typescript
import { 
  UserState, 
  UserRole, 
  EmotionTag, 
  SlipLevel 
} from '@prisma/client'

// Prisma Enum을 직접 사용
export interface User {
  id: string
  role: UserRole
  state: UserState
}
```

### Prisma 타입 확장

```typescript
import { User as PrismaUser } from '@prisma/client'

export interface User extends PrismaUser {
  // 추가 필드
  displayName?: string
}
```

## 유틸리티 타입 활용

### 기본 유틸리티 타입

```typescript
// Partial - 모든 속성을 선택적으로
type PartialUser = Partial<User>

// Required - 모든 속성을 필수로
type RequiredUser = Required<User>

// Pick - 특정 속성만 선택
type UserBasic = Pick<User, 'id' | 'name' | 'email'>

// Omit - 특정 속성 제외
type UserWithoutId = Omit<User, 'id'>

// Record - 키-값 타입
type UserMap = Record<string, User>
```

### ComponentProps 활용

```typescript
import { ComponentProps } from 'react'
import { Button } from '@hua-labs/ui'

// Button의 props 타입 확장
type CustomButtonProps = ComponentProps<typeof Button> & {
  customProp?: string
}
```

## 타입 가드

### 사용자 정의 타입 가드

```typescript
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as ApiError).error === 'string'
  )
}

// 사용
try {
  // ...
} catch (error) {
  if (isApiError(error)) {
    console.error(error.error)
  }
}
```

### 타입 좁히기

```typescript
function processValue(value: string | number) {
  if (typeof value === 'string') {
    // value는 string 타입
    return value.toUpperCase()
  } else {
    // value는 number 타입
    return value.toFixed(2)
  }
}
```

## 제네릭 타입

### 기본 제네릭

```typescript
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// 사용
const userResponse: ApiResponse<User> = {
  success: true,
  data: user
}
```

### 제약 조건

```typescript
interface Identifiable {
  id: string
}

function findById<T extends Identifiable>(
  items: T[],
  id: string
): T | undefined {
  return items.find(item => item.id === id)
}
```

## 데이터베이스 타입

### Supabase Database 타입

```typescript
// lib/types/database.ts
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
    }
  }
}
```

## 타입 export

### 인덱스 파일

```typescript
// types/index.ts
export type { ApiResponse, ApiError } from './api'
export type { User, UserProfile } from './user'
export type { Database } from './database'
```

### 패키지 타입 export

```typescript
// packages/hua-i18n-sdk/src/index.ts
export type { 
  I18nConfig, 
  TranslationData,
  TranslatorInterface
}
```

## 체크리스트

타입 정의 시 다음을 확인하세요:

- [ ] 타입이 올바른 위치에 있는가? (공유 vs 로컬)
- [ ] `any` 타입을 사용하지 않았는가?
- [ ] 명시적으로 타입이 정의되었는가?
- [ ] Prisma 타입을 적절히 활용했는가?
- [ ] 유틸리티 타입을 적절히 사용했는가?
- [ ] 타입 가드가 필요한 곳에 구현되었는가?
- [ ] 타입이 적절히 export되었는가?

## 참고

- API 타입 예시: `apps/my-app/app/types/api.ts`
- 데이터베이스 타입: `apps/my-api/lib/types/database.ts`
- 패키지 타입: `packages/hua-i18n-sdk/src/types/`
