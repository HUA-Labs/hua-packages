---
name: Git Flow Workflow
description: HUA Platform의 Git Flow 워크플로우를 따르는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# Git Flow 워크플로우 스킬

이 스킬은 HUA Platform의 Git Flow 워크플로우를 따르는 방법을 안내합니다.

## 브랜치 전략

### 주요 브랜치
- **main**: 프로덕션 배포용 (보호됨)
- **develop**: 개발 통합용 (보호됨)

### 작업 브랜치
- **feature/**: 새로운 기능 개발
- **fix/**: 버그 수정
- **bugfix/**: 버그 수정 (fix와 동일)
- **release/**: 릴리스 준비
- **hotfix/**: 긴급 수정 (프로덕션 버그)

## 브랜치 생성

### 자동 생성 (권장)

```bash
# 기능 개발
pnpm gitflow:create feature <name>

# 버그 수정
pnpm gitflow:create fix <name>

# 릴리스 준비
pnpm gitflow:create release <version>

# 긴급 수정
pnpm gitflow:create hotfix <name>
```

### 수동 생성

```bash
# develop에서 feature 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/<name>

# main에서 hotfix 브랜치 생성
git checkout main
git pull origin main
git checkout -b hotfix/<name>
```

## 브랜치 관리

### 상태 확인

```bash
pnpm gitflow:status
```

**기능:**
- 현재 브랜치 표시
- main/develop 브랜치 동기화 상태
- 활성 브랜치 목록
- 병합된 브랜치 목록
- 권장 사항 제시

### 브랜치 정리

```bash
# 로컬 브랜치만 정리
pnpm gitflow:cleanup

# 원격 브랜치도 정리
pnpm gitflow:cleanup --remote

# 삭제할 브랜치만 확인 (실제 삭제 안 함)
pnpm gitflow:cleanup --dry-run
```

**주의사항:**
- 보호된 브랜치 (main, develop)는 자동 제외
- 병합된 브랜치만 삭제
- `--dry-run`으로 먼저 확인 권장

## 워크플로우

### 기능 개발 워크플로우

```bash
# 1. 브랜치 생성
pnpm gitflow:create feature user-authentication

# 2. 작업 및 커밋
git add .
git commit -m "feat(auth): add login functionality"

# 3. 원격에 푸시
git push origin feature/user-authentication

# 4. PR 생성 (develop로)
# GitHub에서 Pull Request 생성

# 5. PR 머지 후 브랜치 정리
pnpm gitflow:cleanup
```

### 버그 수정 워크플로우

```bash
# 1. 브랜치 생성
pnpm gitflow:create fix login-error

# 2. 작업 및 커밋
git add .
git commit -m "fix(auth): resolve login error"

# 3. 원격에 푸시
git push origin fix/login-error

# 4. PR 생성 (develop로)
# GitHub에서 Pull Request 생성
```

### 긴급 수정 워크플로우

```bash
# 1. main에서 hotfix 브랜치 생성
pnpm gitflow:create hotfix security-patch

# 2. 작업 및 커밋
git add .
git commit -m "fix(security): patch critical vulnerability"

# 3. 원격에 푸시
git push origin hotfix/security-patch

# 4. PR 생성
# - main으로 머지
# - develop에도 머지 (동기화)
```

## 브랜치 보호 규칙

### main 브랜치
- 직접 푸시 불가
- PR 필수
- 최소 1명의 승인 필요
- CI 체크 통과 필수 (type-check, lint, build)

### develop 브랜치
- 직접 푸시 불가
- PR 필수
- 최소 1명의 승인 필요
- CI 체크 통과 필수

## 체크리스트

브랜치 작업 시 다음을 확인하세요:

- [ ] 올바른 베이스 브랜치에서 분기했는가?
- [ ] 브랜치명이 컨벤션을 따르는가? (feature/, fix/, hotfix/ 등)
- [ ] 작업 전 베이스 브랜치를 최신화했는가?
- [ ] 커밋 메시지가 컨벤션을 따르는가?
- [ ] PR을 올바른 타겟 브랜치로 생성했는가?
- [ ] PR 머지 후 브랜치를 정리했는가?

## 참고

- Git Flow 스크립트: `apps/my-app/scripts/gitflow/`
- 브랜치 보호 설정: `docs/archive/completed-tasks/git-branch-protection.md`
