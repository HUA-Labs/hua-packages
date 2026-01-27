# Vercel 빌드 실패 이슈 - 2025-12-16

## 문제 상황

Vercel 배포 시 `prisma generate` 단계에서 빌드 실패:
```
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  my-app@0.1.0 build: `prisma generate --schema=./prisma/schema.prisma && next build --webpack`
Exit status 1
```

## 현재 상태

### 로컬 빌드
- ✅ 성공
- `prisma generate` 정상 작동
- Next.js 빌드 정상 작동

### Vercel 빌드
- ❌ 실패
- `prisma generate` 단계에서 실패
- 정확한 에러 메시지 없음 (로그 미출력)

## 시도한 해결 방법

### 1. DATABASE_URL 파싱 강화
- URL 문자열 정리 (공백, 따옴표, 줄바꿈 제거)
- 여러 URL 처리 (첫 번째만 사용)
- 프로토콜 확인
- 에러 처리 개선

### 2. 진짜 Lazy Initialization (Proxy 사용)
```typescript
const prisma = new Proxy({...}, {
  get(_target, prop) {
    // 실제 접근 시에만 초기화
  }
})
```

### 3. 빌드 타임 체크 추가
```typescript
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.NODE_ENV === 'production' && !process.env.VERCEL_RUNTIME;
```

## develop 브랜치와의 차이점

### develop 브랜치 (성공)
```typescript
const prisma = globalThis.prisma ?? prismaClientSingleton()
```
- 즉시 실행 방식
- Vercel 빌드 성공

### release/2025-12-16 브랜치 (실패)
```typescript
const prisma = new Proxy({...}, {
  get(_target, prop) { ... }
})
```
- Proxy를 사용한 진짜 Lazy Initialization
- Vercel 빌드 실패

## 가능한 원인

1. **Proxy가 Vercel 빌드 환경에서 문제 발생**
   - Next.js 빌드 과정에서 Proxy 평가 시 문제
   - TypeScript 컴파일 시 Proxy 타입 문제

2. **prisma.config.ts 평가 문제**
   - `prisma generate` 실행 시 `prisma.config.ts` 평가
   - 환경 변수 접근 시 문제

3. **Vercel 환경 변수 설정 문제**
   - DATABASE_URL이 올바르게 설정되지 않음
   - 또는 다른 환경 변수 문제

## 다음 단계 (확인 필요)

1. **Vercel 빌드 로그 확인**
   - 정확한 에러 메시지 확인
   - `prisma generate` 단계의 상세 로그 확인

2. **develop 브랜치 방식으로 롤백 검토**
   - Proxy 대신 즉시 실행 방식 사용
   - 빌드 타임에 안전하게 처리

3. **Prisma 설정 확인**
   - `prisma.config.ts`가 빌드 타임에 평가되는지 확인
   - 필요시 조건부 처리

4. **환경 변수 확인**
   - Vercel 프로젝트 설정에서 DATABASE_URL 확인
   - 빌드 타임 환경 변수 설정 확인

## 참고

- 로컬 빌드는 성공하므로 환경 차이 문제일 가능성 높음
- develop 브랜치는 성공하므로 해당 방식 참고 가능
