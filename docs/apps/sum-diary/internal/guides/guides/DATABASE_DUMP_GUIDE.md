# Supabase 데이터베이스 덤프 가이드

> 작성일: 2025-12-16  
> Supabase 데이터베이스 스키마 및 정책 덤프 방법

## 개요

Supabase 데이터베이스의 실제 스키마, RLS 정책, 인덱스, 제약조건을 확인하기 위한 덤프 스크립트입니다.

## 사전 준비

### 1. PostgreSQL 클라이언트 설치

**Windows:**
- [PostgreSQL 공식 설치 프로그램](https://www.postgresql.org/download/windows/) 다운로드
- 또는 [Chocolatey](https://chocolatey.org/) 사용: `choco install postgresql`

**macOS:**
```bash
brew install postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql-client  # Ubuntu/Debian
sudo yum install postgresql             # CentOS/RHEL
```

### 2. 환경 변수 확인

`.env` 또는 Doppler에 다음 환경 변수가 설정되어 있어야 합니다:

```bash
# DIRECT_URL 권장 (직접 연결, 5432 포트)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# 또는 DATABASE_URL (pgbouncer 제거됨)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**중요:** `DIRECT_URL`을 사용하거나 `DATABASE_URL`에서 `pgbouncer=true`를 제거해야 합니다. (덤프는 직접 연결 필요)

## 사용 방법

### 방법 1: npm 스크립트 (가장 간단) ⭐

```bash
# Doppler 사용 (프로덕션 환경)
pnpm db:dump

# 로컬 환경 변수 사용 (.env 파일)
pnpm db:dump:local
```

**출력 위치:** `docs/database-dumps/`

이 방법이 가장 간단하고 권장됩니다!

### 방법 2: PowerShell 스크립트 (Windows)

```powershell
# 환경 변수 설정
$env:DIRECT_URL = "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# 스크립트 실행
.\scripts\dump-supabase-powershell.ps1
```

### 방법 3: Bash 스크립트 (Linux/macOS)

```bash
# 환경 변수 설정
export DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# 스크립트 실행 권한 부여
chmod +x scripts/dump-supabase-simple.sh

# 실행
./scripts/dump-supabase-simple.sh
```

### 방법 4: 수동 pg_dump (고급)

```bash
# 환경 변수 설정
export PGPASSWORD="your-password"

# 전체 스키마 덤프
pg_dump \
  --host=aws-0-[REGION].pooler.supabase.com \
  --port=5432 \
  --username=postgres.[PROJECT-REF] \
  --dbname=postgres \
  --schema-only \
  --no-owner \
  --no-privileges \
  --file=docs/database-dumps/schema-$(date +%Y%m%d-%H%M%S).sql

# RLS 정책만 확인
psql \
  --host=aws-0-[REGION].pooler.supabase.com \
  --port=5432 \
  --username=postgres.[PROJECT-REF] \
  --dbname=postgres \
  --no-password \
  -c "SELECT * FROM pg_policies WHERE schemaname IN ('user', 'admin', 'public');"
```

## 출력 파일

스크립트 실행 후 `docs/database-dumps/` 폴더에 다음 파일들이 생성됩니다:

### 1. `schema-YYYYMMDD-HHMMSS.sql`
- 전체 데이터베이스 스키마 (DDL)
- 테이블, 인덱스, 제약조건, 함수 등
- 데이터는 제외 (스키마만)

### 2. `rls-policies-YYYYMMDD-HHMMSS.md`
- Row Level Security (RLS) 정책 목록
- 각 정책의 조건, 역할, 명령어 등
- 마크다운 형식

### 3. `indexes-YYYYMMDD-HHMMSS.md`
- 모든 인덱스 정보
- 스키마별, 테이블별 정리
- 인덱스 정의 포함

### 4. `constraints-YYYYMMDD-HHMMSS.md`
- 제약조건 정보 (PK, FK, UNIQUE, CHECK 등)
- 외래 키 관계 포함
- 마크다운 형식

### 5. `tables-YYYYMMDD-HHMMSS.txt`
- 테이블 목록 요약
- 스키마별 정리

## RLS 정책 확인

### Supabase Dashboard에서 확인

1. Supabase 대시보드 접속
2. **Authentication** > **Policies** 메뉴
3. 각 테이블별 RLS 정책 확인

### SQL로 확인

```sql
-- 모든 RLS 정책 조회
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname IN ('user', 'admin', 'public')
ORDER BY schemaname, tablename, policyname;

-- 특정 테이블의 RLS 정책
SELECT * FROM pg_policies
WHERE schemaname = 'user' AND tablename = 'User';

-- RLS 활성화 여부 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname IN ('user', 'admin', 'public')
ORDER BY schemaname, tablename;
```

## 인덱스 확인

```sql
-- 모든 인덱스 조회
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname IN ('user', 'admin', 'public')
ORDER BY schemaname, tablename, indexname;

-- 인덱스 사용 통계
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname IN ('user', 'admin', 'public')
ORDER BY idx_scan DESC;
```

## 제약조건 확인

```sql
-- 모든 제약조건 조회
SELECT 
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema IN ('user', 'admin', 'public')
ORDER BY tc.table_schema, tc.table_name, tc.constraint_type;
```

## 트러블슈팅

### 오류: "pg_dump: command not found"

**해결:**
- PostgreSQL 클라이언트가 설치되어 있는지 확인
- PATH에 `pg_dump`가 포함되어 있는지 확인
- Windows: PostgreSQL 설치 시 "Command Line Tools" 옵션 선택

### 오류: "connection timeout"

**해결:**
- `DIRECT_URL` 사용 확인 (5432 포트)
- `DATABASE_URL`에서 `pgbouncer=true` 제거
- 방화벽/네트워크 설정 확인

### 오류: "password authentication failed"

**해결:**
- Supabase 대시보드에서 비밀번호 확인
- URL 인코딩 확인 (특수문자 포함 시)
- `PGPASSWORD` 환경 변수 사용

### 오류: "schema does not exist"

**해결:**
- Supabase에서 `user`, `admin` 스키마가 생성되어 있는지 확인
- SQL Editor에서 확인:
  ```sql
  SELECT schema_name FROM information_schema.schemata
  WHERE schema_name IN ('user', 'admin', 'public');
  ```

## 주의사항

1. **보안**: 덤프 파일에는 데이터베이스 비밀번호가 포함되지 않지만, 스키마 구조가 노출됩니다.
2. **Git**: 덤프 파일은 `.gitignore`에 추가 권장 (민감 정보 포함 가능)
3. **RLS**: Prisma로 직접 관리하는 경우 RLS가 비활성화되어 있을 수 있습니다.
4. **Connection Pooling**: 덤프는 직접 연결(DIRECT_URL)을 사용해야 합니다.

## 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [PostgreSQL pg_dump 문서](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Row Level Security 가이드](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
