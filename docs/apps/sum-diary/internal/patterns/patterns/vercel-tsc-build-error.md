# Vercel에서 tsc 빌드 오류 해결하기

> **작성일**: 2025-12-07  
> **문제**: Vercel 빌드 시 "No such file or directory (os error 2)" 오류  
> **해결**: `pnpm exec tsc`를 사용하여 tsc 실행 파일 경로 명시

---

## 📋 목차

1. [문제 상황](#문제-상황)
2. [왜 발생했나?](#왜-발생했나)
3. [해결 방법](#해결-방법)
4. [실제 코드](#실제-코드)
5. [배운 점](#배운-점)
6. [참고 자료](#참고-자료)

---

## 🔴 문제 상황

### 발생한 에러

```
@hua-labs/i18n-core:build: ERROR: command finished with error: No such file or directory (os error 2)
@hua-labs/motion-core:build: ERROR: command finished with error: No such file or directory (os error 2)
```

### 문제 발생 환경

- **플랫폼**: Vercel
- **프로젝트 타입**: 모노레포 (pnpm workspaces)
- **빌드 도구**: TypeScript Compiler (tsc)
- **에러 타입**: 실행 파일을 찾을 수 없음

---

## 🤔 왜 발생했나?

### 1. **Vercel 환경의 PATH 제한**

Vercel 빌드 환경에서는 시스템 PATH에 모든 실행 파일이 포함되어 있지 않습니다. 특히 모노레포에서는 각 패키지의 `node_modules/.bin`에 실행 파일이 있지만, 전역 PATH에는 없을 수 있습니다.

### 2. **pnpm의 의존성 관리 방식**

pnpm은 각 패키지의 의존성을 격리된 `node_modules`에 저장합니다. `typescript`가 `devDependencies`에 설치되어 있어도, 직접 `tsc` 명령어를 실행하면 PATH에서 찾을 수 없을 수 있습니다.

### 3. **로컬 vs Vercel 환경 차이**

로컬 환경에서는:
- `tsc`가 전역으로 설치되어 있거나
- `node_modules/.bin`이 PATH에 자동으로 추가되어 작동

Vercel 환경에서는:
- 전역 설치가 없음
- PATH에 `node_modules/.bin`이 자동으로 추가되지 않음

---

## ✅ 해결 방법

### 핵심 아이디어: **pnpm exec를 사용하여 실행 파일 경로 명시**

`pnpm exec`는 pnpm이 관리하는 실행 파일을 자동으로 찾아 실행합니다.

### 방법 1: pnpm exec tsc (권장)

```json
{
  "scripts": {
    "build": "pnpm exec tsc",
    "dev": "pnpm exec tsc --watch"
  }
}
```

**작동 원리:**
1. `pnpm exec`는 pnpm이 관리하는 실행 파일을 찾음
2. 루트 `node_modules/.bin` 또는 현재 패키지의 `node_modules/.bin`에서 `tsc`를 찾음
3. 올바른 경로의 `tsc`를 실행

### 방법 2: npx tsc (대안)

```json
{
  "scripts": {
    "build": "npx tsc"
  }
}
```

**장점**: npx가 자동으로 실행 파일을 찾아줌  
**단점**: 매번 확인하므로 약간 느릴 수 있음

### 방법 3: 직접 경로 지정 (비권장)

```json
{
  "scripts": {
    "build": "../../node_modules/.bin/tsc"
  }
}
```

**문제점**: 경로가 하드코딩되어 유연하지 않음

---

## 💻 실제 코드

### Before (작동하지 않는 코드)

#### packages/hua-i18n-core/package.json

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

**문제**: Vercel에서 `tsc` 명령어를 찾을 수 없음

### After (해결된 코드)

#### packages/hua-i18n-core/package.json

```json
{
  "scripts": {
    "build": "pnpm exec tsc",
    "dev": "pnpm exec tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

**핵심 변경 사항:**
- `tsc` → `pnpm exec tsc`
- `tsc --watch` → `pnpm exec tsc --watch`

---

## 🎓 배운 점

### 1. **pnpm exec의 동작 방식**

```bash
# 직접 실행 (PATH에 없으면 실패)
tsc

# pnpm exec 사용 (자동으로 올바른 경로 찾음)
pnpm exec tsc
```

**장점:**
- pnpm이 자동으로 올바른 실행 파일을 찾아줌
- 모노레포 환경에서도 안정적으로 작동
- 로컬과 Vercel 환경 모두에서 동일하게 작동

### 2. **tsup vs tsc**

처음에는 `tsup`을 사용하려고 했지만, Vercel 환경에서 실행 파일을 찾지 못하는 문제가 발생했습니다. 결국 성공했을 때의 설정인 `tsc`로 되돌렸습니다.

**tsup 문제점:**
- Vercel에서 실행 파일 경로를 찾지 못함
- 다양한 경로 시도 (`node_modules/tsup/dist/cli-default.js`, `../../node_modules/tsup/dist/cli-default.js` 등) 모두 실패

**tsc 해결책:**
- `pnpm exec tsc`를 사용하여 pnpm이 자동으로 경로를 찾도록 함

### 3. **모노레포에서의 빌드 스크립트 작성 원칙**

```json
{
  "scripts": {
    // ❌ 직접 실행 (환경에 따라 실패할 수 있음)
    "build": "tsc",
    
    // ✅ pnpm exec 사용 (항상 작동)
    "build": "pnpm exec tsc",
    
    // ✅ npx 사용 (대안)
    "build": "npx tsc"
  }
}
```

**권장 사항:**
- 모노레포에서는 항상 `pnpm exec` 또는 `npx` 사용
- 직접 실행 파일 이름만 사용하지 않기
- Vercel 같은 CI/CD 환경을 고려하여 작성

### 4. **pnpm-lock.yaml 업데이트**

의존성을 변경한 후에는 반드시 `pnpm-lock.yaml`을 업데이트해야 합니다:

```bash
# 의존성 변경 후
pnpm install

# 변경사항 커밋
git add pnpm-lock.yaml
git commit -m "chore: update pnpm-lock.yaml"
```

**중요**: Vercel은 `--frozen-lockfile` 플래그를 사용하므로, `pnpm-lock.yaml`이 최신 상태여야 합니다.

---

## ⚠️ 주의사항

### 1. **다른 패키지와의 일관성**

프로젝트의 다른 패키지들도 `tsc`를 직접 사용하고 있다면, 모두 `pnpm exec tsc`로 변경하는 것을 고려해야 합니다:

```bash
# 모든 패키지의 build 스크립트 확인
grep -r '"build": "tsc"' packages/
```

### 2. **로컬 개발 환경**

로컬에서는 `tsc`가 직접 작동할 수 있지만, 일관성을 위해 `pnpm exec tsc`를 사용하는 것이 좋습니다.

### 3. **빌드 성능**

`pnpm exec`는 실행 파일을 찾는 과정이 있지만, 실제 빌드 시간에는 큰 영향이 없습니다.

---

## 🔍 대안적 해결 방법

### 방법 1: TypeScript를 루트에 설치

```json
// 루트 package.json
{
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

**장점**: 모든 패키지에서 사용 가능  
**단점**: 버전 관리가 복잡해질 수 있음

### 방법 2: turbo.json에서 명시적 경로 지정

```json
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**"],
      "env": ["NODE_ENV"]
    }
  }
}
```

**문제**: 실행 파일 경로 문제는 해결되지 않음

---

## 📚 참고 자료

### 공식 문서

- [pnpm exec Documentation](https://pnpm.io/cli/exec)
- [Vercel Build Settings](https://vercel.com/docs/build-step)
- [TypeScript Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)

### 관련 패턴 문서

- [Vercel에서 pnpm 버전 지정하기](./vercel-pnpm-version.md)
- [Next.js 빌드 타임 모듈 실행 문제 해결](./build-time-module-execution.md)

### 우리 프로젝트

- [`packages/hua-i18n-core/package.json`](../../../../packages/hua-i18n-core/package.json)
- [`packages/hua-motion-core/package.json`](../../../../packages/hua-motion-core/package.json)

---

## 📊 적용 결과

### 빌드 성공률

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| Vercel 빌드 성공률 | 0% | 100% | ✅ |
| tsc 실행 파일 오류 | 발생 | 해결 | ✅ |
| 빌드 시간 | N/A | 정상 | ✅ |

### 적용된 패키지

1. `@hua-labs/i18n-core` - ✅
2. `@hua-labs/motion-core` - ✅

---

## 💡 결론

Vercel에서 `tsc` 빌드 오류를 해결하려면:

✅ **`pnpm exec tsc` 사용**  
✅ **모노레포에서는 항상 `pnpm exec` 또는 `npx` 사용**  
✅ **의존성 변경 후 `pnpm-lock.yaml` 업데이트 필수**

이 패턴은 다른 빌드 도구(`eslint`, `prettier`, `jest` 등)에도 동일하게 적용할 수 있습니다!

---

**Created**: 2025-12-07  
**Last Updated**: 2025-12-07  
**Author**: HUA Team




