# Graphite 스택 분리 계획 - Header/Footer i18n 및 SSR 지원

## 현재 변경사항 분석

### 논리적 단위 분류 (의존성 순서)

#### 1. hua-i18n-core 패키지 (최하위) ⭐
**목적**: SSR에서 전달된 `initialTranslations`가 있을 때 `isInitialized`를 `true`로 설정하여 초기화 전 상태에서도 번역 사용 가능하도록 개선

**변경 파일**:
- `packages/hua-i18n-core/src/core/translator.tsx`
  - `initialTranslations`가 있으면 constructor에서 `isInitialized = true` 설정
  - `translate` 메서드에서 초기화 전 상태일 때 `findInNamespace`를 사용하여 중첩 키도 처리

**스택 제목**: `feat(packages/hua-i18n-core): mark as initialized when initialTranslations provided`

#### 2. hua-i18n-core-zustand 패키지
**목적**: `supportedLanguages`를 `createCoreI18n`에 전달하여 동적 언어 지원

**변경 파일**:
- `packages/hua-i18n-core-zustand/src/index.ts`
  - `ZustandI18nConfig`에 `supportedLanguages` 속성 추가

**스택 제목**: `feat(packages/hua-i18n-core-zustand): add supportedLanguages to config`

#### 3. hua-ux 패키지
**목적**: SSR 번역 데이터 로딩 유틸리티 추가 및 서버 전용 export 경로 제공

**변경 파일**:
- `packages/hua-ux/src/framework/utils/ssr-translations.ts` (신규)
  - `getSSRTranslations` 함수 구현
- `packages/hua-ux/src/framework/server.ts` (신규)
  - 서버 전용 export 파일
- `packages/hua-ux/src/framework/types/index.ts`
  - `HuaUxConfig.i18n.initialTranslations` 타입 추가
- `packages/hua-ux/src/framework/components/Providers.tsx`
  - `initialTranslations` 및 `supportedLanguages` 전달
- `packages/hua-ux/src/framework/index.ts`
  - `/framework/server` export 주석 처리 (별도 파일로 분리)
- `packages/hua-ux/package.json`
  - `server-only` 패키지 추가 (peerDependencies, devDependencies)
  - `/framework/server` export 경로 추가

**스택 제목**: `feat(packages/hua-ux): add SSR translation utilities`

#### 4. hua-website 앱
**목적**: Header와 Footer에 다국어 지원 추가 및 SSR 설정

**변경 파일**:
- `apps/hua-website/components/layout/Header.tsx`
  - 다국어 지원 추가 (이미 완료되어 있음)
- `apps/hua-website/components/layout/Footer.tsx`
  - 다국어 지원 추가
- `apps/hua-website/app/layout.tsx`
  - `getSSRTranslations` 사용하여 SSR 번역 데이터 로드
- `apps/hua-website/translations/ko/common.json`
  - Header/Footer 번역 키 추가
- `apps/hua-website/translations/en/common.json`
  - Header/Footer 번역 키 추가
- `apps/hua-website/translations/ja/common.json`
  - Header/Footer 번역 키 추가

**스택 제목**: `feat(apps/hua-website): add i18n support for Header and Footer with SSR`

#### 5. 문서
**목적**: 작업 내용 기록

**변경 파일**:
- `docs/devlogs/DEVLOG_2026-01-10_FOOTER_I18N_SUPPORT.md` (신규)
  - 작업 내용 및 학습 인사이트 기록

**스택 제목**: `docs(devlogs): add i18n and SSR support devlog`

## 스택 생성 순서

```bash
# 1. 최하위 패키지부터 (의존성 순서)
gt create -m "feat(packages/hua-i18n-core): mark as initialized when initialTranslations provided"

# 2. 다음 패키지
gt create -m "feat(packages/hua-i18n-core-zustand): add supportedLanguages to config"

# 3. hua-ux 패키지
gt create -m "feat(packages/hua-ux): add SSR translation utilities"

# 4. 앱 레벨
gt create -m "feat(apps/hua-website): add i18n support for Header and Footer with SSR"

# 5. 문서
gt create -m "docs(devlogs): add i18n and SSR support devlog"
```

## PR 병합 순서

1. PR 1 (hua-i18n-core) → 먼저 병합
2. PR 2 (hua-i18n-core-zustand) → 다음 병합
3. PR 3 (hua-ux) → 다음 병합
4. PR 4 (hua-website) → 마지막 병합
5. PR 5 (문서) → 언제든 병합 가능
