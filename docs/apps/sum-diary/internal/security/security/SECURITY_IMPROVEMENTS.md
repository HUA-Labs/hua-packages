# 보안 개선 사항

## 완료된 보안 개선

### 1. 입력 검증 강화

#### 검색어 길이 제한
- **문제**: 검색어 길이 제한 없음 → DoS 공격 가능
- **해결**: 검색어 최대 200자로 제한
- **적용 위치**: `/api/admin/users`, `/api/admin/diaries`

#### 페이지네이션 값 검증
- **문제**: `page`, `limit` 값 검증 없음 → DB 부하 가능
- **해결**: 
  - `page`: 1~1000 범위로 제한
  - `limit`: 1~100 범위로 제한
- **적용 위치**: 모든 관리자 API

#### UUID 형식 검증
- **문제**: 잘못된 형식의 UUID로 검색 시도 가능
- **해결**: UUID 형식 정규식 검증 추가
- **적용 위치**: `/api/admin/diaries` (userId 파라미터)

### 2. 개인정보 노출 최소화

#### 사용자 API 개선
- **제거된 필드**: `email`, `name` (민감 정보)
- **유지된 필드**: `nickname` (표시용), `email_hash`, `nickname_hash` (식별용)
- **이유**: 개인정보 보호법 준수, 최소 권한 원칙

#### 일기 API 개선
- **제거된 필드**: `authorEmail` (민감 정보)
- **유지된 필드**: `authorHash` (식별용), `author` (닉네임만)
- **이유**: 일기 작성자 이메일 노출 방지

### 3. 관리자 활동 로깅

#### 감사 로그 시스템
- **구현**: `admin-audit-log.ts` 모듈 생성
- **기능**:
  - 검색 활동 로깅 (`logAdminSearch`)
  - 조회 활동 로깅 (`logAdminView`)
  - IP 주소 및 User-Agent 기록
- **저장 위치**: `ApiLog` 테이블 활용
- **적용 위치**: 모든 관리자 검색/조회 API

#### 로깅 정보
- 관리자 ID
- 활동 유형 (SEARCH_USERS, SEARCH_DIARIES, VIEW_USER, etc.)
- 검색어 (최대 100자)
- 결과 개수
- IP 주소
- User-Agent

### 4. 에러 메시지 보안 강화

#### 상세 정보 노출 방지
- **문제**: 에러 메시지에 상세 정보 포함 → 정보 유출 가능
- **해결**: 
  - 일반적인 에러 메시지만 반환
  - 상세 정보는 서버 로그에만 기록
- **적용 위치**: 모든 관리자 API

### 5. Prisma 클라이언트 관리 개선

#### 싱글톤 패턴 적용
- **문제**: 매번 새 PrismaClient 생성 → 연결 풀 관리 문제
- **해결**: `@/app/lib/prisma` 싱글톤 인스턴스 사용
- **적용 위치**: `/api/admin/diaries` (기존 `new PrismaClient()` 제거)

## 추가 권장 사항

### 1. Rate Limiting (미구현)

#### 필요성
- API 남용 방지
- DoS 공격 방어
- 리소스 보호

#### 구현 방법
```typescript
// 예시: next-rate-limit 또는 upstash/ratelimit 사용
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 1분에 100회
});

// API에서 사용
const { success } = await ratelimit.limit(adminId);
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

### 2. CSRF 보호 (검토 필요)

#### 현재 상태
- Next.js 기본 CSRF 보호 활용
- 추가 검증 필요 시 `next-auth` CSRF 토큰 사용 고려

### 3. 세션 타임아웃 (검토 필요)

#### 권장 사항
- 관리자 세션은 일반 사용자보다 짧게 설정
- 비활성 시간 제한 (예: 30분)

### 4. IP 화이트리스트 (선택사항)

#### 필요성
- 관리자 페이지 접근 제한
- 특정 IP에서만 접근 허용

#### 구현 방법
```typescript
const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');

if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 5. 2FA (Two-Factor Authentication) (선택사항)

#### 필요성
- 관리자 계정 보안 강화
- 무단 접근 방지

### 6. 개인정보 조회 전용 API (선택사항)

#### 필요성
- 현재는 개인정보를 목록 API에서 제외했지만, 필요시 별도 API로 제공
- 추가 권한 검증 및 로깅 필요

```typescript
// 예시: /api/admin/users/[id]/sensitive
// - 추가 권한 확인 (예: SUPER_ADMIN)
// - 상세 로깅
// - 접근 이력 기록
```

## 보안 체크리스트

### API 보안
- [x] 관리자 권한 확인
- [x] 입력 검증 및 제한
- [x] 개인정보 최소화
- [x] 에러 메시지 보안
- [x] 활동 로깅
- [ ] Rate Limiting
- [ ] CSRF 보호 강화

### 데이터 보안
- [x] 암호화된 데이터만 저장
- [x] 해시 기반 검색
- [x] 개인정보 노출 최소화
- [x] Prisma 클라이언트 관리

### 모니터링
- [x] 관리자 활동 로깅
- [x] 검색 이력 기록
- [ ] 이상 활동 감지 (향후 구현)

## 참고 사항

1. **해시 검색 보안**: SHA-256 해시는 역산 불가능하지만, 부분 검색은 브루트포스 공격 가능성 있음. 하지만 해시는 원본 값으로 역산 불가능하므로 상대적으로 안전.

2. **로그 보관**: 관리자 활동 로그는 법적 책임 추적을 위해 장기 보관 필요.

3. **정기 보안 점검**: 보안 취약점은 지속적으로 모니터링하고 개선 필요.

