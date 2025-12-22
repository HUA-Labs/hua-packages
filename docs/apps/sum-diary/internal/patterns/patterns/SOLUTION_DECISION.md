# 해결책 의사결정 문서

**작성일**: 2025-12-11  
**목적**: Edge Runtime 문제 해결을 위한 의사결정

---

## 🔥 핵심 문제

**Turbo가 Edge Runtime 환경에서 실행되어 모든 명령어 spawn 실패**

### 증거

1. **모든 명령어가 실행 전 실패**
   - `node`, `tsc`, `tsx`, `bash`, `sh`, `.js` 스크립트 모두 실패
   - 실행 시간: 100-105ms (프로세스 spawn 실패)
   - 어떤 로그도 출력되지 않음

2. **28번의 시도 모두 동일한 패턴**
   - 경로 문제가 아니라 실행 환경 문제
   - Edge Runtime에는 실행 파일이 없음

3. **`middleware.ts` 존재**
   - Next.js에서 `middleware.ts`가 있으면 자동으로 Edge Runtime으로 분류
   - 이것이 Vercel이 Edge Runtime을 강제하는 주요 원인

---

## 🎯 해결책 비교

### 해결책 1: Vercel 대시보드에서 Output 모드 변경 (1순위) ✅

**방법**:
1. Vercel 대시보드 접속
2. Project Settings → Build & Development Settings
3. Output: 'Node.js' 선택
4. 재배포

**장점**:
- ✅ 가장 확실한 방법
- ✅ 공식 지원
- ✅ 즉시 적용 가능

**단점**:
- ⚠️ Vercel 대시보드에서 수동 설정 필요
- ⚠️ 코드로 관리 불가

**우선순위**: **1순위 (필수)**

---

### 해결책 2: vercel.json에 VERCEL_FORCE_NO_EDGE_RUNTIME 추가 (2순위) ✅

**방법**:
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && corepack pnpm exec turbo run build --filter=my-app",
  "build": {
    "env": {
      "VERCEL_FORCE_NO_EDGE_RUNTIME": "1"
    }
  }
}
```

**장점**:
- ✅ 코드로 관리 가능
- ✅ 빌드 단계에서 Node.js 환경 보장
- ✅ 대시보드 접근 없이도 가능

**단점**:
- ⚠️ 공식 문서에 없는 옵션 (이스터 에그)
- ⚠️ 장기적으로 지원되지 않을 수 있음

**우선순위**: **2순위 (권장)**

---

### 해결책 3: apps/my-app/package.json에 engines.node 추가 (3순위) ✅

**방법**:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**장점**:
- ✅ 코드로 관리 가능
- ✅ Vercel이 Node.js 런타임으로 추론하도록 유도

**단점**:
- ⚠️ `middleware.ts`가 있으면 여전히 Edge Runtime으로 설정될 수 있음
- ⚠️ 이것만으로는 부족할 가능성

**우선순위**: **3순위 (보조)**

---

### 해결책 4: middleware.ts 제거 또는 대체 (필수) 🔥

**핵심 문제**:
- Next.js는 `middleware.ts`가 존재하면 **프로젝트 전체를 Edge Runtime으로 자동 분류**
- Output Mode를 Node.js로 바꿔도, `engines.node`를 넣어도, `VERCEL_FORCE_NO_EDGE_RUNTIME`을 추가해도 **무효화됨**
- **middleware.ts가 있으면 Vercel이 강제로 Edge Runtime으로 분류**

**현재 middleware.ts 기능**:
1. 보안 스캐너/봇 차단 (민감한 파일 경로 접근 차단)
2. Rate Limiting (Redis 기반, 메모리 폴백)
3. 의심스러운 User-Agent 체크 (API 경로에서 봇 차단)
4. 인증 체크 (보호된 경로: `/diary/write`, `/diary/analysis`, `/profile`, `/admin`)
5. 관리자 권한 체크 (`/admin` 경로)

**선택지**:

#### 🔵 A안: middleware.ts 삭제 (권장)

**장점**:
- ✅ 가장 확실한 해결책
- ✅ 즉시 Edge Runtime 문제 해결
- ✅ 빌드 환경이 Node.js로 확실히 전환됨

**단점**:
- ⚠️ 보안 기능 손실 (보안 스캐너 차단, Rate Limiting 등)
- ⚠️ 각 페이지/API에서 인증 체크를 개별 구현 필요

**대체 방안**:
- 보안 스캐너 차단: `next.config.ts`의 `headers` 또는 `rewrites`로 일부 대체 가능
- Rate Limiting: 각 API route에서 처리 (예: `app/api/**/route.ts`)
- 인증 체크: 각 페이지/레이아웃에서 처리 (예: `app/diary/write/page.tsx`)
- 관리자 권한: 각 admin 페이지에서 처리

**권장**: **가능하면 이 방법 선택**

---

#### 🟡 B안: 기능을 API route 또는 Server Component로 이전

**방법**:
1. **Rate Limiting**: 각 API route에 미들웨어 함수로 추가
   ```typescript
   // app/lib/rate-limit-middleware.ts
   export async function checkRateLimit(req: NextRequest) { ... }
   ```
2. **인증 체크**: 각 보호된 페이지의 레이아웃에서 처리
   ```typescript
   // app/diary/write/layout.tsx
   export default async function Layout() {
     const session = await getServerSession();
     if (!session) redirect('/auth/login');
     return <>{children}</>;
   }
   ```
3. **보안 스캐너 차단**: `next.config.ts`의 `headers`로 처리
4. **User-Agent 체크**: 각 API route에서 처리

**장점**:
- ✅ 기능 유지 가능
- ✅ Node.js 환경에서 실행
- ✅ 더 세밀한 제어 가능

**단점**:
- ⚠️ 코드 변경량 많음
- ⚠️ 각 페이지/API에 개별 구현 필요
- ⚠️ Rate Limiting이 모든 요청에 적용되지 않음 (API route에만 적용)

**권장**: **기능이 필수적이고 삭제 불가능한 경우**

---

#### 🟠 C안: middleware를 극도로 최소화 (비권장)

**방법**:
- middleware.ts를 최소한의 기능만 남기기
- 예: 보안 스캐너 차단만 남기고 나머지 제거

**문제점**:
- ⚠️ **middleware.ts가 존재하기만 하면 Vercel이 Edge Runtime으로 분류**
- ⚠️ 내용이 최소화되어도 여전히 Edge Runtime 문제 발생
- ⚠️ spawn 문제는 계속됨

**결론**: **이 방법으로는 문제 해결 불가**

---

## 🎯 최종 의사결정

### 단계별 실행 계획

#### 1단계: Vercel 설정 변경 (필수)

**옵션 A: Vercel 대시보드에서 설정** (가장 확실)
- Project Settings → Build & Development Settings → Output: 'Node.js'

**옵션 B: vercel.json에 환경 변수 추가** (코드로 관리)
```json
{
  "build": {
    "env": {
      "VERCEL_FORCE_NO_EDGE_RUNTIME": "1"
    }
  }
}
```

**권장**: **옵션 A + 옵션 B 동시 적용**
- 옵션 A: 가장 확실한 방법
- 옵션 B: 코드로 관리 가능, 백업 역할

---

#### 2단계: package.json에 engines.node 추가 (보조)

**작업**:
- `apps/my-app/package.json`에 `engines.node` 추가

**이유**:
- Vercel이 Node.js 런타임으로 추론하도록 유도
- 추가 보험 역할

---

#### 3단계: middleware.ts 제거 또는 대체 (필수) 🔥

**⚠️ 중요**: 이 단계 없이는 1-2단계가 무효화됨

**선택지**:

**옵션 A: middleware.ts 삭제** (권장)
- 가장 확실한 해결책
- 기능을 다른 방식으로 대체 (각 페이지/API에서 처리)

**옵션 B: 기능을 API route/Server Component로 이전**
- 기능 유지하면서 Node.js 환경 사용
- 코드 변경량 많음

**권장**: **옵션 A 먼저 시도, 기능이 필수적이면 옵션 B**

**작업**:
- [ ] middleware.ts의 기능 분석
- [ ] 대체 방안 결정 (삭제 vs 이전)
- [ ] 대체 구현 (옵션 B 선택 시)
- [ ] middleware.ts 제거 또는 최소화

---

#### 4단계: 빌드 스크립트 정리 (환경 정상화 후)

**환경이 Node.js로 변경된 후에만 의미 있음**

**옵션 A**: `"build": "tsup && tsc --emitDeclarationOnly"`
- 성공 로그에서 확인된 패턴
- 가장 간단

**옵션 B**: `"build": "node ../../node_modules/tsx/dist/cli.mjs ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"`
- 절대 경로 사용
- PATH 문제 완전 우회

**권장**: **옵션 A 먼저 시도, 실패 시 옵션 B**

---

## 📋 실행 체크리스트

### 즉시 실행 (필수)

- [ ] Vercel 대시보드에서 Output을 'Node.js'로 변경
- [ ] `vercel.json`에 `VERCEL_FORCE_NO_EDGE_RUNTIME` 환경 변수 추가
- [ ] `apps/my-app/package.json`에 `engines.node` 추가
- [ ] **middleware.ts 제거 또는 대체** (이 단계 없이는 위 조치들이 무효화됨)
- [ ] 재배포

### 환경 정상화 확인 후

- [ ] 빌드 로그에서 Node.js 런타임 사용 확인
- [ ] 빌드 스크립트를 `tsup && tsc --emitDeclarationOnly`로 변경
- [ ] 재배포 및 성공 확인

---

## ⚠️ 중요 경고

**middleware.ts가 존재하면 Vercel이 강제로 Edge Runtime으로 분류합니다.**

다음 조치들만으로는 **문제 해결 불가**:
- ❌ Output Mode를 Node.js로 변경
- ❌ `engines.node` 추가
- ❌ `VERCEL_FORCE_NO_EDGE_RUNTIME` 환경 변수 추가

**반드시 middleware.ts를 제거하거나 대체해야 합니다.**

---

## 🔗 참고 자료

- [Edge Runtime 가설 검증](./EDGE_RUNTIME_HYPOTHESIS.md)
- [진단 체크리스트](./DIAGNOSIS_CHECKLIST.md)
- [Vercel 빌드 도구 실행 오류 해결](./vercel-build-tool-execution-error.md)

