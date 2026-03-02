# create-hua Detailed Guide

Complete technical reference for the hua framework project scaffolding CLI.
hua 프레임워크 프로젝트 스캐폴딩 CLI에 대한 완전한 기술 레퍼런스입니다.

---

## English

### Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [CLI Options](#cli-options)
- [Generated Project Structure](#generated-project-structure)
- [AI Context Files](#ai-context-files)
- [Template System](#template-system)
- [Monorepo Support](#monorepo-support)
- [Configuration](#configuration)
- [Validation & Doctor](#validation--doctor)
- [Troubleshooting](#troubleshooting)

---

## Overview

`create-hua` is a scaffolding CLI tool that generates preconfigured Next.js projects with the hua framework. It provides:

- **Zero-Config Setup** - Get started with a single command
- **Multi-AI Tool Support** - Context files for Cursor, Claude, OpenAI Codex, and more
- **Bilingual Documentation** - Korean and English support
- **Monorepo-Aware** - Auto-detects workspace structure and adjusts Tailwind paths
- **Validation Built-in** - Ensures project integrity before and after creation

### Package Information

- **Package Name**: `@hua-labs/create-hua` or `create-hua`
- **Purpose**: Scaffold new hua framework projects
- **Usage**: `npx @hua-labs/create-hua my-app`
- **Requirements**: Node.js 22+, pnpm

---

## Quick Start

### Interactive Mode

```bash
npx @hua-labs/create-hua my-app
```

The CLI will prompt you for:
- AI context files to generate (Cursor rules, Claude context, etc.)
- Documentation language preference (Korean, English, or both)

### Non-Interactive Mode

```bash
npx @hua-labs/create-hua my-app --claude-skills --lang both --non-interactive
```

### With Auto-Install

```bash
npx @hua-labs/create-hua my-app --install
```

This will automatically run `pnpm install` after project creation.

---

## CLI Options

### Basic Usage

```bash
npx @hua-labs/create-hua <project-name> [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `<project-name>` | Project directory name (required) | Interactive prompt |
| `--claude-skills` | Include Claude Code skills files | `false` |
| `--no-cursorrules` | Skip Cursor IDE rules file | Include |
| `--no-ai-context` | Skip general AI context file | Include |
| `--no-claude-context` | Skip Claude project context | Include |
| `--lang <ko\|en\|both>` | Documentation language | `both` |
| `--dry-run` | Preview without creating files | `false` |
| `--install` | Auto-install dependencies after creation | `false` |
| `--non-interactive` | Skip all prompts, use defaults | `false` |
| `--english-only` | CLI messages in English only | Bilingual |
| `doctor [path]` | Run diagnostic on existing project | - |

### Examples

```bash
# Basic project with defaults
npx @hua-labs/create-hua my-app

# Project with Claude skills, English docs only
npx @hua-labs/create-hua my-app --claude-skills --lang en

# Dry-run to preview structure
npx @hua-labs/create-hua my-app --dry-run

# Full setup with auto-install
npx @hua-labs/create-hua my-app --claude-skills --install

# Minimal AI context
npx @hua-labs/create-hua my-app --no-cursorrules --no-claude-context

# Diagnose existing project
npx @hua-labs/create-hua doctor ./my-app
```

---

## Generated Project Structure

```
my-app/
├── app/
│   ├── layout.tsx                    # Uses HuaProvider from @hua-labs/hua
│   ├── page.tsx                      # Uses HuaPage component
│   ├── globals.css                   # Global styles with Tailwind
│   └── api/
│       └── translations/
│           └── [language]/
│               └── [namespace]/
│                   └── route.ts      # i18n API route
│
├── components/
│   └── LanguageToggle.tsx            # Example component
│
├── lib/
│   ├── i18n-setup.ts                 # i18n initialization
│   └── utils.ts                      # Utility functions
│
├── store/
│   └── useAppStore.ts                # Zustand store example
│
├── translations/
│   ├── ko/
│   │   └── common.json               # Korean translations
│   └── en/
│       └── common.json               # English translations
│
├── public/
│   ├── logo.svg
│   └── next.svg
│
├── hua.config.ts                     # Generated dynamically
├── package.json                      # Generated dynamically
├── tailwind.config.js                # Generated dynamically (monorepo-aware)
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js config
├── postcss.config.js                 # PostCSS config
├── .eslintrc.json                    # ESLint config
│
├── ai-context.md                     # General AI tool context (SSOT)
├── .cursorrules                      # Cursor IDE rules
├── AGENTS.md                         # OpenAI Codex rules (from template)
├── skills.md                         # Antigravity skills (from template)
│
└── .claude/
    ├── project-context.md            # Claude Code project context
    └── skills/
        └── hua-framework/
            └── SKILL.md              # Claude Code skills (optional)
```

### Key Features

- **HuaProvider in layout.tsx**: Wraps app with framework context
- **Bilingual translations**: Pre-configured Korean and English namespaces
- **Zustand store**: Example state management setup
- **i18n API route**: Dynamic translation loading
- **Multiple AI context files**: Support for 5+ AI coding tools

---

## AI Context Files

`create-hua` generates context files for multiple AI coding tools. The system follows a SSOT (Single Source of Truth) pattern with `ai-context.md` as the canonical reference.

### File Types

| File | Tool | Format | Purpose |
|------|------|--------|---------|
| `ai-context.md` | General | Markdown | SSOT for all AI tools |
| `.cursorrules` | Cursor IDE | Text | Cursor-specific rules |
| `.claude/project-context.md` | Claude Code | Markdown | Claude project context |
| `.claude/skills/hua-framework/SKILL.md` | Claude Code | Markdown | Framework usage guide |
| `AGENTS.md` | OpenAI Codex | Markdown | Codex-specific rules |
| `skills.md` | Antigravity | Markdown | Antigravity skills |

### ai-context.md (SSOT)

The primary context file that includes:
- Framework architecture overview
- Component usage patterns
- i18n setup and usage
- State management with Zustand
- Common code patterns
- Package version information

Example content:
```markdown
# my-app - hua Project AI Context

**Project Name**: my-app

## Overview
This is a hua framework project using Next.js, TypeScript, and Tailwind CSS.

## Architecture
- Framework: @hua-labs/hua
- Components: @hua-labs/ui (via hua)
- State: Zustand
- i18n: @hua-labs/i18n-core (via hua)

## Installed Package Versions
- `@hua-labs/hua`: workspace:*
- `next`: ^15.1.6
- `react`: ^19.0.0
```

### .cursorrules (Cursor IDE)

Cursor-specific rules in MDC format:
```yaml
---
rules:
  - path: "**/*.{ts,tsx}"
    alwaysApply: true
---

# hua Framework Rules for Cursor

## Component Usage
- Use @hua-labs/ui components first
- Import from `@hua-labs/hua/ui`
```

### .claude/ (Claude Code)

Claude-specific context and skills:

**project-context.md**: Project overview, architecture, and patterns
**skills/hua-framework/SKILL.md**: Interactive guide for framework usage (optional, enabled with `--claude-skills`)

### Customization

All AI context files are customized with:
- Project name insertion
- Package version information
- Project-specific dependencies

---

## Template System

### How It Works

1. **Template Directory**: `templates/nextjs/` contains the base template
2. **Copy Phase**: Files are copied to the target project directory
3. **Generation Phase**: Dynamic files are generated:
   - `package.json` - with correct dependencies and versions
   - `hua.config.ts` - framework configuration
   - `tailwind.config.js` - with monorepo-aware content paths
4. **Customization Phase**: AI context files are updated with project info
5. **Validation Phase**: Project integrity is verified

### Template Files vs. Generated Files

**Copied from Template:**
- All TypeScript/JavaScript source files
- Configuration files (tsconfig.json, next.config.ts)
- Translation JSON files
- AI context files (base versions)

**Generated Dynamically:**
- `package.json` - versions are computed at runtime
- `hua.config.ts` - includes latest framework options
- `tailwind.config.js` - adjusted for monorepo context

### Version Management

Package versions are determined by:

1. **Monorepo Detection** (workspace:*):
   - Checks for `HUA_WORKSPACE_VERSION` environment variable
   - Looks for `pnpm-workspace.yaml` in parent directories
   - Fallback: Detects `hua-platform` in directory path

2. **Standalone Install** (^x.y.z):
   - Reads version from `packages/hua/package.json`
   - Uses constants from `src/constants/versions.ts`

---

## Monorepo Support

### Auto-Detection

`create-hua` automatically detects monorepo context by looking for:

1. `pnpm-workspace.yaml` file in parent directories
2. `package.json` with `workspaces` field
3. Directory structure hints (`packages/`, `apps/` directories)

### Tailwind Content Paths

Tailwind config is generated differently based on context:

**Standalone Install:**
```javascript
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/@hua-labs/ui/**/*.{ts,tsx}',
    './node_modules/@hua-labs/hua/**/*.{ts,tsx}',
  ],
};
```

**Monorepo Install:**
```javascript
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/hua-ui/src/**/*.{ts,tsx}',
    '../../packages/hua/src/**/*.{ts,tsx}',
  ],
};
```

### Project Location Detection

The CLI detects where the project is created within a monorepo:
- `root` - Project at monorepo root
- `apps` - Project in `apps/` directory
- `packages` - Project in `packages/` directory
- `other` - Project in custom location

This affects relative path calculation for Tailwind content paths.

---

## Configuration

### hua.config.ts

Generated configuration file with framework presets:

```typescript
import { defineConfig } from '@hua-labs/hua/framework/config';

export default defineConfig({
  // Preset: 'product' or 'marketing'
  preset: 'product',

  // i18n settings
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },

  // Motion/animation settings
  motion: {
    defaultPreset: 'product',
    enableAnimations: true,
  },

  // State management
  state: {
    persist: true,
    ssr: true,
  },
});
```

### package.json

Generated with dependencies:

```json
{
  "dependencies": {
    "@hua-labs/hua": "workspace:*",
    "@phosphor-icons/react": "^2.1.9",
    "next": "^15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@types/node": "^25.2.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@tailwindcss/postcss": "^4.1.1",
    "autoprefixer": "^11.0.1",
    "postcss": "^9.0.1",
    "tailwindcss": "^4.1.1",
    "typescript": "^5.9.3"
  }
}
```

**Note**: Only `@hua-labs/hua` is added to dependencies. Other hua packages (ui, motion-core, i18n-core, etc.) are transitive dependencies to avoid React Context duplication issues.

---

## Validation & Doctor

### Validation Phases

**1. Pre-Creation Validation:**
- Node.js version check (22+)
- pnpm availability
- Template integrity check
- Directory existence and emptiness

**2. Post-Creation Validation:**
- package.json existence and structure
- hua.config.ts existence
- Required directories (app, lib, store, translations)
- Required files (layout.tsx, page.tsx, tsconfig.json)
- Translation JSON syntax

### Doctor Command

Diagnose existing project health:

```bash
npx @hua-labs/create-hua doctor
npx @hua-labs/create-hua doctor ./my-app
```

**Checks performed:**
- Project directory existence
- package.json validity
- @hua-labs/hua dependency presence
- hua.config.ts existence
- Required directory structure
- Translation file JSON syntax
- Node.js and pnpm availability

**Output:**
```
🔍 Diagnosing project: ./my-app

📋 Checking prerequisites...
✅ Prerequisites OK

🔬 Diagnosing project structure...

✅ Project is healthy! No issues found.
```

Or if issues are found:
```
❌ Found 2 error(s):
  1. @hua-labs/hua not found in dependencies
     💡 Run: pnpm install @hua-labs/hua
  2. hua.config.ts not found
     💡 This file is required for hua framework. Re-run create-hua.

⚠️  Found 1 warning(s):
  1. Required directory missing: translations
     💡 Re-run create-hua to restore project structure
```

---

## Troubleshooting

### Directory Already Exists

**Issue:** `Directory "my-app" already exists and is not empty`

**Solution:**
```bash
# Use a different name
npx @hua-labs/create-hua my-app-v2

# Or remove the existing directory
rm -rf my-app
npx @hua-labs/create-hua my-app
```

---

### Node.js Version Too Old

**Issue:** `Node.js 22.0.0+ required. Current: v20.x.x`

**Solution:**
- Update Node.js: https://nodejs.org/
- Use nvm: `nvm install 22 && nvm use 22`

---

### pnpm Not Found

**Issue:** `pnpm is required. Install: npm install -g pnpm`

**Solution:**
```bash
npm install -g pnpm
# or
corepack enable pnpm
```

---

### Template Validation Failed

**Issue:** `Template files missing: app/layout.tsx, ...`

**Solution:**
This usually indicates a corrupted package installation.

```bash
# Clear npm cache and reinstall
npm cache clean --force
npx clear-npx-cache
npx @hua-labs/create-hua@latest my-app
```

---

### Tailwind Not Picking Up Styles

**Issue:** Styles from hua-ui components not applying

**Solution:**
Check `tailwind.config.js` content paths:

```javascript
// Make sure hua packages are included
content: [
  './app/**/*.{ts,tsx}',
  './node_modules/@hua-labs/hua/**/*.{ts,tsx}',
  // or for monorepo
  '../../packages/hua/src/**/*.{ts,tsx}',
]
```

Re-run doctor to regenerate:
```bash
rm tailwind.config.js
npx @hua-labs/create-hua doctor
```

---

### Translation Not Loading

**Issue:** `t('common:welcome')` not working

**Solution:**
1. Check translation files exist:
   - `translations/ko/common.json`
   - `translations/en/common.json`

2. Verify JSON syntax:
```bash
npx @hua-labs/create-hua doctor
```

3. Check i18n setup in `lib/i18n-setup.ts`

4. Ensure API route exists: `app/api/translations/[language]/[namespace]/route.ts`

---

### Workspace Version Not Resolving

**Issue:** `Cannot find module '@hua-labs/hua'` in monorepo

**Solution:**
```bash
# Install from monorepo root
pnpm install

# Or force workspace version
HUA_WORKSPACE_VERSION=workspace pnpm install
```

---

### Dry-Run Shows Different Structure

**Issue:** Actual project differs from dry-run preview

**Solution:**
This might indicate a version mismatch. Use the latest version:

```bash
npx @hua-labs/create-hua@latest --dry-run my-app
npx @hua-labs/create-hua@latest my-app
```

---

### AI Context Files Not Generated

**Issue:** Expected AI context files missing

**Solution:**
Check the options you passed:

```bash
# Enable all AI context
npx @hua-labs/create-hua my-app

# Or explicitly enable
npx @hua-labs/create-hua my-app --claude-skills --lang both
```

If files were skipped:
```bash
# Regenerate AI context manually
npx @hua-labs/create-hua doctor my-app
```

---

## Korean

### 목차

- [개요](#개요-1)
- [빠른 시작](#빠른-시작-1)
- [CLI 옵션](#cli-옵션-1)
- [생성된 프로젝트 구조](#생성된-프로젝트-구조-1)
- [AI 컨텍스트 파일](#ai-컨텍스트-파일-1)
- [템플릿 시스템](#템플릿-시스템-1)
- [모노레포 지원](#모노레포-지원-1)
- [설정](#설정-1)
- [검증 및 Doctor](#검증-및-doctor-1)
- [문제 해결](#문제-해결-1)

---

## 개요

`create-hua`는 hua 프레임워크가 사전 설정된 Next.js 프로젝트를 생성하는 스캐폴딩 CLI 도구입니다. 주요 기능:

- **제로 설정** - 단일 명령으로 시작
- **다중 AI 도구 지원** - Cursor, Claude, OpenAI Codex 등을 위한 컨텍스트 파일
- **이중 언어 문서** - 한국어 및 영어 지원
- **모노레포 인식** - 워크스페이스 구조를 자동 감지하고 Tailwind 경로 조정
- **내장 검증** - 프로젝트 생성 전후 무결성 보장

### 패키지 정보

- **패키지 이름**: `@hua-labs/create-hua` 또는 `create-hua`
- **목적**: 새로운 hua 프레임워크 프로젝트 스캐폴딩
- **사용법**: `npx @hua-labs/create-hua my-app`
- **요구사항**: Node.js 22+, pnpm

---

## 빠른 시작

### 대화형 모드

```bash
npx @hua-labs/create-hua my-app
```

CLI가 다음을 묻습니다:
- 생성할 AI 컨텍스트 파일 (Cursor 규칙, Claude 컨텍스트 등)
- 문서 언어 선호도 (한국어, 영어 또는 둘 다)

### 비대화형 모드

```bash
npx @hua-labs/create-hua my-app --claude-skills --lang both --non-interactive
```

### 자동 설치 포함

```bash
npx @hua-labs/create-hua my-app --install
```

프로젝트 생성 후 자동으로 `pnpm install`을 실행합니다.

---

## CLI 옵션

### 기본 사용법

```bash
npx @hua-labs/create-hua <project-name> [options]
```

### 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `<project-name>` | 프로젝트 디렉토리 이름 (필수) | 대화형 프롬프트 |
| `--claude-skills` | Claude Code 스킬 파일 포함 | `false` |
| `--no-cursorrules` | Cursor IDE 규칙 파일 생략 | 포함 |
| `--no-ai-context` | 범용 AI 컨텍스트 파일 생략 | 포함 |
| `--no-claude-context` | Claude 프로젝트 컨텍스트 생략 | 포함 |
| `--lang <ko\|en\|both>` | 문서 언어 | `both` |
| `--dry-run` | 파일 생성 없이 미리보기 | `false` |
| `--install` | 생성 후 의존성 자동 설치 | `false` |
| `--non-interactive` | 모든 프롬프트 건너뛰고 기본값 사용 | `false` |
| `--english-only` | CLI 메시지를 영어로만 표시 | 이중 언어 |
| `doctor [path]` | 기존 프로젝트 진단 실행 | - |

### 예제

```bash
# 기본 프로젝트 (기본값 사용)
npx @hua-labs/create-hua my-app

# Claude 스킬 포함, 영어 문서만
npx @hua-labs/create-hua my-app --claude-skills --lang en

# 구조 미리보기 (드라이런)
npx @hua-labs/create-hua my-app --dry-run

# 자동 설치 포함 전체 설정
npx @hua-labs/create-hua my-app --claude-skills --install

# 최소 AI 컨텍스트
npx @hua-labs/create-hua my-app --no-cursorrules --no-claude-context

# 기존 프로젝트 진단
npx @hua-labs/create-hua doctor ./my-app
```

---

## 생성된 프로젝트 구조

```
my-app/
├── app/
│   ├── layout.tsx                    # @hua-labs/hua의 HuaProvider 사용
│   ├── page.tsx                      # HuaPage 컴포넌트 사용
│   ├── globals.css                   # Tailwind 포함 전역 스타일
│   └── api/
│       └── translations/
│           └── [language]/
│               └── [namespace]/
│                   └── route.ts      # i18n API 라우트
│
├── components/
│   └── LanguageToggle.tsx            # 예제 컴포넌트
│
├── lib/
│   ├── i18n-setup.ts                 # i18n 초기화
│   └── utils.ts                      # 유틸리티 함수
│
├── store/
│   └── useAppStore.ts                # Zustand 스토어 예제
│
├── translations/
│   ├── ko/
│   │   └── common.json               # 한국어 번역
│   └── en/
│       └── common.json               # 영어 번역
│
├── public/
│   ├── logo.svg
│   └── next.svg
│
├── hua.config.ts                     # 동적으로 생성됨
├── package.json                      # 동적으로 생성됨
├── tailwind.config.js                # 동적으로 생성됨 (모노레포 인식)
├── tsconfig.json                     # TypeScript 설정
├── next.config.ts                    # Next.js 설정
├── postcss.config.js                 # PostCSS 설정
├── .eslintrc.json                    # ESLint 설정
│
├── ai-context.md                     # 범용 AI 도구 컨텍스트 (SSOT)
├── .cursorrules                      # Cursor IDE 규칙
├── AGENTS.md                         # OpenAI Codex 규칙 (템플릿에서)
├── skills.md                         # Antigravity 스킬 (템플릿에서)
│
└── .claude/
    ├── project-context.md            # Claude Code 프로젝트 컨텍스트
    └── skills/
        └── hua-framework/
            └── SKILL.md              # Claude Code 스킬 (선택)
```

### 주요 기능

- **layout.tsx의 HuaProvider**: 앱을 프레임워크 컨텍스트로 래핑
- **이중 언어 번역**: 사전 설정된 한국어 및 영어 네임스페이스
- **Zustand 스토어**: 상태 관리 설정 예제
- **i18n API 라우트**: 동적 번역 로딩
- **다중 AI 컨텍스트 파일**: 5개 이상의 AI 코딩 도구 지원

---

## AI 컨텍스트 파일

`create-hua`는 여러 AI 코딩 도구를 위한 컨텍스트 파일을 생성합니다. 시스템은 `ai-context.md`를 정규 참조로 하는 SSOT(Single Source of Truth) 패턴을 따릅니다.

### 파일 유형

| 파일 | 도구 | 형식 | 목적 |
|------|------|------|------|
| `ai-context.md` | 범용 | Markdown | 모든 AI 도구의 SSOT |
| `.cursorrules` | Cursor IDE | Text | Cursor 전용 규칙 |
| `.claude/project-context.md` | Claude Code | Markdown | Claude 프로젝트 컨텍스트 |
| `.claude/skills/hua-framework/SKILL.md` | Claude Code | Markdown | 프레임워크 사용 가이드 |
| `AGENTS.md` | OpenAI Codex | Markdown | Codex 전용 규칙 |
| `skills.md` | Antigravity | Markdown | Antigravity 스킬 |

### ai-context.md (SSOT)

다음을 포함하는 기본 컨텍스트 파일:
- 프레임워크 아키텍처 개요
- 컴포넌트 사용 패턴
- i18n 설정 및 사용법
- Zustand를 사용한 상태 관리
- 일반적인 코드 패턴
- 패키지 버전 정보

예제 내용:
```markdown
# my-app - hua 프로젝트 AI 컨텍스트

**프로젝트 이름**: my-app

## 개요
Next.js, TypeScript, Tailwind CSS를 사용하는 hua 프레임워크 프로젝트입니다.

## 아키텍처
- 프레임워크: @hua-labs/hua
- 컴포넌트: @hua-labs/ui (hua를 통해)
- 상태: Zustand
- i18n: @hua-labs/i18n-core (hua를 통해)

## 설치된 패키지 버전
- `@hua-labs/hua`: workspace:*
- `next`: ^15.1.6
- `react`: ^19.0.0
```

### .cursorrules (Cursor IDE)

MDC 형식의 Cursor 전용 규칙:
```yaml
---
rules:
  - path: "**/*.{ts,tsx}"
    alwaysApply: true
---

# Cursor를 위한 hua 프레임워크 규칙

## 컴포넌트 사용
- @hua-labs/ui 컴포넌트를 먼저 사용
- `@hua-labs/hua/ui`에서 import
```

### .claude/ (Claude Code)

Claude 전용 컨텍스트 및 스킬:

**project-context.md**: 프로젝트 개요, 아키텍처 및 패턴
**skills/hua-framework/SKILL.md**: 프레임워크 사용을 위한 대화형 가이드 (선택, `--claude-skills`로 활성화)

### 커스터마이징

모든 AI 컨텍스트 파일은 다음으로 커스터마이징됩니다:
- 프로젝트 이름 삽입
- 패키지 버전 정보
- 프로젝트별 의존성

---

## 템플릿 시스템

### 작동 방식

1. **템플릿 디렉토리**: `templates/nextjs/`에 기본 템플릿 포함
2. **복사 단계**: 파일을 대상 프로젝트 디렉토리로 복사
3. **생성 단계**: 동적 파일 생성:
   - `package.json` - 올바른 의존성 및 버전 포함
   - `hua.config.ts` - 프레임워크 설정
   - `tailwind.config.js` - 모노레포 인식 content 경로 포함
4. **커스터마이징 단계**: AI 컨텍스트 파일을 프로젝트 정보로 업데이트
5. **검증 단계**: 프로젝트 무결성 확인

### 템플릿 파일 vs. 생성 파일

**템플릿에서 복사:**
- 모든 TypeScript/JavaScript 소스 파일
- 설정 파일 (tsconfig.json, next.config.ts)
- 번역 JSON 파일
- AI 컨텍스트 파일 (기본 버전)

**동적으로 생성:**
- `package.json` - 버전은 런타임에 계산
- `hua.config.ts` - 최신 프레임워크 옵션 포함
- `tailwind.config.js` - 모노레포 컨텍스트에 맞게 조정

### 버전 관리

패키지 버전은 다음과 같이 결정됩니다:

1. **모노레포 감지** (workspace:*):
   - `HUA_WORKSPACE_VERSION` 환경 변수 확인
   - 상위 디렉토리에서 `pnpm-workspace.yaml` 찾기
   - 폴백: 디렉토리 경로에서 `hua-platform` 감지

2. **독립 실행형 설치** (^x.y.z):
   - `packages/hua/package.json`에서 버전 읽기
   - `src/constants/versions.ts`의 상수 사용

---

## 모노레포 지원

### 자동 감지

`create-hua`는 다음을 찾아 모노레포 컨텍스트를 자동으로 감지합니다:

1. 상위 디렉토리의 `pnpm-workspace.yaml` 파일
2. `workspaces` 필드가 있는 `package.json`
3. 디렉토리 구조 힌트 (`packages/`, `apps/` 디렉토리)

### Tailwind Content 경로

Tailwind 설정은 컨텍스트에 따라 다르게 생성됩니다:

**독립 실행형 설치:**
```javascript
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/@hua-labs/ui/**/*.{ts,tsx}',
    './node_modules/@hua-labs/hua/**/*.{ts,tsx}',
  ],
};
```

**모노레포 설치:**
```javascript
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/hua-ui/src/**/*.{ts,tsx}',
    '../../packages/hua/src/**/*.{ts,tsx}',
  ],
};
```

### 프로젝트 위치 감지

CLI는 모노레포 내에서 프로젝트가 생성되는 위치를 감지합니다:
- `root` - 모노레포 루트의 프로젝트
- `apps` - `apps/` 디렉토리의 프로젝트
- `packages` - `packages/` 디렉토리의 프로젝트
- `other` - 사용자 정의 위치의 프로젝트

이는 Tailwind content 경로의 상대 경로 계산에 영향을 미칩니다.

---

## 설정

### hua.config.ts

프레임워크 프리셋이 포함된 생성된 설정 파일:

```typescript
import { defineConfig } from '@hua-labs/hua/framework/config';

export default defineConfig({
  // 프리셋: 'product' 또는 'marketing'
  preset: 'product',

  // i18n 설정
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },

  // 모션/애니메이션 설정
  motion: {
    defaultPreset: 'product',
    enableAnimations: true,
  },

  // 상태 관리
  state: {
    persist: true,
    ssr: true,
  },
});
```

### package.json

의존성이 포함되어 생성됨:

```json
{
  "dependencies": {
    "@hua-labs/hua": "workspace:*",
    "@phosphor-icons/react": "^2.1.9",
    "next": "^15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@types/node": "^25.2.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@tailwindcss/postcss": "^4.1.1",
    "autoprefixer": "^11.0.1",
    "postcss": "^9.0.1",
    "tailwindcss": "^4.1.1",
    "typescript": "^5.9.3"
  }
}
```

**참고**: 의존성에는 `@hua-labs/hua`만 추가됩니다. 다른 hua 패키지(ui, motion-core, i18n-core 등)는 React Context 중복 문제를 피하기 위해 전이 의존성입니다.

---

## 검증 및 Doctor

### 검증 단계

**1. 생성 전 검증:**
- Node.js 버전 확인 (22+)
- pnpm 사용 가능 여부
- 템플릿 무결성 확인
- 디렉토리 존재 및 비어있는지 확인

**2. 생성 후 검증:**
- package.json 존재 및 구조
- hua.config.ts 존재
- 필수 디렉토리 (app, lib, store, translations)
- 필수 파일 (layout.tsx, page.tsx, tsconfig.json)
- 번역 JSON 구문

### Doctor 명령

기존 프로젝트 상태 진단:

```bash
npx @hua-labs/create-hua doctor
npx @hua-labs/create-hua doctor ./my-app
```

**수행되는 검사:**
- 프로젝트 디렉토리 존재
- package.json 유효성
- @hua-labs/hua 의존성 존재
- hua.config.ts 존재
- 필수 디렉토리 구조
- 번역 파일 JSON 구문
- Node.js 및 pnpm 사용 가능 여부

**출력:**
```
🔍 프로젝트 진단 중: ./my-app

📋 사전 요구사항 확인 중...
✅ 사전 요구사항 OK

🔬 프로젝트 구조 진단 중...

✅ 프로젝트가 정상입니다! 문제가 없습니다.
```

또는 문제가 발견된 경우:
```
❌ 2개의 오류를 발견했습니다:
  1. 의존성에 @hua-labs/hua가 없습니다
     💡 실행: pnpm install @hua-labs/hua
  2. hua.config.ts를 찾을 수 없습니다
     💡 이 파일은 hua 프레임워크에 필요합니다. create-hua를 다시 실행하세요.

⚠️  1개의 경고를 발견했습니다:
  1. 필수 디렉토리 누락: translations
     💡 프로젝트 구조를 복원하려면 create-hua를 다시 실행하세요
```

---

## 문제 해결

### 디렉토리가 이미 존재함

**문제:** `디렉토리 "my-app"가 이미 존재하며 비어있지 않습니다`

**해결:**
```bash
# 다른 이름 사용
npx @hua-labs/create-hua my-app-v2

# 또는 기존 디렉토리 제거
rm -rf my-app
npx @hua-labs/create-hua my-app
```

---

### Node.js 버전이 너무 오래됨

**문제:** `Node.js 22.0.0+ 필요합니다. 현재: v20.x.x`

**해결:**
- Node.js 업데이트: https://nodejs.org/
- nvm 사용: `nvm install 22 && nvm use 22`

---

### pnpm을 찾을 수 없음

**문제:** `pnpm이 필요합니다. 설치: npm install -g pnpm`

**해결:**
```bash
npm install -g pnpm
# 또는
corepack enable pnpm
```

---

### 템플릿 검증 실패

**문제:** `템플릿 파일 누락: app/layout.tsx, ...`

**해결:**
이는 일반적으로 손상된 패키지 설치를 나타냅니다.

```bash
# npm 캐시 지우고 재설치
npm cache clean --force
npx clear-npx-cache
npx @hua-labs/create-hua@latest my-app
```

---

### Tailwind가 스타일을 인식하지 못함

**문제:** hua-ui 컴포넌트의 스타일이 적용되지 않음

**해결:**
`tailwind.config.js` content 경로 확인:

```javascript
// hua 패키지가 포함되어 있는지 확인
content: [
  './app/**/*.{ts,tsx}',
  './node_modules/@hua-labs/hua/**/*.{ts,tsx}',
  // 또는 모노레포의 경우
  '../../packages/hua/src/**/*.{ts,tsx}',
]
```

Doctor를 다시 실행하여 재생성:
```bash
rm tailwind.config.js
npx @hua-labs/create-hua doctor
```

---

### 번역이 로드되지 않음

**문제:** `t('common:welcome')`이 작동하지 않음

**해결:**
1. 번역 파일이 존재하는지 확인:
   - `translations/ko/common.json`
   - `translations/en/common.json`

2. JSON 구문 확인:
```bash
npx @hua-labs/create-hua doctor
```

3. `lib/i18n-setup.ts`의 i18n 설정 확인

4. API 라우트 존재 확인: `app/api/translations/[language]/[namespace]/route.ts`

---

### 워크스페이스 버전이 해결되지 않음

**문제:** 모노레포에서 `모듈 '@hua-labs/hua'를 찾을 수 없습니다`

**해결:**
```bash
# 모노레포 루트에서 설치
pnpm install

# 또는 워크스페이스 버전 강제
HUA_WORKSPACE_VERSION=workspace pnpm install
```

---

### 드라이런이 다른 구조를 표시함

**문제:** 실제 프로젝트가 드라이런 미리보기와 다름

**해결:**
버전 불일치를 나타낼 수 있습니다. 최신 버전 사용:

```bash
npx @hua-labs/create-hua@latest --dry-run my-app
npx @hua-labs/create-hua@latest my-app
```

---

### AI 컨텍스트 파일이 생성되지 않음

**문제:** 예상 AI 컨텍스트 파일이 없음

**해결:**
전달한 옵션 확인:

```bash
# 모든 AI 컨텍스트 활성화
npx @hua-labs/create-hua my-app

# 또는 명시적으로 활성화
npx @hua-labs/create-hua my-app --claude-skills --lang both
```

파일이 건너뛴 경우:
```bash
# AI 컨텍스트 수동 재생성
npx @hua-labs/create-hua doctor my-app
```

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/HUA-Labs/hua-packages/blob/main/CONTRIBUTING.md).

기여를 환영합니다! [기여 가이드](https://github.com/HUA-Labs/hua-packages/blob/main/CONTRIBUTING.md)를 읽어주세요.

## License

MIT © HUA Labs
