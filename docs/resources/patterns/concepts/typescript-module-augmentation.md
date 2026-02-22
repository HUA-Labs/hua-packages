# TypeScript 모듈 확장 컨셉

**작성일**: 2025-12-24  
**목적**: TypeScript 모듈 확장의 개념과 올바른 사용 방법

---

## 개요

TypeScript의 `declare module`을 사용하여 기존 모듈의 타입을 확장할 수 있습니다. 하지만 잘못 사용하면 모듈 전체를 덮어쓰는 문제가 발생할 수 있습니다.

---

## 안전한 확장 방법

### Interface 확장 (안전) ✅

```typescript
// ✅ Interface만 확장 - 안전
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
  
  interface User {
    id?: string;
  }
}
```

**특징**:
- 기존 인터페이스에 속성 추가
- 함수나 변수 타입은 변경하지 않음
- 모듈의 다른 타입은 보존됨

### 잘못된 확장 (위험) ❌

```typescript
// ❌ 모듈 전체를 확장하면 함수 타입이 사라질 수 있음
declare module "next-auth" {
  // 이렇게 하면 NextAuth 함수의 타입이 사라질 수 있음
  export function NextAuth(config: any): any; // ❌ 위험!
}
```

---

## 주의사항

### 1. 파일명 주의

**문제**: `next-auth.d.ts` 파일명은 모듈 자체로 인식될 수 있음

```typescript
// ❌ 위험: next-auth.d.ts
declare module "next-auth" { ... }

// ✅ 안전: auth.d.ts
declare module "next-auth" { ... }
```

**이유**: `next-auth.d.ts`는 TypeScript가 `next-auth` 모듈 자체로 인식하여 실제 패키지를 가리지 못함

### 2. Interface만 확장

**원칙**: 
- ✅ Interface 확장은 안전
- ❌ 함수/변수 타입 변경은 위험

### 3. 타입 단언 최소화

**문제**: `as any` 사용으로 타입 안전성 손실

```typescript
// ❌ 타입 안전성 손실
const NextAuth = NextAuthLib as any;

// ✅ 원본 import 사용 (타입 확장이 올바르면 자동 추론)
import NextAuth from "next-auth";
```

---

## 실제 적용 사례

### NextAuth 타입 확장

**파일**: `apps/my-app/auth.d.ts`

```typescript
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
```

**사용**: `apps/my-app/app/lib/auth-v5.ts`

```typescript
// ✅ 올바른 사용
import NextAuth from "next-auth";

export const { auth, handlers } = NextAuth({
  // 타입이 자동으로 추론됨
});
```

---

## 핵심 원칙

1. **Interface만 확장**: 함수나 변수 타입은 변경하지 않음
2. **파일명 주의**: 모듈 이름과 동일한 파일명 피하기
3. **타입 단언 최소화**: `as any` 사용 지양
4. **검증**: 타입 확장 후 실제 사용 코드에서 타입 추론 확인

---

## 관련 문서

- [NextAuth 타입 확장 컨셉](./nextauth-type-augmentation.md)
- [타입 오류 패턴](../type-errors.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-24

