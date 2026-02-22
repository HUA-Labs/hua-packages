# 보안 패턴

**작성일**: 2025-12-24  
**목적**: 보안 관련 반복되는 패턴과 해결 방법 정리

---

## 목차

1. [Input Sanitization 패턴](#input-sanitization-패턴)
2. [Rate Limiting 패턴](#rate-limiting-패턴)
3. [JWT Secret Management 패턴](#jwt-secret-management-패턴)
4. [Password Policy Enforcement 패턴](#password-policy-enforcement-패턴)

---

## Input Sanitization 패턴

### 문제 상황

사용자 입력값에 XSS, SQL Injection 등 악성 코드 포함 가능

### 해결 방법

#### 입력값 Sanitization

```typescript
// ✅ Input Sanitization
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

// 검색어 길이 제한
export function validateSearchQuery(query: string): string {
  if (query.length > 200) {
    throw new Error('검색어는 200자 이하여야 합니다.');
  }
  return sanitizeInput(query);
}
```

### 핵심 포인트

1. **XSS 방지**: DOMPurify로 HTML 태그 제거
2. **길이 제한**: DoS 공격 방지
3. **형식 검증**: UUID, 이메일 등 형식 검증

### 관련 데브로그

- [DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md](../devlogs/DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md)
- [DEVLOG_2025-12-23_SECURITY_IMPROVEMENTS_CRITICAL_FIXES.md](../devlogs/DEVLOG_2025-12-23_SECURITY_IMPROVEMENTS_CRITICAL_FIXES.md)

---

## Rate Limiting 패턴

### 문제 상황

API 악용 방지를 위한 Rate Limiting 필요

### 해결 방법

#### Rate Limiting 미들웨어

```typescript
// ✅ Rate Limiting 미들웨어
export async function checkRateLimitMiddleware(
  request: NextRequest,
  options: {
    userLimitPerMinute: number;
    ipLimitPerMinute: number;
    userId?: string;
    ip: string;
  }
): Promise<NextResponse | null> {
  const key = options.userId 
    ? `rate-limit:user:${options.userId}`
    : `rate-limit:ip:${options.ip}`;
  
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 60);
  }
  
  const limit = options.userId 
    ? options.userLimitPerMinute 
    : options.ipLimitPerMinute;
  
  if (count > limit) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 }
    );
  }
  
  return null;
}
```

### 핵심 포인트

1. **사용자/IP별 제한**: 사용자 인증 여부에 따라 다른 제한
2. **Redis 활용**: 빠른 카운팅 및 만료
3. **일관된 에러 응답**: 429 상태 코드 사용

### 관련 데브로그

- [DEVLOG_2025-12-23_SECURITY_RATE_LIMITING.md](../devlogs/DEVLOG_2025-12-23_SECURITY_RATE_LIMITING.md)

---

## JWT Secret Management 패턴

### 문제 상황

프로덕션 환경에서 `NEXTAUTH_SECRET` 미설정 시 자동 생성된 랜덤 키 사용 → 서버리스 환경에서 인스턴스마다 다른 키 생성

### 해결 방법

#### 환경 변수 필수화

```typescript
// ✅ JWT Secret 필수 검증
function getServerEnvSafely(): ServerEnv {
  const databaseUrl = process.env.DATABASE_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const encryptionKey = process.env.ENCRYPTION_KEY;
  
  if (process.env.NODE_ENV === 'production') {
    if (!nextAuthSecret || nextAuthSecret.length < 32) {
      throw new Error(
        'NEXTAUTH_SECRET must be at least 32 characters in production'
      );
    }
    if (!encryptionKey || encryptionKey.length < 32) {
      throw new Error(
        'ENCRYPTION_KEY must be at least 32 characters in production'
      );
    }
  }
  
  return {
    DATABASE_URL: databaseUrl || '',
    NEXTAUTH_SECRET: nextAuthSecret || '',
    ENCRYPTION_KEY: encryptionKey || '',
  };
}
```

### 핵심 포인트

1. **프로덕션 검증**: 프로덕션 환경에서 필수 환경 변수 검증
2. **최소 길이**: 32자 이상 요구
3. **서버 시작 실패**: 환경 변수 없으면 서버 시작 불가

### 관련 데브로그

- [DEVLOG_2025-12-23_SECURITY_IMPROVEMENTS_CRITICAL_FIXES.md](../devlogs/DEVLOG_2025-12-23_SECURITY_IMPROVEMENTS_CRITICAL_FIXES.md)

---

## Password Policy Enforcement 패턴

### 문제 상황

최소 6자만 요구하여 보안 표준에 미달

### 해결 방법

#### 강화된 비밀번호 정책

```typescript
// ✅ Password Policy Enforcement
const passwordSchema = z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(/[A-Z]/, '대문자를 포함해야 합니다')
  .regex(/[a-z]/, '소문자를 포함해야 합니다')
  .regex(/[0-9]/, '숫자를 포함해야 합니다')
  .regex(/[^A-Za-z0-9]/, '특수문자를 포함해야 합니다');

export function validatePassword(password: string): { valid: boolean; error?: string } {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return { valid: false, error: result.error.errors[0].message };
  }
  return { valid: true };
}
```

### 핵심 포인트

1. **최소 길이**: 8자 이상
2. **복잡도 요구**: 대소문자, 숫자, 특수문자 조합
3. **일반 비밀번호 차단**: 일반적인 비밀번호 목록과 비교

### 관련 데브로그

- [DEVLOG_2025-12-23_SECURITY_IMPROVEMENTS_CRITICAL_FIXES.md](../devlogs/DEVLOG_2025-12-23_SECURITY_IMPROVEMENTS_CRITICAL_FIXES.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-24

