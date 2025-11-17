# 배포 자동화 가이드 (모노레포)

모노레포에서 변경된 앱만 자동으로 배포하는 방법입니다.

## 🎯 전략

### 변경 감지 기반 배포
- Turbo의 필터링 기능을 사용하여 변경된 앱만 빌드/배포
- `dorny/paths-filter`를 사용하여 변경된 파일 감지
- 각 앱별로 독립적인 배포 파이프라인

### 브랜치별 배포 전략

#### `develop` 브랜치
- **Preview 배포**: 변경된 앱만 Vercel Preview 환경에 배포
- **자동 배포**: PR 머지 시 자동으로 배포

#### `main` 브랜치
- **Production 배포**: 변경된 앱만 Vercel Production 환경에 배포
- **수동 승인**: 필요시 수동 승인 후 배포

## 📋 설정 방법

### 1. GitHub Secrets 설정

GitHub 저장소 Settings → Secrets and variables → Actions에서 다음 Secrets를 추가하세요:

```
VERCEL_TOKEN          # Vercel API 토큰
VERCEL_ORG_ID         # Vercel Organization ID
VERCEL_PROJECT_ID_SUM_DIARY  # my-app 프로젝트 ID
VERCEL_PROJECT_ID_SUM_API    # my-api 프로젝트 ID
DATABASE_URL          # PostgreSQL 데이터베이스 연결 URL (Prisma 마이그레이션용)
SUPABASE_URL          # Supabase URL
SUPABASE_SERVICE_KEY  # Supabase Service Key
NEXT_PUBLIC_SUPABASE_URL  # Public Supabase URL
```

### 2. Vercel 토큰 생성

1. Vercel 대시보드 → Settings → Tokens
2. 새 토큰 생성 (이름: `github-actions`)
3. 생성된 토큰을 `VERCEL_TOKEN` Secret에 추가

### 3. 프로젝트 ID 확인

각 Vercel 프로젝트의 Settings → General에서 Project ID를 확인하세요.

## 🔧 워크플로우 동작 방식

### 변경 감지

```yaml
# apps/my-app/** 또는 packages/hua-ui/** 변경 시
my-app: true

# apps/my-api/** 변경 시
my-api: true
```

### 조건부 배포

```yaml
# develop 브랜치: Preview 배포
if: needs.detect-changes.outputs.my-app == 'true' && github.ref == 'refs/heads/develop'

# main 브랜치: Production 배포
if: github.ref == 'refs/heads/main'
```

## 🚀 배포 프로세스

### 1. PR 머지 (develop)
1. PR 머지 → `develop` 브랜치 업데이트
2. GitHub Actions 트리거
3. 변경된 앱 감지
4. **Prisma Client 생성** (`prisma generate`)
5. **데이터베이스 마이그레이션** (`prisma migrate deploy`)
6. 빌드 실행
7. Vercel Preview 배포

### 2. Production 배포 (main)
1. `develop` → `main` 머지
2. GitHub Actions 트리거
3. 변경된 앱 감지
4. **Prisma Client 생성** (`prisma generate`)
5. **데이터베이스 마이그레이션** (`prisma migrate deploy`)
6. 빌드 실행
7. Vercel Production 배포

## 🗄️ 데이터베이스 마이그레이션

### 자동 마이그레이션
배포 워크플로우에서 자동으로 다음을 실행합니다:
1. `prisma generate`: Prisma Client 생성
2. `prisma migrate deploy`: 프로덕션 마이그레이션 적용

### 수동 마이그레이션 (필요시)
로컬에서 마이그레이션을 생성하고 커밋한 후 배포:

```bash
# 마이그레이션 생성
cd apps/my-app
pnpm run db:migrate:local

# 마이그레이션 파일이 prisma/migrations/ 에 생성됨
# Git에 커밋 후 PR 생성
```

### 주의사항
- ⚠️ **프로덕션 데이터베이스**: `prisma migrate deploy`는 프로덕션 데이터베이스에 직접 적용됩니다
- ✅ **안전한 마이그레이션**: 마이그레이션 파일을 먼저 검토하고 테스트 환경에서 확인하세요
- 🔒 **백업**: 중요한 변경 전에는 데이터베이스 백업을 권장합니다

## 📝 주의사항

### 의존성 패키지 변경
- `packages/hua-ui/**` 변경 시 `my-app`도 함께 배포됩니다
- 의존성 관계를 `deploy.yml`의 `filters`에 명시해야 합니다

### 환경 변수
- 빌드에 필요한 환경 변수는 GitHub Secrets에 저장
- Vercel 프로젝트 설정에도 동일한 환경 변수 설정 필요

### 빌드 시간
- 모노레포 전체 빌드는 시간이 오래 걸릴 수 있습니다
- 변경된 앱만 빌드하도록 필터링하여 시간 단축

## 🔍 문제 해결

### 배포가 트리거되지 않음
- 변경된 파일 경로가 `filters`에 포함되어 있는지 확인
- GitHub Actions 로그에서 `detect-changes` 단계 확인

### 빌드 실패
- 환경 변수가 올바르게 설정되었는지 확인
- 로컬에서 `pnpm build --filter=<app>` 실행하여 확인

### Vercel 배포 실패
- Vercel 토큰이 유효한지 확인
- 프로젝트 ID가 올바른지 확인
- Vercel 대시보드에서 배포 로그 확인

## 💡 개선 방안

### 향후 개선
- [ ] 배포 전 자동 테스트 실행
- [ ] 배포 후 Health Check
- [ ] 롤백 자동화
- [ ] 배포 알림 (Slack, Discord 등)

