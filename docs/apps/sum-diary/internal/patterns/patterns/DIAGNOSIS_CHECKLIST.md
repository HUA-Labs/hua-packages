# 진단 체크리스트 (GPT 피드백 기반)

**작성일**: 2025-12-11  
**목적**: "No such file or directory (os error 2)" 오류 진단

---

## 🔍 빠른 1단계 진단 (5분 컷)

### ✅ ① Vercel 빌드 로그에서 "Which step에서 터졌는지"

**확인 사항**:
- [ ] `Running pnpm build` 단계까지 정상인지?
- [ ] `turbo run build` 단계까지 정상인지?
- [ ] `@hua-labs/ui:build` 단계에서 정확히 어떤 명령을 실행하려고 했는지?
- [ ] 로그에 "어떤 파일을 찾으려고 했는지" 나오는지?

**현재 상태**: ✅ 확인 완료
- Vercel 빌드 로그에서 `@hua-labs/ui:build` 단계에서 실패
- 오류 메시지: `ERROR: command finished with error: No such file or directory (os error 2)`
- 오류 메시지: `unable to spawn child process: No such file or directory (os error 2)`
- 실행 시간: 100-105ms (매우 짧음, 스크립트 실행 전 실패)
- 디버깅 로그: 전혀 출력되지 않음 (스크립트가 실행되기 전에 실패)

---

### ✅ ② packages/hua-ui/package.json 내부의 "build" 스크립트

**현재 상태**:
```json
"build": "bash scripts/build-wrapper.sh"
```

**확인 사항**:
- [x] 빌드 스크립트 존재: ✅ `bash scripts/build-wrapper.sh`
- [x] 스크립트 파일 존재: ✅ `packages/hua-ui/scripts/build-wrapper.sh`
- [ ] Vercel에서 `bash` 명령어 사용 가능한지? → **추정: PATH에 없을 가능성 높음**
- [x] 스크립트 파일이 Vercel에 업로드되는지? → ✅ `.gitignore`에 제외되지 않음

**잠재적 문제**:
- ⚠️ `bash` 명령어가 Vercel 환경에서 PATH에 없을 가능성 높음 (시도 27 실패)
- ✅ 스크립트 파일은 `.gitignore`나 `.vercelignore`에 의해 제외되지 않음

---

### ✅ ③ pnpm-workspace.yaml

**현재 상태**:
```yaml
packages:
  - apps/*
  - packages/*
  - tools/*
```

**확인 사항**:
- [x] workspace 경로 정상: ✅ `packages/*`
- [x] 패키지 디렉토리 존재: ✅ `packages/hua-ui/`
- [ ] 패키지 이름과 디렉토리 이름 불일치:
  - 패키지 이름: `@hua-labs/ui`
  - 디렉토리 이름: `hua-ui`
  - **이것이 문제일 수 있음!**

**잠재적 문제**:
- pnpm workspace는 패키지 이름과 디렉토리 이름이 일치하지 않아도 작동하지만, Vercel에서는 문제가 될 수 있음

---

### ✅ ④ 로컬에서 pnpm build는 정상 동작하는지?

**확인 필요**:
- [x] 로컬에서 `cd packages/hua-ui && pnpm build` 실행 시 성공하는지? → ✅ 성공 (이전 대화에서 확인)
- [x] 로컬에서 `cd ../.. && pnpm build --filter=@hua-labs/ui` 실행 시 성공하는지? → ✅ 성공
- [x] 로컬에서 `cd ../.. && pnpm exec turbo run build --filter=my-app` 실행 시 성공하는지? → ✅ 성공

**현재 상태**: ✅ 로컬 빌드는 모두 성공
- 로컬 OK → Vercel NG = 경로 문제 or missing devDependencies 가능성↑
- 다른 패키지들(`hua-utils`, `hua-i18n-sdk` 등)은 Vercel에서도 성공적으로 빌드됨

---

## 🔥 가장 흔한 원인 7개 (확률순)

### 1️⃣ 패키지 디렉토리가 Vercel에 업로드되지 않음

**확인 사항**:
- [x] `.gitignore`에 `packages/hua-ui/` 제외 없음: ✅ 확인됨
- [x] `.vercelignore` 파일 없음: ✅ 확인됨
- [ ] Vercel Settings → Build → Ignored Build Step 확인 필요
- [ ] Turbo가 "변경 없어서 빌드 생략" 하는 경우 제외 설정 필요

**현재 상태**: ✅ `.gitignore`와 `.vercelignore`는 문제 없음
- `.gitignore`에 `packages/hua-ui/` 제외 없음 확인됨
- `.vercelignore` 파일 없음 확인됨
- `dist/`는 제외되지만 이는 정상 (빌드 결과물)

---

### 2️⃣ package.json의 build 스크립트가 잘못된 바이너리를 호출 중

**현재 빌드 스크립트**:
```json
"build": "bash scripts/build-wrapper.sh"
```

**확인 사항**:
- [ ] Vercel 환경에 `bash`가 PATH에 있는지?
- [ ] `scripts/build-wrapper.sh` 파일이 Vercel에 업로드되는지?
- [ ] 스크립트 내부에서 `node` 경로를 찾을 수 있는지?

**잠재적 문제**:
- ⚠️ `bash` 명령어가 Vercel 환경에서 PATH에 없을 가능성 높음 (시도 27 실패)
- ⚠️ Turbo가 `bash`를 PATH에서 찾지 못함 (모든 시도에서 동일한 패턴)
- ✅ 스크립트 파일은 존재하고 실행 권한 문제는 아닌 것으로 보임 (로컬에서 작동)

---

### 3️⃣ workspace link(심볼릭 링크)가 Vercel 서버에서 깨짐

**확인 사항**:
- [x] 패키지 이름: `@hua-labs/ui`
- [x] 디렉토리 이름: `hua-ui`
- [ ] 이름 불일치가 Vercel에서 문제가 되는지?

**현재 상태**: ⚠️ 이름 불일치 발견
- 패키지 이름: `@hua-labs/ui`
- 디렉토리 이름: `hua-ui`
- pnpm workspace는 작동하지만, Vercel + Turbo 조합에서 문제가 될 수 있음
- 하지만 다른 성공 패키지들도 비슷한 패턴을 사용하므로 직접적인 원인은 아닐 가능성

---

### 4️⃣ tsconfig paths / exports field 문제

**확인 사항**:
- [ ] `packages/hua-ui/tsconfig.json` 확인 필요
- [ ] 루트 `tsconfig.json`의 paths 설정 확인 필요
- [ ] `package.json`의 `exports` 필드 확인 필요

**현재 상태**: 확인 필요

---

### 5️⃣ build script가 존재하지 않는 파일 실행함

**현재 빌드 스크립트**:
```json
"build": "bash scripts/build-wrapper.sh"
```

**확인 사항**:
- [x] `scripts/build-wrapper.sh` 파일 존재: ✅ 확인됨
- [ ] Vercel에서 파일이 업로드되는지?
- [ ] 스크립트 내부의 `node` 경로 찾기 로직이 작동하는지?

**현재 상태**: ✅ 파일은 존재하지만 Vercel에서 실행 실패
- `scripts/build-wrapper.sh` 파일 존재 확인됨
- `.gitignore`에 제외되지 않음 확인됨
- 하지만 Vercel에서 `bash` 명령어를 찾지 못해 실행 실패
- 실행 시간이 100-105ms로 매우 짧음 → 스크립트 실행 전에 실패

---

### 6️⃣ package.json의 "bin" 혹은 main/module 필드가 잘못됨

**확인 사항**:
- [x] `main`: `./dist/index.js` ✅
- [x] `module`: `./dist/index.mjs` ✅
- [x] `types`: `./dist/index.d.ts` ✅
- [ ] `bin` 필드 없음: ✅ (문제 없음)

**현재 상태**: main/module/types 필드는 정상

---

### 7️⃣ 패키지 이름 디렉토리 변경 후 turbo 캐시가 꼬인 상태

**확인 사항**:
- [ ] Turbo 캐시 초기화 필요?: ⚠️ 가능성 있음
- [ ] Vercel 빌드 캐시 초기화 필요?: ⚠️ 가능성 있음

**현재 상태**: ⚠️ 가능성 있지만 직접적인 원인은 아닐 가능성
- 다른 패키지들은 성공하므로 Turbo 캐시 문제는 아닐 가능성
- 하지만 시도해볼 가치는 있음

---

## 🎯 가장 유력한 원인 (추론 기반)

### 추정 원인: 패키지 이름과 디렉토리 이름 불일치

**증거**:
- 패키지 이름: `@hua-labs/ui`
- 디렉토리 이름: `hua-ui`
- pnpm workspace는 작동하지만, Vercel + Turbo 조합에서 문제가 될 수 있음

**추가 확인 필요**:
- ✅ Vercel 빌드 로그 확인 완료: `@hua-labs/ui:build` 단계에서 `No such file or directory (os error 2)` 발생
- ⚠️ `bash` 명령어가 PATH에 없을 가능성 높음 (시도 27 실패)
- ✅ 다른 성공 패키지들(`hua-utils`, `hua-i18n-sdk` 등)은 `node ../../node_modules/typescript/lib/tsc.js` 패턴 사용
- ⚠️ `hua-ui`만 `bash scripts/build-wrapper.sh` 사용 → 이것이 문제일 가능성

---

## ☄️ 해결 방향 (빠르게 적용 가능한 순서)

### 1️⃣ Vercel 프로젝트 Settings → Build → Ignored Build Step 확인

**확인 사항**:
- [ ] Ignored Build Step 설정 확인
- [ ] Turbo가 "변경 없어서 빌드 생략" 하는 경우 제외 설정 필요

**현재 상태**: ⚠️ 확인 필요하지만 가능성 낮음
- 다른 패키지들은 성공적으로 빌드되므로 Ignored Build Step 문제는 아닐 가능성
- 하지만 확인해볼 가치는 있음

---

### 2️⃣ 루트에서 `pnpm install --shamefully-hoist` 시도

**목적**: dependency를 루트로 올려서 Vercel에서도 접근 가능하게 함

**현재 상태**: ⚠️ 시도하지 않음
- 다른 성공 패키지들은 `--shamefully-hoist` 없이도 작동
- 이것보다는 `bash` 명령어 문제가 더 유력

---

### 3️⃣ Vercel 환경에서 devDependencies 설치 옵션 활성화

**확인 사항**:
- [x] `tsup`, `tsx`, `typescript`가 루트 `package.json`의 `devDependencies`에 있음: ✅ 확인됨
- [ ] Vercel Settings에서 devDependencies 설치 옵션 확인 필요

**현재 상태**: ✅ 루트에 devDependencies 존재 확인됨
- `tsup`: `^8.5.1` ✅
- `tsx`: `^4.21.0` ✅
- `typescript`: `^5.9.3` ✅
- 모두 루트 `package.json`의 `devDependencies`에 있음

---

## 📋 다음 단계

1. ✅ **Vercel 빌드 로그 확인** (완료)
   - ✅ 정확히 어떤 파일을 찾으려고 했는지: `bash scripts/build-wrapper.sh` 실행 시도
   - ✅ 어느 단계에서 실패했는지: `@hua-labs/ui:build` 단계에서 `No such file or directory (os error 2)`
   - ✅ 실행 시간: 100-105ms (매우 짧음, 스크립트 실행 전 실패)

2. ✅ **로컬 빌드 테스트** (완료)
   - ✅ 로컬에서 모든 빌드 명령어 성공
   - ✅ 로컬 OK → Vercel NG = 경로 문제 or missing devDependencies 가능성↑

3. ⚠️ **패키지 이름과 디렉토리 이름 불일치 확인**
   - ⚠️ 이름 불일치 발견: `@hua-labs/ui` vs `hua-ui`
   - 하지만 다른 성공 패키지들도 비슷한 패턴 사용
   - 직접적인 원인은 아닐 가능성

4. 🔥 **bash 스크립트 대신 다른 방법 시도** (가장 유력)
   - ⚠️ `bash`가 PATH에 없을 가능성 매우 높음 (시도 27 실패)
   - ✅ 다른 성공 패키지들은 `node ../../node_modules/typescript/lib/tsc.js` 패턴 사용
   - ✅ `hua-ui`는 `tsup`이 필요하므로 `node ../../node_modules/tsx/dist/cli.mjs ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly` 패턴 사용 고려
   - ⚠️ 성공 로그에서 `"command": "tsup && tsc --emitDeclarationOnly"`였음 → 이것이 PATH에서 `tsup`을 찾았을 가능성

---

## 📊 종합 분석

### 확인된 사실

1. ✅ **로컬 빌드는 모두 성공**
   - 로컬 환경에서는 모든 빌드 명령어가 정상 작동
   - 로컬 OK → Vercel NG = 환경 차이 문제

2. ✅ **다른 패키지들은 Vercel에서 성공**
   - `hua-utils`, `hua-i18n-sdk`, `hua-hooks` 등은 모두 성공
   - 성공 패키지들의 공통점: `node ../../node_modules/typescript/lib/tsc.js` 패턴 사용

3. ⚠️ **`hua-ui`만 실패**
   - `bash scripts/build-wrapper.sh` 사용
   - `bash` 명령어가 Vercel PATH에 없을 가능성 매우 높음

4. ✅ **성공 로그 분석**
   - 성공했을 때: `"command": "tsup && tsc --emitDeclarationOnly"`
   - 이것은 PATH에서 `tsup`을 찾았을 가능성
   - 현재는 `bash` 스크립트 사용으로 변경됨

### 가장 유력한 원인 (업데이트)

#### 가설 1: `bash` 명령어가 Vercel PATH에 없음 ⚠️

**증거**:
- 시도 27에서 `bash scripts/build-wrapper.sh` 사용 시 실패
- 실행 시간이 100-105ms로 매우 짧음 (스크립트 실행 전 실패)
- 디버깅 로그가 전혀 출력되지 않음 (스크립트가 실행되지 않음)
- 다른 성공 패키지들은 `node` + 절대 경로 패턴 사용

**하지만**: `node`, `tsc`, `tsx`, `sh` 등도 모두 실패 → 이것만으로는 설명 불가

#### 가설 2: Turbo가 Edge Runtime 환경에서 실행됨 🔥 (새로운 가설)

**증거**:
- 모든 명령어(`node`, `tsc`, `tsx`, `bash`, `sh`, `.js` 스크립트)가 실행 전 실패
- 어떤 로그도 출력되지 않음 (스크립트가 한 줄도 실행되지 않음)
- 실행 시간이 100-105ms로 매우 짧음 (프로세스 spawn 실패)
- 28번의 시도 모두 동일한 패턴으로 실패

**가능성**:
- Vercel이 Next.js 15 앱을 자동으로 Edge Runtime으로 분류
- Edge Runtime에는 `node`, `sh`, `bash` 등이 없음
- Turbo가 Edge 환경에서 실행되어 모든 명령어 spawn 실패

**확인 필요**:
- [ ] Vercel Project Settings → Build & Development Settings → Output 설정 확인
- [ ] `.vercel/project.json` 파일 존재 여부 확인
- [ ] `package.json`의 `engines` 필드 확인
- [ ] `middleware.ts` 또는 i18n 설정 존재 여부 확인
- [ ] `vercel.json`의 runtime 설정 확인

**해결 방향**:
- Vercel 설정에서 Output을 'Node.js'로 변경
- `vercel.json`에 `VERCEL_FORCE_NO_EDGE_RUNTIME` 환경 변수 추가
- `package.json`에 `engines.node` 필드 추가
- `.vercel/project.json` 삭제 후 재배포

---

## 🔗 참고 자료

- [Vercel 빌드 도구 실행 오류 해결](./vercel-build-tool-execution-error.md)
- [근본 원인 분석](./ROOT_CAUSE_ANALYSIS.md)

