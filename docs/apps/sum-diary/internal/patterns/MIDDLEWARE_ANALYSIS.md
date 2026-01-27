# Middleware.ts 상세 분석

**작성일**: 2025-12-11  
**목적**: middleware.ts 제거/대체를 위한 기능 분석 및 대체 방안 제시

---

## 📋 Middleware.ts 기능 목록

### 1. 보안 스캐너/봇 차단 (민감한 파일 경로 접근 차단)

**위치**: `middleware.ts:61-103`

**기능**:
- 민감한 파일 경로 접근 차단 (`.env`, `.git`, `package.json` 등)
- 보안 스캔 시도 로깅
- 404 응답 반환

**대체 가능성**: ✅ **대체 가능**

**대체 방안**:
- `next.config.ts`의 `headers` 또는 `rewrites`로 처리
- 또는 API route에서 처리 (하지만 모든 요청에 적용 불가)

**우선순위**: **중간** (보안상 중요하지만 빌드 문제 해결이 더 우선)

---

### 2. Rate Limiting (Redis 기반, 메모리 폴백)

**위치**: `middleware.ts:105-129`

**기능**:
- IP 기반 Rate Limiting: 15분당 100회
- Redis 우선, 실패 시 메모리 폴백
- 모든 요청에 적용

**현재 사용처**:
- `app/lib/redis.ts`: `checkRateLimit()` 함수
- `app/lib/rate-limit.ts`: 별도의 Rate Limiting 시스템 (사용자/IP 기반, 1분당 제한)
- `app/api/diary/create/route.ts`: API route에서 `checkAllLimits()` 사용

**중복 여부**: ⚠️ **중복됨**

**분석**:
- middleware의 Rate Limiting: IP 기반, 15분당 100회, **모든 요청**에 적용
- `app/lib/rate-limit.ts`: 사용자/IP 기반, 1분당 제한, **API route에서만** 사용
- **두 시스템이 별도로 동작 중**

**대체 가능성**: ✅ **대체 가능** (이미 API route에서 Rate Limiting 구현됨)

**대체 방안**:
- API route에서 이미 `checkAllLimits()` 사용 중
- 페이지 접근은 클라이언트 사이드에서 처리
- **단점**: 모든 요청에 적용되지 않음 (API route에만 적용)

**우선순위**: **낮음** (이미 API route에서 Rate Limiting 구현됨)

---

### 3. 의심스러운 User-Agent 체크

**위치**: `middleware.ts:131-139`

**기능**:
- API 경로에서 의심스러운 User-Agent 차단
- 차단 대상: `bot`, `crawler`, `spider`, `scraper`, `python`, `curl`, `wget`

**현재 사용처**:
- `app/api/diary/create/route.ts`: `isSuspiciousUserAgent()` 사용
- `app/api/hua-emotion-analysis/route.ts`: `isSuspiciousUserAgent()` 사용
- `app/lib/guest-limiter.ts`: `isSuspiciousUserAgent()` 함수 정의

**중복 여부**: ⚠️ **중복됨**

**분석**:
- middleware: API 경로에서만 차단
- API route: 각 route에서 개별적으로 체크
- **이미 API route에서 구현됨**

**대체 가능성**: ✅ **대체 가능** (이미 API route에서 구현됨)

**대체 방안**:
- API route에서 이미 `isSuspiciousUserAgent()` 사용 중
- middleware 제거해도 기능 유지

**우선순위**: **낮음** (이미 API route에서 구현됨)

---

### 4. 인증 체크 (보호된 경로)

**위치**: `middleware.ts:141-164`

**기능**:
- 보호된 경로 접근 시 인증 확인
- 보호된 경로: `/diary/write`, `/diary/analysis`, `/profile`, `/admin`
- 인증되지 않은 경우 로그인 페이지로 리다이렉트

**현재 사용처**:
- `app/diary/page.tsx`: 클라이언트 사이드에서 `useSession()` 사용
- `app/diary/write/page.tsx`: 클라이언트 사이드에서 인증 체크 (확인 필요)
- `app/admin/monitoring/page.tsx`: 클라이언트 사이드에서 인증 체크
- `app/profile/page.tsx`: 클라이언트 사이드에서 인증 체크 (확인 필요)

**중복 여부**: ⚠️ **부분 중복**

**분석**:
- middleware: 서버 사이드에서 인증 체크 (모든 요청에 적용)
- 페이지: 클라이언트 사이드에서 인증 체크 (`useSession()`)
- **클라이언트 사이드 체크만으로는 보안 취약**

**대체 가능성**: ⚠️ **대체 가능하지만 보안 약화**

**대체 방안**:
1. **Server Component Layout 사용** (권장)
   ```typescript
   // app/diary/write/layout.tsx
   import { getServerSession } from 'next-auth';
   import { authOptions } from '@/app/lib/auth';
   import { redirect } from 'next/navigation';
   
   export default async function Layout({ children }) {
     const session = await getServerSession(authOptions);
     if (!session) {
       redirect('/auth/login?callbackUrl=/diary/write');
     }
     return <>{children}</>;
   }
   ```

2. **API route에서 인증 체크** (이미 구현됨)
   - 모든 API route에서 `getServerSession()` 사용 중

**우선순위**: **높음** (보안상 중요)

---

### 5. 관리자 권한 체크

**위치**: `middleware.ts:157-163`

**기능**:
- `/admin` 경로 접근 시 관리자 권한 확인
- `role !== 'admin'`인 경우 홈으로 리다이렉트

**현재 사용처**:
- `app/admin/monitoring/page.tsx`: 클라이언트 사이드에서 `/api/user/admin-check` 호출
- `app/api/admin/**/route.ts`: 모든 admin API에서 `checkAdminPermission()` 사용

**중복 여부**: ⚠️ **부분 중복**

**분석**:
- middleware: 서버 사이드에서 권한 체크 (모든 `/admin` 요청에 적용)
- 페이지: 클라이언트 사이드에서 API 호출로 권한 체크
- API route: 서버 사이드에서 `checkAdminPermission()` 사용

**대체 가능성**: ⚠️ **대체 가능하지만 보안 약화**

**대체 방안**:
1. **Server Component Layout 사용** (권장)
   ```typescript
   // app/admin/layout.tsx
   import { getServerSession } from 'next-auth';
   import { authOptions } from '@/app/lib/auth';
   import { checkAdminPermission } from '@/app/lib/admin';
   import { redirect } from 'next/navigation';
   
   export default async function Layout({ children }) {
     const session = await getServerSession(authOptions);
     if (!session?.user?.id) {
       redirect('/auth/login?callbackUrl=/admin');
     }
     
     const isAdmin = await checkAdminPermission(session.user.id);
     if (!isAdmin) {
       redirect('/');
     }
     
     return <>{children}</>;
   }
   ```

2. **API route에서 권한 체크** (이미 구현됨)
   - 모든 admin API에서 `checkAdminPermission()` 사용 중

**우선순위**: **높음** (보안상 중요)

---

## 🎯 대체 전략 요약

### 즉시 제거 가능 (중복 기능)

1. ✅ **Rate Limiting**: 이미 API route에서 구현됨
2. ✅ **User-Agent 체크**: 이미 API route에서 구현됨

### 대체 구현 필요 (보안 중요)

3. ⚠️ **인증 체크**: Server Component Layout으로 대체 필요
4. ⚠️ **관리자 권한 체크**: Server Component Layout으로 대체 필요

### 선택적 대체 (보안 중요도 낮음)

5. ⚠️ **보안 스캐너 차단**: `next.config.ts`로 대체 가능 (선택적)

---

## 📝 대체 구현 계획

### 1단계: Server Component Layout 추가

**작업**:
- `app/diary/write/layout.tsx` 생성 (인증 체크)
- `app/diary/analysis/layout.tsx` 생성 (인증 체크)
- `app/profile/layout.tsx` 생성 (인증 체크)
- `app/admin/layout.tsx` 생성 (인증 + 관리자 권한 체크)

**장점**:
- 서버 사이드에서 인증 체크 (보안 유지)
- 클라이언트 사이드 체크와 중복되지 않음

**단점**:
- 코드 변경량 많음
- 각 보호된 경로마다 layout 필요

---

### 2단계: next.config.ts에 보안 헤더 추가 (선택적)

**작업**:
- `next.config.ts`에 `headers` 설정 추가
- 민감한 파일 경로 접근 차단

**장점**:
- 보안 스캐너 차단 기능 유지

**단점**:
- middleware만큼 세밀한 제어 불가

---

### 3단계: middleware.ts 제거

**작업**:
- `app/middleware.ts` 파일 삭제
- 재배포

**결과**:
- Edge Runtime 문제 해결
- 빌드 환경이 Node.js로 전환

---

## ⚠️ 주의사항

### 보안 고려사항

1. **서버 사이드 인증 체크 필수**
   - 클라이언트 사이드 체크만으로는 보안 취약
   - Server Component Layout 또는 API route에서 반드시 체크

2. **Rate Limiting 범위 축소**
   - middleware 제거 시 모든 요청에 적용되지 않음
   - API route에만 적용됨
   - 페이지 접근은 Rate Limiting 없음

3. **보안 스캐너 차단 약화**
   - `next.config.ts`로 대체 시 세밀한 제어 불가
   - 선택적으로 구현 가능

---

## 🎯 최종 권장 사항

### 옵션 A: 완전 대체 (권장)

1. Server Component Layout 추가 (인증 + 관리자 권한)
2. `next.config.ts`에 보안 헤더 추가 (선택적)
3. middleware.ts 제거

**장점**:
- 모든 기능 유지
- 보안 유지
- Edge Runtime 문제 해결

**단점**:
- 코드 변경량 많음 (4개 layout 파일 생성)

---

### 옵션 B: 부분 대체 (빠른 해결)

1. middleware.ts 제거
2. 클라이언트 사이드 인증 체크만 유지 (이미 구현됨)
3. API route 인증 체크 유지 (이미 구현됨)

**장점**:
- 즉시 해결 가능
- 코드 변경량 최소

**단점**:
- 페이지 접근 시 서버 사이드 인증 체크 없음 (보안 약화)
- Rate Limiting 범위 축소

---

## 📋 체크리스트

### 옵션 A (완전 대체)

- [ ] `app/diary/write/layout.tsx` 생성
- [ ] `app/diary/analysis/layout.tsx` 생성
- [ ] `app/profile/layout.tsx` 생성
- [ ] `app/admin/layout.tsx` 생성
- [ ] `next.config.ts`에 보안 헤더 추가 (선택적)
- [ ] middleware.ts 제거
- [ ] 테스트 (인증 체크, 관리자 권한 체크)
- [ ] 재배포

### 옵션 B (부분 대체)

- [ ] middleware.ts 제거
- [ ] 테스트 (기능 동작 확인)
- [ ] 재배포

---

## 🔗 참고 자료

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Next.js Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

