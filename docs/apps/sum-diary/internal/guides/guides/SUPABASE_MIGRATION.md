# Supabase 마이그레이션 가이드

## 📋 개요

현재 Railway/NAS PostgreSQL에서 Supabase PostgreSQL로 데이터베이스를 마이그레이션하는 가이드입니다.

## 🎯 사전 준비

### 1. Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `my-app` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (저장 필수!)
   - **Region**: 가장 가까운 리전 선택 (예: `Northeast Asia (Seoul)`)
4. 프로젝트 생성 완료 대기 (약 2-3분)

### 2. Supabase 연결 정보 확인

Supabase 대시보드 > **Settings** > **Database**에서 다음 정보 확인:

- **Connection string**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
- **Connection pooling**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
- **Direct connection**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

**Settings** > **API**에서:
- **Project URL**: `https://[PROJECT-REF].supabase.co`
- **anon public key**: `eyJhbGc...`
- **service_role key**: `eyJhbGc...` (⚠️ 절대 공개하지 마세요!)

## 🔧 마이그레이션 단계

### Step 1: 환경 변수 설정

`.env.local` 파일에 Supabase 연결 정보 추가:

```bash
# Supabase Database (Connection Pooling 사용 - Prisma 권장)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase API
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**중요:**
- `DATABASE_URL`에는 `?pgbouncer=true` 추가 (Connection Pooling 사용)
- `DIRECT_URL`은 마이그레이션 및 Prisma Studio용 (직접 연결)

### Step 2: Prisma 스키마 확인

현재 스키마는 `user`와 `admin` 두 개의 스키마를 사용합니다:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["user", "admin"]
}
```

Supabase는 기본적으로 `public` 스키마를 사용하므로, 다음 중 하나를 선택:

#### 옵션 A: 기존 스키마 유지 (권장)

Supabase에서 스키마 생성:

```sql
-- Supabase SQL Editor에서 실행
CREATE SCHEMA IF NOT EXISTS "user";
CREATE SCHEMA IF NOT EXISTS "admin";
```

#### 옵션 B: public 스키마로 통합

Prisma 스키마 수정 필요 (복잡함, 비권장)

### Step 3: 데이터베이스 마이그레이션

```bash
# 1. Prisma 클라이언트 재생성
cd apps/my-app
pnpm prisma generate

# 2. 마이그레이션 실행
pnpm prisma migrate deploy

# 또는 개발 환경에서
pnpm prisma migrate dev --name init_supabase
```

### Step 4: 기존 데이터 마이그레이션 (선택사항)

기존 데이터가 있다면 pg_dump로 백업 후 복원:

```bash
# 1. 기존 DB 백업
pg_dump -h [OLD_HOST] -U [USER] -d [DATABASE] -F c -f backup.dump

# 2. Supabase로 복원
pg_restore -h aws-0-[REGION].pooler.supabase.com \
  -U postgres.[PROJECT-REF] \
  -d postgres \
  --no-owner \
  --no-acl \
  backup.dump
```

또는 Supabase 대시보드의 **SQL Editor**에서 직접 SQL 실행:

```sql
-- 예시: 사용자 데이터 복사
INSERT INTO "user"."User" (id, email, name, ...)
SELECT id, email, name, ...
FROM old_database.public.users;
```

### Step 5: 연결 테스트

```bash
# Prisma Studio로 확인
pnpm prisma studio

# 또는 직접 연결 테스트
pnpm prisma db pull
```

## 🔍 Supabase 특별 설정

### 1. Row Level Security (RLS) 비활성화

Prisma로 직접 관리하므로 RLS는 비활성화:

```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE "user"."User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user"."Diary" DISABLE ROW LEVEL SECURITY;
-- ... 모든 테이블에 대해 반복
```

또는 Supabase 대시보드에서:
- **Authentication** > **Policies** > 각 테이블의 RLS 비활성화

### 2. Connection Pooling 설정

Supabase는 자동으로 Connection Pooling을 제공합니다:
- **Transaction mode**: Prisma는 Transaction 모드 사용
- **Session mode**: 필요시 사용 가능

### 3. 스키마 권한 설정

```sql
-- Supabase SQL Editor에서 실행
GRANT USAGE ON SCHEMA "user" TO postgres;
GRANT USAGE ON SCHEMA "admin" TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "user" TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "admin" TO postgres;
```

## 🚀 배포 환경 설정

### Vercel

Vercel 대시보드 > **Settings** > **Environment Variables**에 추가:

```bash
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Railway

Railway 대시보드 > **Variables** 탭에 동일하게 추가

## ✅ 마이그레이션 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 환경 변수 설정 완료
- [ ] 스키마 생성 (`user`, `admin`)
- [ ] Prisma 마이그레이션 실행 완료
- [ ] 기존 데이터 마이그레이션 (필요시)
- [ ] RLS 비활성화
- [ ] 연결 테스트 성공
- [ ] 배포 환경 변수 설정
- [ ] 프로덕션 배포 테스트

## 🔧 트러블슈팅

### 오류: "schema does not exist"

```sql
-- Supabase SQL Editor에서 실행
CREATE SCHEMA IF NOT EXISTS "user";
CREATE SCHEMA IF NOT EXISTS "admin";
```

### 오류: "permission denied for schema"

```sql
GRANT USAGE ON SCHEMA "user" TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "user" TO postgres;
```

### 오류: "connection timeout"

- Connection Pooling URL 사용 확인 (`?pgbouncer=true`)
- Direct URL은 마이그레이션 시에만 사용

### 오류: "too many connections"

- Supabase 무료 플랜: 최대 60 연결
- Connection Pooling 사용으로 해결 가능
- 필요시 Supabase Pro 플랜으로 업그레이드

## 📊 비용 비교

| 플랜 | 월 비용 | 데이터베이스 크기 | 연결 수 | 백업 |
|------|---------|------------------|---------|------|
| **Supabase Free** | $0 | 500MB | 60 | 1일 |
| **Supabase Pro** | $25 | 8GB | 200 | 7일 |
| **Railway** | $5-10 | 사용량 기반 | 무제한 | 수동 |

## 🎯 다음 단계

1. ✅ Supabase 마이그레이션 완료
2. 🔄 기존 Railway/NAS 연결 제거
3. 📊 Supabase 대시보드에서 모니터링 설정
4. 🔐 보안 설정 확인 (API 키 관리)
5. 📈 성능 모니터링

## 📚 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [Prisma + Supabase 가이드](https://supabase.com/docs/guides/integrations/prisma)
- [Connection Pooling 가이드](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

