# NextAuth 타입 확장 컨셉

**작성일**: 2025-12-24  
**목적**: NextAuth v5 타입 확장의 올바른 방법과 주의사항

---

## 개요

NextAuth v5에서 Session, User, JWT 타입을 확장하여 타입 안전성을 제공합니다. 하지만 잘못된 확장 방식은 모듈 전체를 덮어쓰는 문제를 일으킬 수 있습니다.

---

## 올바른 타입 확장 패턴

### 1. 파일 위치 및 이름

**올바른 위치**: `apps/my-app/auth.d.ts`

```typescript
// ✅ 올바른 파일명
// apps/my-app/auth.d.ts
declare module "next-auth" {
  // ...
}
```

**잘못된 위치**: `apps/my-app/next-auth.d.ts`

```typescript
// ❌ 위험: next-auth.d.ts는 모듈 자체로 인식될 수 있음
// TypeScript가 실제 next-auth 패키지를 찾지 못함
```

### 2. Interface 확장

```typescript
// ✅ 올바른 확장 방식
import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider?: AuthProvider;
    } & DefaultSession["user"];
  }
  
  interface User {
    id?: string;
    provider?: AuthProvider;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: AuthProvider;
    user?: {
      id: string;
      provider?: AuthProvider;
    };
  }
}
```

### 3. 사용

```typescript
// ✅ 올바른 사용
import NextAuth from "next-auth";

export const { auth, handlers } = NextAuth({
  // 타입이 자동으로 추론됨
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id!,
          provider: user.provider,
        };
      }
      return token;
    },
    session({ session, token }) {
      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user,
        } as typeof session.user; // 타입 단언 필요
      }
      return session;
    },
  },
});
```

---

## 주의사항

### 1. 파일명 충돌

**문제**: `next-auth.d.ts` 파일명은 모듈 자체로 인식

**해결**: `auth.d.ts`로 변경

### 2. 타입 단언 필요

**문제**: Session 타입 확장 시 타입 호환성 문제

**해결**: 적절한 타입 단언 사용

```typescript
session.user = {
  ...session.user,
  ...token.user,
} as typeof session.user;
```

### 3. 서버/클라이언트 구분

**서버 사이드**: `getServerSession()` 사용

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-v5";

const session = await getServerSession(authOptions);
```

**클라이언트 사이드**: `useSession()` 사용

```typescript
import { useSession } from "next-auth/react";

const { data: session } = useSession();
```

---

## 실제 적용 사례

### 타입 확장 파일

**위치**: `apps/my-app/auth.d.ts`

```typescript
import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

export type AuthProvider = 'kakao' | 'google' | 'credentials';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider?: AuthProvider;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id?: string;
    provider?: AuthProvider;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: AuthProvider;
    user?: {
      id: string;
      provider?: AuthProvider;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
```

### 사용 예시

```typescript
// ✅ 타입 안전한 사용
const session = await auth();
if (session?.user) {
  const userId = session.user.id; // 타입 안전
  const provider = session.user.provider; // 타입 안전
}
```

---

## 핵심 원칙

1. **파일명 주의**: `auth.d.ts` 사용 (모듈 이름과 동일한 파일명 피하기)
2. **Interface만 확장**: 함수나 변수 타입은 변경하지 않음
3. **타입 단언 최소화**: 필요한 경우에만 사용
4. **서버/클라이언트 구분**: 각 환경에 맞는 함수 사용

---

## 관련 문서

- [TypeScript 모듈 확장 컨셉](./typescript-module-augmentation.md)
- [타입 오류 패턴](../type-errors.md)
- [NextAuth v5 타입 확장 문제 및 해결](../../../apps/my-app/docs/DEVLOG_2025-12-24_NEXTAUTH_TYPE_AUGMENTATION_ISSUE.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-24

