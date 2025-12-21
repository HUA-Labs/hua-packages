# Graphite 워크플로우 가이드

## 개요

이 문서는 Graphite를 사용한 개발 워크플로우를 설명합니다. 특히 Stacked PRs와 기본 명령어 사용법을 다룹니다.

## Stacked PRs 개념

### 기존 Git 워크플로우

기존 방식에서는 큰 기능을 하나의 PR로 만들었습니다:

```
feature/auth
  ├── 로그인 기능
  ├── 로그아웃 기능
  ├── 토큰 관리
  └── 인증 미들웨어
```

문제점:
- PR이 커서 리뷰가 어려움
- 모든 기능이 완성되어야 머지 가능
- 버그 발생 시 원인 파악 어려움

### Stacked PRs 방식

Graphite는 큰 기능을 작은 PR로 분리합니다:

```
[PR 1] 기본 인증 구조
  ↓
[PR 2] 로그인 기능
  ↓
[PR 3] 로그아웃 기능
  ↓
[PR 4] 토큰 관리
  ↓
[PR 5] 인증 미들웨어
```

장점:
- 각 PR이 작아서 리뷰가 쉬움
- 독립적으로 머지 가능
- 단계별로 테스트 및 검증 가능

## 기본 워크플로우

### 1. 새 스택 생성

```bash
gt stack create
```

또는 특정 브랜치에서 시작:

```bash
gt stack create --branch develop
```

### 2. 변경사항 커밋

```bash
# 파일 수정 후
gt commit -m "feat: add login functionality"
```

기존 Git과 동일하지만, Graphite는 자동으로 스택을 관리합니다.

### 3. PR 제출

```bash
gt submit
```

이 명령어는:
- 현재 커밋을 PR로 변환
- GitHub에 PR 생성
- Graphite Agent가 자동으로 리뷰 시작

### 4. 스택에 추가 PR 생성

```bash
# 다음 기능 작업
gt commit -m "feat: add logout functionality"
gt submit
```

이렇게 하면 이전 PR 위에 새로운 PR이 쌓입니다.

## 주요 명령어

### 스택 관리

```bash
# 현재 스택 확인
gt stack list

# 스택 트리 보기
gt stack tree

# 특정 PR로 이동
gt stack checkout <pr-number>
```

### 커밋 관리

```bash
# 커밋 생성
gt commit -m "커밋 메시지"

# 커밋 수정
gt commit --amend

# 커밋 분할
gt commit --split
```

### PR 관리

```bash
# PR 제출
gt submit

# PR 업데이트
gt submit --update

# PR 머지
gt stack sync
```

### 동기화

```bash
# 기본 브랜치와 동기화
gt stack sync

# 리베이스
gt stack rebase
```

## 모노레포에서의 활용

### 여러 패키지 동시 작업

HUA 플랫폼은 모노레포 구조이므로, 여러 패키지를 동시에 수정할 수 있습니다:

```bash
# 예: hua-ui와 my-app 동시 수정
gt commit -m "feat(ui): add new component"
gt commit -m "feat(diary): use new component"
gt submit
```

### 패키지별 PR 분리

더 나은 방법은 패키지별로 PR을 분리하는 것입니다:

```bash
# PR 1: 패키지 개선
gt commit -m "feat(ui): add SectionHeader component"
gt submit

# PR 2: 앱에서 사용
gt commit -m "feat(diary): use SectionHeader in settings"
gt submit
```

## 기존 Git 워크플로우와의 비교

### 기존 방식

```bash
git checkout -b feature/auth
git add .
git commit -m "feat: add authentication"
git push origin feature/auth
# GitHub에서 PR 생성
```

### Graphite 방식

```bash
gt stack create
gt commit -m "feat: add authentication"
gt submit
# 자동으로 PR 생성 및 리뷰 시작
```

### 차이점

| 항목 | 기존 Git | Graphite |
|------|----------|----------|
| PR 생성 | 수동 | 자동 |
| 스택 관리 | 수동 | 자동 |
| 리뷰 시작 | 수동 | 자동 (Agent) |
| 리베이스 | 복잡 | 간단 (`gt stack rebase`) |

## 실제 사용 예시

### 시나리오: 새 컴포넌트 개발

```bash
# 1. 스택 생성
gt stack create

# 2. 기본 구조 커밋
gt commit -m "feat(ui): add Button component structure"
gt submit  # PR 1 생성

# 3. 스타일링 추가
gt commit -m "feat(ui): add Button styles and variants"
gt submit  # PR 2 생성 (PR 1 위에 쌓임)

# 4. 접근성 추가
gt commit -m "feat(ui): add Button accessibility attributes"
gt submit  # PR 3 생성

# 5. 문서화
gt commit -m "docs(ui): add Button component documentation"
gt submit  # PR 4 생성
```

각 PR은 독립적으로 리뷰되고 머지될 수 있습니다.

## 모범 사례

### 1. 작은 PR 유지

- 각 PR은 하나의 명확한 목적을 가져야 합니다
- 200줄 이하를 목표로 합니다

### 2. 의미 있는 커밋 메시지

```bash
# 좋은 예
gt commit -m "feat(ui): add dark mode support to SectionHeader"

# 나쁜 예
gt commit -m "update"
```

### 3. 단계별 검증

각 PR마다:
- 빌드 성공 확인
- 타입 체크 통과
- 린트 통과
- 테스트 통과

### 4. 스택 동기화

기본 브랜치가 업데이트되면:

```bash
gt stack sync
```

## 문제 해결

### 스택 충돌

리베이스 중 충돌 발생 시:

```bash
# 충돌 해결 후
gt commit --amend
gt stack sync
```

### PR 순서 변경

PR 순서를 변경하려면:

```bash
gt stack reorder
```

### 스택 초기화

스택을 처음부터 다시 시작하려면:

```bash
gt stack create --force
```

## 다음 단계

워크플로우를 익혔다면:

1. **[Agent 가이드](./AGENT_GUIDE.md)** - AI 리뷰 활용
2. **[통합 전략](./INTEGRATION_STRATEGY.md)** - Cursor와의 통합

## 참고 자료

- [Graphite CLI 명령어 참조](https://docs.graphite.dev/cli)
- [Stacked PRs 가이드](https://docs.graphite.dev/stacked-prs)

---

**작성일**: 2025-12-21  
**태그**: #graphite #workflow #stacked-prs
