---
name: Graphite Workflow Manager
description: Graphite(gt CLI)의 Stacked Diff 방식을 사용하여 논리적인 작은 단위로 작업을 분리하는 워크플로우 관리 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# Graphite Workflow Manager 스킬

이 스킬은 Graphite(gt CLI)의 Stacked Diff 방식을 사용하여 거대한 PR(Monster PR)을 피하고 논리적인 작은 단위로 작업을 분리하는 방법을 안내합니다.

## 핵심 원칙

### 1. Stacked Diff 방식
- 여러 기능(DB, API, UI)을 한 번에 개발하더라도 하나의 커밋으로 묶지 않음
- 논리적인 작은 단위(Stack)로 분리하여 관리
- 각 스택은 독립적으로 리뷰 가능하도록 구성

### 2. Git 명령어 대신 Graphite 명령어 사용
- `git commit` 대신 `gt create` 사용
- `git rebase` 대신 `gt sync --restack` 사용
- `git checkout` 대신 `gt up` 사용

## 주요 워크플로우 규칙

### 1. 커밋 대신 스택 생성

**금지 사항**:
- `git commit` 사용 금지
- 베이스 브랜치를 신경 쓰는 복잡한 작업 흐름

**권장 사항**:
- 작업 완료 시 "이 변경 사항을 새로운 스택으로 쌓을까요?"라고 제안
- `gt create -m "feat: <message>"` 명령어 사용
- 현재 작업 위에 바로 쌓는 흐름 유지

**예시**:
```bash
# ❌ 하지 말 것
git commit -m "feat: add user stats"

# ✅ 권장
gt create -m "feat: add user stats api"
```

### 2. 논리적 스택 분리

**시나리오**: DB 스키마 수정 → API 로직 → UI 작업을 한꺼번에 수행한 경우

**분리 방법**:
1. DB 변경점만 먼저 스택 생성
   ```bash
   gt create -m "fix: update user schema"
   ```

2. API 변경점을 다음 스택으로 생성
   ```bash
   gt create -m "feat: add user stats api"
   ```

3. UI 변경점을 마지막 스택으로 생성
   ```bash
   gt create -m "feat: add user stats dashboard"
   ```

**분리 기준**:
- **DB 변경**: 스키마 수정, 마이그레이션
- **API 변경**: 엔드포인트 추가/수정, 비즈니스 로직
- **UI 변경**: 컴포넌트, 페이지, 스타일
- **테스트**: 각 스택에 해당하는 테스트 포함

### 3. 작업 흐름 가이드

#### 최신 상태 동기화
```bash
# ❌ 하지 말 것
git checkout main
git pull origin main
git checkout feature-branch

# ✅ 권장
gt up  # 최신 상태로 동기화
```

#### 스택 정리
```bash
# ❌ 하지 말 것
git rebase -i main

# ✅ 권장
gt sync --restack  # 스택 정리 및 재정렬
```

#### 베이스 브랜치 변경
```bash
# ❌ 하지 말 것
git rebase main

# ✅ 권장
gt stack submit --base main  # 베이스 브랜치 지정하여 제출
```

### 4. PR 제출 자동화

**금지 사항**:
- GitHub 웹사이트로 가서 수동으로 PR 생성

**권장 사항**:
```bash
# 전체 스택을 PR로 제출
gt submit

# 특정 스택만 제출
gt stack submit

# 베이스 브랜치 지정하여 제출
gt stack submit --base develop
```

## 작업 흐름 예시

### 시나리오: 사용자 통계 대시보드 개발

**작업 내용**:
1. DB: User 테이블에 stats 필드 추가
2. API: GET /api/user/stats 엔드포인트 생성
3. UI: 대시보드 컴포넌트 생성

**올바른 스택 분리**:

```bash
# 1. DB 변경만 스택 생성
gt create -m "feat(db): add user stats fields to schema"

# 2. API 변경을 다음 스택으로 생성
gt create -m "feat(api): add user stats endpoint"

# 3. UI 변경을 마지막 스택으로 생성
gt create -m "feat(ui): add user stats dashboard component"
```

**잘못된 예시**:
```bash
# ❌ 모든 변경을 하나의 커밋으로
git commit -m "feat: add user stats feature"
```

## 능동적 제안

### 많은 파일 수정 시

**상황**: 수십 개의 파일을 수정하고 있는 경우

**제안**:
> "잠깐! 너무 많이 쌓였습니다. 여기서 한번 `gt create`로 저장하고 갈까요?"

**명령어**:
```bash
gt create -m "feat: <현재까지의 작업 요약>"
```

### 작업 완료 시

**상황**: 작업을 마치고 커밋하려고 하는 경우

**제안**:
> "이 변경 사항을 새로운 스택으로 쌓을까요?"

**명령어**:
```bash
gt create -m "feat: <작업 내용>"
```

## Graphite 명령어 요약

### 기본 명령어

```bash
# 스택 생성
gt create -m "feat: <message>"

# 최신 상태 동기화
gt up

# 스택 정리 및 재정렬
gt sync --restack

# PR 제출
gt submit

# 스택 상태 확인
gt stack

# 스택 로그 확인
gt log
```

### 고급 명령어

```bash
# 특정 스택 수정
gt modify -m "feat: <updated message>"

# 스택 순서 변경
gt reorder

# 스택 병합
gt squash

# 스택 분리
gt split
```

## 체크리스트

Graphite 워크플로우 사용 시 다음을 확인하세요:

- [ ] `git commit` 대신 `gt create`를 사용했는가?
- [ ] 논리적으로 스택을 분리했는가? (DB, API, UI 등)
- [ ] 각 스택이 독립적으로 리뷰 가능한가?
- [ ] `gt up`으로 최신 상태를 동기화했는가?
- [ ] `gt submit`으로 PR을 제출했는가?
- [ ] 복잡한 `git rebase` 대신 `gt sync --restack`을 사용했는가?

## 주의사항

1. **베이스 브랜치 신경 쓰지 않기**: Graphite가 자동으로 관리
2. **복잡한 Git 명령어 피하기**: Graphite 명령어로 대체
3. **작은 단위로 분리**: 하나의 스택은 하나의 논리적 변경만 포함
4. **능동적 제안**: 많은 파일 수정 시 중간에 스택 생성 제안

## 참고

- Graphite 공식 문서: https://docs.graphite.dev/
- Graphite CLI 설치: `npm install -g @graphite-io/cli`
- 스택 관리 가이드: `gt help stack`
