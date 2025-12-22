---
name: Trunk-Based Development
description: Graphite와 Vercel을 사용한 트렁크 기반 개발 워크플로우를 안내합니다
license: MIT
compatibility:
  - cursor
---

# Trunk-Based Development 스킬

이 스킬은 Graphite와 Vercel을 사용한 **트렁크 기반 개발(Trunk-Based Development)** 워크플로우를 안내합니다.

## 핵심 원칙

### 1. Main 브랜치 중심 개발
- **Base 브랜치**: 항상 `main` (develop 브랜치 사용 안 함)
- **Feature 브랜치**: `main`에서 분기하여 `main`으로 직접 PR
- **작은 PR**: Graphite 스택으로 논리적 단위 분리

### 2. Vercel Preview를 테스트 환경으로 활용
- 모든 PR에 자동으로 Preview URL 생성
- **"모든 PR이 곧 테스트 환경"**
- develop 브랜치 같은 중간 대기실 불필요

### 3. 빠른 피드백 루프
- PR 생성 → Vercel Preview → 테스트 → Merge → Production
- develop 브랜치를 거치지 않아 속도 향상

## 왜 Trunk-Based Development인가?

### 기존 Git Flow의 문제점

**과거 방식 (Git Flow)**:
```
Feature → develop (PR & Merge) → main (PR & Merge) → Production
```

**문제점**:
1. **이중 작업**: develop 머지 후 다시 main으로 PR 생성
2. **Graphite와 상극**: Graphite 스택이 develop을 거치면 복잡해짐
3. **느린 피드백**: develop에서 테스트 후 main으로 이동하는 시간 낭비
4. **충돌 확률 증가**: develop과 main 두 곳에서 충돌 가능

### Trunk-Based Development의 장점

**현재 방식 (Trunk-Based)**:
```
Feature Stack → main (PR & Merge) → Production
```

**장점**:
1. **단일 경로**: Feature에서 main으로 직접 이동
2. **Graphite 최적화**: 스택이 main을 기준으로 깔끔하게 관리됨
3. **빠른 피드백**: Vercel Preview에서 바로 테스트
4. **작은 PR**: Graphite로 작게 쪼개서 안전하게 병합

## 워크플로우

### 1. 작업 시작

```bash
# main 브랜치 최신화
git checkout main
git pull origin main

# Graphite로 trunk와 동기화
gt sync

# 새 작업 시작 (Graphite가 자동으로 main에서 분기)
gt create -m "feat: your feature description"
```

### 2. 스택 생성 (Graphite)

```bash
# 작업 시작
# ... 코드 수정 ...

# 스택 1: 기초 작업 (빌드 오류 수정 등)
gt create -m "fix: resolve build errors"

# 스택 2: API 작업
gt create -m "feat: add user stats api"

# 스택 3: UI 작업
gt create -m "feat: add user stats dashboard"
```

### 3. PR 제출 및 테스트

```bash
# 스택 전체를 PR로 제출 (main을 base로)
gt submit

# 또는 특정 스택만 제출
gt stack submit --base main
```

**결과**:
- 각 스택이 개별 PR로 생성됨
- Vercel Preview URL 자동 생성
- Preview URL에서 테스트 및 빌드 오류 확인

### 4. 리뷰 및 병합

1. **PR 리뷰**: 각 스택 PR을 독립적으로 리뷰
2. **테스트**: Vercel Preview에서 확인
3. **병합**: Graphite CLI 또는 GitHub CLI 사용
   
   **Graphite CLI로 병합**:
   ```bash
   # trunk부터 현재 브랜치까지의 모든 PR 병합
   gt merge
   
   # 확인 없이 병합
   gt merge --confirm
   ```
   
   **GitHub CLI로 병합** (리뷰어 없이):
   ```bash
   # Squash merge (권장)
   gh pr merge <pr-number> --squash --admin
   
   # 또는 Graphite CLI 사용
   gt merge
   ```
   
   **병합 순서**: 아래에서 위로 순차적으로 병합
   - 스택 1 (기초) → 먼저 병합
   - 스택 2 (API) → 다음 병합
   - 스택 3 (UI) → 마지막 병합

### 5. 자동 배포

- PR 병합 → `main` 브랜치 업데이트
- Vercel이 자동으로 Production 배포

## 안전장치

### 방어막 1: CI/CD
- **빌드 실패**: PR 머지 버튼 비활성화
- **타입 체크 실패**: PR 머지 불가
- **테스트 실패**: PR 머지 불가

### 방어막 2: 작은 PR
- Graphite로 논리적 단위 분리
- 문제 발생 시 해당 PR만 Revert 가능
- 리뷰가 쉬워짐

### 방어막 3: Vercel 롤백
- 문제 발견 시 즉시 롤백 가능
- 이전 버전으로 1초 컷 복구

### 방어막 4: 브랜치 보호
- `main` 브랜치 직접 푸시 불가
- PR 승인 필수
- Status check 통과 필수

## Graphite 설정

### Base 브랜치를 main으로 고정

```bash
# Graphite 추적 설정
gt track --parent main

# 또는 .graphite_repo_config 파일에서 설정
# baseBranch: main
```

### 스택 제출 시 base 지정

```bash
# 명시적으로 main을 base로 지정
gt submit --base main

# 또는
gt stack submit --base main
```

## Git Flow에서 전환하기

### 1. develop 브랜치 제거

**주의**: 기존 develop 브랜치에 중요한 변경사항이 있다면 먼저 main으로 병합

```bash
# 1. develop 브랜치의 변경사항을 main으로 병합
git checkout main
git merge origin/develop --no-ff -m "chore: merge develop into main (trunk-based development migration)"

# 충돌 발생 시 develop 버전 우선 (대부분의 경우)
git merge origin/develop --no-ff -X theirs

# 2. GitHub Actions 워크플로우에서 develop 제거
# .github/workflows/ci.yml, deploy.yml, pr-checks.yml 수정

# 3. develop 브랜치 삭제
git branch -d develop
git push origin --delete develop

# 4. 원격 브랜치 캐시 정리
git fetch --prune origin
```

**참고**: Graphite 스택으로 재구성할 필요 없음. merge commit으로 통합하는 것이 실용적.

### 2. GitHub 설정 변경

1. **Default Branch를 main으로 설정**
   - Settings → Branches → Default branch → `main`

2. **브랜치 보호 규칙**
   - `main` 브랜치만 보호 규칙 설정
   - `develop` 브랜치 보호 규칙 제거 (또는 유지)

### 3. 스크립트 업데이트

기존 Git Flow 스크립트가 있다면:
- `baseBranch = 'develop'` → `baseBranch = 'main'`으로 변경
- 또는 스크립트를 Graphite 명령어로 대체

### 4. Graphite 설정 업데이트

```bash
# Graphite가 main을 trunk로 인식하도록 설정
# .git/.graphite_repo_config 파일 확인
# trunk: "main" 설정 확인

# 브랜치를 main의 parent로 추적
gt track --parent main <branch-name>
```

## 주의사항

1. **작은 PR 유지**: Graphite로 논리적 단위 분리 필수
2. **빌드 오류 수정을 먼저**: 기초 작업을 스택 1번에 배치
3. **Vercel Preview 활용**: 모든 테스트를 Preview에서 수행
4. **main 브랜치 직접 푸시 금지**: 항상 PR을 통해서만 병합

## 체크리스트

Trunk-Based Development 사용 시 다음을 확인하세요:

- [ ] Base 브랜치가 `main`으로 설정되었는가?
- [ ] Graphite 스택이 `main`을 기준으로 생성되었는가?
- [ ] `gt submit` 시 `--base main`을 사용했는가?
- [ ] Vercel Preview에서 테스트를 완료했는가?
- [ ] 작은 PR로 논리적 단위를 분리했는가?
- [ ] develop 브랜치를 사용하지 않았는가?

## 참고

- [Trunk-Based Development 가이드](https://trunkbaseddevelopment.com/)
- [Graphite 공식 문서](https://docs.graphite.dev/)
- [Vercel Preview Deployments](https://vercel.com/docs/deployments/preview-deployments)
