# Graphite 스택 분리 계획

## 현재 변경사항 분석

총 변경 파일: 약 70개 이상

### 논리적 단위 분류

#### 1. hua-ux 패키지 배포 준비 (핵심 작업) ⭐
**목적**: 퍼블릭 레포 배포를 위한 준비
- `packages/hua-ux/CHANGELOG.md` - 날짜 업데이트
- `packages/hua-ux/README.md` - 문서 확인
- `packages/hua-ux/package.json` - prepack/postpack 스크립트 추가
- `packages/hua-ux/src/framework/index.ts` - @hua-labs/ui-pro export 활성화
- `packages/hua-ux/src/index.ts` - 확인
- `packages/hua-ux/DEPLOYMENT_CHECKLIST.md` - 배포 체크리스트
- `packages/hua-ux/PUBLIC_REPO_DEPENDENCIES.md` - 의존성 가이드

**스택 제목**: `feat(packages/hua-ux): prepare for public repository deployment`

#### 2. hua-ui 패키지 변경
**목적**: UI 패키지 업데이트
- `packages/hua-ui/README.md`
- `packages/hua-ui/docs/ICON_SYSTEM.md`
- `packages/hua-ui/package.json`
- `packages/hua-ui/src/advanced.ts` (삭제)
- `packages/hua-ui/src/components/advanced/...`
- `packages/hua-ui/src/index.ts`
- `packages/hua-ui/tsup.config.ts`

**스택 제목**: `feat(packages/hua-ui): update UI package structure`

#### 3. create-hua-ux 패키지 변경
**목적**: CLI 도구 업데이트
- `packages/create-hua-ux/CHANGELOG.md`
- `packages/create-hua-ux/README.md`
- `packages/create-hua-ux/package.json`
- `packages/create-hua-ux/src/...`
- `packages/create-hua-ux/templates/...`
- `packages/create-hua-ux/docs/...` (많은 문서 파일)

**스택 제목**: `feat(packages/create-hua-ux): update CLI tool and templates`

#### 4. 배포 스크립트 추가
**목적**: 배포 자동화 스크립트
- `scripts/prepare-publish.js`
- `scripts/restore-workspace.js`
- `scripts/copy-to-public-repo.ts`
- `scripts/deployment-status.ts`
- `scripts/README_COPY_TO_PUBLIC.md`

**스택 제목**: `feat(scripts): add deployment automation scripts`

#### 5. 퍼블릭 레포용 문서 (공개 가능)
**목적**: 사용자 가이드 및 공개 문서
- `packages/hua-ux/README.md` - 사용자 가이드
- `packages/hua-ux/CHANGELOG.md` - 변경 이력
- `packages/hua-ux/DEPLOYMENT_CHECKLIST.md` - 배포 체크리스트 (퍼블릭용)
- `packages/hua-ux/PUBLIC_REPO_DEPENDENCIES.md` - 의존성 가이드
- `packages/hua-ui/README.md` - 사용자 가이드
- `packages/hua-ui/docs/ICON_SYSTEM.md` - 아이콘 시스템 가이드
- `packages/create-hua-ux/README.md` - CLI 사용 가이드
- `packages/create-hua-ux/CHANGELOG.md` - 변경 이력
- 공개 가능한 사용자 가이드 문서들

**스택 제목**: `docs: add public repository documentation`

#### 6. 프라이빗 레포 전용 문서 (제외)
**목적**: 내부 개발 문서 (퍼블릭 레포로 복사하지 않음)
- `docs/devlog-2025-12-30-private-to-public-migration.md` - 내부 데브로그
- `docs/devlog-2025-12-30-ui-package-split.md` - 내부 데브로그
- `docs/packages/PRIVATE_TO_PUBLIC_MIGRATION_CHECKLIST.md` - 내부 마이그레이션 체크리스트
- `packages/create-hua-ux/docs/PRIVATE_TO_PUBLIC_REPO_GUIDE.md` - 내부 가이드
- `packages/create-hua-ux/docs/AI_CODING_EXPERIENCE_EVALUATION.md` - 내부 평가
- `packages/create-hua-ux/docs/UI_COMPONENT_ISSUES.md` - 내부 이슈
- `packages/create-hua-ux/docs/KNOWN_ISSUES.md` - 내부 이슈
- `packages/create-hua-ux/docs/PRE_RELEASE_CHECKLIST.md` - 내부 체크리스트
- `packages/create-hua-ux/docs/CI_CD_*` - 내부 CI/CD 문서
- `packages/create-hua-ux/docs/PROVIDER_IMPROVEMENT_SUMMARY.md` - 내부 요약
- `packages/hua-ux/docs/*` - 내부 프레임워크 문서 (대부분)
- `docs/devlogs/*` - 모든 데브로그
- `scripts/README_COPY_TO_PUBLIC.md` - 내부 스크립트 가이드
- 기타 내부 계획/전략 문서들

**스택 제목**: `docs: add private repository internal documentation`
**⚠️ 중요**: 이 스택의 파일들은 퍼블릭 레포로 복사하지 않음

#### 6. 의존성 업데이트
**목적**: 패키지 의존성 동기화
- `pnpm-lock.yaml`

**주의**: 의존성은 각 패키지 변경과 함께 포함되어야 함

## 권장 스택 순서

### 옵션 1: 패키지별 분리 + 문서 구분 (권장) ⭐
```bash
# 1. 배포 스크립트 (기초)
gt create -m "feat(scripts): add deployment automation scripts"

# 2. hua-ux 배포 준비 (핵심 - 퍼블릭 레포용)
gt create -m "feat(packages/hua-ux): prepare for public repository deployment"

# 3. hua-ui 패키지 변경 (퍼블릭 레포용)
gt create -m "feat(packages/hua-ui): update UI package structure"

# 4. create-hua-ux 패키지 변경 (퍼블릭 레포용)
gt create -m "feat(packages/create-hua-ux): update CLI tool and templates"

# 5. 퍼블릭 레포용 문서 (공개 가능)
gt create -m "docs: add public repository documentation"

# 6. 프라이빗 레포 전용 문서 (내부 문서, 퍼블릭 레포로 복사 안 함)
gt create -m "docs: add private repository internal documentation"
```

### 옵션 2: 기능별 분리 (더 세분화)
```bash
# 1. 배포 스크립트
gt create -m "feat(scripts): add deployment automation scripts"

# 2. hua-ux 배포 설정 (package.json, 스크립트)
gt create -m "feat(packages/hua-ux): add deployment scripts and config"

# 3. hua-ux 코드 변경 (src/)
gt create -m "feat(packages/hua-ux): enable ui-pro exports for public repo"

# 4. hua-ux 문서 (README, CHANGELOG, 가이드)
gt create -m "docs(packages/hua-ux): add deployment documentation"

# 5. hua-ui 변경
gt create -m "feat(packages/hua-ui): update UI package structure"

# 6. create-hua-ux 변경
gt create -m "feat(packages/create-hua-ux): update CLI tool and templates"

# 7. 전체 문서
gt create -m "docs: add deployment and migration documentation"
```

## 실행 가이드

### 1단계: 현재 상태 확인
```bash
cd C:\hua
gt sync  # trunk와 동기화
gt ls    # 현재 스택 상태 확인
```

### 2단계: 스택 생성 (옵션 1 권장)
```bash
# 배포 스크립트부터 시작
gt create -m "feat(scripts): add deployment automation scripts"
# 관련 파일만 스테이징: scripts/*, pnpm-lock.yaml

# hua-ux 배포 준비
gt create -m "feat(packages/hua-ux): prepare for public repository deployment"
# 관련 파일만 스테이징: packages/hua-ux/*

# hua-ui 변경
gt create -m "feat(packages/hua-ui): update UI package structure"
# 관련 파일만 스테이징: packages/hua-ui/*

# create-hua-ux 변경
gt create -m "feat(packages/create-hua-ux): update CLI tool and templates"
# 관련 파일만 스테이징: packages/create-hua-ux/*

# 퍼블릭 레포용 문서 (공개 가능)
gt create -m "docs: add public repository documentation"
# 관련 파일만 스테이징: 
# - packages/hua-ux/README.md, CHANGELOG.md, DEPLOYMENT_CHECKLIST.md, PUBLIC_REPO_DEPENDENCIES.md
# - packages/hua-ui/README.md, docs/ICON_SYSTEM.md
# - packages/create-hua-ux/README.md, CHANGELOG.md
# - 공개 가능한 사용자 가이드 문서들

# 프라이빗 레포 전용 문서 (내부 문서, 퍼블릭 레포로 복사 안 함)
gt create -m "docs: add private repository internal documentation"
# 관련 파일만 스테이징:
# - docs/devlog-*, docs/devlogs/*
# - docs/packages/PRIVATE_TO_PUBLIC_MIGRATION_CHECKLIST.md
# - packages/*/docs/PRIVATE_*, KNOWN_ISSUES.md, PRE_RELEASE_CHECKLIST.md 등
# - scripts/README_COPY_TO_PUBLIC.md
# ⚠️ 이 스택의 파일들은 퍼블릭 레포로 복사하지 않음
```

### 3단계: 스택 확인
```bash
gt ls  # 스택 구조 확인
```

### 4단계: PR 제출
```bash
gt submit --base main
```

## 주의사항

1. **의존성 순서**: 배포 스크립트를 먼저 생성 (다른 패키지가 의존)
2. **pnpm-lock.yaml**: 각 패키지 변경과 함께 포함
3. **문서 구분**: 
   - **퍼블릭 레포용**: 사용자 가이드, README, CHANGELOG, 공개 가능한 문서
   - **프라이빗 전용**: 데브로그, 내부 체크리스트, 마이그레이션 가이드, 내부 이슈 문서
4. **퍼블릭 레포 복사 시**: 프라이빗 전용 문서는 제외하고 복사
5. **테스트**: 각 스택 생성 후 빌드 확인 권장

## 파일 스테이징 가이드

각 스택 생성 시 `gt create` 실행 후 대화형으로 파일 선택:

**스택 1: 배포 스크립트**
- `scripts/prepare-publish.js`
- `scripts/restore-workspace.js`
- `scripts/copy-to-public-repo.ts`
- `scripts/deployment-status.ts`
- `pnpm-lock.yaml` (해당 부분만)

**스택 2: hua-ux 배포 준비 (퍼블릭 레포용)**
- `packages/hua-ux/CHANGELOG.md`
- `packages/hua-ux/README.md`
- `packages/hua-ux/package.json`
- `packages/hua-ux/src/framework/index.ts`
- `packages/hua-ux/src/index.ts`
- `packages/hua-ux/DEPLOYMENT_CHECKLIST.md`
- `packages/hua-ux/PUBLIC_REPO_DEPENDENCIES.md`
- `pnpm-lock.yaml` (해당 부분만)
- ⚠️ `packages/hua-ux/docs/*` 제외 (내부 문서)

**스택 3: hua-ui 변경 (퍼블릭 레포용)**
- `packages/hua-ui/README.md`
- `packages/hua-ui/docs/ICON_SYSTEM.md` (공개 가능)
- `packages/hua-ui/package.json`
- `packages/hua-ui/src/advanced.ts` (삭제)
- `packages/hua-ui/src/components/advanced/...`
- `packages/hua-ui/src/index.ts`
- `packages/hua-ui/tsup.config.ts`
- `pnpm-lock.yaml` (해당 부분만)
- ⚠️ `packages/hua-ui/*.md` (내부 문서) 제외

**스택 4: create-hua-ux 변경 (퍼블릭 레포용)**
- `packages/create-hua-ux/CHANGELOG.md`
- `packages/create-hua-ux/README.md`
- `packages/create-hua-ux/package.json`
- `packages/create-hua-ux/src/...`
- `packages/create-hua-ux/templates/...`
- `pnpm-lock.yaml` (해당 부분만)
- ⚠️ `packages/create-hua-ux/docs/*` 중 내부 문서 제외

**스택 5: 퍼블릭 레포용 문서 (공개 가능)**
- `packages/hua-ux/README.md` (이미 스택 2에 포함)
- `packages/hua-ui/README.md` (이미 스택 3에 포함)
- `packages/create-hua-ux/README.md` (이미 스택 4에 포함)
- 공개 가능한 사용자 가이드 문서들만

**스택 6: 프라이빗 레포 전용 문서 (내부 문서)**
- `docs/devlog-*`
- `docs/devlogs/*`
- `docs/packages/PRIVATE_TO_PUBLIC_MIGRATION_CHECKLIST.md`
- `packages/create-hua-ux/docs/PRIVATE_*`
- `packages/create-hua-ux/docs/KNOWN_ISSUES.md`
- `packages/create-hua-ux/docs/PRE_RELEASE_CHECKLIST.md`
- `packages/create-hua-ux/docs/CI_CD_*`
- `packages/hua-ux/docs/*` (내부 문서)
- `scripts/README_COPY_TO_PUBLIC.md`
- 기타 내부 계획/전략 문서들
- ⚠️ **이 스택의 파일들은 퍼블릭 레포로 복사하지 않음**
