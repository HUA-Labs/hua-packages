# Vercel에서 pnpm 버전 지정하기

> **작성일**: 2025-12-04  
> **문제**: Vercel 빌드 시 pnpm 버전 불일치 오류  
> **해결**: corepack을 사용한 pnpm 버전 명시적 지정

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
ERR_PNPM_UNSUPPORTED_ENGINE  Unsupported environment (bad pnpm and/or Node.js version)

Your pnpm version is incompatible with "/vercel/path0".

Expected version: >=10.17.0
Got: 6.35.1

This is happening because the package's manifest has an engines.pnpm field specified.
```

### 문제 발생 환경

- **플랫폼**: Vercel
- **프로젝트 타입**: 모노레포 (pnpm workspaces)
- **요구 버전**: pnpm >=10.17.0
- **Vercel 기본 버전**: pnpm 6.35.1

---

## 🤔 왜 발생했나?

### 1. **Vercel의 기본 pnpm 버전**

Vercel은 기본적으로 오래된 pnpm 버전(6.35.1)을 사용합니다. 최신 프로젝트는 보통 pnpm 8.x 이상을 사용하므로 버전 불일치가 발생합니다.

### 2. **package.json의 engines 필드**

```json
{
  "engines": {
    "pnpm": ">=10.17.0"
  },
  "packageManager": "pnpm@10.24.0"
}
```

프로젝트에서 pnpm 10.17.0 이상을 요구하지만, Vercel은 이를 자동으로 인식하지 못합니다.

### 3. **모노레포의 복잡성**

모노레포에서는 각 앱의 `vercel.json`에서 pnpm 버전을 명시적으로 지정해야 합니다.

---

## ✅ 해결 방법

### 핵심 아이디어: **corepack을 사용한 명시적 버전 지정**

Node.js의 `corepack`을 사용하여 pnpm 버전을 명시적으로 지정합니다.

### 방법 1: corepack use + corepack pnpm (권장)

```json
{
  "installCommand": "corepack enable && corepack use pnpm@10.24.0 && cd ../.. && corepack pnpm install --frozen-lockfile --ignore-scripts=false"
}
```

**작동 원리:**
1. `corepack enable`: corepack 활성화
2. `corepack use pnpm@10.24.0`: pnpm 10.24.0을 활성화하고 현재 디렉토리에 설정
3. `corepack pnpm`: corepack이 관리하는 pnpm을 직접 실행

### 방법 2: corepack prepare (작동하지 않음)

```json
{
  "installCommand": "corepack enable && corepack prepare pnpm@10.24.0 --activate && cd ../.. && pnpm install --frozen-lockfile"
}
```

**문제점:**
- `corepack prepare`는 pnpm을 준비만 하고 활성화하지 않음
- 이후 `pnpm` 명령어는 여전히 시스템의 기본 pnpm(6.35.1)을 사용
- `--activate` 플래그가 있어도 현재 세션에서만 작동하지 않을 수 있음

---

## 💻 실제 코드

### Before (작동하지 않는 코드)

#### vercel.json

```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile --ignore-scripts=false",
  "buildCommand": "cd ../.. && turbo run build --filter=my-app"
}
```

**문제**: Vercel이 기본 pnpm 6.35.1을 사용

#### 첫 번째 시도 (실패)

```json
{
  "installCommand": "corepack enable && corepack prepare pnpm@10.24.0 --activate && cd ../.. && pnpm install --frozen-lockfile --ignore-scripts=false"
}
```

**문제**: `corepack prepare` 후에도 `pnpm` 명령어가 시스템 기본 pnpm을 사용

### After (해결된 코드)

#### vercel.json

```json
{
  "framework": "nextjs",
  "installCommand": "corepack enable && corepack use pnpm@10.24.0 && cd ../.. && corepack pnpm install --frozen-lockfile --ignore-scripts=false",
  "buildCommand": "cd ../.. && turbo run build --filter=my-app",
  "devCommand": "cd ../.. && pnpm --filter my-app run dev"
}
```

**핵심 변경 사항:**
1. `corepack prepare` → `corepack use`
2. `pnpm install` → `corepack pnpm install`

---

## 🎓 배운 점

### 1. **corepack prepare vs corepack use**

```bash
# prepare: pnpm을 준비만 함 (다운로드)
corepack prepare pnpm@10.24.0 --activate

# use: pnpm을 활성화하고 현재 디렉토리에 설정
corepack use pnpm@10.24.0
```

**차이점:**
- `prepare`: pnpm을 다운로드하지만, `pnpm` 명령어는 여전히 시스템 기본 버전 사용
- `use`: pnpm을 활성화하고, `.node-version` 또는 `package.json`의 `packageManager` 필드를 읽어 설정

### 2. **corepack pnpm 직접 사용**

```bash
# 시스템 pnpm 사용 (버전 불일치 가능)
pnpm install

# corepack이 관리하는 pnpm 사용 (올바른 버전 보장)
corepack pnpm install
```

**장점:**
- corepack이 `package.json`의 `packageManager` 필드를 읽어 올바른 버전 사용
- 시스템에 설치된 pnpm 버전에 의존하지 않음

### 3. **모노레포에서의 Vercel 설정**

모노레포에서는 각 앱의 `vercel.json`에서 명시적으로 설정해야 합니다:

```
apps/
├── my-app/
│   └── vercel.json  ← 여기서 설정
├── my-api/
│   └── vercel.json  ← 여기서 설정
└── my-chat/
    └── vercel.json  ← 여기서 설정
```

### 4. **package.json의 packageManager 필드**

```json
{
  "packageManager": "pnpm@10.24.0"
}
```

이 필드는 corepack이 올바른 버전을 사용하도록 도와줍니다. 하지만 Vercel에서는 명시적으로 `corepack use`를 호출해야 합니다.

---

## ⚠️ 주의사항

### 1. **corepack use의 동작 방식**

```bash
# corepack use는 현재 디렉토리에 .node-version 또는 package.json을 읽음
corepack use pnpm@10.24.0

# 모노레포에서는 루트로 이동한 후 실행해야 함
cd ../.. && corepack use pnpm@10.24.0
```

### 2. **buildCommand와 devCommand**

```json
{
  "installCommand": "corepack enable && corepack use pnpm@10.24.0 && cd ../.. && corepack pnpm install",
  "buildCommand": "cd ../.. && turbo run build --filter=my-app",
  "devCommand": "cd ../.. && pnpm --filter my-app run dev"
}
```

**주의:**
- `installCommand`에서는 `corepack pnpm` 사용
- `buildCommand`와 `devCommand`에서는 일반 `pnpm` 사용 가능 (이미 활성화됨)
- 하지만 안전을 위해 `corepack pnpm` 사용 권장

### 3. **Node.js 버전 호환성**

corepack은 Node.js 16.9+ 또는 Node.js 14.19+에서 사용 가능합니다. Vercel은 최신 Node.js를 사용하므로 문제없습니다.

---

## 🔍 대안적 해결 방법

### 방법 1: Vercel 프로젝트 설정에서 지정

Vercel 대시보드에서:
1. Settings > Build & Development Settings
2. Install Command에 직접 입력
3. Package Manager를 pnpm으로 선택

**장점**: UI에서 관리 가능  
**단점**: 각 프로젝트마다 수동 설정 필요

### 방법 2: .npmrc 사용 (작동하지 않음)

```ini
# .npmrc
package-manager=pnpm@10.24.0
```

**문제**: Vercel이 이를 인식하지 않음

### 방법 3: npx pnpm 사용

```json
{
  "installCommand": "npx pnpm@10.24.0 install --frozen-lockfile"
}
```

**장점**: 간단함  
**단점**: 매번 다운로드하므로 느림

---

## 📚 참고 자료

### 공식 문서

- [Corepack Documentation](https://nodejs.org/api/corepack.html)
- [Vercel Build Settings](https://vercel.com/docs/build-step)
- [pnpm Installation](https://pnpm.io/installation)

### 관련 아티클

- [Vercel에서 pnpm 사용하기](https://vercel.com/docs/build-step#using-pnpm)
- [Corepack으로 패키지 매니저 관리하기](https://nodejs.org/en/blog/announcements/v18-release-announce#corepack)

### 우리 프로젝트

- [`apps/my-app/vercel.json`](../../vercel.json)
- [`apps/my-api/vercel.json`](../../../my-api/vercel.json)
- [`package.json`](../../../../package.json)

---

## 📊 적용 결과

### 빌드 성공률

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| Vercel 빌드 성공률 | 0% | 100% | ✅ |
| pnpm 버전 오류 | 발생 | 해결 | ✅ |
| 빌드 시간 | N/A | 정상 | ✅ |

### 적용된 프로젝트

1. `apps/my-app` - ✅
2. `apps/my-api` - ✅

---

## 💡 결론

Vercel에서 pnpm 버전을 지정하려면:

✅ **corepack use + corepack pnpm 사용**  
✅ **각 앱의 vercel.json에서 명시적으로 설정**  
✅ **package.json의 packageManager 필드와 일치시키기**

이 패턴은 다른 모노레포 프로젝트에서도 동일하게 적용할 수 있습니다!

---

**Created**: 2025-12-04  
**Last Updated**: 2025-12-04  
**Author**: HUA Team

