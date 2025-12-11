# 자동화 가이드

이 문서는 HUA Platform 프로젝트의 자동화 기능과 사용 방법을 설명합니다.

---

## 자동화 개요

현재 프로젝트에서 사용 가능한 자동화 기능과 향후 추가할 수 있는 자동화 기능을 정리했습니다.

---

## 현재 구현된 자동화

### 1. GitHub Actions CI/CD

#### CI 워크플로우 (`.github/workflows/ci.yml`)
- **트리거**: PR 생성/업데이트, develop/main 브랜치 푸시
- **기능**:
  - 변경된 파일 감지 (apps/packages)
  - 타입 체크 자동 실행
  - 린트 자동 실행
  - 빌드 자동 실행
- **효과**: PR 생성 시 자동으로 코드 품질 검증

#### 배포 워크플로우 (`.github/workflows/deploy.yml`)
- **트리거**: develop/main 브랜치 푸시
- **기능**:
  - 변경된 앱 감지
  - Prisma 마이그레이션 자동 실행
  - Vercel 배포 (자동)
- **효과**: 코드 머지 시 자동 배포

### 2. 스크립트 자동화

#### Icon 타입 자동 생성
```bash
# packages/hua-ui
pnpm generate:icon-types
```
- `icons.ts` 파일 스캔
- `icon-names.generated.ts` 자동 생성

#### Icon 스니펫 자동 생성
```bash
# packages/hua-ui
pnpm generate:icon-snippets
```
- VS Code 스니펫 파일 자동 생성

---

## 추가 가능한 자동화

### 1. Git Hooks (Pre-commit, Pre-push)

#### 목적
- 커밋 전 자동으로 코드 품질 검증
- 잘못된 코드 커밋 방지
- 일관된 코드 스타일 유지

#### 구현 방법
```bash
# Husky 설치
pnpm add -D husky lint-staged

# Husky 초기화
pnpm exec husky init

# Pre-commit hook 설정
# .husky/pre-commit 파일 생성
```

#### Pre-commit Hook 예시
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Staged 파일만 체크
pnpm exec lint-staged
```

#### Lint-staged 설정 (package.json)
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

#### 효과
- 커밋 전 자동 린트/포맷팅
- 타입 에러 커밋 방지
- 코드 스타일 일관성 유지

---

### 2. PR 자동 생성 스크립트

#### 목적
- Git 변경사항 기반으로 PR 템플릿 자동 채우기
- 변경된 파일 목록 자동 추출
- 커밋 메시지 기반으로 PR 설명 자동 생성

#### 구현 방법
```bash
# scripts/generate-pr.ts 생성
# 사용법: pnpm generate:pr
```

#### 기능
- 변경된 파일 목록 자동 추출
- 커밋 메시지 분석하여 변경 사항 분류
- PR 템플릿 자동 채우기
- GitHub CLI를 통한 PR 자동 생성 (선택)

---

### 3. Devlog 자동 생성 스크립트

#### 목적
- Git 커밋 로그 기반으로 Devlog 초안 자동 생성
- 변경된 파일 목록 자동 추출
- 작업 내용 자동 분류

#### 구현 방법
```bash
# scripts/generate-devlog.ts 생성
# 사용법: pnpm generate:devlog
```

#### 기능
- 특정 날짜/브랜치의 커밋 로그 분석
- 변경된 파일 목록 추출
- Devlog 템플릿 자동 채우기
- 작업 내용 자동 분류 (feat, fix, refactor 등)

---

### 4. AI 컨텍스트 자동 생성 (구현 완료)

#### 목적
- Git 변경사항을 분석하여 AI 에이전트에게 전달할 컨텍스트 자동 생성
- 변경사항 요약 및 권장 사항 자동 생성

#### 구현 방법
```bash
# scripts/generate-ai-context.ts 생성 완료
# 사용법: pnpm generate:ai-context
```

#### 기능
- Git diff 분석
- 변경사항 카테고리 분류
- 영향받는 패키지 자동 감지
- 권장 사항 자동 생성
- AI 에이전트에게 전달할 컨텍스트 자동 생성

---

### 5. 코드 리뷰 체크리스트 자동 생성 (구현 완료)

#### 목적
- 변경사항 기반으로 리뷰 포인트 자동 생성
- 패턴 문서 기반 체크리스트 생성

#### 구현 방법
```bash
# scripts/generate-review-checklist.ts 생성 완료
# 사용법: pnpm generate:review-checklist
```

#### 기능
- 변경된 파일 타입 분석 (컴포넌트, API, 유틸 등)
- 카테고리별 체크리스트 자동 생성
- 관련 패턴 문서 자동 참조
- 코드 리뷰 포인트 자동 생성

---

### 6. VS Code 작업 자동화 (구현 완료)

#### 목적
- VS Code에서 스크립트를 쉽게 실행
- 단축키로 빠른 접근

#### 구현 방법
```bash
# .vscode/tasks.json 생성 완료
# .vscode/keybindings.json 생성 완료
```

#### 기능
- VS Code 작업으로 스크립트 실행
- 단축키 설정 (Ctrl+Alt+P, D, A, R)
- 패널에서 결과 확인

---

### 7. 자동 문서 업데이트 (구현 완료)

#### 목적
- 코드 변경 시 관련 문서 자동 업데이트
- 컴포넌트 추가 시 문서 자동 생성

#### 구현 방법
```bash
# scripts/update-docs.ts 생성 완료
# 사용법: pnpm update:docs
```

#### 기능
- 새 컴포넌트 감지 시 문서 템플릿 생성
- 새 훅 감지 시 문서 템플릿 생성
- 문서 누락 확인
- 문서 디렉토리 자동 생성

---

### 8. 변경사항 요약 자동 생성

#### 목적
- PR/커밋의 변경사항을 자동으로 요약
- AI 에이전트에게 전달할 컨텍스트 자동 생성

#### 구현 방법
```bash
# scripts/generate-changes-summary.ts 생성
# 사용법: pnpm generate:changes-summary
```

#### 기능
- Git diff 분석
- 변경사항 카테고리 분류
- 요약 텍스트 자동 생성

---

### 6. 자동 문서 업데이트

#### 목적
- 코드 변경 시 관련 문서 자동 업데이트
- 컴포넌트 추가 시 문서 자동 생성

#### 구현 방법
```bash
# scripts/update-docs.ts 생성
# 사용법: pnpm update:docs
```

#### 기능
- 새 컴포넌트 감지 시 문서 템플릿 생성
- API 변경 시 문서 자동 업데이트
- 예제 코드 자동 생성

---

## 우선순위별 구현 계획

### Phase 1: 즉시 구현 가능 (높은 효과) - 완료
1. **Git Hooks (Pre-commit)** - 코드 품질 자동 검증 (구현 완료)
2. **PR 자동 생성 스크립트** - PR 작성 시간 단축 (구현 완료)
3. **Devlog 자동 생성 스크립트** - Devlog 작성 시간 단축 (구현 완료)
4. **AI 컨텍스트 자동 생성** - AI 에이전트 효율 향상 (구현 완료)

### Phase 2: 중기 구현 (중간 효과) - 완료
5. **코드 리뷰 체크리스트 자동 생성** - 리뷰 품질 향상 (구현 완료)
6. **VS Code 작업 자동화** - 개발 효율 향상 (구현 완료)

### Phase 3: 장기 구현 (추가 효과) - 완료
7. **자동 문서 업데이트** - 문서 동기화 자동화 (구현 완료)

---

## 사용 예시

### Git Hooks 사용
```bash
# 커밋 시 자동 실행
git commit -m "feat: add new feature"
# → 자동으로 lint, format 실행
```

### PR 자동 생성
```bash
# PR 생성 스크립트 실행
pnpm generate:pr

# 출력:
# - 변경된 파일 목록
# - PR 템플릿 (자동 채워짐)
# - GitHub CLI로 PR 생성 (선택)
```

### Devlog 자동 생성
```bash
# 오늘 작업한 내용으로 Devlog 생성
pnpm generate:devlog

# 특정 날짜/브랜치 지정
pnpm generate:devlog --date=2025-12-06 --branch=feature/new-feature
```

---

## 참고 자료

- [Git Hooks 문서](https://git-scm.com/docs/githooks)
- [Husky 문서](https://typicode.github.io/husky/)
- [Lint-staged 문서](https://github.com/okonet/lint-staged)
- [GitHub CLI 문서](https://cli.github.com/)

---

**작성일**: 2025-12-06  
**최종 업데이트**: 2025-12-06

