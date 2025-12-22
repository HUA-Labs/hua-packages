---
name: Create Pull Request
description: HUA Platform의 Pull Request를 생성하는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# Pull Request 생성 스킬

이 스킬은 HUA Platform의 Pull Request를 올바르게 생성하는 방법을 안내합니다.

## PR 생성 전 확인사항

### 필수 체크리스트

- [ ] 모든 변경사항이 커밋되었는가?
- [ ] 타입 체크가 통과하는가? (`pnpm type-check`)
- [ ] 린트가 통과하는가? (`pnpm lint`)
- [ ] 빌드가 성공하는가? (`pnpm build`)
- [ ] 커밋 메시지가 컨벤션을 따르는가? (`.cursor/skills/commit-convention/SKILL.md` 참고)
- [ ] 브랜치가 올바른가? (`.cursor/skills/git-flow/SKILL.md` 참고)

## PR 자동 생성

### 스크립트 사용 (권장)

```bash
# 기본 사용 (develop 기준)
pnpm generate:pr

# 특정 베이스 브랜치 지정
pnpm generate:pr --base=main

# 파일로 저장
pnpm generate:pr --output=pr-description.md
```

**기능:**
- 변경된 파일 자동 분석
- 커밋 메시지 분석
- 변경 타입 자동 감지
- PR 템플릿 자동 채우기

## PR 템플릿 구조

### 필수 섹션

1. **변경 사항**: 체크박스로 변경 타입 표시
2. **브랜치 정보**: Base/Head 브랜치 명시
3. **Breaking Changes**: 있으면 상세 설명
4. **변경 이유**: 변경 배경과 이유
5. **변경 내용 상세**: 주요 변경사항 설명
6. **체크리스트**: 코드 품질, 테스트, 빌드 확인
7. **테스트**: 테스트 환경 및 결과

### 선택 섹션

- 스크린샷 (UI 변경인 경우)
- 관련 이슈
- 추가 정보

## PR 제목 규칙

커밋 컨벤션과 동일한 형식:

```
<type>[optional scope]: <description>
```

**예시:**
- `feat(auth): add user authentication`
- `fix(api): resolve token expiration issue`
- `refactor(ui): simplify component structure`

## 타겟 브랜치 결정

### 일반 개발
- **From**: `feature/*`, `fix/*`
- **To**: `develop`

### 릴리스
- **From**: `develop`
- **To**: `main`

### 긴급 수정
- **From**: `hotfix/*`
- **To**: `main` (그리고 `develop`)

## PR 설명 작성 가이드

### 변경 사항 체크

```markdown
## 변경 사항

- [x] 새로운 기능 추가
- [x] 버그 수정
- [ ] 코드 리팩토링
```

### 변경 내용 상세

```markdown
## 변경 내용 상세

### 주요 변경 사항

1. **feat(auth): add login functionality**
   - JWT 토큰 기반 인증 구현
   - 로그인 API 엔드포인트 추가
   - 인증 미들웨어 구현

2. **fix(ui): resolve button styling issue**
   - 다크 모드에서 버튼 색상 수정
   - 반응형 레이아웃 개선
```

### 체크리스트

```markdown
## 체크리스트

### 코드 품질
- [x] 코드가 프로젝트의 코딩 스타일을 따릅니다
- [x] 자체 코드 리뷰를 수행했습니다
- [x] 문서를 업데이트했습니다

### 테스트 & 빌드
- [x] 타입 체크가 통과합니다
- [x] 린트가 통과합니다
- [x] 빌드가 성공합니다
```

## 리뷰어 지정

### 자동 지정
- CODEOWNERS 파일이 있으면 자동 지정
- 변경된 파일 경로 기반

### 수동 지정
```markdown
## 리뷰어

@username
@team-name
```

## 라벨 지정

일반적인 라벨:
- `feat` - 새로운 기능
- `fix` - 버그 수정
- `refactor` - 리팩토링
- `docs` - 문서
- `chore` - 설정/도구
- `ready-for-merge` - 머지 준비 완료

## PR 머지 후 작업

### 브랜치 정리

```bash
# 로컬 브랜치 정리
pnpm gitflow:cleanup

# 원격 브랜치도 정리
pnpm gitflow:cleanup --remote
```

### develop 동기화 (hotfix인 경우)

hotfix를 main에 머지한 경우, develop에도 머지:

```bash
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

## 체크리스트

PR 생성 시 다음을 확인하세요:

- [ ] 모든 변경사항이 커밋되었는가?
- [ ] PR 제목이 컨벤션을 따르는가?
- [ ] 타겟 브랜치가 올바른가?
- [ ] PR 설명이 충분히 상세한가?
- [ ] 체크리스트를 모두 확인했는가?
- [ ] 리뷰어를 지정했는가?
- [ ] 적절한 라벨을 지정했는가?

## 참고

- PR 템플릿: `docs/templates/pr-template.md`
- PR 생성 스크립트: `scripts/generate-pr.ts`
- 자동 생성 예시: `PR_DEVELOP_TO_MAIN.md`
