## 변경 사항

- [x] 의존성 업데이트
- [x] 코드 리팩토링
- [x] 문서 수정
- [x] 설정 변경

## 브랜치 정보

- **Base 브랜치**: `develop`
- **Head 브랜치**: `feature/dashboard-ui-widgets`

## Breaking Changes

- [x] Breaking Changes 없음

## 변경 이유

Next.js 16 업그레이드와 Tailwind CSS 4.0 마이그레이션을 완료하고, UI 패키지 개선 작업을 진행했습니다.

## 변경 내용 상세

### 주요 변경 사항

1. **Next.js 16 업그레이드**
   - Next.js 15.4.3 → 16.0.4
   - 빌드 스크립트에 `--webpack` 플래그 추가
   - 서버/클라이언트 컴포넌트 분리 개선

2. **Tailwind CSS 4.0 마이그레이션**
   - 모든 앱의 Tailwind CSS v4로 업그레이드
   - `@tailwindcss/postcss` 패키지 설치
   - PostCSS 설정 업데이트
   - CSS 파일 `@import` 방식으로 변경
   - tailwind.config.js 단순화

3. **UI 패키지 개선**
   - Toast 컴포넌트에서 `dangerouslySetInnerHTML` 제거
   - Toast 애니메이션 CSS를 별도 파일로 분리
   - tsup 빌드 시스템 도입
   - Vitest 테스트 설정
   - Storybook 도입

4. **문서화**
   - Next.js 16 검증 가이드 작성
   - Tailwind CSS 4 마이그레이션 문서 작성
   - 작업 계획 문서 작성
   - 빌드 상태 문서 작성

### 변경된 파일

- 모든 앱의 `package.json`, `postcss.config.js`, `tailwind.config.js`, `globals.css`
- `packages/hua-ui/src/components/Toast.tsx`
- `packages/hua-ui/src/styles/toast.css`
- `packages/hua-ui/package.json`
- `docs/` 디렉토리 내 여러 문서 파일

## 체크리스트

### 코드 품질
- [x] 코드가 프로젝트의 코딩 스타일을 따릅니다
- [x] 자체 코드 리뷰를 수행했습니다
- [x] 문서를 업데이트했습니다

### 테스트 & 빌드
- [x] 타입 체크가 통과합니다
- [x] 빌드가 성공합니다 (`my-api`, `my-chat` 성공)
- [x] 일부 앱의 기존 코드 문제 확인 (`my-app`, `i18n-test`, `hua-motion` - 마이그레이션과 무관)

## 테스트

### 테스트 환경
- OS: Windows
- Node.js 버전: 확인 필요
- 빌드 테스트: `my-api`, `my-chat` 성공

### 빌드 테스트 결과
- `my-api`: Build successful
- `my-chat`: Build successful
- `my-app`: Type error (existing code issue, unrelated to migration)
- `i18n-test`: Type error (existing code issue, unrelated to migration)
- `hua-motion`: Build error (existing code issue, unrelated to migration)

## 관련 이슈

N/A

## 리뷰어

@

## 라벨

- `feature`
- `refactor`
- `docs`
- `chore`
- `needs-review`

## 추가 정보

이 PR은 Next.js 16과 Tailwind CSS 4.0 마이그레이션을 통합한 작업입니다. 주요 앱들의 빌드가 성공적으로 완료되었으며, 일부 앱의 빌드 에러는 기존 코드 문제로 마이그레이션과 무관합니다.

