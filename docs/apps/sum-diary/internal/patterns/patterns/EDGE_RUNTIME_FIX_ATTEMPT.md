# Edge Runtime 문제 해결 시도 (Middleware.ts 유지)

**작성일**: 2025-12-11  
**목적**: middleware.ts를 제거하지 않고 Edge Runtime 문제를 해결하는 시도

---

## 🎯 해결 플로우

### 1️⃣ Vercel Output Mode → Node.js (대시보드 설정)

**작업**: Vercel 대시보드에서 수동 설정
- Project Settings → Build & Development Settings
- Output: 'Node.js' 선택

**상태**: ⚠️ **사용자가 직접 설정 필요**

---

### 2️⃣ vercel.json에 Edge 강제 OFF

**작업**: `apps/my-app/vercel.json` 수정

```json
{
  "build": {
    "env": {
      "VERCEL_FORCE_NO_EDGE_RUNTIME": "1"
    }
  }
}
```

**상태**: ✅ **완료**

---

### 3️⃣ package.json에 Node 엔진 명시

**작업**: `apps/my-app/package.json`에 `engines` 필드 추가

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**상태**: ✅ **완료**

---

### 4️⃣ middleware.ts의 matcher 범위 축소

**작업**: `apps/my-app/app/middleware.ts`의 `matcher` 수정

**이전 (거의 모든 경로)**:
```typescript
matcher: [
  '/((?!_next/static|_next/image|favicon.ico).*)',
]
```

**수정 후 (필요한 경로만)**:
```typescript
matcher: [
  // 보호된 경로만 매칭
  '/diary/write',
  '/diary/write/:path*',
  '/diary/analysis',
  '/diary/analysis/:path*',
  '/profile',
  '/profile/:path*',
  '/admin',
  '/admin/:path*',
  // API 경로만 매칭
  '/api/:path*',
  // 민감한 파일 경로만 매칭
  '/.env',
  '/.env.local',
  '/.env.production',
  '/.env.development',
  '/.git/:path*',
  '/package.json',
  '/package-lock.json',
  '/yarn.lock',
  '/pnpm-lock.yaml',
]
```

**상태**: ✅ **완료**

**효과**: 
- Edge Runtime 추론 범위 축소
- 필요한 경로에만 middleware 적용
- 다른 경로는 Edge Runtime으로 분류되지 않음

---

### 5️⃣ 빌드 스크립트 확인

**현재 상태**:
- `packages/hua-ui/package.json`: `"build": "bash scripts/build-wrapper.sh"`
- 성공 로그에서 확인된 패턴: `tsup && tsc --emitDeclarationOnly`

**권장**: 빌드 스크립트를 `tsup && tsc --emitDeclarationOnly`로 변경 (선택적)

**상태**: ⚠️ **확인 필요** (현재 `bash scripts/build-wrapper.sh` 사용 중)

---

## 📋 체크리스트

### 완료된 작업 ✅

- [x] `vercel.json`에 `VERCEL_FORCE_NO_EDGE_RUNTIME` 추가
- [x] `package.json`에 `engines.node` 추가
- [x] `middleware.ts`의 `matcher` 범위 축소

### 사용자 작업 필요 ⚠️

- [ ] Vercel 대시보드에서 Output Mode를 'Node.js'로 변경
- [ ] 빌드 스크립트 확인 (선택적)

---

## 🎯 다음 단계

### 성공 시

- ✅ Edge Runtime 문제 해결
- ✅ middleware.ts 유지
- ✅ 모든 기능 정상 작동

### 실패 시

- ⚠️ middleware.ts 제거 및 대체 작업 진행
- Server Component Layout 생성
- 기능을 다른 방식으로 구현

---

## 🔗 참고 자료

- [Middleware 분석](./MIDDLEWARE_ANALYSIS.md)
- [Middleware 대체 계획](./MIDDLEWARE_REPLACEMENT_PLAN.md)
- [해결책 의사결정](./SOLUTION_DECISION.md)

