# Pro 코드 보호 전략

## 현실적인 제약사항

### 완전히 숨기는 것은 불가능
- npm에 배포된 패키지는 `node_modules`에 설치됨
- 빌드된 JavaScript 코드는 역컴파일 가능
- 하지만 **소스 코드 자체는 보호 가능**

### 보호 가능한 것
- ✅ TypeScript 소스 코드
- ✅ 원본 컴포넌트 구조
- ✅ 주석과 문서
- ✅ 개발 환경 설정

### 보호 불가능한 것
- ❌ 빌드된 JavaScript 코드 (역컴파일 가능)
- ❌ 실행되는 로직 (디버깅 가능)

---

## 보호 방법

### 방법 1: 소스 코드 제외 + 빌드된 파일만 배포 ✅ **추천**

**구조:**
```
packages/hua-ui-pro/
├── src/              # 소스 코드 (private repo에만)
├── dist/             # 빌드된 파일만 npm에 배포
└── package.json      # files: ["dist"] 설정
```

**package.json 설정:**
```json
{
  "name": "@hua-labs/ui-pro",
  "version": "1.0.0",
  "files": [
    "dist"  // 소스 코드 제외, 빌드된 파일만 포함
  ],
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts"
}
```

**tsup.config.ts 설정:**
```ts
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: false,  // ✅ 소스맵 제거 (디버깅 어렵게)
    minify: true,      // ✅ 코드 최소화
    treeshake: true,
    splitting: true,
    outDir: 'dist',
  }
]);
```

**장점:**
- ✅ 소스 코드는 private repo에만 유지
- ✅ 빌드된 파일만 npm에 배포
- ✅ TypeScript 타입 정의는 제공 (사용 편의성)
- ✅ 구현 세부사항은 숨김

**단점:**
- ⚠️ 빌드된 코드는 역컴파일 가능 (하지만 어려움)
- ⚠️ 소스맵 없으면 디버깅 어려움 (사용자 경험 저하)

---

### 방법 2: npm Private Package (유료)

**npm Private Package 사용:**
```json
{
  "name": "@hua-labs/ui-pro",
  "private": true,  // 또는 npm 조직의 private package
  "publishConfig": {
    "access": "restricted"
  }
}
```

**장점:**
- ✅ npm에서 직접 접근 제어
- ✅ 인증된 사용자만 설치 가능

**단점:**
- ❌ npm 유료 플랜 필요 ($7/월 per user)
- ❌ 설치한 사용자는 여전히 코드 확인 가능

---

### 방법 3: Private Registry

**자체 npm registry 운영:**
- GitHub Packages
- AWS CodeArtifact
- Verdaccio (self-hosted)
- Bytesafe

**장점:**
- ✅ 완전한 접근 제어
- ✅ 라이선스 관리 용이

**단점:**
- ❌ 인프라 관리 필요
- ❌ 사용자 설정 복잡

---

### 방법 4: 코드 난독화 (Obfuscation)

**도구:**
- `javascript-obfuscator`
- `terser` (minify + mangle)

**tsup.config.ts:**
```ts
import { defineConfig } from 'tsup';
import obfuscator from 'rollup-plugin-obfuscator';

export default defineConfig({
  // ... 기타 설정
  esbuildOptions(options) {
    options.minify = true;
    options.mangle = true;  // 변수명 난독화
  },
  plugins: [
    obfuscator({
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
    })
  ]
});
```

**장점:**
- ✅ 코드 읽기 어렵게 만듦
- ✅ 역컴파일 어려움

**단점:**
- ⚠️ 성능 오버헤드 가능
- ⚠️ 디버깅 매우 어려움
- ⚠️ 완전한 보호는 아님

---

## 최종 권장안: 하이브리드 접근

### ✅ 방법 1 (소스 제외) + 방법 2 (Private Package)

**구조:**
```
Private Repo (GitHub Private):
├── packages/hua-ui-pro/
│   ├── src/              # 소스 코드 (private)
│   ├── dist/             # 빌드된 파일
│   └── package.json      # files: ["dist"]

Public npm:
└── @hua-labs/ui-pro      # 빌드된 dist만 배포
```

**설정:**

1. **package.json:**
```json
{
  "name": "@hua-labs/ui-pro",
  "version": "1.0.0",
  "private": false,  // npm에 배포하되
  "files": [
    "dist"  // 소스 코드 제외
  ],
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts"
}
```

2. **tsup.config.ts:**
```ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false,  // ✅ 소스맵 제거
  minify: true,      // ✅ 최소화
  treeshake: true,
  splitting: true,
  outDir: 'dist',
});
```

3. **.npmignore 또는 files 필드:**
```
# 소스 코드 제외
src/
*.ts
*.tsx
!dist/**/*.d.ts  # 타입 정의는 포함
tsconfig.json
tsup.config.ts
```

---

## 추가 보호 레이어

### 런타임 라이선스 체크 (선택사항)

```tsx
// @hua-labs/ui-pro/src/components/TransactionsTable.tsx
'use client';

import { useEffect } from 'react';

export function TransactionsTable(props: TransactionsTableProps) {
  useEffect(() => {
    // 라이선스 체크 (선택사항)
    if (process.env.NODE_ENV === 'production') {
      // 라이선스 검증 로직
    }
  }, []);

  // ... 컴포넌트 구현
}
```

**주의:**
- 클라이언트 사이드에서는 완전한 보호 불가능
- 서버 사이드에서만 효과적

---

## 구현 계획

### Phase 1: Pro 패키지 생성

1. **packages/hua-ui-pro 생성**
   ```bash
   mkdir packages/hua-ui-pro
   cd packages/hua-ui-pro
   ```

2. **package.json 설정**
   ```json
   {
     "name": "@hua-labs/ui-pro",
     "version": "1.0.0",
     "private": false,
     "files": ["dist"],
     "main": "./dist/index.js",
     "module": "./dist/index.mjs",
     "types": "./dist/index.d.ts"
   }
   ```

3. **tsup.config.ts 설정**
   - `sourcemap: false`
   - `minify: true`

### Phase 2: 빌드 및 배포

1. **소스 코드는 private repo에만 유지**
2. **빌드된 dist만 npm에 배포**
3. **.npmignore로 소스 제외 확인**

### Phase 3: 사용자 인증 (선택사항)

1. **npm Private Package로 전환** (유료)
2. **또는 Private Registry 사용**

---

## 결론

### ✅ 실용적인 보호 방법

1. **소스 코드 제외**
   - `files: ["dist"]` 설정
   - `.npmignore`로 소스 제외
   - 빌드된 파일만 npm에 배포

2. **소스맵 제거**
   - `sourcemap: false`
   - 디버깅 정보 제거

3. **코드 최소화**
   - `minify: true`
   - 변수명 난독화

4. **Private Repo 유지**
   - 소스 코드는 private GitHub repo에만
   - Public npm에는 빌드된 파일만

### ⚠️ 한계

- 빌드된 JavaScript는 역컴파일 가능
- 하지만 소스 코드 자체는 보호됨
- 구현 세부사항은 숨김

### 🎯 권장안

**현실적인 보호 수준:**
- ✅ 소스 코드는 private repo에만
- ✅ 빌드된 파일만 npm 배포
- ✅ 소스맵 제거
- ✅ 코드 최소화
- ⚠️ 완전한 숨김은 불가능하지만, 실용적으로 충분한 보호
