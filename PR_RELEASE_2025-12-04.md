# PR: release/2025-12-04 → main

## 변경 사항

- [x] 버그 수정
- [x] 코드 리팩토링
- [x] 문서 수정
- [x] 설정 변경
- [x] 보안 업데이트

## 브랜치 정보

- **Base 브랜치**: `main`
- **Head 브랜치**: `release/2025-12-04`

## Breaking Changes

- [x] Breaking Changes 없음

## 변경 이유

develop 브랜치의 모든 변경사항을 main으로 머지하여 프로덕션 배포 준비

## 변경 내용 상세

### 주요 변경 사항

1. **Vercel 빌드 오류 수정** (Critical)
   - Supabase 클라이언트 빌드 타임 초기화 제거 (lazy initialization 패턴 적용)
   - Dynamic Import로 빌드 타임 실행 방지
   - 타입 오류 수정 (명시적 타입 어노테이션 추가)
   - Vercel pnpm 버전 불일치 문제 해결 (corepack use + corepack pnpm 사용)
   - `apps/my-api/lib/credit-scheduler.ts` - getter를 사용한 lazy initialization
   - `apps/my-api/lib/services/notification-service.ts` - getter를 사용한 lazy initialization
   - `apps/my-api/app/api/admin/test-daily-grant/route.ts` - dynamic import 적용
   - `apps/my-app/vercel.json` - corepack을 사용한 pnpm 버전 지정
   - `apps/my-api/vercel.json` - corepack을 사용한 pnpm 버전 지정

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

4. **문서화**
   - DevLog 추가: `DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md`
   - 패턴 문서 추가: `build-time-module-execution.md` (빌드 타임 모듈 실행 문제)
   - 패턴 문서 추가: `vercel-pnpm-version.md` (Vercel pnpm 버전 지정)
   - 패턴 문서 README 업데이트

### 변경된 파일

주요 변경 파일:
- `apps/my-api/lib/credit-scheduler.ts`
- `apps/my-api/lib/services/notification-service.ts`
- `apps/my-api/app/api/admin/test-daily-grant/route.ts`
- `apps/my-api/app/api/**/*.ts` (타입 어노테이션 추가)
- `apps/my-app/docs/patterns/build-time-module-execution.md`
- `apps/my-app/docs/patterns/vercel-pnpm-version.md`
- `apps/my-app/docs/patterns/README.md`
- `apps/my-app/vercel.json` (pnpm 버전 지정)
- `apps/my-api/vercel.json` (pnpm 버전 지정)
- `docs/devlogs/DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md`
- `docs/devlogs/README.md`
- `packages/hua-i18n-core/src/hooks/useI18n.tsx` (중복 export 제거)
- 기타 여러 API 라우트 파일들

## 체크리스트

### 코드 품질
- [x] 코드가 프로젝트의 코딩 스타일을 따릅니다
- [x] 자체 코드 리뷰를 수행했습니다
- [x] 문서를 업데이트했습니다
- [x] 변경 사항이 새로운 경고를 생성하지 않습니다

### 테스트 & 빌드
- [x] 타입 체크가 통과합니다
- [x] 빌드가 성공합니다 (`pnpm build`)
  - my-app: 성공
  - my-api: 성공
  - my-chat: 성공
- [x] Vercel 빌드가 성공합니다
  - my-app: 성공
  - my-api: 성공
- [x] Vercel pnpm 버전 문제 해결 확인

### 배포 관련
- [x] 환경 변수 변경사항 확인 완료
- [x] 빌드 환경 설정 확인 완료

## 테스트

- [x] 로컬에서 빌드 테스트 완료
- [x] 모든 패키지 빌드 성공
- [x] TypeScript 타입 체크 통과
- [x] Vercel 빌드 성공

### 테스트 환경
- OS: Windows 10
- Node.js 버전: v22.17.1
- pnpm 버전: 10.24.0

### 빌드 테스트 결과

#### my-app
```
✓ Compiled successfully in 8.0s
✓ Finished TypeScript in 9.0s
✓ Generating static pages (73/73) in 1502.2ms
```

#### my-api
```
✓ Compiled successfully in 9.7s
✓ Finished TypeScript in 7.8s
✓ Generating static pages (72/72) in 1587.4ms
```

#### my-chat
```
✓ Compiled successfully in 4.1s
✓ Finished TypeScript in 5.5s
✓ Generating static pages (9/9) in 848.7ms
```

## 관련 커밋

주요 커밋:
- `fix(my-api): use dynamic import for credit-scheduler in test route`
- `fix(my-api): use lazy initialization for Supabase clients`
- `fix(my-api): add type annotations for Supabase queries`
- `fix(vercel): specify pnpm version using corepack`
- `fix(vercel): use corepack use and corepack pnpm for pnpm version`
- `docs: add devlog and pattern documentation for Vercel build error fix`
- `docs: add pattern documentation for Vercel pnpm version issue`
- `chore: resolve merge conflicts between main and develop`

## 관련 이슈

N/A

## 리뷰어

@HUA-Labs/team

## 라벨

- `release`
- `bugfix`
- `security`
- `chore`
- `docs`

## 추가 정보

### 보안 취약점 대응
- React 19.2.1: 보안 취약점 수정
- Next.js 16.0.7: 보안 취약점 수정

### 배포 환경
- Vercel에서 자동 배포 처리
- 환경 변수는 Vercel 및 Doppler에서 관리
- 네이티브 모듈 빌드 환경 구성 완료

### 주의 사항

1. **bcrypt**: 네이티브 모듈이므로 빌드 환경이 올바르게 설정되어야 합니다.
2. **환경 변수**: 배포 시 환경 변수가 올바르게 설정되어 있는지 확인하세요.
3. **데이터베이스**: Prisma 마이그레이션이 필요할 수 있습니다.
4. **Zustand 5.x**: API 호환성은 유지되지만, 타입 정의가 약간 변경되었을 수 있습니다.
5. **@typescript-eslint 8.x**: ESLint 9와 완전 호환되며, Flat Config를 지원합니다.

### 참고 문서
- [DevLog: Vercel Build Error Fix](./docs/devlogs/DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md)
- [DevLog: Dependency Update](./docs/devlogs/DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md)
- [Pattern: Build-Time Module Execution](./apps/my-app/docs/patterns/build-time-module-execution.md)
- [Pattern: Vercel pnpm Version](./apps/my-app/docs/patterns/vercel-pnpm-version.md)

### 관련 PR
- 기존 PR #16은 이 PR로 대체됩니다.

---

**작성일**: 2025-12-04  
**작성자**: HUA Team
