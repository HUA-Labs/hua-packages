# Private → Public 레포 마이그레이션 체크리스트

**Date**: 2025-12-30  
**Status**: In Progress  
**Single Source of Truth**: Private Repository (`c:\hua`)

## 원칙 / Principles

1. **단일 진실 공급원 (Single Source of Truth)**: 프라이빗 레포가 메인 개발 레포
2. **문서만 선택적 공개**: 코드는 공개하되, 내부 전략/계획 문서는 제외
3. **버전 관리**: 퍼블릭 레포는 배포 가능한 안정 버전만 포함
4. **Pro 코드 보호**: Pro 패키지는 퍼블릭 레포에 포함하지 않음

## 현재 상태 / Current Status

### 프라이빗 레포 (Private Repo) - `c:\hua`

#### 패키지 상태
- ✅ `packages/hua-ui/` - Core UI (수정 완료, Pro 제거됨)
- ✅ `packages/hua-ui-pro/` - Pro UI (새로 생성, 프라이빗 전용)
- ✅ `packages/hua-ux/` - UX 프레임워크 (Pro 의존성 추가됨)
- ✅ `packages/create-hua-ux/` - CLI 도구

#### 문서 상태
- ✅ `packages/hua-ui/docs/` - 공개 가능한 문서
- ⚠️ `packages/hua-ui/UI_PACKAGE_STRATEGY.md` - 내부 전략 문서 (공개 불가)
- ⚠️ `packages/hua-ui/PRO_CODE_PROTECTION.md` - 내부 전략 문서 (공개 불가)
- ⚠️ `packages/hua-ui/IMPLEMENTATION_PLAN.md` - 내부 계획 문서 (공개 불가)
- ⚠️ `packages/hua-ui/COMPONENT_STATUS.md` - 내부 상태 문서 (공개 불가)

### 퍼블릭 레포 (Public Repo) - `C:\HUA-Labs-public`

#### 현재 포함된 패키지
- ✅ `packages/hua-ui/` - Core UI (복사됨, 최신 상태 확인 필요)
- ✅ `packages/hua-ux/` - UX 프레임워크 (이미 존재, 최신 상태 확인 필요)
- ✅ `packages/create-hua-ux/` - CLI 도구
- ✅ 기타 i18n, motion 패키지들

#### 문제점
- ⚠️ 퍼블릭 레포의 `hua-ui`에 내부 전략 문서 포함됨
- ⚠️ 퍼블릭 레포의 `hua-ui`가 최신 상태인지 확인 필요
- ⚠️ `hua-ux` 패키지가 최신 상태인지 확인 필요

## 마이그레이션 체크리스트 / Migration Checklist

### Phase 1: 프라이빗 레포 정리 (Private Repo Cleanup)

#### 1.1 Git 상태 정리
- [ ] 변경사항 커밋 (`packages/hua-ui/`, `packages/hua-ui-pro/`, `packages/hua-ux/`)
- [ ] 브랜치 정리 (필요시)
- [ ] 태그 확인 (배포 버전)

#### 1.2 내부 문서 분리
- [ ] 내부 전략 문서를 별도 폴더로 이동 또는 `.private/` 폴더 생성
- [ ] 공개 가능한 문서만 `docs/` 폴더에 유지
- [ ] `.gitignore`에 내부 문서 추가 (선택적)

**내부 문서 목록 (공개 불가)**:
- `packages/hua-ui/UI_PACKAGE_STRATEGY.md`
- `packages/hua-ui/PRO_CODE_PROTECTION.md`
- `packages/hua-ui/IMPLEMENTATION_PLAN.md`
- `packages/hua-ui/COMPONENT_STATUS.md`
- `packages/hua-ui/MIGRATION_GUIDE.md` (내부 마이그레이션 가이드인 경우)

**공개 가능한 문서**:
- `packages/hua-ui/docs/ARCHITECTURE.md`
- `packages/hua-ui/docs/DEVELOPMENT_GUIDE.md`
- `packages/hua-ui/docs/ICON_SYSTEM.md`
- `packages/hua-ui/docs/PACKAGE_STRUCTURE.md`
- `packages/hua-ui/README.md` (공개 버전)

### Phase 2: 퍼블릭 레포 정리 (Public Repo Cleanup)

#### 2.1 내부 문서 제거
- [ ] `C:\HUA-Labs-public\packages\hua-ui/UI_PACKAGE_STRATEGY.md` 삭제
- [ ] `C:\HUA-Labs-public\packages\hua-ui/PRO_CODE_PROTECTION.md` 삭제
- [ ] `C:\HUA-Labs-public\packages\hua-ui/IMPLEMENTATION_PLAN.md` 삭제
- [ ] `C:\HUA-Labs-public\packages\hua-ui/COMPONENT_STATUS.md` 삭제
- [ ] `C:\HUA-Labs-public\packages\hua-ui/MIGRATION_GUIDE.md` 확인 및 삭제 (내부 가이드인 경우)

#### 2.2 문서 정리
- [ ] 공개 가능한 문서만 `docs/` 폴더에 유지
- [ ] README.md가 공개 버전인지 확인
- [ ] 내부 링크/참조 제거

### Phase 3: 코드 동기화 (Code Synchronization)

#### 3.1 Core UI 동기화
- [ ] 프라이빗 레포의 `packages/hua-ui/` 최신 상태 확인
- [ ] 퍼블릭 레포의 `packages/hua-ui/`와 비교
- [ ] 변경사항이 있으면 `robocopy`로 동기화
- [ ] Pro 관련 파일 제거 확인 (dashboard, Emotion*, StatsPanel, SectionHeader)
- [ ] `src/advanced/` 폴더 제거 확인

#### 3.2 UX 프레임워크 동기화
- [ ] 프라이빗 레포의 `packages/hua-ux/` 최신 상태 확인
- [ ] 퍼블릭 레포의 `packages/hua-ux/`와 비교
- [ ] 변경사항이 있으면 동기화
- [ ] Pro 의존성 제거 (퍼블릭 레포에서는 `@hua-labs/ui-pro` 사용 불가)
- [ ] Pro 컴포넌트 re-export 제거

#### 3.3 빌드 검증
- [ ] 퍼블릭 레포에서 `packages/hua-ui` 빌드 테스트
- [ ] 퍼블릭 레포에서 `packages/hua-ux` 빌드 테스트 (Pro 의존성 제거 후)
- [ ] 빌드 오류 확인 및 수정

### Phase 4: 의존성 정리 (Dependency Cleanup)

#### 4.1 퍼블릭 레포 의존성 수정
- [ ] `packages/hua-ux/package.json`에서 `@hua-labs/ui-pro` 제거
- [ ] `packages/hua-ux/src/framework/index.ts`에서 Pro 컴포넌트 re-export 제거
- [ ] `workspace:*` → npm 버전으로 변경 (배포 시)

#### 4.2 package.json 정리
- [ ] 퍼블릭 레포의 모든 `package.json`에서 내부 링크 제거
- [ ] 레포지토리 URL 확인
- [ ] 라이선스 정보 확인

### Phase 5: 문서 작성 (Documentation)

#### 5.1 공개 문서 작성
- [ ] README.md 공개 버전 작성 (내부 전략 제외)
- [ ] 사용 가이드 작성
- [ ] API 문서 작성
- [ ] 예제 코드 작성

#### 5.2 문서 링크 정리
- [ ] 내부 문서 링크 제거
- [ ] 공개 문서 링크만 유지
- [ ] 외부 링크 확인

### Phase 6: 최종 검증 (Final Verification)

#### 6.1 코드 검증
- [ ] 퍼블릭 레포에서 모든 패키지 빌드 성공
- [ ] 타입 체크 통과
- [ ] 린트 통과

#### 6.2 문서 검증
- [ ] 내부 문서 누락 확인
- [ ] 공개 문서 완전성 확인
- [ ] 링크 유효성 확인

#### 6.3 Git 상태 확인
- [ ] 퍼블릭 레포 Git 상태 확인
- [ ] 커밋 메시지 확인
- [ ] 태그 확인

## 자동화 스크립트 / Automation Scripts

### 현재 사용 중인 스크립트
- `scripts/copy-to-public-repo.ts` - 패키지 복사 스크립트

### 개선 필요 사항
- [ ] 내부 문서 자동 제거 기능 추가
- [ ] 문서 필터링 기능 추가
- [ ] 의존성 자동 수정 기능 추가

## 주의사항 / Warnings

1. **Pro 코드 보호**: Pro 패키지는 절대 퍼블릭 레포에 포함하지 않음
2. **내부 문서 보호**: 전략/계획 문서는 공개하지 않음
3. **의존성 확인**: 퍼블릭 레포에서는 Pro 의존성 사용 불가
4. **버전 관리**: 퍼블릭 레포는 안정 버전만 배포

## 다음 단계 / Next Steps

1. **즉시 실행**: Phase 1 (프라이빗 레포 정리)
2. **다음**: Phase 2 (퍼블릭 레포 정리)
3. **그 다음**: Phase 3 (코드 동기화)
4. **최종**: Phase 4-6 (의존성 정리, 문서 작성, 검증)

## 관련 파일 / Related Files

- `scripts/copy-to-public-repo.ts` - 복사 스크립트
- `packages/create-hua-ux/docs/PRIVATE_TO_PUBLIC_REPO_GUIDE.md` - 가이드 문서
- `docs/devlog-2025-12-30-ui-package-split.md` - 작업 데브로그
