# Middleware.ts 대체 구현 계획

**작성일**: 2025-12-11  
**목적**: middleware.ts를 제거하고 기능을 대체하는 구체적인 구현 계획

---

## ✅ 대체 가능 여부

**결론: 대체 가능합니다!**

### 대체 가능한 기능

1. ✅ **Rate Limiting** - 이미 API route에서 구현됨 (중복 제거 가능)
2. ✅ **User-Agent 체크** - 이미 API route에서 구현됨 (중복 제거 가능)
3. ✅ **인증 체크** - Server Component Layout으로 대체 가능
4. ✅ **관리자 권한 체크** - Server Component Layout으로 대체 가능
5. ⚠️ **보안 스캐너 차단** - `next.config.ts`로 대체 가능 (선택적)

---

## 📝 구현 계획

### 1단계: Server Component Layout 생성

#### 1.1. `app/diary/write/layout.tsx` 생성

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export default async function DiaryWriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login?callbackUrl=/diary/write');
  }
  
  return <>{children}</>;
}
```

#### 1.2. `app/diary/analysis/layout.tsx` 생성

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export default async function DiaryAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login?callbackUrl=/diary/analysis');
  }
  
  return <>{children}</>;
}
```

#### 1.3. `app/profile/layout.tsx` 생성

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login?callbackUrl=/profile');
  }
  
  return <>{children}</>;
}
```

#### 1.4. `app/admin/layout.tsx` 생성 (인증 + 관리자 권한 체크)

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { checkAdminPermission } from '@/app/lib/admin';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

---

### 2단계: next.config.ts에 보안 헤더 추가 (선택적)

#### 2.1. `next.config.ts` 수정

```typescript
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    // ... 기존 설정
  },
  
  // 보안 헤더 추가 (선택적)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // 민감한 파일 경로 리다이렉트 (선택적)
  async rewrites() {
    return {
      beforeFiles: [
        // 민감한 파일 경로 접근 차단
        {
          source: '/.env',
          destination: '/404',
        },
        {
          source: '/.env.local',
          destination: '/404',
        },
        {
          source: '/.git/:path*',
          destination: '/404',
        },
        {
          source: '/package.json',
          destination: '/404',
        },
        // ... 기타 민감한 경로
      ],
    };
  },
  
  // ... 기존 설정
};

export default nextConfig;
```

**참고**: `rewrites`로는 완전한 차단이 어려울 수 있음. 보안 스캐너 차단은 선택적으로 구현.

---

### 3단계: middleware.ts 제거

#### 3.1. 파일 삭제

```bash
rm apps/my-app/app/middleware.ts
```

또는 수동으로 삭제

---

## 📊 기능 대체 매핑

| middleware.ts 기능 | 대체 방법 | 상태 |
|-------------------|----------|------|
| Rate Limiting (IP 기반) | API route에서 이미 구현됨 | ✅ 중복 제거 가능 |
| User-Agent 체크 | API route에서 이미 구현됨 | ✅ 중복 제거 가능 |
| 인증 체크 (`/diary/write`) | `app/diary/write/layout.tsx` | ⚠️ 구현 필요 |
| 인증 체크 (`/diary/analysis`) | `app/diary/analysis/layout.tsx` | ⚠️ 구현 필요 |
| 인증 체크 (`/profile`) | `app/profile/layout.tsx` | ⚠️ 구현 필요 |
| 인증 + 관리자 권한 (`/admin`) | `app/admin/layout.tsx` | ⚠️ 구현 필요 |
| 보안 스캐너 차단 | `next.config.ts` (선택적) | ⚠️ 선택적 구현 |

---

## ⚠️ 주의사항

### 1. Rate Limiting 범위 축소

**현재 (middleware.ts)**:
- 모든 요청에 적용 (페이지 + API)

**대체 후**:
- API route에만 적용
- 페이지 접근은 Rate Limiting 없음

**영향**: 페이지 접근에 대한 Rate Limiting이 없어짐. 하지만 API route에서 이미 구현되어 있어 큰 문제는 없을 것으로 예상.

### 2. 보안 스캐너 차단 약화

**현재 (middleware.ts)**:
- 세밀한 로깅 및 차단

**대체 후 (`next.config.ts`)**:
- 기본적인 리다이렉트만 가능
- 로깅 불가능

**영향**: 보안 스캐너 차단 기능이 약화되지만, 필수 기능은 아님.

### 3. 클라이언트 사이드 체크와 중복

**현재**:
- middleware.ts: 서버 사이드 체크
- 페이지 컴포넌트: 클라이언트 사이드 체크 (`useSession()`)

**대체 후**:
- Server Component Layout: 서버 사이드 체크
- 페이지 컴포넌트: 클라이언트 사이드 체크 (유지)

**영향**: 중복이지만, 서버 사이드 체크가 먼저 실행되어 보안상 문제 없음.

---

## 🎯 구현 순서

### 즉시 구현 (필수)

1. ✅ `app/diary/write/layout.tsx` 생성
2. ✅ `app/diary/analysis/layout.tsx` 생성
3. ✅ `app/profile/layout.tsx` 생성
4. ✅ `app/admin/layout.tsx` 생성
5. ✅ `app/middleware.ts` 제거

### 선택적 구현

6. ⚠️ `next.config.ts`에 보안 헤더 추가 (선택적)

---

## ✅ 검증 체크리스트

### 구현 후 확인 사항

- [ ] `/diary/write` 접근 시 인증 체크 동작 확인
- [ ] `/diary/analysis` 접근 시 인증 체크 동작 확인
- [ ] `/profile` 접근 시 인증 체크 동작 확인
- [ ] `/admin` 접근 시 인증 + 관리자 권한 체크 동작 확인
- [ ] 비인증 사용자가 보호된 경로 접근 시 로그인 페이지로 리다이렉트 확인
- [ ] 비관리자가 `/admin` 접근 시 홈으로 리다이렉트 확인
- [ ] API route의 Rate Limiting 정상 동작 확인
- [ ] Vercel 빌드 성공 확인
- [ ] Edge Runtime 문제 해결 확인

---

## 🔗 참고 자료

- [Next.js Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Next.js Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Next.js Rewrites](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites)
- [Middleware 분석](./MIDDLEWARE_ANALYSIS.md)

