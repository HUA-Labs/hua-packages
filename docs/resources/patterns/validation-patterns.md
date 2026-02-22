# 검증 패턴

**작성일**: 2025-12-24  
**목적**: Zod 검증 관련 반복되는 패턴과 해결 방법 정리

---

## 목차

1. [Zod 검증 도입 패턴](#zod-검증-도입-패턴)
2. [unknown 타입 강제 패턴](#unknown-타입-강제-패턴)
3. [Request/Response 네이밍 분리 패턴](#requestresponse-네이밍-분리-패턴)
4. [클라이언트/서버 환경 변수 분리 패턴](#클라이언트서버-환경-변수-분리-패턴)
5. [API 스키마 재사용 패턴](#api-스키마-재사용-패턴)

---

## Zod 검증 도입 패턴

### 문제 상황

API 요청/응답 검증이 없어 타입 안전성 부족

### 해결 방법

#### Zod 스키마 정의

```typescript
// ✅ Zod 스키마 정의
import { z } from 'zod';

export const CreateDiaryRequestSchema = z.object({
  content: z.string().min(1, '일기 내용은 필수입니다'),
  emotion: z.enum(['joy', 'sadness', 'anger']).optional(),
});

export type CreateDiaryRequest = z.infer<typeof CreateDiaryRequestSchema>;
```

#### API 라우트에서 검증

```typescript
// ✅ API 라우트에서 검증
export async function POST(request: NextRequest) {
  const body: unknown = await request.json();
  const validationResult = CreateDiaryRequestSchema.safeParse(body);
  
  if (!validationResult.success) {
    return NextResponse.json(
      { error: '검증 실패', details: validationResult.error.issues },
      { status: 400 }
    );
  }
  
  const data = validationResult.data; // 타입 안전
  // ...
}
```

### 핵심 포인트

1. **런타임 검증**: TypeScript 타입 체크만으로는 부족
2. **unknown 타입 사용**: API 요청은 항상 `unknown`으로 시작
3. **에러 응답 일관성**: 검증 실패 시 일관된 에러 응답

### 관련 데브로그

- [DEVLOG_2025-12-24_ZOD_VALIDATION_REVIEW_AND_IMPROVEMENTS.md](../devlogs/DEVLOG_2025-12-24_ZOD_VALIDATION_REVIEW_AND_IMPROVEMENTS.md)

---

## unknown 타입 강제 패턴

### 문제 상황

API 요청을 `any`로 처리하여 타입 안전성 부족

### 해결 방법

#### unknown 타입 강제

```typescript
// ❌ 타입 안전하지 않음
const body = await request.json(); // any 타입

// ✅ unknown 타입 강제
const body: unknown = await request.json();
const validationResult = CreateDiaryRequestSchema.safeParse(body);
```

### 핵심 포인트

1. **unknown 타입**: API 요청은 항상 `unknown`으로 시작
2. **검증 후 사용**: 검증 성공 후에만 타입 안전한 데이터 사용
3. **타입 가드**: Zod의 `safeParse`로 타입 가드 역할

### 관련 데브로그

- [DEVLOG_2025-12-24_ZOD_VALIDATION_REVIEW_AND_IMPROVEMENTS.md](../devlogs/DEVLOG_2025-12-24_ZOD_VALIDATION_REVIEW_AND_IMPROVEMENTS.md)

---

## Request/Response 네이밍 분리 패턴

### 문제 상황

Request인지 Response인지 불명확한 스키마 이름

### 해결 방법

#### 명시적 네이밍

```typescript
// ❌ 불명확한 네이밍
export const CreateDiarySchema = z.object({ ... });

// ✅ 명시적 네이밍
export const CreateDiaryRequestSchema = z.object({ ... });
export const CreateDiaryResponseSchema = z.object({
  success: z.boolean(),
  diaryId: z.string().uuid(),
});
export const DiaryEntitySchema = z.object({ ... }); // 재사용 가능
```

### 핵심 포인트

1. **명확한 구분**: Request/Response/Entity 명시
2. **재사용성**: Entity 스키마로 재사용
3. **확장 용이**: Request/Response 분리로 확장 용이

### 관련 데브로그

- [DEVLOG_2025-12-24_ZOD_VALIDATION_IMPROVEMENTS_STACK.md](../devlogs/DEVLOG_2025-12-24_ZOD_VALIDATION_IMPROVEMENTS_STACK.md)

---

## 클라이언트/서버 환경 변수 분리 패턴

### 문제 상황

하나의 스키마에 서버/클라이언트 변수 혼재

### 해결 방법

#### 분리된 스키마

```typescript
// ✅ 서버 전용 환경 변수
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
});

// ✅ 클라이언트 전용 환경 변수
const clientEnvSchema = z.object({
  NEXT_PUBLIC_DEFAULT_AI_PROVIDER: z.enum(['openai', 'gemini', 'auto']),
});

// ✅ 분리된 함수
export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}

export function getClientEnv() {
  return clientEnvSchema.parse(process.env);
}
```

### 핵심 포인트

1. **보안 강화**: 서버 변수 노출 방지
2. **명시적 관리**: `NEXT_PUBLIC_*` 접두사 검증
3. **빌드 타임 검증**: Next.js App Router 최적화

### 관련 데브로그

- [DEVLOG_2025-12-24_ZOD_VALIDATION_IMPROVEMENTS_STACK.md](../devlogs/DEVLOG_2025-12-24_ZOD_VALIDATION_IMPROVEMENTS_STACK.md)

---

## API 스키마 재사용 패턴

### 문제 상황

폼 검증과 API 검증이 중복되어 스키마 관리 어려움

### 해결 방법

#### 스키마 재사용

```typescript
// ✅ API 스키마 재사용
export const CreateDiaryRequestSchema = z.object({
  content: z.string().min(1),
  emotion: z.enum(['joy', 'sadness']).optional(),
});

// 폼에서 API 스키마 재사용
export const DiaryWriteFormSchema = CreateDiaryRequestSchema.extend({
  // 폼 전용 추가 필드
  draft: z.boolean().optional(),
});
```

### 핵심 포인트

1. **스키마 재사용**: API 스키마를 폼에서 재사용
2. **확장성**: `extend`로 추가 필드 추가
3. **일관성**: API와 폼 검증 로직 일치

### 관련 데브로그

- [DEVLOG_2025-12-24_ZOD_VALIDATION_IMPROVEMENTS_STACK.md](../devlogs/DEVLOG_2025-12-24_ZOD_VALIDATION_IMPROVEMENTS_STACK.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-24

