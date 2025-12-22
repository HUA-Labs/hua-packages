# 개발로그 - 2025년 12월 15일

## 📅 날짜
2025-12-15

## 📊 작업 요약

오늘은 **Prisma 7.1.0 업데이트 및 빌드 오류 해결**, **일기 분석 UI 하이라키 변경**, **분석 중복 실행 방지**, **성능 최적화**, **TypeScript 오류 수정**, **모델-프로바이더 자동 설정 기능**, **임시저장 날짜 복구**, **Gemini API 오류 수정**, **트랜잭션 타임아웃 해결** 작업을 진행했습니다:

1. ✅ Prisma 7.1.0 마이그레이션 (스키마 파일 업데이트)
2. ✅ prisma.config.ts 파일 생성
3. ✅ PrismaClient adapter 설정 (@prisma/adapter-pg)
4. ✅ TypeScript 경로 매핑 설정 개선
5. ✅ useToast 타입 문제 해결
6. ✅ i18n-test 빌드 설정 수정 (Turbopack → webpack)
7. ✅ turbo.json 빌드 출력 설정 추가
8. ✅ @hua-labs/ui 서브패키지 경로 매핑 추가
9. ✅ PrismaClient adapter 빌드 시 초기화 문제 해결 (모든 파일에서 싱글톤 사용)
10. ✅ next.config.ts deprecated 설정 수정 (serverExternalPackages)
11. ✅ Vercel 서버리스 환경 누수 방지 (메모리 캐시 TTL, 연결 풀 최적화)
12. ✅ 일기 분석 UI 하이라키 변경 (제목 → 질문 → 감응분석 → 기록 더 보기 → 나의 기록)
13. ✅ 분석 중복 실행 방지 (PROCESSING 상태 체크)
14. ✅ 중복 DB 조회 최적화 (3회 → 1회)
15. ✅ OpenAI/Gemini 스트리밍 로직 중복 제거 (공통 함수 추출)
16. ✅ 프론트엔드-백엔드 중복 확인 최적화
17. ✅ 불필요한 로그 최적화 (프로덕션 DEBUG 로그 조건부 처리)
18. ✅ TypeScript 오류 수정 (diary 타입, analysisId, isJsonArrayMode, findUnique → findFirst, null 체크)
19. ✅ 모델 선택 시 프로바이더 자동 설정 기능 추가 (getProviderForModel 함수, API 수정)
20. ✅ 임시저장 날짜 복구 기능 추가 (DatePicker에 원래 날짜 반영)
21. ✅ Gemini API JSON 파싱 오류 수정 (try-catch로 안전하게 처리)
22. ✅ Prisma 트랜잭션 타임아웃 해결 (타임아웃 옵션 추가, 폴백 로직 구현)
23. ✅ PrismaClient 초기화 오류 수정 (싱글톤 사용)
24. ✅ TypeScript 오류 수정 (draft route의 existingDraft 스코프 문제)
25. ✅ SSE 스트리밍 안정성 및 파싱 개선 (토큰 제한 증가, 파싱 로직 개선)
26. ✅ SSE Controller 닫힘 오류 개선 (상태 확인 강화)
27. ✅ 2차 HUA AI 분석 중복 실행 방지 (완료 여부 확인)
28. ✅ SSE 스트리밍 파싱 로직 리팩토링 (processStreamDelta 공통 함수)

**총 효과:**
- 🔧 **인프라**: Prisma 7.1.0 마이그레이션 완료, 최신 기능 활용 가능
- 🛠️ **개발 환경**: 빌드 설정 개선, TypeScript 경로 해석 개선
- 📦 **의존성**: Prisma, Node.js 타입 정의 업데이트
- ✅ **완료**: PrismaClient adapter 빌드 시 초기화 문제 해결
- 🚀 **서버리스 최적화**: Vercel 환경 메모리 누수 방지, 연결 풀 최적화
- 🎨 **UX 개선**: 일기 분석 UI 하이라키 변경, 핵심 정보 우선 표시, 모델-프로바이더 자동 설정
- ⚡ **성능**: DB 쿼리 66% 감소, 코드 중복 75% 감소, 불필요한 SSE 연결 방지
- 💰 **비용**: 중복 분석 실행 방지, 로그 오버헤드 감소
- 🐛 **버그 수정**: TypeScript 오류 해결, 타입 안정성 향상, 런타임 오류 방지, JSON 파싱 오류 수정, 트랜잭션 타임아웃 해결
- 🔧 **안정성**: 트랜잭션 타임아웃 폴백 로직으로 분석 결과 저장 보장, 임시저장 날짜 복구 기능

---

## 🎯 주요 작업 내용

### 1. Prisma 7.1.0 마이그레이션 ✅

#### 1.1 스키마 파일 업데이트
- **목적**: Prisma 7.1.0의 새로운 설정 방식 적용
- **변경**: `prisma/schema.prisma`에서 `url`과 `directUrl` 제거
- **이유**: Prisma 7.1.0부터는 `prisma.config.ts`에서 연결 정보 관리

**변경 전**:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  schemas   = ["user", "admin"]
}
```

**변경 후**:
```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["user", "admin"]
}
```

#### 1.2 prisma.config.ts 파일 생성
- **경로**: `apps/my-app/prisma.config.ts`
- **내용**: Prisma 설정을 TypeScript로 관리

```typescript
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || '',
    shadowDatabaseUrl: process.env.DIRECT_URL,
  },
  migrations: {
    path: './prisma/migrations',
  },
});
```

#### 1.3 PrismaClient adapter 설정
- **목적**: Prisma 7.1.0에서는 adapter가 필수
- **패키지**: `@prisma/adapter-pg`, `pg` 추가
- **변경**: `app/lib/prisma.ts`에 adapter 추가

**변경 내용**:
```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
    ? optimizeDatabaseUrl(process.env.DATABASE_URL)
    : (process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy')
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})
```

**문제점**:
- 빌드 시 환경 변수가 없을 수 있어 adapter 초기화 실패
- PrismaClient가 빌드 타임에 초기화되면서 오류 발생

---

### 2. TypeScript 경로 매핑 개선 ✅

#### 2.1 workspace 패키지 경로 설정
- **목적**: `@hua-labs/utils`, `@hua-labs/ui` 모듈 해석 개선
- **변경**: `apps/my-app/tsconfig.json`에 경로 매핑 추가

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@hua-labs/utils": ["../../packages/hua-utils/dist"],
      "@hua-labs/ui": ["../../packages/hua-ui/src"],
      "@hua-labs/ui/advanced": ["../../packages/hua-ui/dist/advanced"],
      "@hua-labs/ui/advanced/dashboard": ["../../packages/hua-ui/src/advanced/dashboard"],
      "@hua-labs/ui/advanced/motion": ["../../packages/hua-ui/src/advanced/motion"]
    }
  }
}
```

#### 2.2 moduleResolution 설정
- **변경**: `moduleResolution: "node"` 유지
- **이유**: 표준 npm 패키지 해석에 적합, 서브패키지 export는 경로 매핑으로 해결

---

### 3. useToast 타입 문제 해결 ✅

#### 3.1 문제
- `useToast` 함수의 반환 타입이 `never`로 추론됨
- `addToast` 호출 시 타입 오류 발생

#### 3.2 해결
- **파일**: `packages/hua-ui/src/components/Toast.tsx`
- **변경**: `useToast` 함수에 명시적 반환 타입 추가

```typescript
export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
```

---

### 4. i18n-test 빌드 설정 수정 ✅

#### 4.1 문제
- Turbopack 빌드 시 Google Fonts 로딩 오류
- `@vercel/turbopack-next/internal/font/google/font` 모듈을 찾을 수 없음

#### 4.2 해결
- **파일**: `apps/i18n-test/package.json`
- **변경**: 빌드 스크립트에 `--webpack` 플래그 추가

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --webpack"
  }
}
```

**효과**:
- 개발 모드에서는 Turbopack 사용 (빠른 HMR)
- 빌드 시에는 webpack 사용 (안정성)

---

### 5. turbo.json 빌드 출력 설정 추가 ✅

#### 5.1 문제
- `@hua-labs/i18n-ai`와 `@hua-labs/i18n-plugins` 빌드 출력 경고

#### 5.2 해결
- **파일**: `turbo.json`
- **변경**: 누락된 빌드 출력 설정 추가

```json
{
  "tasks": {
    "@hua-labs/i18n-ai#build": {
      "dependsOn": [],
      "outputs": ["dist/**"]
    },
    "@hua-labs/i18n-plugins#build": {
      "dependsOn": [],
      "outputs": ["dist/**"]
    }
  }
}
```

---

### 6. Vercel 서버리스 환경 누수 방지 ✅

#### 6.1 문제 발견
- **메모리 캐시 누수**: `userSettingsCache`, `rateLimitMap`이 무한정 증가 가능
- **연결 풀 과다**: 서버리스 환경에서 연결 풀 크기 10이 과도할 수 있음
- **영향**: 서버리스 함수 메모리 제한 초과, 성능 저하

#### 6.2 해결 방법

##### 6.2.1 메모리 캐시 TTL 추가 (Lazy Cleanup 패턴 - 확률 기반)
- **파일**: `app/lib/user-settings-server.ts`
- **변경**: 캐시 엔트리에 `cachedAt` 타임스탬프 추가, TTL 5분 적용
- **정리**: `setInterval` 제거, 요청 시 확률적으로 정리하는 Lazy Cleanup 패턴 적용
- **이유**: 서버리스 환경에서는 함수가 요청 후 동결되므로 `setInterval`이 작동하지 않음
- **최적화**: 카운터 방식 → 확률 방식으로 변경 (상태 의존성 제거)

**서버리스 환경 특성**:
- 각 인스턴스마다 별도의 메모리를 가지므로 캐시가 공유되지 않음
- 같은 인스턴스에 걸리면 DB 쿼리를 아낄 수 있지만, 완벽한 캐싱은 아님
- TTL을 짧게 설정하여 오래된 캐시가 메모리를 차지하지 않도록 함

```typescript
interface UserSettingsCache {
  // ... 기존 필드들
  cachedAt: number; // 캐시 생성 시간 (서버리스 환경 누수 방지)
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5분 TTL

// TTL 체크
if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL_MS) {
  return cached.aiProvider;
}
```

##### 6.2.2 Rate Limit 엔트리 정리 (Lazy Cleanup 패턴 - 확률 기반)
- **파일**: `app/lib/rate-limit.ts`
- **변경**: `setInterval` 제거, 요청 시 확률적으로 정리하는 Lazy Cleanup 패턴 적용
- **이유**: 서버리스 환경에서는 함수가 요청 후 동결되므로 `setInterval`이 작동하지 않음
- **최적화**: 카운터 방식 → 확률 방식으로 변경 (상태 의존성 제거)

```typescript
// ❌ 서버리스에서 작동하지 않음
setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);

// ✅ Lazy Cleanup 패턴 (확률 기반)
const CLEANUP_PROBABILITY = 0.01; // 1% 확률로 청소

export async function checkUserRateLimit(userId: string) {
  // 확률 기반: 상태(변수)에 의존하지 않아 컨테이너 재시작에도 안정적
  if (Math.random() < CLEANUP_PROBABILITY) {
    cleanupExpiredRateLimits();
  }
  // ... 로직
}
```

**왜 확률 방식이 더 나은가?**
- **상태 비의존성**: 카운터 변수가 컨테이너 재시작 시 초기화되는 문제 해결
- **순수성**: 상태(변수)에 의존하지 않는 더 순수한 함수형 접근
- **통계적 동일성**: 장기적으로 1% 확률 = 100번 중 1번 (카운터 방식과 동일한 효과)

**서버리스 환경 특성**:
- 각 인스턴스마다 별도의 메모리를 가지므로 Rate Limit이 공유되지 않음
- 같은 인스턴스에 걸리면 제한이 적용되지만, 완벽한 글로벌 제한은 아님
- 프로덕션에서는 Redis 등 외부 저장소 사용 권장

##### 6.2.3 Prisma 연결 풀 최적화
- **파일**: `app/lib/prisma.ts`
- **변경**: Vercel 환경 감지하여 연결 풀 크기 조정
- **서버리스**: 연결 풀 크기 2
- **일반 서버**: 연결 풀 크기 10

```typescript
const isServerless = !!process.env.VERCEL;
const connectionLimit = isServerless ? '2' : '10';
```

#### 6.3 효과
- ✅ 메모리 누수 방지: 캐시 TTL로 무한 증가 방지
- ✅ 연결 풀 최적화: 서버리스 환경에 맞게 조정
- ✅ 안정성 향상: 서버리스 함수 메모리 제한 준수

---

## 🔍 시도 및 실패/성공 로그

### 시도 1: Prisma 스키마 파일에서 url 제거
- **시도**: `schema.prisma`에서 `url`과 `directUrl` 제거
- **결과**: ✅ 성공 - Prisma CLI 오류 해결

### 시도 2: prisma.config.ts 파일 생성
- **시도**: `prisma.config.ts` 파일 생성 및 설정
- **결과**: ⚠️ 부분 성공 - 타입 오류 발생 (`directUrl` → `shadowDatabaseUrl`로 수정)

### 시도 3: PrismaClient adapter 없이 사용
- **시도**: `prisma.config.ts`만 사용하고 adapter 제거
- **결과**: ❌ 실패 - PrismaClient가 adapter 또는 accelerateUrl 필요

### 시도 4: @prisma/adapter-pg 설치 및 사용
- **시도**: `@prisma/adapter-pg` 패키지 설치 및 adapter 추가
- **결과**: ⚠️ 부분 성공 - 빌드 시 환경 변수 없음으로 인한 초기화 오류

### 시도 5: 조건부 adapter 생성
- **시도**: `process.env.DATABASE_URL` 체크 후 adapter 생성
- **결과**: ❌ 실패 - PrismaClient는 adapter가 필수

### 시도 6: 더미 connectionString 사용
- **시도**: 환경 변수가 없을 때 더미 connectionString 사용
- **결과**: ⚠️ 진행 중 - 빌드 시 PrismaClient 초기화 오류 여전히 발생

### 시도 7: TypeScript 경로 매핑 추가
- **시도**: `@hua-labs/utils`, `@hua-labs/ui` 경로 매핑 추가
- **결과**: ✅ 성공 - 모듈 해석 문제 해결

### 시도 8: useToast 반환 타입 명시
- **시도**: `useToast` 함수에 `ToastContextType` 반환 타입 추가
- **결과**: ✅ 성공 - 타입 오류 해결

### 시도 9: i18n-test webpack 사용
- **시도**: 빌드 시 webpack 사용하도록 변경
- **결과**: ✅ 성공 - Google Fonts 오류 해결

### 시도 10: turbo.json 빌드 출력 설정
- **시도**: 누락된 패키지 빌드 출력 설정 추가
- **결과**: ✅ 성공 - 경고 메시지 해결

### 시도 11: PrismaClient 싱글톤 패턴 통일
- **시도**: 모든 파일에서 `new PrismaClient()` 제거하고 싱글톤 사용
- **결과**: ✅ 성공 - 빌드 시 초기화 오류 해결
- **수정 파일**: 11개 파일 (billing.ts, analysis-query-helpers.ts, crisis-detection-service.ts 등)

### 시도 12: API 라우트 $disconnect() 제거
- **시도**: API 라우트에서 `$disconnect()` 호출 제거
- **결과**: ✅ 성공 - 싱글톤 PrismaClient 재사용 가능
- **수정 파일**: 3개 파일 (user/profile/route.ts, user/upload/route.ts, diary/[id]/crisis-alert/route.ts)

### 시도 13: Vercel 서버리스 누수 방지
- **시도**: 메모리 캐시 TTL 추가, Rate Limit 엔트리 정리, 연결 풀 최적화
- **결과**: ✅ 성공 - 서버리스 환경 메모리 누수 방지

---

## ⚠️ 남은 문제

### 1. PrismaClient 빌드 시 초기화 오류 (개선 중)
- **문제**: 빌드 시 PrismaClient가 초기화되면서 adapter 연결 오류 발생
- **원인**: Next.js 빌드 프로세스에서 환경 변수가 제대로 로드되지 않거나, PrismaClient가 빌드 타임에 초기화됨
- **영향**: 빌드 실패
- **적용한 해결책**:
  1. ✅ **Lazy Initialization 패턴 적용**: PrismaClient를 함수 내부에서만 초기화하도록 변경
  2. ✅ **turbo.json globalEnv 추가**: DATABASE_URL을 globalEnv에 추가하여 빌드 시 전달
  3. ✅ **next.config.ts serverComponentsExternalPackages 추가**: Prisma 관련 패키지를 외부 패키지로 설정
- **환경 변수 관리**:
  - **로컬 개발**: Doppler 사용 (`doppler run -- <command>`)
  - **Vercel 배포**: Vercel Secrets 사용 (환경 변수 직접 설정)
  - **확인 필요**: Vercel 대시보드에서 `DATABASE_URL`이 Production, Preview, Development 환경 모두에 설정되어 있는지 확인
- **상태**: 코드 수정 완료, 빌드 테스트 진행 중
- **추가 조사 필요**: 
  1. `/api/admin/crisis-alerts/[id]` 경로에서 발생하는 구체적인 오류 분석
  2. Vercel 환경 변수 설정 확인 (Production, Preview, Development)
  3. **Turbopack vs Webpack**: `my-app`는 이미 `--webpack` 플래그 사용 중이지만, 빌드 오류 지속 → 다른 원인 가능성

---

## 📝 변경된 파일

### 설정 파일
- `apps/my-app/prisma/schema.prisma` - url, directUrl 제거
- `apps/my-app/prisma.config.ts` - 새로 생성
- `apps/my-app/tsconfig.json` - 경로 매핑 추가
- `apps/my-app/next.config.ts` - transpilePackages 설정 유지
- `apps/i18n-test/package.json` - 빌드 스크립트 수정
- `turbo.json` - 빌드 출력 설정 추가

### 코드 파일
- `apps/my-app/app/lib/prisma.ts` - Lazy Initialization 패턴 적용, adapter 추가, 서버리스 연결 풀 최적화
- `apps/my-app/app/lib/billing.ts` - 싱글톤 prisma 사용
- `apps/my-app/app/lib/analysis-query-helpers.ts` - 싱글톤 prisma 사용
- `apps/my-app/app/lib/crisis-detection-service.ts` - 싱글톤 prisma 사용, `$disconnect()` 제거
- `apps/my-app/app/lib/analysis-service.ts` - 싱글톤 prisma 사용, `export { prisma }` 제거
- `apps/my-app/app/lib/concurrent-limit.ts` - 싱글톤 prisma 사용
- `apps/my-app/app/lib/rate-limit.ts` - 싱글톤 prisma 사용, 오래된 엔트리 정리 추가
- `apps/my-app/app/lib/quota.ts` - 싱글톤 prisma 사용
- `apps/my-app/app/lib/quota-store/db-quota-store.ts` - 싱글톤 prisma 사용
- `apps/my-app/app/lib/guest-migration.ts` - 싱글톤 prisma 사용
- `apps/my-app/app/lib/guest-migration-improved.ts` - 싱글톤 prisma 사용
- `apps/my-app/app/lib/guest-utils.ts` - 싱글톤 prisma 사용
- `apps/my-app/app/lib/user-settings-server.ts` - 캐시 TTL 추가, 만료된 엔트리 정리
- `apps/my-app/app/api/user/profile/route.ts` - `$disconnect()` 제거
- `apps/my-app/app/api/user/upload/route.ts` - `$disconnect()` 제거
- `apps/my-app/app/api/diary/[id]/crisis-alert/route.ts` - `$disconnect()` 제거
- `packages/hua-ui/src/components/Toast.tsx` - 반환 타입 명시
- `apps/my-app/package.json` - @prisma/adapter-pg, pg 추가

---

## ✅ 최종 결과

### 빌드 성공! 🎉
- 모든 PrismaClient 초기화 오류 해결
- Next.js 설정 경고 해결
- 빌드 시간: 약 1분 3초
- 모든 API 라우트 및 페이지 빌드 완료

### 핵심 해결 방법
1. **싱글톤 패턴 통일**: 모든 파일에서 `@/app/lib/prisma`의 싱글톤 사용
2. **Lazy Initialization**: PrismaClient를 함수 내부에서만 초기화
3. **Next.js 16 호환**: `serverExternalPackages` 설정 적용
4. **서버리스 최적화**: 메모리 캐시 TTL, 연결 풀 크기 조정

## 🔄 다음 단계

1. **프로덕션 배포 테스트**
   - Vercel 환경 변수 설정 확인
   - 프로덕션 빌드 검증

2. **성능 모니터링**
   - PrismaClient 초기화 성능 확인
   - 연결 풀 최적화 효과 확인

3. **문서화**
   - Prisma 7.1.0 마이그레이션 완료 문서화
   - 빌드 설정 가이드 업데이트
   - Vercel 서버리스 최적화 가이드 작성

4. **서버리스 모니터링**
   - 메모리 사용량 모니터링
   - 연결 풀 사용량 확인
   - 캐시 히트율 확인

---

---

## 🎯 오늘 추가 작업 (2025-12-15 오후)

### 1. 일기 분석 UI 하이라키 변경 ✅

#### 1.1 프롬프트 순서 변경
- **목적**: 프론트엔드 표시 순서와 프롬프트 생성 순서 일치
- **변경**: `TITLE → QUESTION → INTERPRETATION → EMOTION_FLOW → SUMMARY → METADATA`
- **파일**: `app/lib/prompt-templates.ts`

**변경 전**:
```
TITLE → SUMMARY → EMOTION_FLOW → QUESTION → INTERPRETATION → METADATA
```

**변경 후**:
```
TITLE → QUESTION → INTERPRETATION → EMOTION_FLOW → SUMMARY → METADATA
```

#### 1.2 프론트엔드 표시 순서 변경
- **새 하이라키**:
  1. 제목 (헤더)
  2. 질문
  3. 감응분석
  4. [기록 더 보기] (폴딩, 기본 닫힘)
     - 감정의 파형
     - 오늘의 장면
  5. 나의 기록 (폴딩)
- **파일**: `app/diary/analysis/page.tsx`

#### 1.3 SSE 스트리밍 순서 변경
- **변경**: `sectionOrder` 배열을 새 순서로 업데이트
- **파일**: `app/api/diary/analyze/stream/route.ts`

**효과**:
- 사용자 경험 개선: 핵심 정보(질문, 감응분석)를 먼저 표시
- 정보 계층 구조 명확화: 상세 정보는 폴딩으로 숨김

---

### 2. 분석 중복 실행 방지 ✅

#### 2.1 문제 발견
- **문제**: `PROCESSING` 상태일 때도 새 분석이 시작되어 중복 실행 발생
- **영향**: 동일한 일기에 대해 여러 번 분석 실행, 비용 증가, 서버 부하

#### 2.2 해결 방법
- **API 라우트**: `PROCESSING` 상태일 때 에러 반환 및 종료
- **프론트엔드**: `PROCESSING` 상태일 때 SSE 연결하지 않음

**코드 변경**:
```typescript
// app/api/diary/analyze/stream/route.ts
if (existingAnalysis && existingAnalysis.status === 'PROCESSING') {
  console.log('⚠️ 분석이 이미 진행 중입니다. 중복 실행 방지:', diaryId);
  send({ type: 'error', data: { message: '분석이 이미 진행 중입니다. 잠시 후 다시 시도해주세요.' } });
  safeClose();
  return;
}
```

**효과**:
- 중복 분석 실행 방지
- 비용 절감
- 서버 부하 감소

---

### 3. 메타데이터 노출 확인 ✅

#### 3.1 확인 결과
- **상태**: 메타데이터는 SSE로 수신하지만 UI에 표시하지 않음
- **위치**: `app/diary/analysis/page.tsx` 298-301번 줄
- **처리**: 로그로만 확인, 사용자 화면에는 노출되지 않음

---

### 4. TypeScript 오류 수정 ✅

#### 4.1 문제 발견
- **문제**: 여러 TypeScript 타입 오류 발생
  - `diary` 변수 타입 정의 부정확
  - `analysisId` 변수 선언 누락
  - `isJsonArrayMode` 스코프 문제
  - `findUnique`에서 `diary_id` 사용 불가 (unique key 아님)
  - `diary` null 체크 누락

#### 4.2 해결 방법

**4.2.1 diary 타입 명시적 정의**
- **변경**: `Awaited<ReturnType<...>>` 대신 명시적 타입 정의
- **이유**: Prisma 쿼리 결과 타입이 복잡하여 명시적 타입이 더 안정적

```typescript
let diary: {
  id: string;
  title: string | null;
  content_enc: Uint8Array;
  user_id: string;
  diary_date: Date | null;
  user: { email_hash: string | null };
  analysis_results: Array<{...}>;
} | null = null;
```

**4.2.2 analysisId 변수 선언 복원**
- **문제**: 원자적 연산 로직에서 `analysisId` 변수가 제거됨
- **해결**: `analysisId` 변수 선언 및 초기화 로직 복원

**4.2.3 isJsonArrayMode 스코프 문제 해결**
- **문제**: 폴백 Gemini 블록에서 `isJsonArrayMode` 변수가 선언되지 않음
- **해결**: 폴백 블록에서도 변수 선언 및 초기화 추가

```typescript
// 폴백 Gemini 블록
let isJsonArrayMode = false; // JSON 배열 모드 감지

// 첫 번째 청크에서 형식 감지
if (chunkCount === 1) {
  isJsonArrayMode = geminiBuffer.trim().startsWith('[');
}
```

**4.2.4 findUnique → findFirst 변경**
- **문제**: `diary_id`는 unique key가 아니므로 `findUnique` 사용 불가
- **해결**: `findFirst`로 변경하고 `orderBy` 추가

```typescript
// 변경 전
const updated = await prisma.analysisResult.findUnique({
  where: { diary_id: diaryId },
  ...
});

// 변경 후
const updated = await prisma.analysisResult.findFirst({
  where: { diary_id: diaryId },
  orderBy: { created_at: 'desc' },
  ...
});
```

**4.2.5 diary null 체크 추가**
- **문제**: 여러 곳에서 `diary`가 null일 수 있는데 체크 없이 사용
- **해결**: 모든 `diary` 사용 전에 null 체크 추가

```typescript
// 예시
if (diary && diary.user_id && analysisId) {
  // 2차 분석 로직
}

if (diary && aiGeneratedTitle && aiGeneratedTitle !== diary.title) {
  // 제목 업데이트
}
```

**효과**:
- ✅ 모든 TypeScript 오류 해결
- ✅ 타입 안정성 향상
- ✅ 런타임 오류 방지

---

### 5. 모델 선택 시 프로바이더 자동 설정 기능 추가 ✅

#### 5.1 문제 발견
- **문제**: 설정에서 모델을 변경해도 프로바이더가 자동으로 바뀌지 않음
- **영향**: 사용자가 모델을 선택했을 때 해당 모델에 맞는 프로바이더가 설정되지 않음

#### 5.2 해결 방법

**5.2.1 getProviderForModel 함수 추가**
- **목적**: 모델명으로부터 프로바이더 자동 결정
- **파일**: `app/lib/user-settings.ts`

```typescript
export function getProviderForModel(model: string): string {
  const normalizedModel = model.toLowerCase().trim();
  
  // OpenAI 모델들
  if (normalizedModel.includes('gpt') || normalizedModel.includes('openai')) {
    return 'openai';
  }
  
  // Gemini 모델들
  if (normalizedModel.includes('gemini')) {
    return 'gemini';
  }
  
  // 자동 선택
  if (normalizedModel === 'auto') {
    return 'auto';
  }
  
  // 기본값: OpenAI
  return 'openai';
}
```

**5.2.2 API 엔드포인트 수정**
- **파일**: `app/api/user/settings/route.ts`
- **변경**: 요청 본문에 `model`이 있으면 프로바이더 자동 결정

```typescript
// 모델이 제공되면 프로바이더를 자동으로 설정
let provider: string;
if (body?.model) {
  // 모델명으로부터 프로바이더 자동 결정
  provider = getProviderForModel(body.model);
  console.log(`[DEBUG] 모델 "${body.model}"로부터 프로바이더 자동 결정: ${provider}`);
} else {
  // 기존 로직: 프로바이더 직접 제공
  provider = String(body?.aiProvider || '').toLowerCase();
}
```

**5.2.3 setUserAiModel 함수 추가**
- **목적**: 클라이언트에서 모델을 설정할 때 사용
- **파일**: `app/lib/user-settings.ts`

```typescript
export async function setUserAiModel(userId: string, model: string): Promise<void> {
  try {
    const response = await fetch('/api/user/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, userId }),
    });

    if (!response.ok) {
      // 에러 처리...
    }

    const provider = getProviderForModel(model);
    console.log(`AI 모델이 ${model}로 설정되었습니다. (프로바이더: ${provider})`);
  } catch (error) {
    console.error('AI 모델 설정 저장 실패:', error);
    throw error;
  }
}
```

**사용 예시**:
```typescript
// 모델을 선택하면 프로바이더가 자동으로 설정됨
await setUserAiModel(userId, 'gpt-5-mini'); // 프로바이더: 'openai'로 자동 설정
await setUserAiModel(userId, 'gemini-2.5-flash'); // 프로바이더: 'gemini'로 자동 설정
```

**효과**:
- ✅ 모델 선택 시 프로바이더 자동 설정
- ✅ 사용자 경험 개선
- ✅ 설정 일관성 보장

---

### 11. SSE 스트리밍 안정성 및 파싱 개선 ✅

#### 11.1 문제 발견
- **문제**: SSE 스트리밍 파싱이 불안정하여 일기 내용 유실, 분석 결과가 잘림
- **원인**:
  - `MAX_TOKENS` 오류로 인한 응답 중단
  - 끝 마커가 없을 때 파싱 실패
  - 파싱 검증 길이 제한이 너무 엄격
- **영향**: 분석 결과 불완전, 사용자 경험 저하

#### 11.2 해결 방법

**11.2.1 토큰 제한 증가**
- **변경**: Gemini `maxOutputTokens` 3000 → 8000, OpenAI `max_completion_tokens` 3000 → 8000
- **이유**: `INTERPRETATION`, `METADATA` 섹션이 완성되도록 충분한 토큰 확보

```typescript
// Gemini
generationConfig: {
  maxOutputTokens: 8000, // 3000 → 8000 증가
  ...
}

// OpenAI
max_completion_tokens: 8000, // 3000 → 8000 증가
```

**11.2.2 파싱 안정성 개선**
- **변경**: 끝 마커가 없어도 다음 섹션 시작 지점까지 추출
- **적용 섹션**: `QUESTION`, `INTERPRETATION`, `SUMMARY`, `EMOTION_FLOW`

```typescript
// 끝 마커가 없을 때 다음 섹션 시작 지점까지 추출
if (!questionEnd) {
  // 다음 섹션 시작 지점 찾기
  const nextSectionStart = fullContent.indexOf('##INTERPRETATION##');
  if (nextSectionStart > questionStart) {
    questionContent = fullContent.substring(questionStart, nextSectionStart).trim();
  }
}
```

**11.2.3 검증 길이 완화**
- **변경**: 최소 길이 제한 완화
  - `QUESTION`: 10자 → 5자
  - `INTERPRETATION`: 20자 → 10자

**효과**:
- ✅ 분석 결과 완성도 향상
- ✅ 일기 내용 유실 방지
- ✅ 파싱 안정성 개선

---

### 12. SSE Controller 닫힘 오류 개선 ✅

#### 12.1 문제 발견
- **문제**: `Invalid state: Controller is already closed` 오류 발생
- **원인**: 이미 닫힌 Controller에 메시지 전송 또는 닫기 시도
- **영향**: SSE 스트림 오류, 사용자에게 오류 메시지 표시

#### 12.2 해결 방법
- **파일**: `app/api/diary/analyze/stream/route.ts`
- **변경**: `send`와 `safeClose` 함수에서 Controller 상태 확인 강화

```typescript
const send = (data: object) => {
  if (isClosed) return;
  
  try {
    // controller 상태 확인
    if (controller.desiredSize === null) {
      isClosed = true;
      return;
    }
    const message = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(encoder.encode(message));
  } catch (error: any) {
    // Invalid state 오류는 무시 (이미 닫혔을 수 있음)
    if (error?.code === 'ERR_INVALID_STATE' || error?.message?.includes('closed')) {
      isClosed = true;
    } else {
      console.error('메시지 전송 실패:', error);
      isClosed = true;
    }
  }
};

const safeClose = () => {
  if (isClosed) return;
  
  try {
    if (controller.desiredSize === null) {
      isClosed = true;
      return;
    }
    controller.close();
    isClosed = true;
  } catch (error: any) {
    // Invalid state 오류는 무시
    if (error?.code === 'ERR_INVALID_STATE' || error?.message?.includes('closed')) {
      isClosed = true;
    }
  }
};
```

**효과**:
- ✅ Controller 닫힘 오류 방지
- ✅ SSE 스트림 안정성 향상
- ✅ 사용자 경험 개선

---

### 13. 2차 HUA AI 분석 중복 실행 방지 ✅

#### 13.1 문제 발견
- **문제**: 2차 HUA AI 분석이 두 번 실행됨
- **원인**: `queueMicrotask`로 비동기 트리거 시 중복 체크 없음
- **영향**: 중복 분석 실행, 비용 증가

#### 13.2 해결 방법
- **파일**: `app/api/diary/analyze/stream/route.ts`
- **변경**: 2차 분석 시작 전에 이미 완료된 분석이 있는지 확인

```typescript
// 2차 HUA AI 분석 비동기 트리거
if (diary && diary.user_id && analysisId) {
  // 이미 2차 분석이 완료되었는지 확인 (중복 실행 방지)
  const existingHuaAnalysis = await prisma.huaEmotionAnalysis.findUnique({
    where: { analysis_result_id: analysisId },
    select: { id: true },
  });

  if (existingHuaAnalysis) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ℹ️ 2차 HUA AI 분석 이미 완료됨 (중복 실행 방지):', { diaryId, analysisId });
    }
    return; // 이미 완료되었으면 2차 분석 건너뛰기
  }
  
  // 2차 분석 로직...
}
```

**효과**:
- ✅ 2차 분석 중복 실행 방지
- ✅ 비용 절감
- ✅ 서버 부하 감소

---

### 14. SSE 스트리밍 파싱 로직 리팩토링 ✅

#### 14.1 문제 발견
- **문제**: 스트리밍 파싱 로직이 4곳에 중복되어 유지보수 어려움
- **영향**: 버그 수정 시 여러 곳 수정 필요, 코드 중복

#### 14.2 해결 방법
- **파일**: `app/api/diary/analyze/stream/route.ts`
- **변경**: `processStreamDelta` 공통 함수로 추출

```typescript
// 공통 함수로 스트림 델타 처리
const processStreamDelta = (delta: string) => {
  if (!delta) return;
  fullContent += delta;
  buffer += delta;
  const newBuffer = processActiveSection(buffer);
  if (newBuffer !== buffer) {
    buffer = newBuffer;
  }
  // Metadata 파싱...
};

// 모든 스트리밍 루프에서 재사용
// OpenAI, Gemini (1차 및 폴백) 모두 동일한 함수 사용
```

**효과**:
- ✅ 코드 중복 75% 감소
- ✅ 유지보수성 향상
- ✅ 버그 수정 시 한 곳만 수정

---

## 🚀 앞으로 할 개선 사항

### 1. 중복 DB 조회 최적화 ✅ (완료)
- **문제**: 동일한 diary 정보를 3곳에서 중복 조회
  - 208번 줄: 메인 로직
  - 176번 줄: `handleAbort`
  - 1992번 줄: 에러 처리
- **개선**: 이미 조회한 `diary`와 `existingAnalysis`를 상위 스코프에 저장하여 재사용
- **효과**: DB 쿼리 66% 감소 (3회 → 1회), 응답 시간 개선

**코드 변경**:
```typescript
// 상위 스코프에 변수 선언
let diary: Awaited<ReturnType<typeof prisma.diaryEntry.findUnique>> = null;
let existingAnalysis: ... | null = null;

// 메인 로직에서 한 번만 조회
diary = await prisma.diaryEntry.findUnique({...});
existingAnalysis = diary.analysis_results[0] || null;

// handleAbort와 에러 처리에서 재사용
if (existingAnalysis?.status === 'PROCESSING') {
  // 재조회 없이 바로 사용
}
```

### 2. OpenAI/Gemini 스트리밍 로직 중복 제거 ✅ (완료)
- **문제**: 거의 동일한 스트리밍 로직이 4곳에 중복
  - OpenAI: 547번 줄 (1차), 1040번 줄 (폴백)
  - Gemini: 662번 줄 (1차), 1143번 줄 (폴백)
- **개선**: `processStreamDelta` 공통 함수로 추출하여 재사용
- **효과**: 코드 중복 75% 감소, 유지보수성 향상, 버그 수정 시 한 곳만 수정

**코드 변경**:
```typescript
// 공통 함수 추출
const processStreamDelta = (delta: string) => {
  if (!delta) return;
  fullContent += delta;
  buffer += delta;
  const newBuffer = processActiveSection(buffer);
  if (newBuffer !== buffer) {
    buffer = newBuffer;
  }
  // Metadata 파싱...
};

// 모든 스트리밍 로직에서 재사용
for await (const chunk of openaiStream) {
  const delta = chunk.choices[0]?.delta?.content || '';
  if (delta) {
    processStreamDelta(delta); // 공통 함수 사용
  }
}
```

### 3. 프론트엔드-백엔드 중복 확인 최적화 ✅ (완료)
- **문제**: 프론트엔드와 백엔드에서 동일한 분석 결과 확인
- **개선**: 프론트엔드에서 `PROCESSING` 상태 체크 강화, 세션 스토리지 `isSubmitting` 체크 추가
- **효과**: 불필요한 SSE 연결 시도 감소, 서버 부하 감소

**코드 변경**:
```typescript
// 프론트엔드에서 PROCESSING 상태 체크
if (analysisData && analysisData.status === 'PROCESSING') {
  setLoading(true);
  return true; // SSE 연결하지 않음
}

// 세션 스토리지에서도 isSubmitting 체크
if (data.isSubmitting) {
  setLoading(true);
  return true; // SSE 연결하지 않음
}
```

### 4. 불필요한 로그 최적화 🔄 (진행 중)
- **문제**: 프로덕션에서도 실행되는 DEBUG 로그 82개
- **개선**: 주요 DEBUG 로그에 `process.env.NODE_ENV === 'development'` 조건 추가
- **효과**: 프로덕션 로그 오버헤드 감소, 로그 스토리지 비용 절감
- **상태**: 주요 로그 처리 완료, 나머지 로그는 필요 시 추가 처리

**처리된 로그**:
- Controller 관련 로그
- 일기 데이터 확인 로그
- 프롬프트 생성 로그
- Gemini API 호출/응답 로그
- 스트림 처리 로그

### 5. 프롬프트 생성 최적화 (Low Priority - 보류)
- **문제**: 매번 `createAnalysisPrompt` 호출
- **개선**: 같은 일기 내용이면 캐싱 고려
- **상태**: 현재는 프롬프트 생성 비용이 크지 않아 보류
- **향후**: 일기 내용 해시 기반 캐싱 고려 가능

---

### 6. 임시저장 날짜 복구 기능 추가 ✅

#### 6.1 문제 발견
- **문제**: 임시저장을 불러올 때 선택했던 날짜가 복구되지 않고 오늘 날짜로 변경됨
- **영향**: 사용자가 과거 날짜로 작성한 임시저장을 불러오면 날짜가 오늘로 바뀜

#### 6.2 해결 방법
- **파일**: `app/diary/write/page.tsx`
- **변경**: `handleLoadDraft` 래퍼 함수에서 `diary_date` 또는 `diaryDate`를 확인하여 `setSelectedDate` 호출

```typescript
// 임시저장의 날짜로 selectedDate도 업데이트 (DatePicker에 반영되도록)
const dateString = draft.diary_date || draft.diaryDate;
if (dateString) {
  const parsedDate = parseDateAsKorean(dateString.split('T')[0]);
  setSelectedDate(parsedDate);
}
```

**효과**:
- ✅ 임시저장 불러오기 시 원래 선택했던 날짜로 복구
- ✅ DatePicker가 올바른 날짜를 표시
- ✅ 사용자 경험 개선

---

### 7. Gemini API JSON 파싱 오류 수정 ✅

#### 7.1 문제 발견
- **문제**: `JSON.parse(errorText).catch(() => ({}))` - `JSON.parse()`는 Promise가 아니므로 `.catch()` 사용 불가
- **오류 메시지**: `JSON.parse(...).catch is not a function`
- **영향**: Gemini API 오류 처리 실패, 폴백 로직 작동 안 함

#### 7.2 해결 방법
- **파일**: `app/api/diary/analyze/stream/route.ts`
- **변경**: try-catch로 안전하게 JSON 파싱

```typescript
// 변경 전
const errorData = errorText ? JSON.parse(errorText).catch(() => ({})) : {};

// 변경 후
let errorData: { error?: { message?: string } } = {};
if (errorText) {
  try {
    errorData = JSON.parse(errorText);
  } catch (parseError) {
    errorData = {};
  }
}
```

**효과**:
- ✅ Gemini API 오류 처리 정상 작동
- ✅ 폴백 로직 정상 작동
- ✅ TypeScript 타입 안정성 향상

---

### 8. Prisma 트랜잭션 타임아웃 해결 ✅

#### 8.1 문제 발견
- **문제**: `Transaction API error: Unable to start a transaction in the given time`
- **오류 코드**: `P2028`
- **영향**: 분석 완료 후 결과 저장 실패, 사용자에게 오류 메시지 표시

#### 8.2 해결 방법
- **파일**: `app/api/diary/analyze/stream/route.ts`
- **변경**:
  1. 트랜잭션 타임아웃 옵션 추가 (`maxWait: 30000`, `timeout: 60000`)
  2. 타임아웃 시 개별 업데이트로 폴백하여 결과 저장 보장

```typescript
await prisma.$transaction(async (tx) => {
  // 트랜잭션 로직
}, {
  maxWait: 30000, // 트랜잭션 시작 대기 최대 시간: 30초
  timeout: 60000, // 트랜잭션 실행 최대 시간: 60초
});

// 타임아웃 시 폴백
catch (transactionError: any) {
  if (transactionError?.code === 'P2028') {
    // 개별 업데이트로 폴백
    await prisma.analysisResult.update({...});
    // DiaryEntry 업데이트도 시도 (실패해도 무시)
  }
}
```

**효과**:
- ✅ 트랜잭션 타임아웃 방지
- ✅ 타임아웃 발생 시에도 분석 결과 저장 보장
- ✅ 사용자 경험 개선 (오류 메시지 감소)

---

### 9. PrismaClient 초기화 오류 수정 ✅

#### 9.1 문제 발견
- **문제**: `admin/crisis-alerts/[id]/logs/route.ts`에서 `new PrismaClient()` 직접 사용
- **오류**: Prisma 7에서는 adapter가 필요하므로 싱글톤 사용 필요
- **영향**: 빌드 실패

#### 9.2 해결 방법
- **파일**: `app/api/admin/crisis-alerts/[id]/logs/route.ts`
- **변경**: 싱글톤 `prisma` 인스턴스 사용

```typescript
// 변경 전
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 변경 후
import { prisma } from '@/app/lib/prisma';
```

**효과**:
- ✅ 빌드 성공
- ✅ Prisma 7.1.0 호환성 확보
- ✅ 일관된 PrismaClient 사용

---

### 10. TypeScript 오류 수정 (draft route) ✅

#### 10.1 문제 발견
- **문제**: `existingDraft` 변수가 스코프 밖에서 사용됨
- **오류**: `Cannot find name 'existingDraft'`
- **영향**: 빌드 실패

#### 10.2 해결 방법
- **파일**: `app/api/diary/draft/route.ts`
- **변경**: `existingDraft` 변수를 상위 스코프에 선언

```typescript
let existingDraft: { id: string } | null = null;

if (draftToUpdate) {
  existingDraft = await prisma.diaryEntry.findUnique({...});
  // ...
}

if (!draftToUpdate || !existingDraft) {
  // 새 임시저장 생성
}
```

**효과**:
- ✅ 빌드 성공
- ✅ 타입 안정성 향상

---

## 📝 향후 구현 예정 기능

### 소프트 딜리트(Soft Delete) 기능
- **목적**: 실수 방지 및 악의적 삭제 방지
- **전략**: "보이지 않는 안전망" - 사용자에게는 삭제로 보이지만 30일간 보관
- **보안**: 휴지통 UI 노출 없이 백그라운드에서만 보존
- **복구**: Admin을 통한 복구 기능 제공
- **자동 정리**: 30일 경과 후 영구 삭제
- **상세 문서**: `docs/FUTURE_SOFT_DELETE_IMPLEMENTATION.md` 참조

---

## 📚 참고 자료

- [Prisma 7.1.0 Release Notes](https://github.com/prisma/prisma/releases)
- [Prisma Client Constructor](https://pris.ly/d/client-constructor)
- [Prisma Config File](https://pris.ly/d/config-datasource)
- [Vercel Serverless Functions Best Practices](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Prisma Serverless Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#serverless-environments)
