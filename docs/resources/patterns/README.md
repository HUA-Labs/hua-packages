# 개발 패턴 가이드

**작성일**: 2025-12-06  
**목적**: 반복되는 작업과 오류 패턴을 정리하여 개발 효율성 향상

---

## 목차

### 기본 패턴
1. [빌드 오류 패턴](./build-errors.md)
2. [타입 오류 패턴](./type-errors.md)
3. [의존성 관리 패턴](./dependency-management.md)
4. [환경 설정 패턴](./environment-setup.md)
5. [코드 품질 패턴](./code-quality.md)
6. [배포 패턴](./deployment.md)
7. [Next.js 16 런타임 에러 패턴](./nextjs-runtime-errors.md)
8. [인증/인가 보안 패턴](./auth-security-patterns.md)

### 도메인별 패턴
9. [검증 패턴](./validation-patterns.md) - Zod 검증 패턴
10. [데이터베이스 패턴](./database-patterns.md) - DB 관련 패턴 (Race Condition, UUIDv7, Prisma 등)
11. [성능 최적화 패턴](./performance-patterns.md) - 성능 최적화 패턴 (Client-Side Search, 캐싱 등)
12. [보안 패턴](./security-patterns.md) - 보안 관련 패턴 (Sanitization, Rate Limiting 등)
13. [코드 구조 패턴](./code-organization-patterns.md) - 코드 구조 및 재사용성 패턴

### 컨셉 문서
14. [TypeScript 모듈 확장 컨셉](./concepts/typescript-module-augmentation.md) - 모듈 확장 개념
15. [NextAuth 타입 확장 컨셉](./concepts/nextauth-type-augmentation.md) - NextAuth 타입 확장 패턴

---

## 패턴 문서 작성 원칙

각 패턴 문서는 다음 구조를 따릅니다:

1. **문제 상황**: 어떤 문제가 발생했는지
2. **원인 분석**: 왜 발생했는지
3. **해결 방법**: 어떻게 해결했는지
4. **예방 방법**: 앞으로 어떻게 예방할 수 있는지
5. **관련 데브로그**: 참고할 수 있는 데브로그 링크

---

## 패턴 추가 가이드

새로운 패턴을 발견했을 때:

1. 해당 카테고리 문서에 추가
2. 데브로그 링크 추가
3. 해결 방법과 예방 방법 명시
4. 필요시 새 문서 생성

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-23

