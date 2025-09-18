# HUA Platform 모노레포 스캐폴딩 가이드

## 🎯 목표
기존 분산된 프로젝트들을 `hua-platform` 모노레포로 물리적으로 통합

## 📁 현재 구조 → 목표 구조

### 현재 구조
```
G:\HUA\
├── hua-api/              # SUM API (베타 서비스)
├── sdk/
│   ├── hua-sdk-lite-v2/  # SDK Lite v2.2.1
│   └── i18n-sdk/         # i18n SDK 1.3.0
├── hua-demo/             # API 테스트 데모
├── my-chat/             # 챗 인터페이스 (클로즈 베타)
├── my-app/            # 일기앱 (개발 예정)
└── hua-labs/             # 현재 작업 중
```

### 목표 구조
```
G:\HUA\hua-platform\
├── apps/
│   ├── my-chat/         # 감정 대화 앱
│   ├── my-app/        # 감정 일기 앱
│   ├── api/              # SUM API 서버
│   ├── demo/             # API 테스트 데모
│   ├── website/          # 공식 사이트
│   └── docs/             # 문서 사이트
├── packages/
│   ├── hua-sdk-lite/     # 기존 SDK Lite
│   ├── hua-i18n-core/    # i18n 기본 기능
│   ├── hua-i18n-plugins/ # i18n 플러그인
│   ├── hua-i18n-ai/      # i18n AI 번역
│   ├── hua-i18n-generator/ # i18n JSON 생성기
│   ├── hua-i18n-monitor/ # i18n 성능 모니터링
│   ├── hua-i18n-cli/     # i18n CLI 도구
│   ├── hua-utils/        # 공통 유틸리티
│   ├── hua-types/        # 공통 타입 정의
│   └── hua-config/       # 공통 설정
├── tools/
│   ├── cli/              # CLI 도구
│   ├── build/            # 빌드 스크립트
│   └── scripts/          # 유틸리티 스크립트
├── infra/
│   ├── firebase/         # Firebase 설정
│   └── supabase/         # Supabase 설정
├── .turbo/               # Turborepo 캐시
├── turbo.json            # 빌드 설정
├── pnpm-workspace.yaml   # pnpm 워크스페이스
├── tsconfig.base.json    # 공통 TypeScript 설정
└── package.json          # 루트 패키지
```

## 🚀 단계별 스캐폴딩

### Phase 1: 기본 구조 생성

#### 1. 루트 디렉토리 생성
```bash
# G:\HUA\ 디렉토리에서
mkdir hua-platform
cd hua-platform
```

#### 2. 기본 폴더 구조 생성
```bash
# apps 폴더 생성
mkdir apps
mkdir apps\my-chat
mkdir apps\my-app
mkdir apps\api
mkdir apps\demo
mkdir apps\website
mkdir apps\docs

# packages 폴더 생성
mkdir packages
mkdir packages\hua-sdk-lite
mkdir packages\hua-i18n-core
mkdir packages\hua-i18n-plugins
mkdir packages\hua-i18n-ai
mkdir packages\hua-i18n-generator
mkdir packages\hua-i18n-monitor
mkdir packages\hua-i18n-cli
mkdir packages\hua-utils
mkdir packages\hua-types
mkdir packages\hua-config

# tools 폴더 생성
mkdir tools
mkdir tools\cli
mkdir tools\build
mkdir tools\scripts

# infra 폴더 생성
mkdir infra
mkdir infra\firebase
mkdir infra\supabase
```

### Phase 2: 루트 설정 파일 생성

#### 1. package.json (루트)
```json
{
  "name": "hua-platform",
  "version": "1.0.0",
  "private": true,
  "description": "HUA Labs - 감정 인터페이스 플랫폼",
  "workspaces": [
    "apps/*",
    "packages/*",
    "tools/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    "type-check": "turbo run type-check",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@turbo/gen": "^1.12.0",
    "turbo": "^1.12.0",
    "typescript": "^5.3.0",
    "prettier": "^3.1.0",
    "eslint": "^8.56.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  },
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

#### 2. pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

#### 3. turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "clean": {
      "cache": false
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

#### 4. tsconfig.base.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@hua-labs/*": ["./packages/*/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### 5. .gitignore
```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
build/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# Turbo
.turbo

# TypeScript
*.tsbuildinfo

# IDE
.vscode/
.idea/

# OS
Thumbs.db
```

#### 6. README.md
```markdown
# HUA Platform

HUA Labs - 감정 인터페이스 플랫폼

## 🚀 빠른 시작

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev

# 빌드
pnpm build

# 테스트
pnpm test
```

## 📁 구조

- `apps/` - 애플리케이션들
- `packages/` - 공통 패키지들
- `tools/` - 개발 도구들
- `infra/` - 인프라 설정

## 🛠️ 개발

각 앱/패키지는 독립적으로 개발할 수 있습니다:

```bash
# 특정 앱 개발
pnpm dev --filter=my-chat
pnpm dev --filter=api

# 특정 패키지 빌드
pnpm build --filter=hua-sdk-lite
```
```

### Phase 3: 기존 프로젝트 마이그레이션

#### 1. hua-api → apps/api
```bash
# hua-api 폴더의 모든 내용을 apps/api로 복사
xcopy "G:\HUA\hua-api\*" "G:\HUA\hua-platform\apps\api\" /E /I /H

# package.json 수정
cd apps/api
# package.json의 name을 "@hua-labs/api"로 변경
```

#### 2. hua-sdk-lite-v2 → packages/hua-sdk-lite
```bash
# hua-sdk-lite-v2 폴더의 모든 내용을 packages/hua-sdk-lite로 복사
xcopy "G:\HUA\sdk\hua-sdk-lite-v2\*" "G:\HUA\hua-platform\packages\hua-sdk-lite\" /E /I /H

# package.json 수정
cd packages/hua-sdk-lite
# package.json의 name을 "@hua-labs/sdk-lite"로 변경
```

#### 3. i18n-sdk → packages/hua-i18n-* (모듈별 분리)
```bash
# i18n-sdk의 core 기능을 hua-i18n-core로 복사
xcopy "G:\HUA\sdk\i18n-sdk\src\core\*" "G:\HUA\hua-platform\packages\hua-i18n-core\src\" /E /I /H

# i18n-sdk의 plugins를 hua-i18n-plugins로 복사
xcopy "G:\HUA\sdk\i18n-sdk\src\plugins\*" "G:\HUA\hua-platform\packages\hua-i18n-plugins\src\" /E /I /H

# i18n-sdk의 AI 기능을 hua-i18n-ai로 복사
xcopy "G:\HUA\sdk\i18n-sdk\src\plugins\builtin\gpt-translator.ts" "G:\HUA\hua-platform\packages\hua-i18n-ai\src\" /E /I /H
```

#### 4. my-chat → apps/my-chat
```bash
# my-chat 폴더의 모든 내용을 apps/my-chat으로 복사
xcopy "G:\HUA\my-chat\*" "G:\HUA\hua-platform\apps\my-chat\" /E /I /H

# package.json 수정
cd apps/my-chat
# 의존성을 workspace 패키지로 변경
```

#### 5. hua-demo → apps/demo
```bash
# hua-demo 폴더의 모든 내용을 apps/demo로 복사
xcopy "G:\HUA\hua-demo\*" "G:\HUA\hua-platform\apps\demo\" /E /I /H
```

### Phase 4: 공통 패키지 생성

#### 1. packages/hua-utils/package.json
```json
{
  "name": "@hua-labs/utils",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

#### 2. packages/hua-types/package.json
```json
{
  "name": "@hua-labs/types",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

#### 3. packages/hua-config/package.json
```json
{
  "name": "@hua-labs/config",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

### Phase 5: 의존성 정리

#### 1. 각 패키지의 package.json 수정
```json
{
  "dependencies": {
    "@hua-labs/utils": "workspace:*",
    "@hua-labs/types": "workspace:*",
    "@hua-labs/config": "workspace:*"
  }
}
```

#### 2. 루트에서 의존성 설치
```bash
cd G:\HUA\hua-platform
pnpm install
```

## 🚨 주의사항

### 1. 백업 필수
```bash
# 기존 프로젝트들 백업
mkdir G:\HUA\backup
xcopy "G:\HUA\hua-api" "G:\HUA\backup\hua-api\" /E /I /H
xcopy "G:\HUA\sdk" "G:\HUA\backup\sdk\" /E /I /H
xcopy "G:\HUA\my-chat" "G:\HUA\backup\my-chat\" /E /I /H
xcopy "G:\HUA\hua-demo" "G:\HUA\backup\hua-demo\" /E /I /H
```

### 2. Git 히스토리 보존
```bash
# 각 프로젝트의 Git 히스토리를 보존하려면
git subtree add --prefix=apps/api ../hua-api main
git subtree add --prefix=packages/hua-sdk-lite ../sdk/hua-sdk-lite-v2 main
```

### 3. 환경 변수 정리
- 각 앱의 `.env` 파일들을 `infra/` 폴더로 이동
- 공통 환경 변수는 루트 `.env` 파일로 통합

## ✅ 검증 단계

### 1. 빌드 테스트
```bash
pnpm build
```

### 2. 개발 서버 테스트
```bash
pnpm dev --filter=api
pnpm dev --filter=my-chat
```

### 3. 의존성 테스트
```bash
pnpm test
```

## 🎯 완료 후 다음 단계

1. **CI/CD 설정**: GitHub Actions + Vercel
2. **문서 사이트 구축**: apps/docs
3. **공식 사이트 구축**: apps/website
4. **CLI 도구 개발**: tools/cli

---

**이 스캐폴딩을 따라하면 완전한 모노레포 구조가 완성됩니다!** 🚀 