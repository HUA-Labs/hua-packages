# PR: develop → main

## 변경 사항

- [x] 버그 수정
- [x] 코드 리팩토링
- [x] 문서 수정
- [x] 설정 변경

## 브랜치 정보

- **Base 브랜치**: `main`
- **Head 브랜치**: `develop`

## Breaking Changes

- [x] Breaking Changes 없음

## 변경 이유

develop 브랜치의 모든 변경사항을 main으로 머지하여 프로덕션 배포 준비

## 변경 내용 상세

### 주요 변경 사항

1. **빌드 오류 수정**
   - TypeScript 타입 에러 5개 해결
   - my-app 컴포넌트의 이벤트 핸들러 타입 추가
   - SearchModal, ProfileSettingsTab, SecuritySettingsTab, register page 등

2. **린트 경고 수정**
   - 사용하지 않는 import 제거 (HeroSection, Suspense, Icon 등)
   - 사용하지 않는 변수 주석 처리 또는 언더스코어 표시
   - React Hook dependency 경고 수정

3. **브랜치 정리 및 머지**
   - `feature/stats-panel-section-header` → StatsPanel, SectionHeader 컴포넌트 추가
   - `feature/i18n-loaders-sandbox` → hua-i18n-loaders 패키지 및 문서 추가
   - `feature/i18n-refactor` → Dashboard widgets 및 deploy workflow 업데이트

4. **빈 폴더 정리**
   - 사용하지 않는 패키지 디렉토리 제거

5. **Tailwind CSS v4 및 React 19 호환성**
   - PostCSS 설정 업데이트 (`@tailwindcss/postcss` 사용)
   - React Context import 수정 (`import * as React` → 명시적 import)

6. **개발로그 추가**
   - 2025-11-30 개발로그 작성

### 변경된 파일

주요 변경 파일:
- `apps/my-app/app/**/*.tsx` - TypeScript 타입 에러 수정
- `apps/my-api/app/**/*.tsx` - 린트 경고 수정
- `packages/hua-ui/src/index.ts` - StatsPanel, SectionHeader export 추가
- `packages/hua-i18n-loaders/**` - 새 패키지 추가
- `.github/workflows/deploy.yml` - Vercel build step 추가
- `docs/devlogs/DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md` - 개발로그 추가

## 체크리스트

### 코드 품질
- [x] 코드가 프로젝트의 코딩 스타일을 따릅니다
- [x] 자체 코드 리뷰를 수행했습니다
- [x] 문서를 업데이트했습니다
- [x] 변경 사항이 새로운 경고를 생성하지 않습니다

### 테스트 & 빌드
- [x] 타입 체크가 통과합니다
- [x] 린트가 통과합니다 (주요 경고 수정 완료)
- [x] 빌드가 성공합니다 (`pnpm build` - 22/22 패키지 성공)

### 배포 관련
- [x] 환경 변수 변경사항 없음
- [x] 마이그레이션 스크립트 확인 완료
- [x] 배포 가이드 업데이트 (deploy.yml 업데이트)

## 테스트

- [x] 로컬에서 빌드 테스트 완료
- [x] 모든 패키지 빌드 성공
- [x] TypeScript 타입 체크 통과

### 테스트 환경
- OS: Windows 10
- Node.js 버전: 22.x
- pnpm 버전: 10.20.0

## 관련 커밋

주요 커밋:
- `Merge chore/build-and-lint-fixes: Fix build errors and lint warnings`
- `feat(ui): add dashboard widgets and documentation from feature/i18n-refactor`
- `feat(i18n): add i18n loader package and SSR hydration from feature/i18n-loaders-sandbox`
- `feat(ui): add StatsPanel and SectionHeader components from feature/stats-panel-section-header`
- `fix: resolve build errors for Tailwind CSS v4 and React 19 compatibility`

## 관련 이슈

N/A

## 리뷰어

@HUA-Labs/team

## 라벨

- `chore`
- `ready-for-merge`
- `build-fix`
- `lint-fix`

## 추가 정보

- 모든 빌드가 통과하여 스테이징 환경 배포 준비 완료
- develop 브랜치가 main과 동기화되어 있음
- 브랜치 정리 완료 (feature 브랜치들 머지 후 삭제)

