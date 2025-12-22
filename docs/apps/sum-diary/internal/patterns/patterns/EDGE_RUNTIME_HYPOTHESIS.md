# Edge Runtime 가설 검증

**작성일**: 2025-12-11  
**목적**: Turbo가 Edge Runtime 환경에서 실행되어 Node.js 바이너리가 없을 가능성 검증

---

## 🔥 핵심 가설

**Turbo가 Edge Runtime 환경에서 실행되어 모든 명령어 spawn 실패**

### 증거

1. **모든 명령어가 실행 전 실패**
   - `node`, `tsc`, `tsx`, `bash`, `sh`, `.js` 스크립트 모두 실패
   - 어떤 로그도 출력되지 않음 (스크립트가 한 줄도 실행되지 않음)
   - 실행 시간이 100-105ms로 매우 짧음 (프로세스 spawn 실패)

2. **28번의 시도 모두 동일한 패턴**
   - 경로 문제가 아니라 실행 파일 자체가 없음
   - 절대 경로, 상대 경로 상관없이 실패

3. **Edge Runtime에는 실행 파일이 없음**
   - `node`, `sh`, `bash`, `npx`, `pnpm` 모두 없음
   - Edge Runtime은 WebAssembly 기반으로 실행 파일 실행 불가

---

## 🔍 확인 사항

### ✅ 1. middleware.ts 존재 여부

**현재 상태**: ✅ `apps/my-app/app/middleware.ts` 존재

**의미**:
- Next.js에서 `middleware.ts`가 있으면 **자동으로 Edge Runtime으로 분류**
- 이것이 Vercel이 Edge Runtime을 강제하는 주요 원인일 수 있음

**확인 필요**:
- [ ] Vercel이 이 파일을 감지하여 Edge Runtime으로 설정했는지
- [ ] middleware가 Edge Runtime을 강제하는지

---

### ✅ 2. vercel.json 설정

**현재 상태**:
```json
{
  "framework": "nextjs",
  "installCommand": "...",
  "buildCommand": "cd ../.. && corepack pnpm exec turbo run build --filter=my-app",
  "devCommand": "..."
}
```

**확인 사항**:
- [x] `runtime` 필드 없음: ⚠️ Edge Runtime 강제 설정 없음
- [x] `output` 필드 없음: ⚠️ Output 모드 명시 없음
- [ ] Vercel이 자동으로 Edge Runtime으로 추론했을 가능성

**문제점**:
- `middleware.ts`가 있으면 Vercel이 자동으로 Edge Runtime으로 설정할 수 있음
- `vercel.json`에 명시적으로 Node.js 런타임을 지정하지 않음

---

### ✅ 3. package.json의 engines 필드

**현재 상태**:
```json
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=10.17.0"
  }
}
```

**확인 사항**:
- [x] 루트 `package.json`에 `engines.node` 있음: ✅ 확인됨
- [ ] `apps/my-app/package.json`에 `engines.node` 있는지 확인 필요

**의미**:
- `engines.node`가 없으면 Vercel이 Edge Runtime으로 추론할 수 있음
- 루트에만 있고 앱 레벨에 없으면 문제가 될 수 있음

---

### ✅ 4. .vercel/project.json 존재 여부

**현재 상태**: ✅ 파일 없음

**의미**:
- `.vercel/project.json`이 있으면 Edge Runtime 설정이 영구적으로 고정됨
- 현재는 없으므로 이 문제는 아님

---

### ✅ 5. Next.js 15 + App Router + middleware 조합

**현재 상태**:
- ✅ Next.js 15 사용
- ✅ App Router 사용 (`app/` 디렉토리)
- ✅ `middleware.ts` 존재

**의미**:
- Next.js 15 + App Router + middleware 조합은 **기본적으로 Edge Runtime을 사용**
- 이것이 Vercel이 Edge Runtime으로 설정한 주요 원인일 가능성

---

## 🎯 Vercel이 Edge Runtime으로 설정하는 조건

### 자동 Edge Runtime 설정 조건

| 조건 | 현재 상태 | Edge Runtime 강제 여부 |
|------|----------|----------------------|
| `middleware.ts` 존재 | ✅ 있음 | ✅ **강제** |
| Next.js 15 + App Router | ✅ 해당 | ⚠️ 가능성 높음 |
| `i18n` 설정 | ❓ 확인 필요 | ⚠️ 가능성 있음 |
| `vercel.json`에 `runtime: "edge"` | ❌ 없음 | ❌ 강제 아님 |
| `package.json`에 `engines.node` 없음 (앱 레벨) | ❓ 확인 필요 | ⚠️ 가능성 있음 |

### 결론

**`middleware.ts`가 존재하면 Vercel이 자동으로 Edge Runtime으로 설정할 가능성이 매우 높음**

---

## 💡 해결 방향

### 해결책 1: vercel.json에 명시적으로 Node.js 런타임 지정

```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && corepack pnpm exec turbo run build --filter=my-app",
  "functions": {
    "app/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

**장점**:
- 명시적으로 Node.js 런타임 지정
- Vercel이 Edge Runtime으로 추론하는 것을 방지

**단점**:
- `functions` 필드가 빌드 단계에 영향을 주는지 불확실

---

### 해결책 2: VERCEL_FORCE_NO_EDGE_RUNTIME 환경 변수 추가

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
- Edge Runtime 강제 비활성화
- 빌드 단계에서 Node.js 환경 보장

**단점**:
- 공식 문서에 없는 옵션 (이스터 에그)
- 장기적으로 지원되지 않을 수 있음

---

### 해결책 3: Vercel Project Settings에서 Output 모드 변경

**Vercel 대시보드에서**:
1. Project Settings → Build & Development Settings
2. Output: 'Node.js' 선택
3. 재배포

**장점**:
- 가장 확실한 방법
- 공식 지원

**단점**:
- Vercel 대시보드에서 수동 설정 필요
- 코드로 관리 불가

---

### 해결책 4: apps/my-app/package.json에 engines.node 추가

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**장점**:
- 코드로 관리 가능
- Vercel이 Node.js 런타임으로 추론하도록 유도

**단점**:
- `middleware.ts`가 있으면 여전히 Edge Runtime으로 설정될 수 있음

---

## 🎯 권장 해결 순서

### 1순위: 해결책 3 (Vercel 대시보드 설정) + 해결책 4 (engines.node 추가)

**이유**:
- 가장 확실한 방법
- 코드로도 관리 가능

**작업**:
1. Vercel 대시보드에서 Output을 'Node.js'로 변경
2. `apps/my-app/package.json`에 `engines.node` 추가
3. 재배포

---

### 2순위: 해결책 2 (VERCEL_FORCE_NO_EDGE_RUNTIME) + 해결책 4

**이유**:
- 코드로 관리 가능
- 빌드 단계에서 Node.js 환경 보장

**작업**:
1. `vercel.json`에 `build.env.VERCEL_FORCE_NO_EDGE_RUNTIME` 추가
2. `apps/my-app/package.json`에 `engines.node` 추가
3. 재배포

---

## 📋 확인 체크리스트

- [x] `middleware.ts` 존재: ✅ 확인됨 (Edge Runtime 강제 원인)
- [x] `vercel.json`에 `runtime` 필드 없음: ✅ 확인됨
- [x] `.vercel/project.json` 없음: ✅ 확인됨
- [ ] `apps/my-app/package.json`에 `engines.node` 있는지 확인 필요
- [ ] Vercel 대시보드에서 Output 모드 확인 필요
- [ ] Next.js i18n 설정 확인 필요

---

## 🔗 참고 자료

- [Next.js Middleware Runtime](https://nextjs.org/docs/app/building-your-application/routing/middleware#runtime)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions)
- [Vercel Build Settings](https://vercel.com/docs/build-step)

