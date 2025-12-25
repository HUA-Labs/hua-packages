---
name: Error Handling
description: HUA Platform의 에러 처리 패턴을 따르는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# 에러 처리 스킬

이 스킬은 HUA Platform의 에러 처리 패턴을 따르는 방법을 안내합니다.

## 🚨 AI 어시스턴트 필수 준수 사항

### 에러 처리 구현 시 필수 확인

```
IF (에러 처리를 구현할 때) THEN
  1. unknown 타입 사용 확인 (any 금지)
  2. 타입 가드 사용 확인
  3. 사용자 친화적 메시지 확인
  4. 표준 API 응답 형식 확인
  5. 에러 로깅 확인
END IF
```

### 자동 검증 로직

```
IF (에러 처리 코드 작성) THEN
  IF (any 타입 사용) THEN
    → "any 대신 unknown 타입을 사용하세요."
  END IF
  
  IF (에러 메시지가 기술적임) THEN
    → "사용자 친화적인 메시지로 변경하세요."
  END IF
  
  IF (API 응답 형식이 표준과 다름) THEN
    → "표준 API 응답 형식을 사용하세요: { success, data?, error? }"
  END IF
END IF
```

## 에러 처리 원칙

### 1. 사용자 친화적 메시지
- 기술적인 에러 메시지를 사용자에게 직접 노출하지 않음
- 명확하고 이해하기 쉬운 메시지 제공
- 필요시 에러 코드와 함께 상세 정보 제공

### 2. 타입 안전성
- `unknown` 타입 사용 (에러는 `any` 대신 `unknown`)
- 타입 가드를 통한 안전한 에러 처리
- 명시적 에러 타입 정의

### 3. 일관된 에러 형식
- 프로젝트 전반에서 일관된 에러 처리 패턴 사용
- API 응답 형식 표준화

## 에러 처리 유틸리티

### 기본 에러 처리 함수

```typescript
import { getErrorMessage, handleApiError, handleApiResponse } from '@/app/utils/errorHandler'

// 에러에서 메시지 추출
try {
  // ...
} catch (error) {
  const message = getErrorMessage(error)
  console.error(message)
}

// API 에러 처리
try {
  const response = await fetch('/api/endpoint')
  const result = await handleApiResponse<ResponseType>(response)
  
  if (result.success) {
    // 성공 처리
    console.log(result.data)
  } else {
    // 에러 처리
    console.error(result.error)
  }
} catch (error) {
  const message = handleApiError(error, '기본 에러 메시지')
  console.error(message)
}
```

## API 에러 처리

### 표준 API 응답 형식

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### ✅ 올바른 예시: API 라우트에서 에러 처리

```typescript
// app/api/example/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 비즈니스 로직
    const data = await fetchData()
    
    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : '알 수 없는 오류가 발생했습니다.'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'ERROR_CODE',
        message 
      },
      { status: 500 }
    )
  }
}
```

### ❌ 잘못된 예시

```typescript
// ❌ any 타입 사용
catch (error: any) {
  console.error(error.message)
}

// ❌ 기술적 에러 메시지 직접 노출
catch (error) {
  return NextResponse.json({ error: error.stack })
}

// ❌ 표준 형식 미사용
catch (error) {
  return NextResponse.json({ message: 'Error' })
}
```

## 클라이언트 컴포넌트 에러 처리

### ✅ 올바른 예시: try-catch 사용

```typescript
'use client'

import { useState } from 'react'
import { getErrorMessage } from '@/app/utils/errorHandler'

export function MyComponent() {
  const [error, setError] = useState<string | null>(null)
  
  async function handleAction() {
    try {
      setError(null)
      await performAction()
    } catch (error) {
      setError(getErrorMessage(error))
    }
  }
  
  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      <button onClick={handleAction}>실행</button>
    </div>
  )
}
```

### ✅ 올바른 예시: 에러 바운더리 사용

```typescript
'use client'

import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert">
      <h2>오류가 발생했습니다</h2>
      <p>{error.message}</p>
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

## 커스텀 에러 클래스

### ✅ 올바른 예시: 에러 타입 정의

```typescript
// lib/errors/types.ts
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details)
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = '인증이 필요합니다') {
    super('AUTHENTICATION_ERROR', message, 401)
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = '권한이 없습니다') {
    super('AUTHORIZATION_ERROR', message, 403)
  }
}
```

### 사용 예시

```typescript
import { ValidationError, AuthenticationError } from '@/lib/errors/types'

function validateInput(input: string) {
  if (!input) {
    throw new ValidationError('입력값이 필요합니다')
  }
}

function checkAuth(user: User | null) {
  if (!user) {
    throw new AuthenticationError()
  }
}
```

## 에러 로깅

### ✅ 올바른 예시: 에러 로깅 패턴

```typescript
import { getErrorMessage } from '@/app/utils/errorHandler'

try {
  // ...
} catch (error) {
  // 개발 환경에서는 상세 로그
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error)
  }
  
  // 프로덕션에서는 사용자 친화적 메시지만
  const message = getErrorMessage(error)
  // 에러 리포팅 서비스에 전송 (선택사항)
  // logError(error)
  
  // 사용자에게 표시
  showErrorToast(message)
}
```

## AI 어시스턴트 실행 체크리스트

에러 처리 시 다음을 자동으로 확인하세요:

### 타입 안전성
- [ ] `unknown` 타입을 사용했는가? (any 금지)
- [ ] 타입 가드를 적용했는가?
- [ ] 명시적 에러 타입을 정의했는가?

### 사용자 경험
- [ ] 사용자 친화적인 에러 메시지를 제공하는가?
- [ ] 기술적인 에러 메시지를 직접 노출하지 않았는가?

### API 응답
- [ ] API 응답 형식이 표준화되어 있는가? (`{ success, data?, error? }`)
- [ ] 적절한 HTTP 상태 코드를 사용하는가?

### 에러 처리
- [ ] 에러 바운더리를 적절히 사용했는가?
- [ ] 에러 로깅이 적절히 구현되었는가?
- [ ] 커스텀 에러 클래스를 사용했는가? (필요한 경우)

## 참고

- 에러 처리 유틸리티: `apps/my-app/app/utils/errorHandler.ts`
- API 에러 처리: `apps/my-api/docs/TECHNICAL_IMPLEMENTATION.md`
- 에러 처리 스킬: `.cursor/skills/error-handling/SKILL.md`
