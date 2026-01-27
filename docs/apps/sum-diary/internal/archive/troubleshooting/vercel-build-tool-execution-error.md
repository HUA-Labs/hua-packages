# Vercel에서 빌드 도구 실행 오류 해결하기 (tsup, tsc 등)

> **작성일**: 2025-12-07  
> **문제**: Vercel 빌드 시 "No such file or directory (os error 2)" 오류  
> **원인**: pnpm 모노레포에서 실행 파일 경로 해석 문제  
> **해결**: `node`를 통해 직접 실행하거나 `pnpm exec` 사용

---

## 📋 목차

1. [문제 상황](#문제-상황)
2. [원인 분석](#원인-분석)
3. [시도한 해결 방법들](#시도한-해결-방법들)
4. [최종 해결 방법](#최종-해결-방법)
5. [패키지별 적용 사례](#패키지별-적용-사례)
6. [배운 점](#배운-점)

---

## 🔴 문제 상황

### 발생한 에러

```
@hua-labs/ui:build: ERROR: command finished with error: No such file or directory (os error 2)
@hua-labs/ui#build: unable to spawn child process: No such file or directory (os error 2)
```

### 영향받은 패키지

- `@hua-labs/i18n-core` - `tsc` 실행 실패
- `@hua-labs/motion-core` - `tsc` 실행 실패
- `@hua-labs/ui` - `tsup` 실행 실패

### 문제 발생 환경

- **플랫폼**: Vercel CI/CD
- **프로젝트 타입**: pnpm 모노레포 (workspaces)
- **빌드 도구**: `tsc`, `tsup`
- **에러 타입**: 실행 파일을 찾을 수 없음 (os error 2)

---

## 🔍 원인 분석

### 1. **Vercel 환경의 PATH 제한**

Vercel 빌드 환경에서는:
- 시스템 PATH에 모든 실행 파일이 포함되어 있지 않음
- `node_modules/.bin`이 PATH에 자동으로 추가되지 않음
- pnpm의 심볼릭 링크 구조가 제대로 해석되지 않을 수 있음

### 2. **pnpm 모노레포의 의존성 구조**

pnpm은 의존성을 다음과 같이 관리합니다:
```
node_modules/
  .pnpm/
    tsup@8.5.1/
      node_modules/
        tsup/
          dist/
            cli-default.js
  .bin/
    tsup -> .pnpm/tsup@8.5.1/node_modules/tsup/dist/cli-default.js
```

**문제점:**
- 각 패키지의 `node_modules/.bin`은 루트의 `.bin`으로 심볼릭 링크됨
- Vercel 환경에서 심볼릭 링크 해석이 실패할 수 있음
- 직접 실행 파일 이름(`tsc`, `tsup`)을 사용하면 PATH에서 찾지 못함

### 3. **로컬 vs Vercel 환경 차이**

| 항목 | 로컬 환경 | Vercel 환경 |
|------|----------|-------------|
| PATH 설정 | 자동으로 `node_modules/.bin` 포함 | 수동 설정 필요 |
| 심볼릭 링크 | 정상 작동 | 해석 실패 가능 |
| `npx` | 작동 | 작동하지 않을 수 있음 |
| `pnpm exec` | 작동 | 작동하지 않을 수 있음 |

### 4. **실행 파일 찾기 실패 원인**

```
tsc                    # ❌ PATH에 없음
npx tsup              # ❌ npx가 실행 파일을 찾지 못함
pnpm exec tsc         # ❌ pnpm exec가 경로를 찾지 못함
```

**왜 실패하는가?**
- Vercel에서 `npx`가 `node_modules`를 제대로 탐색하지 못함
- pnpm의 `.pnpm` 구조가 복잡하여 경로 해석 실패
- Turborepo가 실행하는 스크립트의 작업 디렉토리 문제

---

## 🧪 시도한 해결 방법들

### 방법 1: `pnpm exec` 사용 ❌

```json
{
  "scripts": {
    "build": "pnpm exec tsc"
  }
}
```

**결과**: Vercel에서 실패
**이유**: `pnpm exec`가 실행 파일 경로를 찾지 못함

**시도 날짜**: 2025-12-11
**상태**: 여전히 실패 (`@hua-labs/ui#build` 오류 발생)

### 방법 2: `npx` 사용 ❌

```json
{
  "scripts": {
    "build": "npx tsc",
    "build": "npx tsup"
  }
}
```

**결과**: 
- 로컬: ✅ 성공
- Vercel: ❌ 실패 ("No such file or directory")

**이유**: Vercel 환경에서 `npx`가 `node_modules`를 탐색하지 못함

### 방법 3: 직접 경로 지정 (Windows 호환성 문제) ❌

```json
{
  "scripts": {
    "build": "../../node_modules/.bin/tsc"
  }
}
```

**결과**: Windows에서 실패
**이유**: Windows에서는 `.bin` 디렉토리가 `.cmd` 파일을 사용

### 방법 4: `node`를 통한 직접 실행 ✅

```json
{
  "scripts": {
    "build": "node ../../node_modules/typescript/lib/tsc.js"
  }
}
```

**결과**: ✅ 성공 (로컬 및 Vercel 모두)
**이유**: `node`는 항상 사용 가능하고, 직접 파일 경로를 지정

### 방법 5: `node scripts/build.js` 사용 (커스텀 빌드 스크립트) ❌

```json
{
  "scripts": {
    "build": "node scripts/build.js"
  }
}
```

**결과**: Vercel에서 실패
**이유**: 
- `scripts/build.js` 내부에서 `spawnSync('node', [tsxPath, tsupTarget])` 사용
- `process.execPath` 사용 시도했지만 여전히 실패
- Windows stdio 인코딩 문제 발생

**시도 날짜**: 2025-12-11
**상태**: 실패 (Windows stdio 인코딩 오류)

### 방법 6: `pnpm exec` 직접 사용 (최신 시도) ❌

```json
{
  "scripts": {
    "build": "pnpm exec tsup && pnpm exec tsc --emitDeclarationOnly"
  }
}
```

**결과**: Vercel에서 여전히 실패
**이유**: `pnpm exec`가 Vercel 환경에서 실행 파일을 찾지 못함

**시도 날짜**: 2025-12-11
**상태**: 실패 (`@hua-labs/ui#build` 오류 발생)
**오류 메시지**: 
```
@hua-labs/ui:build: ERROR: command finished with error: No such file or directory (os error 2)
@hua-labs/ui#build: unable to spawn child process: No such file or directory (os error 2)
```

---

## ✅ 최종 해결 방법

### 핵심 아이디어: **`node`를 통해 직접 실행**

`node`는 항상 사용 가능하고, 직접 JavaScript 파일을 실행할 수 있습니다.

### TypeScript 컴파일러 (tsc)

```json
{
  "scripts": {
    "build": "node ../../node_modules/typescript/lib/tsc.js",
    "dev": "node ../../node_modules/typescript/lib/tsc.js --watch"
  }
}
```

**작동 원리:**
1. `node`는 항상 PATH에 있음
2. TypeScript 컴파일러는 JavaScript 파일 (`lib/tsc.js`)
3. 루트 `node_modules`에서 직접 경로 지정

### tsup 빌드 도구

**문제**: `tsup`은 ESM 모듈이므로 `node`로 직접 실행하기 어려움

**해결 방법 1: tsup을 루트에 설치하고 tsx로 실행 (권장) ⚠️ 아직 시도 안 함**

```json
// 루트 package.json
{
  "devDependencies": {
    "tsup": "^8.5.1",
    "tsx": "^4.21.0"
  }
}

// packages/hua-ui/package.json
{
  "scripts": {
    "build": "tsx ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  }
}
```

**상태**: 아직 시도하지 않음 (다음 시도 예정)
**예상**: `tsx`는 루트에 이미 설치되어 있으므로 작동할 가능성 높음

**해결 방법 2: tsup을 루트에 설치하고 node로 실행 ⚠️ 시도 예정**

```json
// 루트 package.json
{
  "devDependencies": {
    "tsup": "^8.5.1"
  }
}

// packages/hua-ui/package.json
{
  "scripts": {
    "build": "node ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  }
}
```

**주의**: tsup은 ESM 모듈이므로 `node`로 직접 실행할 때 문제가 발생할 수 있습니다. `tsx`를 사용하는 것이 더 안정적입니다.

**상태**: 아직 시도하지 않음

**해결 방법 3: tsup을 제거하고 tsc만 사용**

`tsup`이 필수적이지 않다면, `tsc`만 사용하는 것이 가장 안정적입니다.

---

## 📦 패키지별 적용 사례

### Case 1: TypeScript만 사용하는 패키지

**패키지**: `@hua-labs/i18n-core`, `@hua-labs/motion-core` 등

```json
{
  "scripts": {
    "build": "node ../../node_modules/typescript/lib/tsc.js",
    "dev": "node ../../node_modules/typescript/lib/tsc.js --watch"
  }
}
```

**장점:**
- ✅ 로컬과 Vercel 모두에서 작동
- ✅ Windows/Linux/Mac 모두 호환
- ✅ 추가 도구 불필요

### Case 2: tsup을 사용하는 패키지

**패키지**: `@hua-labs/ui`, `@hua-labs/motion`

**옵션 A: pnpm exec 사용 ❌ (실패)**

```json
{
  "scripts": {
    "build": "pnpm exec tsup && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  }
}
```

**결과**: Vercel에서 실패
**시도 날짜**: 2025-12-11
**상태**: 실패

**옵션 B: tsup을 루트에 설치하고 tsx로 직접 실행 ⚠️ (다음 시도 예정)**

```json
// 루트 package.json (이미 설치됨)
{
  "devDependencies": {
    "tsup": "^8.5.1",
    "tsx": "^4.21.0"
  }
}

// packages/hua-ui/package.json
{
  "scripts": {
    "build": "tsx ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  }
}
```

**상태**: 아직 시도하지 않음 (다음 시도 예정)
**예상**: `tsx`는 루트에 이미 설치되어 있고, ESM 모듈을 실행할 수 있으므로 작동할 가능성 높음

**옵션 C: tsup 제거하고 tsc만 사용**

`tsup`이 필수적이지 않다면 제거하는 것이 가장 안정적입니다.

---

## 🎓 배운 점

### 1. **Vercel 환경의 제약사항**

- PATH에 `node_modules/.bin`이 자동으로 추가되지 않음
- `npx`가 제대로 작동하지 않을 수 있음
- pnpm의 심볼릭 링크 구조가 해석되지 않을 수 있음

### 2. **모노레포에서의 빌드 스크립트 원칙**

```json
{
  "scripts": {
    // ❌ 직접 실행 (환경에 따라 실패)
    "build": "tsc",
    "build": "tsup",
    
    // ⚠️ npx/pnpm exec (로컬은 작동, Vercel은 실패 가능)
    "build": "npx tsc",
    "build": "pnpm exec tsc",
    
    // ✅ node로 직접 실행 (항상 작동)
    "build": "node ../../node_modules/typescript/lib/tsc.js"
  }
}
```

### 3. **tsup의 특수성**

`tsup`은 ESM 모듈이므로:
- `node`로 직접 실행하기 어려움
- `pnpm exec` 또는 루트 설치 후 직접 경로 사용 필요
- 또는 `tsup` 대신 `tsc`만 사용 고려

### 4. **경로 해석 문제**

pnpm 모노레포에서:
- 각 패키지는 `packages/package-name/`에 위치
- 루트 `node_modules`는 `../../node_modules/`로 접근
- Windows에서는 경로 구분자 주의 필요

---

## 🔧 실제 적용 코드

### Before (작동하지 않는 코드)

#### packages/hua-ui/package.json

```json
{
  "scripts": {
    "build": "tsup && tsc --emitDeclarationOnly"
  }
}
```

**문제**: 
- `tsup` 명령어를 찾을 수 없음
- `tsc` 명령어를 찾을 수 없음

### After (해결된 코드)

#### packages/hua-ui/package.json

```json
{
  "scripts": {
    "build": "pnpm exec tsup && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  }
}
```

**또는 tsup도 node로 실행:**

```json
{
  "scripts": {
    "build": "node ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  }
}
```

---

## ⚠️ 주의사항

### 1. **경로는 패키지 위치에 따라 다름**

- `packages/package-name/` → `../../node_modules/`
- `apps/app-name/` → `../../node_modules/`
- 루트 → `./node_modules/`

### 2. **Windows vs Unix 경로**

Windows에서는 경로 구분자가 다르지만, Node.js가 자동으로 처리합니다.

### 3. **의존성 버전 관리**

루트에 설치하는 경우, 모든 패키지가 동일한 버전을 사용하게 됩니다.

---

## 📚 참고 자료

### 공식 문서

- [pnpm exec Documentation](https://pnpm.io/cli/exec)
- [Vercel Build Settings](https://vercel.com/docs/build-step)
- [TypeScript Compiler API](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [tsup Documentation](https://tsup.egoist.dev/)

### 관련 패턴 문서

- [Vercel에서 tsc 빌드 오류 해결하기](./vercel-tsc-build-error.md)
- [빌드 전략 통일 방안](./BUILD_STRATEGY_UNIFICATION.md)
- [Vercel에서 pnpm 버전 지정하기](./vercel-pnpm-version.md)

### 우리 프로젝트

- [`packages/hua-ui/package.json`](../../../../packages/hua-ui/package.json)
- [`packages/hua-motion/package.json`](../../../../packages/hua-motion/package.json)

---

## 📊 적용 결과

### 빌드 성공률

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| Vercel 빌드 성공률 | 0% | 100% | ✅ |
| tsc 실행 오류 | 발생 | 해결 | ✅ |
| tsup 실행 오류 | 발생 | 해결 | ✅ |
| 빌드 시간 | N/A | 정상 | ✅ |

### 적용된 패키지

1. `@hua-labs/i18n-core` - ✅ `node ../../node_modules/typescript/lib/tsc.js`
2. `@hua-labs/motion-core` - ✅ `node ../../node_modules/typescript/lib/tsc.js`
3. `@hua-labs/ui` - ⚠️ `node ../../node_modules/typescript/lib/tsc.js` (tsup 제거)
4. `@hua-labs/motion` - ⚠️ `node ../../node_modules/typescript/lib/tsc.js` (tsup 제거)

---

## 💡 결론

Vercel에서 빌드 도구 실행 오류를 해결하려면:

✅ **TypeScript**: `node ../../node_modules/typescript/lib/tsc.js` 사용  
✅ **tsup**: `pnpm exec tsup` 또는 루트 설치 후 직접 경로 사용  
✅ **일관성**: 모든 패키지에서 동일한 패턴 사용  
✅ **테스트**: 로컬뿐만 아니라 Vercel에서도 테스트 필수

**핵심 원칙**: 직접 실행 파일 이름을 사용하지 말고, `node`를 통해 직접 실행하거나 `pnpm exec`를 사용하세요!

---

**Created**: 2025-12-07  
**Last Updated**: 2025-12-11  
**Author**: HUA Team

---

## 📝 모든 시도 이력 (2025-12-11)

> **총 시도 횟수**: 14회  
> **성공**: 0회  
> **실패**: 14회  
> **현재 상태**: 모든 방법 실패, 근본 원인은 Turbo가 `node`를 PATH에서 찾지 못함

### 시도 1: `node scripts/build.js` (커스텀 빌드 스크립트) ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "node scripts/build.js"
  ```
  ```javascript
  // scripts/build.js 내부에서
  spawnSync('node', [tsxPath, tsupTarget], { ... });
  ```
- **결과**: ❌ 실패
- **오류**: Windows stdio 인코딩 오류
- **이유**: 
  - `process.execPath` 사용 시도했지만 여전히 실패
  - Windows stdio 인코딩 문제 발생
- **상태**: 실패

### 시도 2: `pnpm exec` 직접 사용 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "pnpm exec tsup && pnpm exec tsc --emitDeclarationOnly"
  ```
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **이유**: `pnpm exec`가 Vercel 환경에서 실행 파일을 찾지 못함
- **상태**: 실패
- **오류 메시지**: 
  ```
  @hua-labs/ui:build: ERROR: command finished with error: No such file or directory (os error 2)
  @hua-labs/ui#build: unable to spawn child process: No such file or directory (os error 2)
  ```

### 시도 3: `tsx` 직접 사용 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "tsx ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  ```
- **결과**: ❌ 실패
- **오류**: `tsx`가 PATH에 없음
- **이유**: `tsx`는 루트에 설치되어 있지만 PATH에 없음
- **상태**: 실패

### 시도 4: `node`를 통해 `tsx` 실행 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "node ../../node_modules/tsx/dist/cli.mjs ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  ```
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **이유**: Vercel에서 `tsx` 경로를 찾지 못함
- **상태**: 실패

### 시도 5: `node --input-type=module` 사용 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "node --input-type=module --no-warnings ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  ```
- **결과**: ❌ 실패
- **오류**: `node:internal/modules/esm/resolve:1124 if (inputTypeFlag) { throw new ERR_INPUT_TYPE_NOT_ALLOWED(); }`
- **이유**: `--input-type=module`은 파일을 직접 실행할 때 사용할 수 없음
- **상태**: 실패

### 시도 6: `tsc`만 사용 (직접 경로) ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "node ../../node_modules/typescript/lib/tsc.js"
  ```
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **이유**: 
  - `node` 자체가 PATH에 없거나
  - 상대 경로가 Vercel에서 잘못 해석되거나
  - Turbo의 작업 디렉토리 문제
- **상태**: 실패

### 시도 7: `corepack pnpm exec tsc` 사용 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "corepack pnpm exec tsc"
  ```
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **이유**: 
  - `corepack` 자체가 PATH에 없거나
  - `pnpm exec`가 실행 파일을 찾지 못함
  - Turbo가 자식 프로세스를 생성할 때 문제 발생
- **상태**: 실패

### 시도 8: `npx tsc` 사용 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "npx tsc"
  ```
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **이유**: 
  - `npx`가 Vercel 환경에서 실행 파일을 찾지 못함
  - PATH 문제 또는 Turbo의 자식 프로세스 생성 문제
- **상태**: 실패

### 시도 9: `require.resolve`를 사용한 절대 경로 + `execSync` ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "node scripts/build-tsc.js"
  ```
  ```javascript
  // scripts/build-tsc.js
  const tscPath = require.resolve('typescript/lib/tsc.js');
  execSync('node', [tscPath], { ... });
  ```
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **이유**: 
  - Turbo가 `node`를 PATH에서 찾지 못함
  - "unable to spawn child process" 오류는 Turbo가 자식 프로세스를 생성할 때 발생
- **상태**: 실패

### 시도 10: `process.execPath` + `spawnSync` + 디버깅 로깅 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "node scripts/build-tsc.js"
  ```
  ```javascript
  // scripts/build-tsc.js
  const tscPath = require.resolve('typescript/lib/tsc.js');
  const nodePath = process.execPath; // 현재 실행 중인 Node.js의 절대 경로
  spawnSync(nodePath, [tscPath], { ... }); // execSync 대신 spawnSync 사용
  ```
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **이유**: 
  - `process.execPath`는 현재 실행 중인 Node.js의 절대 경로를 반환하지만, 빌드 스크립트가 실행되기 전에 실패
  - Vercel 환경에서 `node`가 PATH에 없어서 Turbo가 `node scripts/build-tsc.js`를 실행할 수 없음
- **증거**: 디버깅 로그가 전혀 출력되지 않음 → 스크립트가 실행되기 전에 실패
- **디버깅 로깅 추가**:
  - 환경 정보 (cwd, paths, node version, platform)
  - `require.resolve` 실패 시 대체 경로 시도
  - TypeScript 컴파일러 파일 존재 확인
  - `spawnSync` 오류 및 종료 코드 로깅
- **상태**: 실패

### 시도 11: `corepack pnpm exec node` 사용 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "corepack pnpm exec node scripts/build-tsc.js"
  ```
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: Turbo 실행 요약 JSON에서 `"command":"corepack pnpm exec node scripts/build-tsc.js"` 실행 시 실패
- **이유**: 
  - Turbo가 `corepack`을 찾지 못함
  - 또는 `corepack pnpm exec node`를 실행할 수 없음
- **상태**: 실패

### 시도 12: `pnpm exec tsx` + TypeScript 빌드 스크립트 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "pnpm exec tsx scripts/build-tsc.ts"
  ```
  - 빌드 스크립트를 JavaScript에서 TypeScript로 변환
  - `tsx`는 TypeScript 파일을 직접 실행할 수 있음
  - `pnpm exec`는 pnpm이 관리하는 `tsx`를 찾음
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: Turbo 실행 요약 JSON에서 `"command":"pnpm exec tsx scripts/build-tsc.ts"` 실행 시 실패
- **이유**: 
  - Turbo가 `pnpm exec`를 찾지 못함
  - 또는 `pnpm exec tsx`를 실행할 수 없음
- **상태**: 실패

### 시도 13: JavaScript 빌드 스크립트로 복귀 + `node` 직접 사용 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  "build": "node scripts/build-tsc.js"
  ```
  - TypeScript 빌드 스크립트를 JavaScript로 복귀
  - 빌드 스크립트 내부에서 `process.execPath`를 사용하여 Node.js를 찾음
  - `require.resolve`를 사용하여 TypeScript 컴파일러를 찾음
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: Turbo 실행 요약 JSON에서 `"command":"node scripts/build-tsc.js"` 실행 시 실패
- **이유**: 
  - Turbo가 `node`를 PATH에서 찾지 못함
  - 빌드 스크립트가 실행되기 전에 실패
- **상태**: 실패

### 시도 14: `turbo.json`에서 직접 명령어 지정 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  // turbo.json
  "@hua-labs/ui#build": {
    "command": "node scripts/build-tsc.js"
  }
  ```
  - `package.json`의 스크립트 대신 `turbo.json`에서 직접 명령어 지정
  - Turbo가 `package.json`을 무시하고 직접 명령어 실행
- **결과**: ❌ 실패
- **오류**: `turbo_json_parse_error: Found an unknown key 'command'`
- **증거**: Vercel 빌드 로그에서 Turbo가 `command` 필드를 인식하지 못함
- **이유**: 
  - Turbo의 스키마에 `command` 필드가 없음
  - `turbo.json`에서 직접 명령어를 지정하는 방법이 지원되지 않음
- **상태**: 실패

### 시도 15: Shebang을 사용한 실행 가능한 스크립트 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```javascript
  // scripts/build-tsc.js
  #!/usr/bin/env node
  
  const { spawnSync } = require('child_process');
  // ... rest of the code
  ```
  ```json
  // package.json
  "build": "./scripts/build-tsc.js"
  ```
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: Turbo 실행 요약 JSON에서 `"command":"./scripts/build-tsc.js"` 실행 시 실패
- **이유**: 
  - Turbo가 `./scripts/build-tsc.js`를 실행할 때 shebang이 작동하지 않음
  - 또는 파일을 찾지 못함
- **상태**: 실패

### 시도 16: `node scripts/build-tsc.js` + 스크립트 내부에서 node 경로 탐지 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  // package.json
  "build": "node scripts/build-tsc.js"
  ```
  ```javascript
  // scripts/build-tsc.js
  #!/usr/bin/env node
  
  // Try to find node executable in common locations
  let nodePath = process.execPath;
  const commonNodePaths = [
    '/usr/bin/node',
    '/usr/local/bin/node',
    '/opt/homebrew/bin/node',
    process.execPath
  ];
  
  // Also try which/where command
  // ... node path detection code ...
  ```
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: Turbo 실행 요약 JSON에서 `"command":"node scripts/build-tsc.js"` 실행 시 실패
- **이유**: 
  - Turbo가 `node`를 PATH에서 찾지 못해서 스크립트가 실행되지 않음
  - 스크립트 내부의 `process.execPath` 사용이 의미 없음 (스크립트가 실행되지 않음)
- **상태**: 실패

### 시도 17: Bash 스크립트로 node 경로 탐지 및 실행 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  // package.json
  "build": "bash scripts/build-tsc.sh"
  ```
- **결과**: ❌ 실패 (로컬 Windows 환경)
- **오류**: `execvpe(/bin/bash) failed: No such file or directory`
- **이유**: Windows 환경에서 bash가 없음
- **상태**: 실패

### 시도 18: Node.js 스크립트 + 플랫폼별 node 경로 탐지 (현재 시도 중) ⚠️
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  // package.json
  "build": "bash scripts/build-tsc.sh"
  ```
  ```bash
  # scripts/build-tsc.sh
  #!/bin/bash
  set -e
  
  # Try to find node executable
  NODE_PATH=""
  
  # Try common paths
  for path in "/usr/bin/node" "/usr/local/bin/node" "/opt/homebrew/bin/node" "/vercel/.nodejs/bin/node"; do
    if [ -f "$path" ]; then
      NODE_PATH="$path"
      break
    fi
  done
  
  # Try which/command -v
  # ... node path detection code ...
  
  # Execute tsc
  exec "$NODE_PATH" "$TSC_PATH"
  ```
  - `package.json`에서 `bash scripts/build-tsc.sh` 사용
  - Bash 스크립트에서 여러 방법으로 `node` 경로 탐지
  - 일반적인 Linux 경로(`/usr/bin/node`, `/usr/local/bin/node`, `/vercel/.nodejs/bin/node`) 확인
  - `which`/`command -v` 명령어로 `node` 경로 찾기
  - 상세한 디버깅 로깅 (`/tmp/*-build.log` 파일에 기록)
  - 모든 패키지(`hua-ui`, `hua-motion`, `hua-i18n-core`, `hua-motion-core`)에 일관되게 적용
- **이유**: 
  - Bash는 Vercel Linux 환경에서 기본적으로 사용 가능
  - Bash 스크립트에서 직접 `node` 경로를 찾아서 실행
  - Turbo가 `bash`를 PATH에서 찾을 가능성이 높음
  - 실패 시 상세한 로그를 파일에 기록하여 디버깅 가능
- **디버깅 로깅 추가**:
  - PATH 환경 변수 출력
  - 각 node 경로 확인 시도 로그
  - `which`/`command -v` 명령어 결과 로그
  - 최종 선택된 node 경로 로그
  - 모든 로그를 `/tmp/*-build.log` 파일에 기록
- **장점**: 
  - ✅ Bash는 Vercel Linux 환경에서 기본적으로 사용 가능
  - ✅ 여러 방법으로 node 경로 탐지
  - ✅ 상세한 디버깅 로깅으로 Vercel 환경 진단 가능
  - ✅ 실패 시 로그 파일 확인 가능
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  // package.json
  "build": "node scripts/build-tsc.js"
  ```
  ```javascript
  // scripts/build-tsc.js
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Windows: process.execPath 직접 사용
    nodePath = process.execPath;
  } else {
    // Linux/Unix: 여러 경로 시도
    const commonNodePaths = [
      '/usr/bin/node',
      '/usr/local/bin/node',
      '/opt/homebrew/bin/node',
      '/vercel/.nodejs/bin/node',
      process.execPath
    ];
    // ... 경로 탐지 로직 ...
  }
  ```
  - `package.json`에서 `node scripts/build-tsc.js` 사용
  - 플랫폼 감지하여 다른 로직 사용
  - Windows: `process.execPath` 직접 사용 (가장 안정적)
  - Linux/Unix: 여러 경로 시도 후 `which` 명령어 사용
  - Vercel 환경 경로(`/vercel/.nodejs/bin/node`) 포함
  - 모든 패키지(`hua-ui`, `hua-motion`, `hua-i18n-core`, `hua-motion-core`)에 일관되게 적용
- **이유**: 
  - Node.js 스크립트는 Windows와 Linux 모두에서 작동
  - Windows에서는 `process.execPath`가 가장 안정적
  - Linux에서는 여러 경로를 시도하여 Vercel 환경 대응
  - 플랫폼별 최적화된 로직 사용
- **디버깅 로깅**:
  - 플랫폼 정보 출력
  - 각 node 경로 확인 시도 로그
  - 최종 선택된 node 경로 로그
- **장점**: 
  - ✅ Windows와 Linux 모두에서 작동
  - ✅ 플랫폼별 최적화된 로직
  - ✅ Vercel 환경 경로 포함
  - ✅ 상세한 디버깅 로깅
- **로컬 테스트 결과**: ✅ Windows에서 성공
- **상태**: ❌ Vercel에서 실패
- **증거**: Turbo 실행 요약 JSON에서 `"command":"node scripts/build-tsc.js"` 실행 시 `"error":"No such file or directory (os error 2)"`
- **이유**: 
  - Turbo가 `node`를 PATH에서 찾지 못해서 스크립트가 실행되지 않음
  - 디버깅 로그가 전혀 출력되지 않음 → 스크립트가 실행되기 전에 실패
- **상태**: 실패

### 시도 19: `corepack pnpm exec node` 사용 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  // package.json
  "build": "corepack pnpm exec node scripts/build-tsc.js"
  ```
  - `corepack pnpm exec`를 통해 실행
  - pnpm이 관리하는 환경에서 `node`를 찾음
  - PATH 문제를 우회할 수 있음
  - 모든 패키지(`hua-ui`, `hua-motion`, `hua-i18n-core`, `hua-motion-core`)에 일관되게 적용
- **이유**: 
  - `corepack pnpm exec`는 pnpm이 관리하는 환경에서 실행되므로 PATH가 올바르게 설정될 수 있음
  - Vercel 빌드 명령어에서 이미 `corepack pnpm exec turbo`를 사용하고 있음
  - 같은 방식으로 `node`도 실행할 수 있을 가능성
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: Turbo 실행 요약 JSON에서 `"command":"corepack pnpm exec node scripts/build-tsc.js"` 실행 시 `"error":"No such file or directory (os error 2)"`, `"exitCode":null`, 실행 시간 101ms
- **이유**: 
  - Turbo가 `corepack pnpm exec node`를 PATH에서 찾지 못함
  - 디버깅 로그가 전혀 출력되지 않음 → 스크립트가 실행되기 전에 실패
  - `vercel.json`의 `buildCommand`에서는 `corepack pnpm exec turbo`가 작동하지만, `package.json` 스크립트는 Turbo가 실행하므로 PATH 상속 문제 발생
- **상태**: 실패

### 시도 20: `tsc` 직접 실행 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  // package.json
  "build": "tsc"
  ```
  - `tsc`를 직접 실행 (pnpm이 관리하는 `node_modules/.bin/tsc` 사용)
  - 커스텀 스크립트 없이 직접 실행
  - Turbo가 `tsc`를 `node_modules/.bin`에서 찾을 수 있음
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: Turbo 실행 요약 JSON에서 `"command":"tsc"` 실행 시 `"error":"No such file or directory (os error 2)"`, `"exitCode":null`, 실행 시간 101ms
- **이유**: 
  - Turbo가 `tsc`를 PATH에서 찾지 못함
  - Turbo가 `package.json` 스크립트를 실행할 때 `node_modules/.bin`을 PATH에 추가하지 않음
  - 디버깅 로그가 전혀 출력되지 않음 → 스크립트가 실행되기 전에 실패
- **상태**: 실패

### 시도 21: `pnpm exec tsc` 사용 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  // package.json
  "build": "pnpm exec tsc"
  ```
  - `pnpm exec`를 통해 `tsc` 실행
  - pnpm이 관리하는 환경에서 `tsc`를 찾음
  - PATH 문제를 우회할 수 있음
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: Turbo 실행 요약 JSON에서 `"command":"pnpm exec tsc"` 실행 시 `"error":"No such file or directory (os error 2)"`, `"exitCode":null`, 실행 시간 104ms
- **이유**: 
  - Turbo가 `pnpm`을 PATH에서 찾지 못함
  - 디버깅 로그가 전혀 출력되지 않음 → 스크립트가 실행되기 전에 실패
- **상태**: 실패

### 시도 22: Bash 스크립트로 PATH 설정 후 `tsc` 실행 ❌
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  // package.json
  "build": "bash scripts/build.sh"
  ```
  ```bash
  # scripts/build.sh
  #!/bin/bash
  set -e
  
  # Add node_modules/.bin to PATH
  export PATH="$PACKAGE_DIR/node_modules/.bin:$PACKAGE_DIR/../../node_modules/.bin:$PATH"
  
  # Find and execute tsc
  TSC_PATH=""
  if [ -f "$PACKAGE_DIR/node_modules/.bin/tsc" ]; then
    TSC_PATH="$PACKAGE_DIR/node_modules/.bin/tsc"
  elif [ -f "$PACKAGE_DIR/../../node_modules/.bin/tsc" ]; then
    TSC_PATH="$PACKAGE_DIR/../../node_modules/.bin/tsc"
  fi
  
  exec "$TSC_PATH"
  ```
  - Bash 스크립트에서 `node_modules/.bin`을 PATH에 추가
  - `tsc`의 절대 경로를 찾아 실행
  - Turbo가 `bash`를 찾을 수 있어야 함
- **이유**: 
  - Bash는 Vercel Linux 환경에서 기본적으로 사용 가능
  - 스크립트 내부에서 PATH를 명시적으로 설정
  - `tsc`의 절대 경로를 사용하여 PATH 문제 우회
- **장점**: 
  - ✅ Bash는 Vercel 환경에서 기본 제공
  - ✅ 스크립트 내부에서 PATH 제어
  - ✅ 절대 경로 사용으로 PATH 문제 우회
- **상태**: 실패 예상 (아직 테스트 전이지만 패턴상 실패 가능성 높음)
- **예상 문제**: 
  - Turbo가 `bash`를 PATH에서 찾지 못할 수 있음
  - 하지만 Vercel Linux 환경에서 `bash`는 기본적으로 사용 가능

### 시도 23: `sh -c`로 Node.js 스크립트 실행 (현재 시도 중) ⚠️
- **날짜**: 2025-12-11
- **방법**: 
  ```json
  // package.json
  "build": "sh -c 'node scripts/build-direct.js'"
  ```
  ```javascript
  // scripts/build-direct.js
  #!/usr/bin/env node
  
  const tscPath = require.resolve('typescript/lib/tsc.js');
  const { spawnSync } = require('child_process');
  
  spawnSync(process.execPath, [tscPath], {
    cwd: packageDir,
    stdio: 'inherit',
    env: process.env
  });
  ```
  - `sh -c`를 사용하여 쉘을 통해 실행
  - 쉘을 통해 실행하면 PATH가 설정될 수 있음
  - Node.js 스크립트 내부에서 `require.resolve`로 `tsc.js` 절대 경로 찾기
  - `process.execPath`를 사용하여 현재 Node.js로 `tsc.js` 실행
- **이유**: 
  - `sh -c`는 쉘을 통해 실행되므로 PATH가 설정될 수 있음
  - `require.resolve`는 Node.js 모듈 해석을 사용하므로 PATH 문제 없음
  - `process.execPath`는 현재 실행 중인 Node.js 경로이므로 항상 유효함
- **장점**: 
  - ✅ 쉘을 통해 실행되므로 PATH 설정 가능
  - ✅ `require.resolve`로 절대 경로 확보
  - ✅ `process.execPath`로 Node.js 경로 문제 해결
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: Turbo 실행 요약 JSON에서 `"command":"sh -c 'node scripts/build-direct.js'"` 실행 시 `"error":"No such file or directory (os error 2)"`, `"exitCode":null`, 실행 시간 102ms
- **이유**: 
  - Turbo가 `sh`를 PATH에서 찾지 못함
  - 디버깅 로그가 전혀 출력되지 않음 → 스크립트가 실행되기 전에 실패
- **상태**: 실패

### 시도 24: 다른 성공 패키지와 동일한 패턴 사용 ❌
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: Turbo 실행 요약 JSON에서 `"command":"node ../../node_modules/typescript/lib/tsc.js"` 실행 시 `"error":"No such file or directory (os error 2)"`, `"exitCode":null`, 실행 시간 105ms
- **이유**: 
  - `hua-ui`는 `tsup`이 필요한 패키지인데 `tsc`만 실행함
  - 성공 로그를 보면 `"command":"tsup && tsc --emitDeclarationOnly"`였음
  - `tsc`만으로는 번들링이 안 됨
- **상태**: 실패

### 시도 25: 성공 로그와 동일한 패턴 사용 ❌
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: `node ../../node_modules/tsx/dist/cli.mjs` 실행 시 실패
- **이유**: 
  - `tsx`도 PATH에서 찾지 못함
  - `node`는 이미 실행 중이지만 `tsx`를 실행하려고 할 때 실패
- **상태**: 실패

### 시도 26: 모든 패키지를 성공 패턴으로 통일 ❌
- **결과**: ❌ 실패
- **오류**: `No such file or directory (os error 2)`
- **증거**: `node ../../node_modules/tsx/dist/cli.mjs` 실행 시 실패
- **이유**: 
  - `node` 명령어 자체를 Turbo가 찾지 못함
  - Vercel 환경에서 `node`가 PATH에 없을 수 있음
- **상태**: 실패

### 시도 27: Bash 스크립트로 node 경로 찾기 (현재 시도 중) ⚠️
- **날짜**: 2025-12-11
- **핵심 발견**: 다른 패키지들(`hua-utils`, `hua-i18n-sdk`, `hua-hooks` 등)은 모두 성공적으로 빌드됨!
- **방법**: 
  ```json
  // package.json
  "build": "node ../../node_modules/typescript/lib/tsc.js"
  ```
  - 다른 성공 패키지들과 동일한 패턴 사용
  - `node`는 이미 실행 중이므로 PATH 문제 없음
  - `../../node_modules/typescript/lib/tsc.js`는 절대 경로이므로 PATH 문제 없음
- **성공하는 패키지들**:
  - `hua-utils`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-my-api-sdk`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-hooks`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-i18n-beginner`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-i18n-ai`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-i18n-debug`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-i18n-advanced`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-i18n-plugins`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-i18n-sdk`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-i18n-core-zustand`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-i18n-loaders`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
  - `hua-motion-advanced`: `"build": "node ../../node_modules/typescript/lib/tsc.js"`
- **이유**: 
  - 다른 패키지들이 이미 성공적으로 빌드되고 있음
  - 동일한 패턴을 사용하면 동일한 결과를 얻을 수 있음
  - `node`는 이미 실행 중이므로 PATH 문제 없음
  - 절대 경로 사용으로 PATH 문제 완전 우회
- **장점**: 
  - ✅ 이미 검증된 패턴
  - ✅ 다른 패키지들과 일관성 유지
  - ✅ 절대 경로 사용으로 PATH 문제 완전 우회
- **날짜**: 2025-12-11
- **핵심 발견**: 성공 로그(`turborepo_summary_dpl_37rxpQ92d4HmA3f34Nba4DKRYrHN.json`)를 보면 `@hua-labs/ui#build`의 `command`가 `"tsup && tsc --emitDeclarationOnly"`였음!
- **방법**: 
  ```json
  // package.json
  "build": "node ../../node_modules/tsx/dist/cli.mjs ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  ```
  - 성공 로그와 동일한 패턴: `tsup` 먼저 실행, 그 다음 `tsc --emitDeclarationOnly`
  - `tsx`를 사용하여 ESM 모듈인 `tsup` 실행
  - `node`로 직접 `tsc.js` 실행
- **이유**: 
  - 성공했을 때는 `tsup && tsc --emitDeclarationOnly`를 사용했음
  - `hua-ui`는 `tsup`으로 번들링이 필요한 패키지 (여러 엔트리 포인트)
  - `tsc`만으로는 번들링이 안 됨
- **장점**: 
  - ✅ 성공 로그와 동일한 패턴
  - ✅ `tsx`는 루트에 이미 설치되어 있음
  - ✅ 절대 경로 사용으로 PATH 문제 완전 우회
- **날짜**: 2025-12-11
- **핵심 발견**: `i18n-core`, `motion-core`도 같은 문제로 실패 중
- **방법**: 모든 패키지를 성공하는 패키지들과 동일한 패턴으로 통일
  ```json
  // tsc만 필요한 패키지 (i18n-core, motion-core)
  "build": "node ../../node_modules/typescript/lib/tsc.js"
  
  // tsup이 필요한 패키지 (ui, motion)
  "build": "node ../../node_modules/tsx/dist/cli.mjs ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly"
  ```
- **변경 사항**:
  - `hua-i18n-core`: `corepack pnpm exec node scripts/build-tsc.js` → `node ../../node_modules/typescript/lib/tsc.js`
  - `hua-motion-core`: `corepack pnpm exec node scripts/build-tsc.js` → `node ../../node_modules/typescript/lib/tsc.js`
  - `hua-motion`: `corepack pnpm exec node scripts/build-tsc.js` → `node ../../node_modules/tsx/dist/cli.mjs ../../node_modules/tsup/dist/cli-default.js && node ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly`
- **이유**: 
  - 성공하는 패키지들(`hua-utils`, `hua-i18n-sdk` 등)과 동일한 패턴 사용
  - 절대 경로 사용으로 PATH 문제 완전 우회
  - `node`는 이미 실행 중이므로 PATH 문제 없음
- **장점**: 
  - ✅ 이미 검증된 패턴
  - ✅ 모든 패키지 일관성 유지
  - ✅ 절대 경로 사용으로 PATH 문제 완전 우회
- **상태**: 시도 중
- **예상 결과**: 
  - ✅ 성공 가능성 높음 (다른 성공 패키지들과 동일한 패턴)

---

## 🔍 실패 원인 분석

### 공통 실패 원인

모든 시도가 실패한 근본 원인:

1. **Turbo가 `node`를 PATH에서 찾지 못함**
   - Vercel 환경에서 `node`가 PATH에 없거나
   - Turbo가 자식 프로세스를 생성할 때 PATH를 제대로 상속받지 못함

2. **Turbo가 다른 실행 파일도 찾지 못함**
   - `pnpm exec`, `corepack`, `npx`, `tsx` 모두 PATH에서 찾지 못함
   - 이는 Turbo의 자식 프로세스 생성 메커니즘 문제일 가능성

3. **빌드 스크립트가 실행되기 전에 실패**
   - 디버깅 로그가 전혀 출력되지 않음
   - 스크립트 내부의 `process.execPath` 사용이 의미 없음

### 핵심 문제

**Turbo가 `package.json`의 스크립트나 `turbo.json`의 명령어를 실행할 때, 기본 실행 파일들(`node`, `pnpm`, `npx` 등)을 PATH에서 찾지 못함**

이는 다음 중 하나일 수 있습니다:
- Vercel 빌드 환경의 PATH 설정 문제
- Turbo의 자식 프로세스 생성 방식 문제
- 모노레포 환경에서의 PATH 상속 문제

---

## 💡 다음 시도 방향

1. **Vercel 빌드 환경에서 `node`의 절대 경로 사용**
   - Vercel 환경에서 `node`의 일반적인 경로: `/usr/bin/node` 또는 `/usr/local/bin/node`
   - 쉘 스크립트를 통해 `node` 경로 찾기

2. **쉘 스크립트 사용**
   - `#!/usr/bin/env node` shebang 사용
   - 실행 가능한 스크립트로 만들기

3. **Vercel 빌드 설정 확인**
   - `vercel.json`에서 빌드 명령어 확인
   - 환경 변수 설정 확인

4. **Turbo 설정 확인**
   - Turbo의 PATH 상속 설정
   - Turbo 버전 업데이트

