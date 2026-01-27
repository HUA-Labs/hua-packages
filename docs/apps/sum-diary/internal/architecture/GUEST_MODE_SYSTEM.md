# 게스트 모드 시스템 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **게스트 모드**를 통해 로그인 없이도 서비스를 체험할 수 있도록 지원합니다. 이 문서는 실제 구현 코드를 기반으로 게스트 모드 시스템의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- 로그인 없이 체험 가능
- IP 기반 게스트 ID 생성
- 클라이언트 LocalStorage 기반 추적
- 자동 마이그레이션 지원
- 제한적 기능 제공

---

## 1. 시스템 구조

### 1.1 게스트 모드 플로우

```
게스트 사용자 접속
    ↓
게스트 ID 생성/조회
    ├─ IP 기반 게스트 ID (서버)
    └─ LocalStorage 게스트 ID (클라이언트)
    ↓
게스트 제한 체크
    ├─ User-Agent 검증
    ├─ Rate Limiting (분당 5회)
    └─ 일일 제한 체크 (3회)
    ↓
일기 작성/분석
    ↓
게스트 일기 저장
    ↓
로그인/회원가입 시
    ├─ 게스트 일기 마이그레이션
    └─ LocalStorage 게스트 ID 초기화
```

### 1.2 구현 위치

**주요 파일:**
- `app/lib/guest-utils.ts`: 게스트 사용자 유틸리티
- `app/lib/guest-migration.ts`: 게스트 일기 마이그레이션
- `app/lib/guest-migration-improved.ts`: 개선된 마이그레이션
- `app/lib/guest-limiter.ts`: 게스트 제한 시스템
- `app/lib/client-guest-id.ts`: 클라이언트 게스트 ID 관리

---

## 2. 게스트 ID 생성

### 2.1 IP 기반 게스트 ID

**구현 위치:** `app/lib/guest-migration.ts`

**함수:** `generateGuestId(ip: string): string`

**프로세스:**
1. IP 주소를 SHA-256 해시
2. 해시의 첫 32자 추출
3. UUID 형식으로 변환 (8-4-4-4-12 패턴)

**코드:**
```typescript
export function generateGuestId(ip: string): string {
  const guestId = crypto.createHash('sha256')
    .update(`guest_${ip}`)
    .digest('hex')
    .substring(0, 32);
  
  // UUID 형식으로 변환
  return `${guestId.substring(0, 8)}-${guestId.substring(8, 12)}-${guestId.substring(12, 16)}-${guestId.substring(16, 20)}-${guestId.substring(20, 32)}`;
}
```

**특징:**
- 동일 IP는 항상 동일한 게스트 ID
- UUID 형식으로 데이터베이스와 호환
- 해시 기반으로 개인정보 보호

### 2.2 클라이언트 게스트 ID

**구현 위치:** `app/lib/client-guest-id.ts`

**목적:**
- 같은 기기/브라우저에서 일관된 게스트 ID 사용
- IP 변경 시에도 게스트 일기 추적 가능

**저장 위치:**
- LocalStorage: `hua_guest_id`

**함수:**
- `getOrCreateClientGuestId()`: 게스트 ID 가져오기 또는 생성
- `getClientGuestId()`: 저장된 게스트 ID 조회
- `clearClientGuestId()`: 게스트 ID 초기화

**UUID 생성:**
- UUID v4 형식
- 클라이언트 사이드에서 생성

---

## 3. 게스트 사용자 생성

### 3.1 게스트 사용자 생성/조회

**구현 위치:** `app/lib/guest-utils.ts`

**함수:** `getOrCreateGuestUser(request, logAction?)`

**프로세스:**
1. IP 주소 추출
2. 게스트 ID 생성
3. User upsert (email_hash = null, nickname_hash = null)
4. 게스트 사용 로그 기록

**코드:**
```typescript
export async function getOrCreateGuestUser(
  request: NextRequest, 
  logAction?: 'diary_write' | 'diary_analyze'
) {
  const ip = getClientIP(request);
  const formattedGuestId = generateGuestId(ip);
  
  const guestUser = await prisma.user.upsert({
    where: { id: formattedGuestId },
    update: {},
    create: {
      id: formattedGuestId,
      state: UserState.active,
      email_hash: null,
      nickname_hash: null,
      email_enc: null,
      nickname_enc: null,
      name_enc: null,
    },
  });
  
  if (logAction) {
    await logGuestUsage(ip, request.headers.get('user-agent'), logAction);
  }
  
  return guestUser;
}
```

**특징:**
- `email_hash = null`, `nickname_hash = null`로 게스트 식별
- NULL은 unique 제약에서 여러 개 허용 (수천 명 게스트 지원)
- 자동으로 User 생성

---

## 4. 게스트 제한 시스템

### 4.1 제한 설정

**구현 위치:** `app/lib/guest-limiter.ts`

**제한:**
- 일기 작성: IP당 24시간당 3회
- Rate Limiting: 분당 5회 요청
- User-Agent 검증: 의심스러운 요청 차단

**설정:**
```typescript
export const GUEST_LIMITS = {
  DIARY_WRITES_PER_IP: 3,
  WINDOW_HOURS: 24,
  RATE_LIMIT_PER_MINUTE: 5,
} as const;
```

### 4.2 일일 제한 체크

**구현:** `checkGuestUsageLimit(ip, action)`

**프로세스:**
1. 24시간 윈도우 계산
2. LoginLog에서 게스트 사용 횟수 조회
3. 제한 초과 여부 확인
4. 리셋 시간 계산

**코드:**
```typescript
export async function checkGuestUsageLimit(
  ip: string, 
  action: 'diary_write' | 'diary_analyze' = 'diary_write'
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  reason?: string;
}> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - GUEST_LIMITS.WINDOW_HOURS * 60 * 60 * 1000);
  
  const usageCount = await prisma.loginLog.count({
    where: {
      ip: ip,
      action: action,
      is_guest: true,
      created_at: { gte: windowStart }
    }
  });
  
  const remaining = Math.max(0, GUEST_LIMITS.DIARY_WRITES_PER_IP - usageCount);
  const allowed = usageCount < GUEST_LIMITS.DIARY_WRITES_PER_IP;
  const resetTime = new Date(windowStart.getTime() + GUEST_LIMITS.WINDOW_HOURS * 60 * 60 * 1000);
  
  return { allowed, remaining, resetTime };
}
```

### 4.3 Rate Limiting

**구현:** `checkRateLimit(ip, endpoint?)`

**프로세스:**
1. 최근 1분간 요청 수 조회
2. 제한 초과 여부 확인
3. 통과 시 로깅 (비동기)

**제한:**
- 분당 5회 요청

### 4.4 User-Agent 검증

**구현:** `isSuspiciousUserAgent(userAgent)`

**의심스러운 패턴:**
- 봇/크롤러: `bot`, `crawler`, `spider`, `scraper`
- CLI 도구: `curl`, `wget`, `httpie`, `python-requests`
- API 테스트 도구: `postman`, `insomnia`, `rest-client`
- 자동화 도구: `python`, `node`, `java`, `selenium`
- 너무 짧은 User-Agent (< 10자)

**허용된 봇:**
- 검색 엔진: `googlebot`, `bingbot`, `slurp`
- 소셜 미디어: `facebookexternalhit`, `twitterbot`
- 우리 봇: `hua-bot`, `my-app-bot`

**정상 모바일:**
- 모바일 브라우저 패턴 감지 시 정상으로 간주

---

## 5. 게스트 일기 마이그레이션

### 5.1 기본 마이그레이션

**구현 위치:** `app/lib/guest-migration.ts`

**함수:** `migrateGuestDiaries(guestId, userId)`

**프로세스:**
1. 게스트 일기 조회
2. 트랜잭션으로 user_id 업데이트
3. 분석 결과 자동 연결 (diary_id로 연결됨)

**코드:**
```typescript
export async function migrateGuestDiaries(
  guestId: string,
  userId: string
): Promise<{
  success: boolean;
  migratedCount: number;
  error?: string;
}> {
  const guestDiaries = await prisma.diaryEntry.findMany({
    where: {
      user_id: guestId,
      deleted_at: null
    }
  });

  const result = await prisma.$transaction(async (tx) => {
    const updateDiaries = await tx.diaryEntry.updateMany({
      where: {
        user_id: guestId,
        deleted_at: null
      },
      data: {
        user_id: userId,
        updated_at: new Date()
      }
    });

    return { diaryCount: updateDiaries.count };
  });

  return {
    success: true,
    migratedCount: result.diaryCount
  };
}
```

### 5.2 개선된 마이그레이션

**구현 위치:** `app/lib/guest-migration-improved.ts`

**함수:** `migrateGuestDiariesFromRequestImproved(request, userId, clientGuestId?)`

**개선 사항:**
1. 여러 게스트 ID 통합 지원
2. 클라이언트 LocalStorage 게스트 ID 지원
3. 최근 30일 이내 패턴 기반 검색

**전략:**
1. 현재 IP 기반 게스트 ID
2. 클라이언트 LocalStorage 게스트 ID
3. 최근 30일 이내 동일 IP 패턴의 게스트 ID들

**코드:**
```typescript
export async function migrateGuestDiariesFromRequestImproved(
  request: NextRequest,
  userId: string,
  clientGuestId?: string | null
): Promise<{
  success: boolean;
  totalMigratedCount: number;
  migratedByGuestId: Array<{
    guestId: string;
    count: number;
    source: 'current_ip' | 'client_storage' | 'recent_pattern';
  }>;
  warnings?: string[];
}> {
  const guestIds: Array<{ id: string; source: ... }> = [];

  // 1. 현재 IP 기반 게스트 ID
  const ip = getClientIP(request);
  const currentGuestId = generateGuestId(ip);
  guestIds.push({ id: currentGuestId, source: 'current_ip' });

  // 2. 클라이언트 LocalStorage 게스트 ID
  if (clientGuestId && clientGuestId !== currentGuestId) {
    if (uuidRegex.test(clientGuestId)) {
      guestIds.push({ id: clientGuestId, source: 'client_storage' });
    }
  }

  // 3. 최근 30일 이내 패턴 검색
  const recentGuestUsers = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "User"
    WHERE id::text LIKE ${currentGuestId.substring(0, 8) + '%'}
      AND email_hash IS NULL
      AND created_at >= NOW() - INTERVAL '30 days'
    LIMIT 5
  `;

  // 마이그레이션 실행
  return await migrateMultipleGuestDiaries(uniqueGuestIds, userId);
}
```

### 5.3 여러 게스트 ID 통합

**구현:** `migrateMultipleGuestDiaries(guestIds, userId)`

**프로세스:**
1. 각 게스트 ID별로 일기 조회
2. 일기 user_id 업데이트
3. 각 게스트 ID별 개수 집계

**결과:**
- 총 마이그레이션된 일기 수
- 게스트 ID별 개수
- 소스 정보 (current_ip, client_storage, recent_pattern)

---

## 6. IP 주소 추출

### 6.1 클라이언트 IP 추출

**구현:** `getClientIP(request)`

**우선순위:**
1. `x-forwarded-for` 헤더 (프록시/로드밸런서 뒤)
2. `x-real-ip` 헤더
3. 개발 환경: `127.0.0.1`
4. 알 수 없음: `unknown`

**코드:**
```typescript
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    // 쉼표로 구분된 여러 IP 중 첫 번째
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (process.env.NODE_ENV === 'development') {
    return '127.0.0.1';
  }
  
  return 'unknown';
}
```

---

## 7. 게스트 로깅

### 7.1 게스트 사용 로그

**구현:** `logGuestUsage(ip, userAgent, action)`

**저장 위치:**
- `LoginLog` 테이블
- `is_guest: true`
- `action: 'diary_write' | 'diary_analyze'`

**목적:**
- 일일 제한 체크
- Rate Limiting
- 통계 수집

### 7.2 API 요청 로그

**구현:** `logGuestApiRequest(ip, userAgent, endpoint, method)`

**목적:**
- Rate Limiting용 일반 API 요청 로깅
- 비동기 처리 (응답 지연 없음)

---

## 8. 통합 제한 체크

### 8.1 게스트 제한 체크

**구현:** `checkGuestLimits(request, endpoint?)`

**체크 순서:**
1. User-Agent 검증
2. Rate Limiting 체크 (분당 5회)
3. 일일 제한 체크 (24시간당 3회)

**반환 값:**
```typescript
{
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  reason?: string;
}
```

---

## 9. 게스트 사용자 식별

### 9.1 게스트 식별 방법

**데이터베이스:**
- `email_hash = null`
- `nickname_hash = null`
- `email_enc = null`
- `nickname_enc = null`

**특징:**
- NULL은 unique 제약에서 여러 개 허용
- 수천 명의 게스트 지원 가능
- 어드민은 `role = 'ADMIN'`으로 구분

### 9.2 게스트 ID 조회

**서버 사이드:**
- `getGuestUserId(request)`: IP 기반 게스트 ID
- `getGuestUser(request)`: 게스트 사용자 조회

**클라이언트 사이드:**
- `getOrCreateClientGuestId()`: LocalStorage 게스트 ID
- `getClientGuestId()`: 저장된 게스트 ID 조회

---

## 10. 구현 상세

### 10.1 주요 함수

**게스트 사용자:**
- `getOrCreateGuestUser(request, logAction?)`: 게스트 사용자 생성/조회
- `getGuestUser(request)`: 게스트 사용자 조회
- `getGuestUserId(request)`: 게스트 ID 추출

**게스트 ID:**
- `generateGuestId(ip)`: IP 기반 게스트 ID 생성
- `getOrCreateClientGuestId()`: 클라이언트 게스트 ID 가져오기/생성
- `getClientGuestId()`: 클라이언트 게스트 ID 조회
- `clearClientGuestId()`: 클라이언트 게스트 ID 초기화

**제한 체크:**
- `checkGuestUsageLimit(ip, action)`: 일일 제한 체크
- `checkGuestLimits(request, endpoint?)`: 통합 제한 체크
- `isSuspiciousUserAgent(userAgent)`: User-Agent 검증

**마이그레이션:**
- `migrateGuestDiaries(guestId, userId)`: 기본 마이그레이션
- `migrateGuestDiariesFromRequest(request, userId)`: 요청 기반 마이그레이션
- `migrateGuestDiariesFromRequestImproved(...)`: 개선된 마이그레이션
- `migrateMultipleGuestDiaries(guestIds, userId)`: 여러 게스트 ID 통합

**로깅:**
- `logGuestUsage(ip, userAgent, action)`: 게스트 사용 로그
- `logGuestApiRequest(ip, userAgent, endpoint, method)`: API 요청 로그

### 10.2 데이터 구조

**게스트 사용자:**
```typescript
{
  id: string; // UUID 형식 게스트 ID
  email_hash: null;
  nickname_hash: null;
  email_enc: null;
  nickname_enc: null;
  state: 'active';
  role: 'USER';
}
```

**마이그레이션 결과:**
```typescript
{
  success: boolean;
  totalMigratedCount: number;
  migratedByGuestId: Array<{
    guestId: string;
    count: number;
    source: 'current_ip' | 'client_storage' | 'recent_pattern';
  }>;
  warnings?: string[];
  error?: string;
}
```

---

## 11. 보안 고려사항

### 11.1 IP 기반 추적

**제한:**
- 동적 IP 환경에서 제한적
- VPN 사용 시 우회 가능
- 클라이언트 LocalStorage로 보완

### 11.2 User-Agent 검증

**전략:**
- 의심스러운 요청 차단
- 봇/크롤러 필터링
- 정상 모바일 브라우저 허용

### 11.3 제한 우회 방지

**전략:**
- IP 기반 제한
- User-Agent 검증
- Rate Limiting
- 다중 계정 감지 (향후)

---

## 12. 성능 고려사항

### 12.1 비동기 로깅

**전략:**
- 로깅은 비동기로 처리
- 응답 지연 없음
- 에러 발생 시 무시

### 12.2 쿼리 최적화

**전략:**
- 인덱스 활용 (`ip`, `is_guest`, `created_at`)
- 시간 윈도우 제한
- 집계 쿼리 최적화

---

## 13. 참고 자료

### 관련 코드 파일
- `app/lib/guest-utils.ts`: 게스트 사용자 유틸리티
- `app/lib/guest-migration.ts`: 게스트 일기 마이그레이션
- `app/lib/guest-migration-improved.ts`: 개선된 마이그레이션
- `app/lib/guest-limiter.ts`: 게스트 제한 시스템
- `app/lib/client-guest-id.ts`: 클라이언트 게스트 ID 관리

### 관련 문서
- [인증 및 권한 관리](./AUTH_AND_AUTHORIZATION.md)
- [할당량 및 비용 관리](./QUOTA_AND_BILLING_SYSTEM.md)

---

## 14. 향후 개선 계획

### 14.1 계획된 개선사항

1. **다중 기기 추적**
   - 디바이스 핑거프린팅
   - 더 정확한 게스트 식별

2. **게스트 분석 제한**
   - 분석 횟수 제한
   - 프리미엄 전환 유도

3. **게스트 통계**
   - 게스트 전환율 추적
   - 마이그레이션 성공률

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
