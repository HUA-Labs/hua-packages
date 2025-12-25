---
name: Create Pull Request
description: HUA Platform의 Pull Request를 생성하는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# Pull Request 생성 스킬

이 스킬은 HUA Platform의 Pull Request를 올바르게 생성하는 방법을 안내합니다.

## 🚨 AI 어시스턴트 필수 준수 사항

### PR 생성 전 필수 확인

```
IF (PR을 생성하려고 할 때) THEN
  1. 모든 변경사항 커밋 확인
  2. 타입 체크 통과 확인
  3. 린트 통과 확인
  4. 빌드 성공 확인
  5. 커밋 메시지 컨벤션 확인
  6. Graphite 사용 확인 (gt submit)
END IF
```

### 자동 검증 로직

```
IF (PR 생성) THEN
  IF (타입 체크 실패) THEN
    → "타입 체크를 통과해야 합니다. pnpm type-check를 실행하세요."
  END IF
  
  IF (린트 실패) THEN
    → "린트를 통과해야 합니다. pnpm lint를 실행하세요."
  END IF
  
  IF (빌드 실패) THEN
    → "빌드가 성공해야 합니다. pnpm build를 실행하세요."
  END IF
  
  IF (GitHub에서 수동 PR 생성) THEN
    → "Graphite를 사용하여 PR을 생성하세요. gt submit을 사용하세요."
  END IF
END IF
```

## PR 생성 전 확인사항

### 필수 체크리스트

- [ ] 모든 변경사항이 커밋되었는가?
- [ ] 타입 체크가 통과하는가? (`pnpm type-check`)
- [ ] 린트가 통과하는가? (`pnpm lint`)
- [ ] 빌드가 성공하는가? (`pnpm build`)
- [ ] 커밋 메시지가 컨벤션을 따르는가? (`.cursor/skills/commit-convention/SKILL.md` 참고)
- [ ] Graphite를 사용하여 PR을 생성하는가? (`gt submit`)

## PR 자동 생성

### Graphite 사용 (⚠️ 권장)

```bash
# Graphite로 PR 제출
gt submit

# 베이스 브랜치 지정
gt submit --base main
```

**기능:**
- 변경된 파일 자동 분석
- 커밋 메시지 분석
- 변경 타입 자동 감지
- PR 템플릿 자동 채우기

### 스크립트 사용 (보조)

```bash
# PR 설명 생성 (Graphite와 함께 사용)
pnpm generate:pr

# 특정 베이스 브랜치 지정
pnpm generate:pr --base=main

# 파일로 저장
pnpm generate:pr --output=pr-description.md
```

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

### Trunk-Based Development (현재 방식)

- **From**: Feature 브랜치 (Graphite 스택)
- **To**: `main` (항상 main)

### ❌ 사용 안 함 (Git Flow)

- ~~From: `feature/*`, `fix/*`~~
- ~~To: `develop`~~

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
# Graphite로 병합된 브랜치 정리
gt sync

# 또는 수동 정리
git branch -d <branch-name>
git push origin --delete <branch-name>
```

## AI 어시스턴트 실행 체크리스트

PR 생성 시 다음을 자동으로 확인하세요:

### 생성 전 확인
- [ ] 모든 변경사항이 커밋되었는가?
- [ ] 타입 체크가 통과하는가?
- [ ] 린트가 통과하는가?
- [ ] 빌드가 성공하는가?

### PR 제목 및 설명
- [ ] PR 제목이 컨벤션을 따르는가?
- [ ] 타겟 브랜치가 올바른가? (main)
- [ ] PR 설명이 충분히 상세한가?
- [ ] 체크리스트를 모두 확인했는가?

### Graphite 사용
- [ ] Graphite를 사용하여 PR을 생성했는가? (`gt submit`)
- [ ] GitHub에서 수동으로 PR을 생성하지 않았는가?

## 참고

- PR 템플릿: `docs/templates/PR_TEMPLATE.md`
- PR 생성 스크립트: `scripts/generate-pr.ts`
- Graphite 워크플로우: `.cursor/skills/graphite-workflow/SKILL.md`
- Trunk-Based Development: `.cursor/skills/trunk-based-development/SKILL.md`
