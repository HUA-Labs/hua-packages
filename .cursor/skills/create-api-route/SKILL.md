---
name: Create API Route
description: HUA Platform의 Next.js App Router API 라우트를 생성하는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# API 라우트 생성 스킬

이 스킬은 HUA Platform의 Next.js App Router API 라우트를 올바르게 생성하는 방법을 안내합니다.

## 🚨 AI 어시스턴트 필수 준수 사항

### API 라우트 생성 시 필수 확인

```
IF (API 라우트를 생성할 때) THEN
  1. 파일 위치 확인 (app/api/)
  2. HTTP 메서드 함수 export 확인
  3. 인증/인가 확인
  4. 입력값 검증 확인
  5. 에러 처리 확인
  6. 표준 응답 형식 확인
END IF
```

### 자동 검증 로직

```
IF (API 라우트 생성) THEN
  IF (파일 위치가 app/api/가 아님) THEN
    → "API 라우트는 app/api/ 폴더에 있어야 합니다."
  END IF
  
  IF (인증 확인 없음) THEN
    → "인증이 필요한 API는 세션 확인을 추가하세요."
  END IF
  
  IF (입력값 검증 없음) THEN
    → "POST/PUT 요청에는 입력값 검증이 필요합니다."
  END IF
  
  IF (에러 처리 없음) THEN
    → "try-catch로 에러 처리를 추가하세요."
  END IF
  
  IF (응답 형식이 표준과 다름) THEN
    → "표준 응답 형식을 사용하세요: { success, data?, error? }"
  END IF
END IF
```

## 파일 구조

### 기본 구조

```
app/api/
├── [endpoint]/
│   └── route.ts          # API 라우트 핸들러
├── [endpoint]/
│   ├── [id]/
│   │   └── route.ts      # 동적 라우트
│   └── route.ts
```

### 파일 위치

- **앱 API**: `apps/{app-name}/app/api/`
- **예시**: `apps/my-app/app/api/diary/route.ts`

## 기본 구조

### ✅ 올바른 예시: GET 요청

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 비즈니스 로직
    const data = await fetchData()

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'ERROR_CODE',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}
```

### ✅ 올바른 예시: POST 요청

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 요청 본문 파싱
    const body = await request.json()
    
    // 입력값 검증
    if (!body.requiredField) {
      return NextResponse.json(
        { success: false, error: 'VALIDATION_ERROR', message: '필수 필드가 없습니다' },
        { status: 400 }
      )
    }

    // 비즈니스 로직
    const result = await createData(body)

    return NextResponse.json({ 
      success: true, 
      data: result 
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'ERROR_CODE',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}
```

## 인증 및 인가

### ✅ 올바른 예시: 세션 기반 인증

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json(
      { success: false, error: 'UNAUTHORIZED', message: '인증이 필요합니다' },
      { status: 401 }
    )
  }

  const userId = (session.user as any).id
  // userId 사용
}
```

### ✅ 올바른 예시: API 키 인증

```typescript
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'MISSING_API_KEY', message: 'API 키가 필요합니다' },
      { status: 401 }
    )
  }

  const apiKey = authHeader.substring(7)
  // API 키 검증
}
```

## 동적 라우트

### ✅ 올바른 예시: 단일 파라미터

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // id 사용
}
```

### ✅ 올바른 예시: 다중 파라미터

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string; namespace: string }> }
) {
  const { language, namespace } = await params
  // 파라미터 사용
}
```

### ✅ 올바른 예시: Catch-all 라우트

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  // path 배열 사용
}
```

## 에러 처리

### ✅ 올바른 예시: 표준 에러 응답

```typescript
// 성공 응답
return NextResponse.json({ 
  success: true, 
  data: result 
})

// 에러 응답
return NextResponse.json(
  { 
    success: false, 
    error: 'ERROR_CODE',
    message: '에러 메시지'
  },
  { status: 400 }
)
```

### HTTP 상태 코드

- `200` - 성공
- `201` - 생성 성공
- `400` - 잘못된 요청
- `401` - 인증 필요
- `403` - 권한 없음
- `404` - 리소스 없음
- `500` - 서버 오류

**참고**: 에러 처리 패턴은 `.cursor/skills/error-handling/SKILL.md` 스킬을 참고하세요.

## 입력값 검증

### ✅ 올바른 예시: 입력값 검증

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()

  // 필수 필드 검증
  if (!body.email || !body.password) {
    return NextResponse.json(
      { success: false, error: 'VALIDATION_ERROR', message: '이메일과 비밀번호가 필요합니다' },
      { status: 400 }
    )
  }

  // 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return NextResponse.json(
      { success: false, error: 'VALIDATION_ERROR', message: '올바른 이메일 형식이 아닙니다' },
      { status: 400 }
    )
  }
}
```

## 데이터베이스 작업

### ✅ 올바른 예시: Prisma 사용

```typescript
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  const data = await prisma.model.findMany({
    where: {
      // 조건
    },
    select: {
      // 필요한 필드만 선택
    }
  })

  return NextResponse.json({ success: true, data })
}
```

## Rate Limiting

### ✅ 올바른 예시: Rate Limiting

```typescript
import { checkRateLimit } from '@/app/lib/rate-limiter'

export async function POST(request: NextRequest) {
  const rateLimitResult = await checkRateLimit(request)
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { 
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: '요청 한도를 초과했습니다'
      },
      { status: 429 }
    )
  }
}
```

## 응답 헤더

### ✅ 올바른 예시: 응답 헤더

```typescript
return NextResponse.json(data, {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600', // 캐싱
  },
  status: 200
})
```

## AI 어시스턴트 실행 체크리스트

API 라우트 생성 시 다음을 자동으로 확인하세요:

### 파일 구조
- [ ] 파일이 올바른 위치에 있는가? (`app/api/`)
- [ ] HTTP 메서드 함수가 올바르게 export되었는가? (`GET`, `POST`, `PUT`, `DELETE`)

### 보안
- [ ] 인증/인가가 적절히 구현되었는가?
- [ ] 입력값 검증이 구현되었는가?
- [ ] Rate limiting이 필요한가? (필요한 경우)

### 에러 처리
- [ ] 에러 처리가 표준 형식을 따르는가?
- [ ] 적절한 HTTP 상태 코드를 사용하는가?

### 타입 안전성
- [ ] 타입 안전성이 보장되는가?
- [ ] 동적 라우트 파라미터 타입이 올바른가?

## 참고

- API 레이어 아키텍처: `apps/my-app/docs/architecture/API_LAYER.md`
- 에러 처리 스킬: `.cursor/skills/error-handling/SKILL.md`
- 실제 예시: `apps/my-app/app/api/diary/route.ts`
