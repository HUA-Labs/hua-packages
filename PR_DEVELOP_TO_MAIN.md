# PR: develop → main

## 변경 사항

- [x] 버그 수정
- [x] 코드 리팩토링
- [x] 문서 수정
- [x] 설정 변경
- [x] 보안 업데이트

## 브랜치 정보

- **Base 브랜치**: `main`
- **Head 브랜치**: `develop`

## Breaking Changes

- [x] Breaking Changes 없음

## 변경 이유

develop 브랜치의 모든 변경사항을 main으로 머지하여 프로덕션 배포 준비

## 변경 내용 상세

### 주요 변경 사항

1. **Vercel 배포 에러 수정**
   - OpenAI 클라이언트 빌드 타임 초기화 제거 (지연 초기화로 변경)
   - `turbo.json`에서 환경 변수 설정 제거 (Vercel/Doppler에서 직접 관리)
   - Prisma Client 생성이 빌드 전에 실행되도록 수정
   - Vercel 빌드 명령어를 `turbo run build`로 변경하여 workspace 의존성 빌드 보장

2. **의존성 업데이트 및 정리**
   - Next.js 16.0.7 (보안 취약점 수정)
   - React 19.2.1 (보안 취약점 수정)
   - ESLint 9 호환성 (TypeScript ESLint 8.0.0)
   - bcryptjs → bcrypt 마이그레이션 (보안 및 성능 개선)
   - 사용하지 않는 패키지 38개 제거

3. **빌드 환경 설정**
   - 네이티브 모듈(bcrypt) 빌드를 위한 환경 설정
   - GitHub Actions에 build-essential, python3 설치 추가
   - `.npmrc`에 `ignore-scripts=false` 설정

4. **CI/CD 파이프라인 정리**
   - GitHub Actions에서 Vercel 배포 단계 제거 (Vercel에서 자동 처리)
   - Prisma 마이그레이션 단계 유지

### 변경된 파일

주요 변경 파일:
- `apps/my-app/app/lib/openai-test.ts`
- `apps/my-app/vercel.json`
- `apps/my-app/package.json`
- `apps/my-api/package.json`
- `apps/my-api/app/api/**/*.ts` (bcrypt 마이그레이션)
- `turbo.json`
- `.github/workflows/deploy.yml`
- `pnpm-workspace.yaml`
- `docs/devlogs/DEVLOG_2025-12-04_RELEASE_TO_MAIN_AND_CODE_REVIEW.md`

## 체크리스트

### 코드 품질
- [x] 코드가 프로젝트의 코딩 스타일을 따릅니다
- [x] 자체 코드 리뷰를 수행했습니다
- [x] 문서를 업데이트했습니다
- [x] 변경 사항이 새로운 경고를 생성하지 않습니다

### 테스트 & 빌드
- [x] 타입 체크가 통과합니다
- [x] 린트가 통과합니다
- [x] 빌드가 성공합니다 (`pnpm build`)

### 배포 관련
- [x] 환경 변수 변경사항 확인 완료
- [x] 마이그레이션 스크립트 확인 완료
- [x] 배포 가이드 업데이트 완료

## 테스트

- [x] 로컬에서 빌드 테스트 완료
- [x] 모든 패키지 빌드 성공
- [x] TypeScript 타입 체크 통과
- [x] Vercel 배포 성공

### 테스트 환경
- OS: Windows 10
- Node.js 버전: v22.17.1
- pnpm 버전: 10.24.0

## 관련 커밋

주요 커밋:
- `fix: defer OpenAI client initialization and remove env vars from turbo.json`
- `fix: add prisma generate to build script for Vercel deployment`
- `fix: update Vercel build command to use turbo for workspace dependencies`
- `chore: migrate bcryptjs to bcrypt and configure build environment`
- `chore: update dependencies and remove unused packages`
- `docs: add devlog for 2025-12-04 release to main and code review`

## 관련 이슈

N/A

## 리뷰어

@HUA-Labs/team

## 라벨

- `chore`
- `ready-for-merge`
- `deployment`
- `security`

## 추가 정보

### 보안 취약점 대응
- React 19.2.1: CVE-2025-55182 패치 적용
- Next.js 16.0.7: CVE-2025-66478 패치 적용

### 배포 환경
- Vercel에서 자동 배포 처리
- 환경 변수는 Vercel 및 Doppler에서 관리
- 네이티브 모듈 빌드 환경 구성 완료

### 참고 문서
- [데브로그: 2025-12-04](./docs/devlogs/DEVLOG_2025-12-04_RELEASE_TO_MAIN_AND_CODE_REVIEW.md)

