# 자동화 빠른 시작 가이드

이 문서는 자동화 기능을 빠르게 시작하는 방법을 설명합니다.

---

## 1. Git Hooks (Pre-commit) 설정

### 설치 확인

```bash
# Husky와 lint-staged가 설치되어 있는지 확인
pnpm list husky lint-staged
```

### 설정 확인

`.husky/pre-commit` 파일이 존재하고 다음 내용을 포함하는지 확인:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Staged 파일만 체크
pnpm exec lint-staged
```

### 테스트

```bash
# 테스트 파일 생성
echo "const test = 'test'" > test.ts

# Staging
git add test.ts

# 커밋 시도 (자동으로 lint-staged 실행됨)
git commit -m "test: test pre-commit hook"
```

---

## 2. PR 자동 생성

### 기본 사용

```bash
# 현재 브랜치와 develop 브랜치 비교
pnpm generate:pr

# 출력된 PR 설명을 복사하여 GitHub PR에 붙여넣기
```

### 옵션

```bash
# Base 브랜치 지정
pnpm generate:pr --base=main

# 파일로 저장
pnpm generate:pr --output=pr-description.md
```

---

## 3. Devlog 자동 생성

### 기본 사용

```bash
# 오늘 작업한 내용으로 Devlog 생성
pnpm generate:devlog

# 생성된 파일 확인
# docs/devlogs/DEVLOG_YYYY-MM-DD_AUTO_GENERATED.md
```

### 옵션

```bash
# 특정 날짜 지정
pnpm generate:devlog --date=2025-12-06

# 특정 브랜치 지정
pnpm generate:devlog --branch=feature/new-feature

# 파일 경로 지정
pnpm generate:devlog --output=docs/devlogs/DEVLOG_2025-12-06.md
```

---

## 4. AI 컨텍스트 자동 생성

### 기본 사용

```bash
# 현재 브랜치와 develop 브랜치 비교하여 컨텍스트 생성
pnpm generate:ai-context

# 생성된 파일 확인
# ai-context.md
```

### AI 에이전트에게 전달

```bash
# 컨텍스트 생성
pnpm generate:ai-context --output=context.md

# AI 에이전트에게 전달 예시:
# "context.md 파일을 읽고 이 변경사항에 대해 리뷰해줘"
# 또는
# "context.md 파일의 변경사항을 기반으로 PR 설명을 작성해줘"
```

### 옵션

```bash
# Base 브랜치 지정
pnpm generate:ai-context --base=main

# 파일 경로 지정
pnpm generate:ai-context --output=pr-context.md
```

---

## 워크플로우 예시

### PR 생성 워크플로우

```bash
# 1. 작업 완료 후 PR 컨텍스트 생성
pnpm generate:ai-context --output=pr-context.md

# 2. AI 에이전트에게 컨텍스트 전달
# "pr-context.md 파일을 읽고 PR 설명을 작성해줘"

# 3. 또는 직접 PR 설명 생성
pnpm generate:pr --output=pr-description.md

# 4. GitHub에서 PR 생성 시 설명 붙여넣기
```

### Devlog 작성 워크플로우

```bash
# 1. 하루 작업 완료 후 Devlog 생성
pnpm generate:devlog

# 2. 생성된 Devlog 검토 및 수정
# docs/devlogs/DEVLOG_YYYY-MM-DD_AUTO_GENERATED.md

# 3. 파일명 변경 (AUTO_GENERATED 제거)
# docs/devlogs/DEVLOG_YYYY-MM-DD_제목.md

# 4. 커밋 및 푸시
git add docs/devlogs/DEVLOG_YYYY-MM-DD_제목.md
git commit -m "docs: add devlog for YYYY-MM-DD"
```

### AI 에이전트 협업 워크플로우

```bash
# 1. 변경사항 확인
git status

# 2. AI 컨텍스트 생성
pnpm generate:ai-context --output=context.md

# 3. AI 에이전트에게 전달
# "context.md 파일을 읽고:
#  - 변경사항을 리뷰해줘
#  - 개선 사항을 제안해줘
#  - 테스트 케이스를 작성해줘"
```

---

## 5. 코드 리뷰 체크리스트 자동 생성

### 기본 사용

```bash
# 현재 브랜치와 develop 브랜치 비교하여 체크리스트 생성
pnpm generate:review-checklist

# 생성된 파일 확인
# review-checklist.md
```

### 옵션

```bash
# Base 브랜치 지정
pnpm generate:review-checklist --base=main

# 파일 경로 지정
pnpm generate:review-checklist --output=review-checklist.md
```

---

## 6. 자동 문서 업데이트

### 기본 사용

```bash
# 문서 생성 및 업데이트
pnpm update:docs

# 문서 누락만 확인 (생성하지 않음)
pnpm update:docs:check
```

### 기능

- 새 컴포넌트 감지 시 문서 템플릿 자동 생성
- 새 훅 감지 시 문서 템플릿 자동 생성
- 문서 누락 확인

---

## 7. VS Code 작업 자동화

### 단축키

- `Ctrl+Alt+P`: PR 생성
- `Ctrl+Alt+D`: Devlog 생성
- `Ctrl+Alt+A`: AI 컨텍스트 생성
- `Ctrl+Alt+R`: 리뷰 체크리스트 생성

### 사용법

1. VS Code에서 단축키 누르기
2. 또는 `Ctrl+Shift+P` → "Tasks: Run Task" → 작업 선택

**참고**: Cursor의 기본 단축키와 충돌을 피하기 위해 `Ctrl+Alt` 조합을 사용합니다.

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

### Pre-commit Hook이 실행되지 않음

```bash
# .husky/pre-commit 파일에 실행 권한 부여 (Linux/macOS)
chmod +x .husky/pre-commit

# Windows에서는 Git Bash에서 실행
```

---

## 다음 단계

자동화 기능을 더 활용하려면:

1. [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md) - 전체 자동화 가이드
2. [AUTOMATION_SETUP.md](./AUTOMATION_SETUP.md) - 상세 설정 방법

---

**작성일**: 2025-12-06  
**최종 업데이트**: 2025-12-06

