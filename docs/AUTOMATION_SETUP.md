# 자동화 설정 가이드

이 문서는 자동화 기능을 설정하는 방법을 설명합니다.

---

## 1. Git Hooks 설정 (Pre-commit)

### 설치

```bash
# Husky 및 lint-staged 설치
pnpm add -D husky lint-staged

# Husky 초기화
pnpm exec husky init
```

### Pre-commit Hook 설정

`.husky/pre-commit` 파일 생성:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Staged 파일만 체크
pnpm exec lint-staged
```

### Lint-staged 설정

`package.json`에 추가:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### 효과

- 커밋 전 자동으로 린트 및 포맷팅 실행
- 잘못된 코드 커밋 방지
- 코드 스타일 일관성 유지

---

## 2. PR 자동 생성 스크립트

### 사용법

```bash
# 기본 사용 (develop 브랜치 기준)
pnpm generate:pr

# Base 브랜치 지정
pnpm generate:pr --base=main

# 파일로 저장
pnpm generate:pr --output=pr-description.md
```

### 기능

- 변경된 파일 목록 자동 추출
- 커밋 메시지 분석하여 변경 사항 분류
- PR 템플릿 자동 채우기

---

## 3. AI 컨텍스트 자동 생성 스크립트

### 사용법

```bash
# 기본 사용 (develop 브랜치 기준)
pnpm generate:ai-context

# Base 브랜치 지정
pnpm generate:ai-context --base=main

# 파일 경로 지정
pnpm generate:ai-context --output=context.md
```

### 기능

- Git 변경사항 자동 분석
- 영향받는 패키지 자동 감지
- 변경 유형 자동 분류 (컴포넌트, API, 문서 등)
- 권장 사항 자동 생성
- AI 에이전트에게 전달할 컨텍스트 자동 생성

### 사용 예시

```bash
# PR 생성 전 컨텍스트 생성
pnpm generate:ai-context --base=develop --output=pr-context.md

# AI 에이전트에게 전달
# "pr-context.md 파일을 읽고 이 변경사항에 대해 리뷰해줘"
```

---

## 4. Devlog 자동 생성 스크립트

### 사용법

```bash
# 오늘 작업한 내용으로 Devlog 생성
pnpm generate:devlog

# 특정 날짜 지정
pnpm generate:devlog --date=2025-12-06

# 특정 브랜치 지정
pnpm generate:devlog --branch=feature/new-feature

# 파일 경로 지정
pnpm generate:devlog --output=docs/devlogs/DEVLOG_2025-12-06.md
```

### 기능

- Git 커밋 로그 분석
- 변경된 파일 목록 추출
- 작업 내용 자동 분류 (feat, fix, refactor 등)
- Devlog 템플릿 자동 채우기

---

## 4. 의존성 설치

스크립트 실행을 위해 다음 패키지가 필요합니다:

```bash
pnpm add -D tsx
```

---

## 5. GitHub CLI 연동 (선택)

PR을 자동으로 생성하려면 GitHub CLI를 설치하고 인증하세요:

```bash
# GitHub CLI 설치 (macOS)
brew install gh

# GitHub CLI 설치 (Windows)
winget install GitHub.cli

# 인증
gh auth login

# PR 자동 생성 (향후 구현)
pnpm generate:pr --create
```

---

## 6. VS Code 작업 자동화

### 작업 설정 (`.vscode/tasks.json`)

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Generate PR",
      "type": "shell",
      "command": "pnpm generate:pr",
      "problemMatcher": []
    },
    {
      "label": "Generate Devlog",
      "type": "shell",
      "command": "pnpm generate:devlog",
      "problemMatcher": []
    }
  ]
}
```

### 단축키 설정 (`.vscode/keybindings.json`)

```json
[
  {
    "key": "ctrl+alt+p",
    "command": "workbench.action.tasks.runTask",
    "args": "Generate PR"
  },
  {
    "key": "ctrl+alt+d",
    "command": "workbench.action.tasks.runTask",
    "args": "Generate Devlog"
  },
  {
    "key": "ctrl+alt+a",
    "command": "workbench.action.tasks.runTask",
    "args": "Generate AI Context"
  },
  {
    "key": "ctrl+alt+r",
    "command": "workbench.action.tasks.runTask",
    "args": "Generate Review Checklist"
  }
]
```

**참고**: Cursor의 기본 단축키와 충돌을 피하기 위해 `Ctrl+Alt` 조합을 사용합니다.

---

## 7. 자동화 워크플로우 예시

### PR 생성 워크플로우

1. 기능 개발 완료
2. `pnpm generate:pr` 실행
3. 생성된 PR 설명 검토 및 수정
4. GitHub에서 PR 생성
5. PR 설명 붙여넣기

### Devlog 작성 워크플로우

1. 하루 작업 완료
2. `pnpm generate:devlog` 실행
3. 생성된 Devlog 검토 및 수정
4. 파일명 변경 (AUTO_GENERATED 제거)
5. 커밋 및 푸시

---

## 문제 해결

### 스크립트 실행 오류

```bash
# tsx가 설치되어 있는지 확인
pnpm list tsx

# 없으면 설치
pnpm add -D tsx
```

### Git 명령어 오류

```bash
# Git이 설치되어 있는지 확인
git --version

# Git 저장소인지 확인
git status
```

### 권한 오류 (Linux/macOS)

```bash
# 실행 권한 부여
chmod +x scripts/generate-pr.ts
chmod +x scripts/generate-devlog.ts
```

---

**작성일**: 2025-12-06  
**최종 업데이트**: 2025-12-06

