# 빌드 오류 해결 시도 및 결과 로그 - 2025-12-15

## 📅 날짜
2025-12-15

## 🎯 목표
Prisma 7.1.0 업데이트 후 발생한 빌드 오류 해결

---

## 📋 시도 및 결과 상세 로그

### 시도 1: Prisma 스키마 파일 업데이트
**시간**: 2025-12-15 오전
**목표**: Prisma 7.1.0 요구사항에 맞게 스키마 파일 수정

**작업 내용**:
- `prisma/schema.prisma`에서 `url`과 `directUrl` 제거
- `datasource` 블록을 최소화

**결과**: ✅ **성공**
- Prisma CLI 오류 해결
- `prisma generate` 명령 실행 성공

**오류 메시지 (이전)**:
```
Error: The datasource property `url` is no longer supported in schema files.
Error: The datasource property `directUrl` is no longer supported in schema files.
```

---

### 시도 2: prisma.config.ts 파일 생성
**시간**: 2025-12-15 오전
**목표**: Prisma 7.1.0의 새로운 설정 방식 적용

**작업 내용**:
- `apps/my-app/prisma.config.ts` 파일 생성
- `defineConfig`를 사용한 설정 작성

**초기 시도**:
```typescript
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_URL'),
  },
});
```

**결과**: ❌ **실패**
- 오류: `Missing required environment variable: DATABASE_URL`
- 원인: `env()` 함수가 빌드 시 환경 변수를 찾지 못함

**수정 시도 1**:
```typescript
import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || '',
    directUrl: process.env.DIRECT_URL,
  },
});
```

**결과**: ⚠️ **부분 성공**
- 타입 오류: `Type 'string | undefined' is not assignable to type 'string'`
- `directUrl`이 존재하지 않음 (`shadowDatabaseUrl`로 변경 필요)

**수정 시도 2**:
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

**결과**: ✅ **성공**
- 타입 오류 해결
- Prisma CLI가 설정 파일을 인식

---

### 시도 3: PrismaClient adapter 설정
**시간**: 2025-12-15 오전
**목표**: Prisma 7.1.0 요구사항에 맞게 adapter 추가

**초기 시도**: adapter 없이 사용
**결과**: ❌ **실패**
```
Error [PrismaClientConstructorValidationError]: 
Using engine type "client" requires either "adapter" or "accelerateUrl" 
to be provided to PrismaClient constructor.
```

**시도 1**: `@prisma/adapter-postgresql` 패키지 설치 시도
**결과**: ❌ **실패**
```
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/@prisma%2Fadapter-postgresql: Not Found - 404
```

**시도 2**: `@prisma/adapter-pg` 패키지 설치
**결과**: ✅ **성공**
- 패키지 설치 완료
- `pg` 패키지도 함께 설치

**시도 3**: adapter 추가
```typescript
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ 
  connectionString: optimizeDatabaseUrl(process.env.DATABASE_URL) 
})

export const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})
```

**결과**: ⚠️ **부분 성공**
- 타입 오류 해결
- 빌드 시 PrismaClient 초기화 오류 발생

**오류 메시지**:
```
Error [PrismaClientInitializationError]: 
`PrismaClient` needs to be constructed with a non-empty, valid `PrismaClientOptions`
```

**시도 4**: 조건부 adapter 생성
```typescript
const getAdapter = () => {
  if (process.env.DATABASE_URL) {
    return new PrismaPg({ 
      connectionString: optimizeDatabaseUrl(process.env.DATABASE_URL) 
    })
  }
  return undefined
}

export const prisma = new PrismaClient({
  adapter: getAdapter(),
})
```

**결과**: ❌ **실패**
- `adapter`는 필수이므로 `undefined` 불가

**시도 5**: 더미 connectionString 사용
```typescript
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
    ? optimizeDatabaseUrl(process.env.DATABASE_URL)
    : 'postgresql://localhost:5432/dummy'
})
```

**결과**: ⚠️ **진행 중**
- 빌드 시 PrismaClient 초기화 오류 여전히 발생
- 실제 연결은 런타임에 이루어지므로 빌드 시 더미 URL 사용 가능할 것으로 예상

---

### 시도 4: TypeScript 경로 매핑 설정
**시간**: 2025-12-15 오전
**목표**: workspace 패키지 모듈 해석 개선

**문제 1**: `@hua-labs/utils` 모듈을 찾을 수 없음
**시도**: 경로 매핑 추가
```json
{
  "paths": {
    "@hua-labs/utils": ["../../packages/hua-utils/dist"]
  }
}
```
**결과**: ✅ **성공**

**문제 2**: `@hua-labs/ui/advanced` 모듈을 찾을 수 없음
**시도**: 서브패키지 경로 매핑 추가
```json
{
  "paths": {
    "@hua-labs/ui/advanced": ["../../packages/hua-ui/dist/advanced"],
    "@hua-labs/ui/advanced/dashboard": ["../../packages/hua-ui/src/advanced/dashboard"],
    "@hua-labs/ui/advanced/motion": ["../../packages/hua-ui/src/advanced/motion"]
  }
}
```
**결과**: ✅ **성공**

**문제 3**: `moduleResolution` 설정
**시도 1**: `moduleResolution: "bundler"`로 변경
**결과**: ⚠️ **부분 성공** - 서브패키지 해석 개선, 표준 패키지 해석 문제

**시도 2**: `moduleResolution: "node"`로 되돌림 + 경로 매핑 유지
**결과**: ✅ **성공** - 모든 모듈 해석 성공

---

### 시도 5: useToast 타입 문제 해결
**시간**: 2025-12-15 오전
**목표**: TypeScript 타입 오류 해결

**문제**:
```
Type error: This expression is not callable.
Type 'never' has no call signatures.
```

**원인**: `useToast` 함수의 반환 타입이 명시되지 않아 `never`로 추론됨

**시도**: 명시적 반환 타입 추가
```typescript
export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
```

**결과**: ✅ **성공**
- 타입 오류 해결
- 타입 선언 파일 재생성 완료

---

### 시도 6: i18n-test 빌드 설정 수정
**시간**: 2025-12-15 오전
**목표**: Turbopack 빌드 오류 해결

**문제**:
```
Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
```

**시도**: 빌드 스크립트에 `--webpack` 플래그 추가
```json
{
  "scripts": {
    "build": "next build --webpack"
  }
}
```

**결과**: ✅ **성공**
- Google Fonts 로딩 오류 해결
- 빌드 성공

---

### 시도 7: turbo.json 빌드 출력 설정
**시간**: 2025-12-15 오전
**목표**: 빌드 경고 메시지 해결

**문제**:
```
WARNING  no output files found for task @hua-labs/i18n-ai#build
WARNING  no output files found for task @hua-labs/i18n-plugins#build
```

**시도**: 누락된 빌드 출력 설정 추가
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

**결과**: ✅ **성공**
- 경고 메시지 해결

---

## 📊 최종 상태

### ✅ 해결된 문제
1. Prisma 스키마 파일 오류
2. prisma.config.ts 설정
3. TypeScript 모듈 해석 문제
4. useToast 타입 문제
5. i18n-test 빌드 오류
6. turbo.json 경고
7. **PrismaClient 빌드 시 초기화 오류** ✅ (시도 13에서 해결)

### ✅ 최종 해결된 문제
1. **PrismaClient 빌드 시 초기화 오류** ✅
   - **원인**: 여러 파일에서 `new PrismaClient()`를 직접 생성하여 빌드 시 초기화 시도
   - **해결**: 모든 파일에서 싱글톤 `prisma`를 import하도록 변경
   - **결과**: 빌드 성공!

### 시도 8: Lazy Initialization 패턴 적용 (제안된 해결책)
**시간**: 2025-12-15 오후
**목표**: PrismaClient를 지연 초기화하여 빌드 시 DB 연결 시도 방지

**문제**: 파일 최상단에서 `new PrismaPg()`와 `new PrismaClient()`가 즉시 실행되어 빌드 시 DB 연결 시도

**시도**: Lazy Initialization 패턴 적용
```typescript
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL 
    ? optimizeDatabaseUrl(process.env.DATABASE_URL)
    : 'postgresql://localhost:5432/dummy?connection_limit=1'
  
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter, log: [...] })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()
export { prisma }
```

**결과**: ⚠️ **진행 중** - 코드 수정 완료, 빌드 테스트 필요

### 시도 9: turbo.json globalEnv 추가
**시간**: 2025-12-15 오후
**목표**: TurboRepo가 빌드 시 DATABASE_URL 환경 변수를 전달하도록 설정

**시도**: `globalEnv`에 DATABASE_URL 추가
```json
{
  "globalEnv": ["DATABASE_URL", "NODE_ENV", "DIRECT_URL"]
}
```

**결과**: ✅ **완료** - 설정 추가 완료

### 시도 10: next.config.ts serverComponentsExternalPackages 추가
**시간**: 2025-12-15 오후
**목표**: Prisma 관련 패키지를 서버 컴포넌트 외부 패키지로 설정하여 빌드 시 번들링 방지

**시도**: `experimental.serverComponentsExternalPackages` 추가
```typescript
experimental: {
  serverComponentsExternalPackages: [
    '@prisma/client',
    'prisma',
    '@prisma/adapter-pg',
    'pg',
  ],
}
```

**결과**: ✅ **완료** - 설정 추가 완료

### 시도 11: 환경 변수 로드 전략 확인 (Doppler + Vercel Secrets)
**시간**: 2025-12-15 오후
**목표**: 로컬(Doppler)과 배포(Vercel Secrets) 환경 변수 로드 확인

**현재 상황**:
- **로컬 개발**: Doppler 사용 (`doppler run -- <command>`)
- **Vercel 배포**: Vercel Secrets 사용 (환경 변수 직접 설정)

**확인 사항**:
1. `turbo.json`의 `globalEnv`에 `DATABASE_URL` 포함됨 ✅
2. `turbo.json`의 `tasks.build.env`에 `DATABASE_URL` 포함됨 ✅
3. `vercel.json`에 환경 변수 설정 없음 (Vercel 대시보드에서 직접 관리)

**문제 가능성**:
- Vercel 빌드 시 환경 변수가 `turbo.json`의 `env` 리스트에 포함되어 있지만, 실제로 전달되지 않을 수 있음
- Next.js 빌드 프로세스에서 환경 변수 로드 타이밍 문제

**해결 방안**:
1. Vercel 대시보드에서 `DATABASE_URL`이 Production, Preview, Development 환경 모두에 설정되어 있는지 확인
2. `vercel.json`에 빌드 시 환경 변수 명시적 설정 추가 고려
3. 빌드 로그에서 환경 변수 로드 여부 확인

**결과**: ⚠️ **조사 필요** - Vercel 환경 변수 설정 확인 필요

### 시도 12: Turbopack vs Webpack 빌드 차이 확인
**시간**: 2025-12-15 오후
**목표**: Turbopack이 빌드 오류의 원인인지 확인

**관찰**:
- `i18n-test` 앱에서 Turbopack 빌드 시 Google Fonts 오류 발생 → `--webpack` 플래그로 해결 ✅
- `my-app` 앱의 빌드 스크립트 확인 필요

**현재 상태**:
- `apps/my-app/package.json`: `"build": "prisma generate --schema=./prisma/schema.prisma && next build --webpack"`
- 이미 `--webpack` 플래그가 설정되어 있음 ✅

**분석**:
- `my-app`는 이미 webpack을 사용하도록 설정되어 있음
- 하지만 빌드 오류가 여전히 발생한다는 것은:
  1. Turbopack이 문제가 아닐 수 있음
  2. 또는 다른 설정에서 Turbopack이 사용되고 있을 수 있음
  3. 또는 PrismaClient 초기화 문제가 Turbopack과 무관할 수 있음

**확인 필요**:
- Vercel 빌드 시 실제로 webpack이 사용되는지 확인
- `next.config.ts`에서 Turbopack 관련 설정 확인
- 빌드 로그에서 실제 빌드 도구 확인

**결과**: ⚠️ **분석 중** - 이미 webpack 설정되어 있으나 빌드 오류 지속

### 시도 13: 모든 파일에서 PrismaClient 싱글톤 사용으로 통일
**시간**: 2025-12-15 오후
**목표**: 여러 파일에서 `new PrismaClient()`를 직접 생성하는 문제 해결

**문제 발견**:
- 빌드 로그에서 여러 경로에서 PrismaClient 초기화 오류 발생
- `/api/admin/crisis-alerts/[id]`, `/api/billing`, `/api/auth/register`, `/api/diary/create`, `/api/quota`, `/api/user/migrate-guest-diaries`, `/api/hua-emotion-analysis` 등
- 원인: 여러 파일에서 `new PrismaClient()`를 직접 생성하여 빌드 시 초기화 시도

**수정한 파일들**:
1. `billing.ts`: `new PrismaClient()` → `import { prisma } from './prisma'`
2. `analysis-query-helpers.ts`: `new PrismaClient()` → `import { prisma } from './prisma'`
3. `crisis-detection-service.ts`: `new PrismaClient()` → `import { prisma } from './prisma'` (또한 `$disconnect()` 제거)
4. `analysis-service.ts`: `new PrismaClient()` → `import { prisma } from './prisma'` (또한 `export { prisma }` 제거)
5. `concurrent-limit.ts`: `new PrismaClient()` → `import { prisma } from './prisma'`
6. `rate-limit.ts`: `new PrismaClient()` → `import { prisma } from './prisma'`
7. `quota.ts`: `new PrismaClient()` → `import { prisma } from './prisma'`
8. `quota-store/db-quota-store.ts`: `new PrismaClient()` → `import { prisma } from '../prisma'`
9. `guest-migration.ts`: `new PrismaClient()` → `import { prisma } from './prisma'`
10. `guest-migration-improved.ts`: `new PrismaClient()` → `import { prisma } from './prisma'`
11. `guest-utils.ts`: `new PrismaClient()` → `import { prisma } from './prisma'`

**추가 수정**:
- `next.config.ts`: `experimental.serverComponentsExternalPackages` → `serverExternalPackages` (Next.js 16에서 deprecated)

**결과**: ✅ **성공** - 빌드 성공!

### 📝 다음 시도 계획
1. 빌드 시 환경 변수 로드 확인
2. PrismaClient 초기화 지연 방법 검토
3. Prisma Accelerate 사용 검토
4. Next.js 빌드 프로세스에서 PrismaClient 초기화 시점 확인
5. **추가**: `/api/admin/crisis-alerts/[id]` 경로에서 발생하는 오류 상세 분석

---

## 🔍 기술적 세부사항

### Prisma 7.1.0 주요 변경사항
1. **스키마 파일에서 연결 정보 제거**
   - `url`, `directUrl` 속성 제거
   - `prisma.config.ts`로 이동

2. **PrismaClient adapter 필수**
   - 직접 DB 연결: `@prisma/adapter-pg` 사용
   - Prisma Accelerate: `accelerateUrl` 사용

3. **환경 변수 관리**
   - `prisma.config.ts`에서 `process.env` 직접 사용
   - `env()` 함수는 사용하지 않음

### TypeScript 경로 매핑 전략
- **기본 패키지**: `node_modules`를 통한 해석 (moduleResolution: "node")
- **workspace 패키지**: 경로 매핑을 통한 직접 해석
- **서브패키지**: 각 서브패키지별 경로 매핑 추가

---

## 💡 교훈

1. **Prisma 7.1.0 마이그레이션**
   - 스키마 파일 변경은 간단하지만, PrismaClient 초기화 방식 변경이 복잡
   - 빌드 시 환경 변수 로드가 중요

2. **TypeScript 경로 매핑**
   - workspace 패키지는 명시적 경로 매핑이 필요
   - 서브패키지 export는 각각 경로 매핑 필요

3. **빌드 설정**
   - Turbopack은 개발 모드에 적합, 빌드는 webpack 사용 권장
   - turbo.json 설정은 모든 패키지에 대해 명시 필요

---

## 📚 참고 자료

- [Prisma 7.1.0 Release Notes](https://github.com/prisma/prisma/releases)
- [Prisma Client Constructor](https://pris.ly/d/client-constructor)
- [Prisma Config File](https://pris.ly/d/config-datasource)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
