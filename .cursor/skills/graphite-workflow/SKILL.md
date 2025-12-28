---
name: Graphite Workflow Manager
description: Graphite(gt CLI)의 Stacked Diff 방식을 사용하여 논리적인 작은 단위로 작업을 분리하는 워크플로우 관리 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# Graphite Workflow Manager 스킬

이 스킬은 Graphite(gt CLI)의 Stacked Diff 방식을 사용하여 거대한 PR(Monster PR)을 피하고 논리적인 작은 단위로 작업을 분리하는 방법을 안내합니다.

## 🚨 AI 어시스턴트 필수 준수 사항

### 절대 금지 사항
- ❌ `git commit` 사용 금지 → 반드시 `gt create` 사용
- ❌ `git rebase` 사용 금지 → Graphite는 merge commit 방식 사용
- ❌ 작업 완료 후에만 스택 생성 제안 → 작업 중간에 제안해야 함
- ❌ main 브랜치에 직접 푸시 → 항상 PR을 통해서만 병합

### 필수 실행 규칙

#### 규칙 1: 파일 수정 시작 시 즉시 체크
```
IF (수정 중인 파일이 5개 이상) THEN
  → 즉시 사용자에게 제안:
    "여러 파일을 수정하고 계시네요. 논리적 단위로 나눠서 스택을 생성하시겠어요?"
    "예를 들어, DB 변경만 완료하셨다면 여기서 `gt create`로 스택을 만들고 다음 작업을 진행하시겠어요?"
END IF
```

#### 규칙 2: 논리적 단위 완성 시 즉시 제안
```
IF (다음 중 하나라도 해당) THEN
  - DB 스키마 변경 완료 → API 작업 시작 전
  - 패키지 작업 완료 → 앱 작업 시작 전
  - API 엔드포인트 완료 → UI 작업 시작 전
  - 한 영역의 작업 완료 → 다른 영역으로 넘어가기 전
THEN
  → 즉시 사용자에게 제안:
    "지금까지 [완료한 작업]이 완료되었습니다. 여기서 스택을 생성하고 다음 작업을 진행하시겠어요?"
    "명령어: gt create -m 'feat: [완료한 작업 요약]'"
END IF
```

#### 규칙 3: 작업 중간 체크 (10개 이상 파일)
```
IF (수정 중인 파일이 10개 이상) AND (아직 스택 생성 안 함) THEN
  → 즉시 사용자에게 제안:
    "작업이 많이 쌓였습니다. 현재까지의 논리적 단위를 스택으로 저장하시겠어요?"
    "이렇게 하면 작업을 안전하게 보관하고 다음 단계로 진행할 수 있습니다."
END IF
```

#### 규칙 4: 작업 완료 시
```
IF (사용자가 작업 완료를 알림) OR (모든 변경사항이 완료됨) THEN
  → 사용자에게 제안:
    "이 변경 사항을 새로운 스택으로 쌓을까요?"
    "명령어: gt create -m 'feat: [작업 내용]'"
END IF
```

## 핵심 원칙

### 1. Stacked Diff 방식
- 여러 기능(DB, API, UI)을 한 번에 개발하더라도 하나의 커밋으로 묶지 않음
- 논리적인 작은 단위(Stack)로 분리하여 관리
- 각 스택은 독립적으로 리뷰 가능하도록 구성

### 2. Git 명령어 대신 Graphite 명령어 사용
- `git commit` → `gt create` 사용
- `git rebase` → 금지 (Graphite는 merge commit 방식)
- `gt sync` → trunk와 동기화
- `gt checkout` → 스택 내 이동

## 주요 워크플로우 규칙

### 1. 커밋 대신 스택 생성

**❌ 절대 하지 말 것:**
```bash
git commit -m "feat: add user stats"
```

**✅ 반드시 이렇게:**
```bash
gt create -m "feat: add user stats api"
```

### 2. 논리적 스택 분리

**시나리오**: DB 스키마 수정 → API 로직 → UI 작업을 한꺼번에 수행한 경우

**올바른 분리 방법:**
```bash
# 1단계: DB 변경만 먼저 스택 생성
gt create -m "fix: update user schema"

# 2단계: API 변경을 다음 스택으로 생성
gt create -m "feat: add user stats api"

# 3단계: UI 변경을 마지막 스택으로 생성
gt create -m "feat: add user stats dashboard"
```

**분리 기준:**
- **DB 변경**: 스키마 수정, 마이그레이션 → 스택 1
- **API 변경**: 엔드포인트 추가/수정, 비즈니스 로직 → 스택 2
- **UI 변경**: 컴포넌트, 페이지, 스타일 → 스택 3
- **테스트**: 각 스택에 해당하는 테스트 포함

### 3. 모노레포에서의 스택 분리 (특별 가이드)

**시나리오**: 패키지 간 의존성 변경 (예: `hua-ui` 패키지 업데이트)

**✅ 올바른 순서:**
```bash
# 1. 하위 패키지부터 먼저 스택 생성
gt create -m "feat(packages/hua-ui): update Button API"

# 2. 의존하는 앱들을 순차적으로 스택 생성
gt create -m "feat(apps/my-app): migrate to new Button API"
gt create -m "feat(apps/my-api): migrate to new Button API"
```

**❌ 잘못된 순서:**
```bash
# 앱 변경을 먼저 스택 생성 (의존성 오류 발생)
gt create -m "feat(apps/my-app): use new Button API"  # hua-ui 변경 전
gt create -m "feat(packages/hua-ui): update Button API"  # 나중에
```

**병합 순서:**
1. PR 1 (hua-ui) → 먼저 병합
2. PR 2 (my-app) → 다음 병합
3. PR 3 (my-api) → 마지막 병합

**주의사항:**
- ⚠️ **의존성 방향 준수**: 하위 패키지부터 먼저 병합
- ⚠️ **순환 의존성 방지**: `motion-core → ui` 같은 금지된 의존성 확인
- ⚠️ **Turbo 빌드**: `dependsOn: ["^build"]` 설정으로 자동 처리되지만, 스택 분리 시 빌드 순서 확인

### 4. 작업 흐름 가이드

#### 최신 상태 동기화
```bash
# ❌ 하지 말 것
git checkout main
git pull origin main
git checkout feature-branch

# ✅ 권장
gt sync  # trunk와 동기화 및 병합된 브랜치 정리
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
```

### 5. PR 제출 자동화

**❌ 금지 사항:**
- GitHub 웹사이트로 가서 수동으로 PR 생성

**✅ 권장 사항:**
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

**올바른 스택 분리:**
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

**병합 순서:**
1. PR 1 (hua-i18n-core) → 먼저 병합
2. PR 2 (hua-i18n-sdk) → 다음 병합
3. PR 3-5 (앱들) → 병렬 또는 순차 병합

### Turbo 빌드와의 통합

**Turbo의 `dependsOn: ["^build"]` 설정:**
- Graphite 스택 분리와 잘 작동
- 각 PR에서 관련 패키지만 빌드하여 효율적
- 빌드 실패 시 해당 PR만 롤백 가능

**주의사항:**
- 패키지 빌드 순서는 Turbo가 자동 관리
- 스택 분리 시 빌드 의존성 고려 필요

### 순환 의존성 방지

**금지된 의존성 규칙:**
- `motion-core → ui` (순환 의존성)
- `motion-core → motion-advanced` (역방향 의존성)

**Graphite 사용 시:**
- 스택 분리 시 의존성 방향 확인 필수
- 하위 패키지부터 먼저 변경 및 병합

## 작업 흐름 예시

### 시나리오: 사용자 통계 대시보드 개발

**작업 내용:**
1. DB: User 테이블에 stats 필드 추가
2. API: GET /api/user/stats 엔드포인트 생성
3. UI: 대시보드 컴포넌트 생성

**✅ 올바른 스택 분리:**
```bash
# 1. DB 변경만 스택 생성
gt create -m "feat(db): add user stats fields to schema"

# 2. API 변경을 다음 스택으로 생성
gt create -m "feat(api): add user stats endpoint"

# 3. UI 변경을 마지막 스택으로 생성
gt create -m "feat(ui): add user stats dashboard component"
```

**❌ 잘못된 예시:**
```bash
# 모든 변경을 하나의 커밋으로
git commit -m "feat: add user stats feature"
```

## Graphite 명령어 요약

### 기본 명령어

```bash
# 스택 생성 (가장 중요!)
gt create -m "feat: <message>"

# 최신 상태 동기화
gt sync  # trunk와 동기화 및 병합된 브랜치 정리

# PR 제출
gt submit

# 스택 상태 확인
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
```

### 브랜치 정리

```bash
# 병합된 브랜치 자동 정리
gt sync

# 원격 브랜치 정리
git fetch --prune origin

# 특정 브랜치 삭제
gt branch delete <branch-name>
```

## AI 어시스턴트 실행 체크리스트

작업을 시작하기 전에 다음을 확인하세요:

### 작업 시작 시
- [ ] `gt sync`로 최신 상태 확인
- [ ] 현재 브랜치 확인 (`gt log`)

### 파일 수정 중
- [ ] 5개 이상 파일 수정 시작 → 즉시 스택 생성 제안
- [ ] 10개 이상 파일 수정 → 즉시 스택 생성 제안
- [ ] 논리적 단위 완성 → 즉시 스택 생성 제안

### 스택 생성 시
- [ ] `git commit` 대신 `gt create` 사용
- [ ] 논리적으로 스택 분리 (DB, API, UI 등)
- [ ] 각 스택이 독립적으로 리뷰 가능한지 확인

### 모노레포 작업 시
- [ ] 패키지 간 의존성 변경 시 하위 패키지부터 스택 생성
- [ ] 순환 의존성 규칙 위반하지 않았는지 확인
- [ ] 병합 순서가 올바른지 확인 (하위 패키지 → 상위 앱)

### PR 제출 시
- [ ] `gt submit`으로 PR 제출
- [ ] `gt sync`로 동기화 확인

## 주의사항

1. **⚠️ main 브랜치 직접 푸시 절대 금지**: 항상 `gt create` → `gt submit` → PR 병합 순서로만 작업
   - `git push origin main` 사용 금지
   - 모든 변경은 PR을 통해서만 병합
2. **베이스 브랜치 신경 쓰지 않기**: Graphite가 자동으로 관리
3. **복잡한 Git 명령어 피하기**: Graphite 명령어로 대체
4. **작은 단위로 분리**: 하나의 스택은 하나의 논리적 변경만 포함
5. **🚨 능동적 제안 필수**: 작업 중간에 논리적 단위가 완성될 때마다 스택 생성 제안 (작업 완료 후가 아님!)
6. **리베이스 금지**: Graphite는 merge commit 방식 사용, `git rebase` 사용 금지
7. **충돌 해결**: `gt restack`이 rebase를 사용할 수 있어 충돌이 반복될 경우, 수동으로 `git merge main --no-ff` 사용 권장

## 트러블슈팅

### 충돌이 반복될 때

**문제**: `gt restack` 실행 시 충돌이 반복적으로 발생

**해결:**
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

**해결:**
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

**해결:**
```bash
# 브랜치를 main의 parent로 추적 설정
gt track --parent main <branch-name>
```

### PR이 자동으로 닫혔을 때

**문제**: `gt sync` 또는 스택 처리 중 PR이 자동으로 닫힘

**원인**:
- 베이스 브랜치가 변경되어 PR이 더 이상 유효하지 않음
- `gt sync` 실행 시 이미 병합된 것으로 감지됨
- restack 중 충돌이 해결되지 않아 자동으로 닫힘

**해결 방법 1: PR 다시 제출**
```bash
# 1. 해당 브랜치로 이동
gt checkout <branch-name>
# 또는
git checkout <branch-name>

# 2. 베이스 브랜치와 동기화
gt sync

# 3. 충돌이 있다면 해결
gt restack  # 또는 수동으로 merge commit 생성

# 4. PR 다시 제출
gt submit --base main
```

**해결 방법 2: GitHub에서 수동으로 다시 열기**
```bash
# 1. 브랜치 확인
git branch -a

# 2. 브랜치가 존재한다면 GitHub에서 PR을 다시 열 수 있음
# Graphite 웹 인터페이스 또는 GitHub에서 "Reopen pull request" 클릭

# 3. 또는 새로 제출
gt submit --base main
```

**해결 방법 3: 브랜치가 삭제된 경우**
```bash
# 1. 로컬 브랜치 확인
gt ls

# 2. 브랜치가 있다면 다시 제출
gt submit --base main

# 3. 브랜치가 없다면 Graphite 웹 인터페이스에서 확인
# 또는 git log로 커밋 찾아서 새 브랜치 생성
```

## 참고

- Graphite 공식 문서: https://docs.graphite.dev/
- Graphite CLI 설치: `npm install -g @graphite-io/cli`
- 스택 관리 가이드: `gt help stack`
- 명령어 도움말: `gt help <command>`
