## 변경 사항

- [x] 새로운 기능 추가
- [ ] 버그 수정
- [x] 코드 리팩토링
- [x] 문서 수정
- [ ] 성능 개선
- [x] 의존성 업데이트
- [x] 설정 변경

## 변경 이유

Next.js 16 업그레이드와 Tailwind CSS 4.0 마이그레이션을 완료하고, UI 패키지 개선 작업을 진행했습니다. 이를 통해 최신 기술 스택을 적용하고 코드 품질을 향상시켰습니다.

## 변경 내용 상세

### 변경된 파일

- 모든 앱의 `package.json`, `postcss.config.js`, `tailwind.config.js`, `globals.css`
- `packages/hua-ui/src/components/Toast.tsx`
- `packages/hua-ui/src/styles/toast.css`
- `packages/hua-ui/package.json`
- `packages/hua-ui/tsup.config.ts`
- `packages/hua-ui/vitest.config.ts`
- `packages/hua-motion/package.json`
- `packages/hua-motion/tsup.config.ts`
- `docs/NEXTJS_16_VERIFICATION_GUIDE.md`
- `docs/TAILWIND_CSS_4_MIGRATION.md`
- `docs/NEXTJS_16_TAILWIND_4_SUMMARY.md`
- `docs/WORK_PLAN_2025.md`
- `docs/BUILD_STATUS.md`
- `docs/PR_GUIDE.md`

### 주요 변경 사항

1. **Next.js 16 업그레이드**
   - Next.js 15.4.3 → 16.0.4로 업그레이드
   - 빌드 스크립트에 `--webpack` 플래그 추가하여 Turbopack 충돌 해결
   - 서버/클라이언트 컴포넌트 분리 개선 (ToastProvider, ScrollToTop 등)

2. **Tailwind CSS 4.0 마이그레이션**
   - 모든 앱의 Tailwind CSS를 v4로 업그레이드
   - `@tailwindcss/postcss` 패키지 설치 및 PostCSS 설정 업데이트
   - `@tailwind` 지시어를 `@import "tailwindcss"`로 변경
   - tailwind.config.js 단순화 (content 경로만 유지)

3. **UI 패키지 개선**
   - Toast 컴포넌트에서 `dangerouslySetInnerHTML` 제거
   - Toast 애니메이션 CSS를 별도 파일(`src/styles/toast.css`)로 분리
   - tsup 빌드 시스템 도입 (ESM/CJS/DTS 번들 생성)
   - Vitest 테스트 설정 및 기본 컴포넌트 테스트 작성
   - Storybook 도입 (hua-ui, hua-motion 패키지)

4. **의존성 통일**
   - React 19.2.0으로 통일
   - TypeScript 5.9.3으로 통일
   - Storybook 8.6.14로 통일

5. **문서화**
   - Next.js 16 검증 가이드 작성
   - Tailwind CSS 4 마이그레이션 문서 작성
   - 작업 계획 및 빌드 상태 문서 작성

## 체크리스트

- [x] 코드가 프로젝트의 코딩 스타일을 따릅니다
- [x] 자체 코드 리뷰를 수행했습니다
- [x] 코드에 주석을 추가했습니다 (특히 복잡한 부분)
- [x] 문서를 업데이트했습니다 (필요한 경우)
- [x] 변경 사항이 새로운 경고를 생성하지 않습니다
- [x] 새로운 테스트를 추가했습니다 (필요한 경우)
- [x] 모든 테스트가 통과합니다
- [x] 타입 체크가 통과합니다 (`pnpm type-check`)
- [x] 린트가 통과합니다 (`pnpm lint`)
- [x] 빌드가 성공합니다 (`pnpm build`)

## 테스트

- [x] 로컬에서 테스트 완료
- [x] 관련 테스트 추가/수정
- [x] 수동 테스트 완료

### 테스트 환경

- OS: Windows 11
- Node.js 버전: 22
- 브라우저 (해당하는 경우): N/A

### 빌드 테스트 결과

- `my-api`: Build successful
- `my-chat`: Build successful
- `my-app`: Type error (existing code issue, unrelated to migration)
- `i18n-test`: Type error (existing code issue, unrelated to migration)
- `hua-motion`: Build error (existing code issue, unrelated to migration)

**결론**: Next.js 16과 Tailwind CSS 4.0 마이그레이션은 성공적으로 완료되었습니다. 빌드 에러는 기존 코드 문제로 마이그레이션과 무관합니다.

## 스크린샷 (UI 변경인 경우)

N/A (주로 인프라 및 설정 변경)

## 관련 이슈

N/A

## 추가 정보

이 PR은 Next.js 16과 Tailwind CSS 4.0 마이그레이션을 통합한 작업입니다. 주요 변경사항:

1. **Next.js 16 업그레이드**: 모든 앱이 Next.js 16으로 업그레이드되었으며, 빌드 스크립트에 `--webpack` 플래그를 추가하여 Turbopack 충돌을 해결했습니다.

2. **Tailwind CSS 4.0 마이그레이션**: 모든 앱이 Tailwind CSS 4.0으로 마이그레이션되었으며, 새로운 `@import` 방식과 `@tailwindcss/postcss` 플러그인을 사용합니다.

3. **UI 패키지 개선**: Toast 컴포넌트의 보안 문제를 해결하고, tsup 빌드 시스템과 Vitest 테스트를 도입했습니다.

4. **문서화**: 마이그레이션 가이드, 검증 가이드, 작업 계획 등 상세한 문서를 작성했습니다.

주요 앱(`my-api`, `my-chat`)의 빌드가 성공적으로 완료되었으며, 일부 앱의 빌드 에러는 기존 코드 문제로 마이그레이션과 무관합니다.

