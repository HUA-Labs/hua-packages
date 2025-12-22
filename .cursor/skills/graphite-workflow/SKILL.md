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
- `git rebase` 금지 (Graphite는 merge commit 방식)
- `gt sync`로 trunk와 동기화
- `gt checkout` 대신 `gt checkout` 또는 `gt up` 사용 (스택 내 이동)

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

### 2-1. 모노레포에서의 스택 분리 (특별 가이드)

**시나리오**: 패키지 간 의존성 변경 (예: `hua-ui` 패키지 업데이트)

**올바른 분리 방법**:
1. 하위 패키지부터 먼저 스택 생성
   ```bash
   gt create -m "feat(packages/hua-ui): update Button API"
   ```

2. 의존하는 앱들을 순차적으로 스택 생성
   ```bash
   gt create -m "feat(apps/my-app): migrate to new Button API"
   gt create -m "feat(apps/my-api): migrate to new Button API"
   ```

3. 병합 순서: 하위 패키지 → 상위 앱 순서로 병합
   - PR 1 (hua-ui) 먼저 병합
   - PR 2 (my-app) 다음 병합
   - PR 3 (my-api) 마지막 병합

**주의사항**:
- ⚠️ **의존성 방향 준수**: 하위 패키지부터 먼저 병합
- ⚠️ **순환 의존성 방지**: `motion-core → ui` 같은 금지된 의존성 확인
- ⚠️ **Turbo 빌드**: `dependsOn: ["^build"]` 설정으로 자동 처리되지만, 스택 분리 시 빌드 순서 확인

**잘못된 예시**:
```bash
# ❌ 앱 변경을 먼저 스택 생성 (의존성 오류 발생)
gt create -m "feat(apps/my-app): use new Button API"  # hua-ui 변경 전
gt create -m "feat(packages/hua-ui): update Button API"  # 나중에
```

### 3. 작업 흐름 가이드

#### 최신 상태 동기화
```bash
# ❌ 하지 말 것
git checkout main
git pull origin main
git checkout feature-branch

# ✅ 권장
gt sync  # trunk와 동기화 및 병합된 브랜치 정리
# 또는
git checkout main
git pull origin main
gt checkout <branch-name>  # Graphite로 브랜치 체크아웃
```

#### 스택 정리 및 동기화
```bash
# ❌ 하지 말 것
git rebase -i main
git rebase main  # Graphite는 merge commit 방식 사용

# ✅ 권장
gt sync  # trunk와 동기화 및 병합된 브랜치 정리
gt restack  # 스택 재정렬 (내부적으로 rebase 사용 가능, 주의 필요)

# 주의: gt restack은 내부적으로 rebase를 사용할 수 있어 충돌이 반복될 수 있음
# 충돌이 많을 경우 수동으로 merge commit 생성 권장
```

#### 베이스 브랜치 설정 및 변경
```bash
# ❌ 하지 말 것
git rebase main  # Graphite는 merge commit 방식 사용

# ✅ 권장
# 1. 브랜치를 main의 parent로 추적 설정
gt track --parent main <branch-name>

# 2. 베이스 브랜치 지정하여 제출
gt submit --base main

# 3. 또는 Graphite 설정 파일에서 trunk 설정
# .git/.graphite_repo_config에서 trunk: "main" 설정
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

# 베이스 브랜치 지정하여 제출 (main 사용 권장)
gt submit --base main
```

## 모노레포 특화 워크플로우

### 패키지 간 의존성 변경 시나리오

**시나리오**: `hua-i18n-core` 패키지 API 변경 후 모든 앱 업데이트

**올바른 스택 분리**:
```bash
# 1. 패키지 변경 (하위 레벨)
gt create -m "feat(packages/hua-i18n-core): add new translation API"

# 2. SDK 패키지 업데이트 (중간 레벨)
gt create -m "feat(packages/hua-i18n-sdk): update to use new core API"

# 3. 앱들 업데이트 (상위 레벨)
gt create -m "feat(apps/my-app): migrate to new i18n API"
gt create -m "feat(apps/my-api): migrate to new i18n API"
gt create -m "feat(apps/my-chat): migrate to new i18n API"
```

**병합 순서**:
1. PR 1 (hua-i18n-core) → 먼저 병합
2. PR 2 (hua-i18n-sdk) → 다음 병합
3. PR 3-5 (앱들) → 병렬 또는 순차 병합

### Turbo 빌드와의 통합

**Turbo의 `dependsOn: ["^build"]` 설정**:
- Graphite 스택 분리와 잘 작동
- 각 PR에서 관련 패키지만 빌드하여 효율적
- 빌드 실패 시 해당 PR만 롤백 가능

**주의사항**:
- 패키지 빌드 순서는 Turbo가 자동 관리
- 스택 분리 시 빌드 의존성 고려 필요

### 순환 의존성 방지

**금지된 의존성 규칙**:
- `motion-core → ui` (순환 의존성)
- `motion-core → motion-advanced` (역방향 의존성)

**Graphite 사용 시**:
- 스택 분리 시 의존성 방향 확인 필수
- 하위 패키지부터 먼저 변경 및 병합

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
gt sync  # trunk와 동기화
gt restack  # 스택 재정렬 (별도 명령어, 주의: rebase 사용 가능)

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

### PR 병합 및 관리

```bash
# trunk부터 현재 브랜치까지의 모든 PR 병합
gt merge

# 확인 없이 병합
gt merge --confirm

# 병합 전 미리보기 (실제 병합하지 않음)
gt merge --dry-run

# 주의: gt downstack merge는 deprecated, gt merge 사용
```

### 브랜치 정리

```bash
# 병합된 브랜치 자동 정리
gt sync

# 원격 브랜치 정리
git fetch --prune origin

# 특정 브랜치 삭제
git branch -d <branch-name>
git push origin --delete <branch-name>
```

## 체크리스트

Graphite 워크플로우 사용 시 다음을 확인하세요:

- [ ] `git commit` 대신 `gt create`를 사용했는가?
- [ ] 논리적으로 스택을 분리했는가? (DB, API, UI 등)
- [ ] 각 스택이 독립적으로 리뷰 가능한가?
- [ ] `gt up`으로 최신 상태를 동기화했는가?
- [ ] `gt submit`으로 PR을 제출했는가?
- [ ] 복잡한 `git rebase` 대신 `gt sync`와 `gt restack`을 적절히 사용했는가?

### 모노레포 특화 체크리스트

- [ ] 패키지 간 의존성 변경 시 하위 패키지부터 스택을 생성했는가?
- [ ] 순환 의존성 규칙을 위반하지 않았는가? (`motion-core → ui` 금지 등)
- [ ] 병합 순서가 올바른가? (하위 패키지 → 상위 앱)
- [ ] Turbo 빌드 의존성을 고려했는가?

## 주의사항

1. **⚠️ main 브랜치 직접 푸시 절대 금지**: 항상 `gt create` → `gt submit` → PR 병합 순서로만 작업
   - `git push origin main` 사용 금지
   - 모든 변경은 PR을 통해서만 병합
2. **베이스 브랜치 신경 쓰지 않기**: Graphite가 자동으로 관리
3. **복잡한 Git 명령어 피하기**: Graphite 명령어로 대체
4. **작은 단위로 분리**: 하나의 스택은 하나의 논리적 변경만 포함
5. **능동적 제안**: 많은 파일 수정 시 중간에 스택 생성 제안
6. **리베이스 금지**: Graphite는 merge commit 방식 사용, `git rebase` 사용 금지
7. **충돌 해결**: `gt restack`이 rebase를 사용할 수 있어 충돌이 반복될 경우, 수동으로 `git merge main --no-ff` 사용 권장

## 트러블슈팅

### 충돌이 반복될 때

**문제**: `gt restack` 실행 시 충돌이 반복적으로 발생

**해결**:
```bash
# 1. restack 중단
gt abort  # 또는 git rebase --abort

# 2. 수동으로 merge commit 생성
git merge main --no-ff -m "chore: merge main into <branch-name>"

# 3. 충돌 해결 후
git add -A
git commit --amend --no-edit

# 4. Graphite에 반영
gt sync
```

### PR이 제출되지 않을 때

**문제**: `gt submit` 실행 시 "already merged" 오류

**원인**: 스택의 하위 PR이 이미 병합되었지만 trunk에 반영되지 않음

**해결**:
```bash
# 1. trunk 최신화
git checkout main
git pull origin main

# 2. Graphite 동기화
gt sync

# 3. 다시 제출
gt submit
```

### 브랜치가 추적되지 않을 때

**문제**: `gt log`에 브랜치가 표시되지 않음

**해결**:
```bash
# 브랜치를 main의 parent로 추적 설정
gt track --parent main <branch-name>
```

## 참고

- Graphite 공식 문서: https://docs.graphite.dev/
- Graphite CLI 설치: `npm install -g @graphite-io/cli`
- 스택 관리 가이드: `gt help stack`
- 명령어 도움말: `gt help <command>`
