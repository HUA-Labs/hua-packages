# Turbo PATH 문제 해결 가이드

**작성일**: 2025-12-14  
**최종 업데이트**: 2025-12-14  
**목적**: Turbo가 PATH를 상속받지 못하는 문제 해결 및 Vercel 빌드 안정화

---

## 📊 현재 상태

### ✅ 완료된 작업
- **Turbo 버전 업데이트**: 2.3.3 → 2.6.3
- **passThroughEnv 설정**: `turbo.json`에 `PATH`, `NODE` 추가
- **로컬 빌드**: ✅ 성공 (모든 22개 패키지)
- **Vercel 빌드**: ✅ pnpm filter로 우회하여 성공

### ⚠️ 남은 문제
- Vercel 환경에서 Turbo 사용 시 PATH 상속 문제 여전히 존재
- 현재는 pnpm filter로 우회하여 사용 중

---

## 🔍 문제 분석

### 증상
- Vercel 빌드에서 `@hua-labs/utils`, `@hua-labs/ui`, `@hua-labs/motion` 패키지 빌드 실패
- 오류: `spawnSync /vercel/.local/share/pnpm/.tools/pnpm/10.24.0/bin/pnpm ENOENT`
- 오류: `Cannot find module '/vercel/.local/share/pnpm/.tools/pnpm/10.24.0/bin/pnpm'`

### 근본 원인
**Turbo가 `package.json` 스크립트를 실행할 때 PATH 환경 변수를 제대로 상속받지 못함**

- `vercel.json`의 `buildCommand`는 작동 (쉘에서 직접 실행)
- `package.json`의 스크립트는 실패 (Turbo가 실행)
- Turbo가 자식 프로세스를 생성할 때 PATH를 상속받지 않음

---

## ✅ 적용된 해결 방법

### 1. Turbo 버전 업데이트 (완료) ✅

**이전 버전**: 2.3.3  
**현재 버전**: 2.6.3

### 2. globalPassThroughEnv 설정 (권장 방법) ✅

웹 검색 결과에 따르면, `globalPassThroughEnv`를 사용하는 것이 더 나은 방법입니다:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalPassThroughEnv": ["PATH", "NODE"],
  "tasks": {
    "@hua-labs/utils#build": {
      "dependsOn": [],
      "outputs": ["dist/**"]
    }
  }
}
```

**효과**:
- 모든 태스크에 PATH와 NODE 환경 변수를 전달
- 캐시에 영향을 주지 않음 (passThroughEnv의 특징)
- 개별 태스크마다 설정할 필요 없음
- 더 간단하고 유지보수하기 쉬움

**참고**: 이전에는 각 태스크마다 `passThroughEnv`를 설정했지만, `globalPassThroughEnv`가 더 효율적입니다.

---

### 2. 빌드 스크립트를 절대 경로로 변경 (추가 보완)

성공하는 패키지들의 패턴을 따라 빌드 스크립트를 절대 경로로 변경:

#### @hua-labs/utils
```json
{
  "build": "node ../../node_modules/typescript/lib/tsc.js"
}
```

#### @hua-labs/ui
```json
{
  "build": "node ../../node_modules/tsx/dist/cli.mjs ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
}
```

**장점**:
- PATH 문제를 완전히 우회
- `node`는 이미 실행 중이므로 PATH 문제 없음
- `../../node_modules/...`는 상대 경로이므로 항상 유효

---

### 3. vercel.json 설정 변경 (임시 우회) ✅

**변경 사항**: Turbo 대신 pnpm filter 사용

**이전 설정**:
```json
{
  "buildCommand": "cd ../.. && turbo run build --filter=my-app"
}
```

**현재 설정** (my-app, my-api 동일):
```json
{
  "installCommand": "corepack enable && corepack use pnpm@10.24.0 && cd ../.. && corepack pnpm install --frozen-lockfile",
  "buildCommand": "cd ../.. && pnpm --filter=my-app... run build",
  "devCommand": "cd ../.. && pnpm --filter my-app run dev"
}
```

**효과**:
- ✅ Turbo PATH 문제를 완전히 우회
- ✅ 안정적인 Vercel 빌드 보장
- ✅ my-api와 설정 통일

**참고**: 
- `...` (세 개 점)은 의존성 패키지도 함께 빌드
- pnpm filter는 Turbo보다 PATH 문제에 덜 민감함

---

## 📋 적용 체크리스트

### 완료된 작업 ✅
- [x] Turbo 버전 업데이트 (2.3.3 → 2.6.3)
- [x] `turbo.json`에 `globalPassThroughEnv: ["PATH", "NODE"]` 추가 (권장 방법)
- [x] 개별 태스크의 `passThroughEnv` 제거 (globalPassThroughEnv로 통합)
- [x] `@hua-labs/utils#build` 설정 추가
- [x] `@hua-labs/ui#build` 설정 추가
- [x] `@hua-labs/motion#build` 설정 추가
- [x] `@hua-labs/i18n-core#build` 설정 추가
- [x] `@hua-labs/motion-core#build` 설정 추가
- [x] `vercel.json`에서 pnpm filter 사용으로 변경
- [x] my-api와 my-app 설정 통일
- [x] 로컬 빌드 성공 확인 (22개 패키지)

### 향후 작업 (Turbo로 전환 시)
- [ ] Vercel 빌드 로그에서 PATH 전달 여부 확인
- [ ] `passThroughEnv`가 Vercel에서 작동하는지 검증
- [ ] 빌드 스크립트를 절대 경로로 변경 검토
- [ ] Turbo 이슈 리포트 또는 커뮤니티 확인

---

## 🔧 추가 해결 방법 (passThroughEnv로 해결되지 않는 경우)

### 방법 1: 빌드 스크립트를 쉘 스크립트로 변경

```json
{
  "build": "sh -c 'node ../../node_modules/typescript/lib/tsc.js'"
}
```

**장점**: 쉘을 통해 실행되므로 PATH가 설정됨  
**단점**: `sh`도 PATH에서 찾지 못할 수 있음

### 방법 2: Node.js 스크립트 사용

```javascript
// scripts/build.js
const { spawnSync } = require('child_process');
const tscPath = require.resolve('typescript/lib/tsc.js');
spawnSync(process.execPath, [tscPath], { stdio: 'inherit' });
```

```json
{
  "build": "node scripts/build.js"
}
```

**장점**: `process.execPath`는 항상 유효  
**단점**: 스크립트가 실행되려면 `node`를 찾을 수 있어야 함

### 방법 3: Turbo 버전 업데이트 (완료) ✅

**이전 버전**: 2.3.3  
**현재 버전**: 2.6.3

```bash
pnpm add -D -w turbo@latest
```

**결과**: 
- ✅ 로컬 빌드에서 정상 작동
- ⚠️ Vercel 환경에서는 여전히 문제 존재
- `passThroughEnv` 설정과 함께 사용 중

---

## 📚 참고 자료

- [Turbo 공식 문서 - Environment Variables](https://turbo.build/repo/docs/reference/configuration#env)
- [Vercel 빌드 환경](https://vercel.com/docs/build-step)
- [근본 원인 분석](./ROOT_CAUSE_ANALYSIS.md)
- [Vercel 빌드 도구 실행 오류 해결](./vercel-build-tool-execution-error.md)

---

## 🎯 향후 Turbo로 전환하기 위한 방안

### 현재 상황
- ✅ 로컬에서는 Turbo 2.6.3 + `passThroughEnv`로 정상 작동
- ✅ Vercel에서는 pnpm filter로 안정적으로 빌드 중
- ⚠️ Vercel에서 Turbo 사용 시 PATH 문제 여전히 존재

### Turbo로 전환하기 위한 단계별 방안

#### 1단계: Vercel 환경에서 PATH 확인
```bash
# vercel.json의 buildCommand에 디버깅 추가
"buildCommand": "cd ../.. && echo $PATH && which pnpm && which node && turbo run build --filter=my-app"
```

**목적**: Vercel 환경에서 실제 PATH 값 확인

#### 2단계: passThroughEnv 검증
```json
// turbo.json
{
  "@hua-labs/utils#build": {
    "passThroughEnv": ["PATH", "NODE", "PNPM_HOME"]
  }
}
```

**추가 환경 변수**:
- `PNPM_HOME`: pnpm 설치 경로
- `NPM_CONFIG_PREFIX`: npm 설정 경로

#### 3단계: 빌드 스크립트 최적화
현재 패키지들의 빌드 스크립트를 확인하고 절대 경로 사용 검토:

**@hua-labs/utils**:
```json
{
  "build": "node ../../node_modules/typescript/lib/tsc.js"
}
```

**@hua-labs/ui**:
```json
{
  "build": "node ../../node_modules/tsx/dist/cli.mjs ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
}
```

**장점**: PATH 문제를 완전히 우회

#### 4단계: Node.js 스크립트 래퍼 사용
각 패키지에 `scripts/build.js` 생성:

```javascript
// packages/hua-utils/scripts/build.js
const { spawnSync } = require('child_process');
const path = require('path');

const tscPath = require.resolve('typescript/lib/tsc.js');
const result = spawnSync(process.execPath, [tscPath], {
  stdio: 'inherit',
  cwd: __dirname
});

process.exit(result.status || 0);
```

```json
{
  "build": "node scripts/build.js"
}
```

**장점**: `process.execPath`는 항상 유효하므로 PATH 문제 없음

#### 5단계: Turbo 이슈 확인 및 리포트
- [Turbo GitHub Issues](https://github.com/vercel/turbo/issues)에서 PATH 관련 이슈 확인
- Vercel 환경에서의 PATH 상속 문제 리포트 작성
- 커뮤니티 해결책 확인

### 최종 권장 사항

**현재 (안정적)**:
- ✅ pnpm filter 사용 (Vercel 빌드 안정적)
- ✅ Turbo 2.6.3 + passThroughEnv (로컬 빌드 성공)

**향후 전환 시**:
1. Vercel 빌드 로그에서 PATH 확인
2. `passThroughEnv`에 추가 환경 변수 포함 (`PNPM_HOME` 등)
3. 빌드 스크립트를 절대 경로 또는 Node.js 래퍼로 변경
4. Turbo 이슈 트래커 모니터링

**참고**: pnpm filter도 충분히 빠르고 안정적이므로, Turbo로 전환하는 것이 반드시 필요한 것은 아닙니다. 다만 Turbo의 캐싱 및 병렬 처리 최적화를 활용하려면 위 방안을 따라 진행하세요.
