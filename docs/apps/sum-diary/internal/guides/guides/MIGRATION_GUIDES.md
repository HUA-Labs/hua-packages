# 마이그레이션 가이드

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16

## 개요

이 문서는 숨다이어리 서비스의 주요 마이그레이션 작업에 대한 통합 가이드입니다.

---

## 1. Supabase 마이그레이션

### 1.1 개요

Railway/NAS PostgreSQL에서 Supabase PostgreSQL로 데이터베이스를 마이그레이션하는 가이드입니다.

### 1.2 사전 준비

**Supabase 프로젝트 생성:**
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `my-app`
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: 가장 가까운 리전 선택 (예: `Northeast Asia (Seoul)`)

### 1.3 연결 정보 확인

Supabase 대시보드 > **Settings** > **Database**에서:
- **Connection string**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
- **Connection pooling**: 포트 6543 사용
- **Direct connection**: 포트 5432 사용

### 1.4 환경 변수 설정

`.env.local` 파일에 Supabase 연결 정보 추가:

```env
# Supabase Database (Connection Pooling 사용 - Prisma 권장)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**중요:**
- `DATABASE_URL`에는 `?pgbouncer=true` 추가 (Connection Pooling 사용)
- `DIRECT_URL`은 마이그레이션 및 Prisma Studio용 (직접 연결)

### 1.5 스키마 설정

현재 스키마는 `user`와 `admin` 두 개의 스키마를 사용합니다. Supabase에서 스키마 생성:

```sql
-- Supabase SQL Editor에서 실행
CREATE SCHEMA IF NOT EXISTS "user";
CREATE SCHEMA IF NOT EXISTS "admin";
```

### 1.6 데이터베이스 마이그레이션

```bash
# 1. Prisma 클라이언트 재생성
cd apps/my-app
pnpm prisma generate

# 2. 마이그레이션 실행
pnpm prisma migrate deploy

# 또는 개발 환경에서
pnpm prisma migrate dev --name init_supabase
```

### 1.7 기존 데이터 마이그레이션 (선택사항)

기존 데이터가 있다면 pg_dump로 백업 후 복원:

```bash
# 1. 기존 DB 백업
pg_dump -h old-host -U user -d database > backup.sql

# 2. Supabase로 복원
psql -h aws-0-[REGION].pooler.supabase.com -U postgres -d postgres < backup.sql
```

자세한 내용은 [Supabase 마이그레이션 가이드](./SUPABASE_MIGRATION.md) 참조

---

## 2. UUID v7 마이그레이션

### 2.1 개요

UUID v4에서 v7로의 마이그레이션 전략입니다. 현재는 배포 우선으로 v4를 유지하고 있습니다.

### 2.2 UUID v4 vs v7 비교

| 특징 | UUID v4 | UUID v7 |
|------|---------|---------|
| **생성 방식** | 완전 랜덤 | 시간 기반 + 랜덤 |
| **정렬 가능** | ❌ (랜덤) | ✅ (시간순 정렬 가능) |
| **인덱스 효율** | 낮음 (랜덤) | 높음 (시간 기반) |
| **생성 시간 추출** | 불가능 | 가능 (타임스탬프 포함) |

### 2.3 UUID v7의 장점

1. **시간순 정렬 가능**
   - 생성 시간 기준으로 정렬 가능
   - `ORDER BY id`만으로 최신순 정렬 가능
   - 별도 `created_at` 인덱스 불필요 (일부 케이스)

2. **인덱스 성능 향상**
   - 시간 기반이므로 B-tree 인덱스 효율적
   - 시퀀셜 스캔 성능 향상
   - 페이지 분할(fragmentation) 감소

3. **생성 시간 추출**
   - UUID에서 직접 생성 시간 추출 가능
   - 디버깅 및 분석 용이

### 2.4 마이그레이션 전략

**옵션 A: 점진적 마이그레이션 (권장)**
- 기존 v4 UUID 유지
- 새로운 레코드만 v7 사용
- 하이브리드 시스템 운영

**옵션 B: 전체 마이그레이션**
- 모든 기존 데이터를 v7로 변환
- 외래키 관계 재구성
- 높은 리스크

### 2.5 구현 계획

1. PostgreSQL UUID v7 생성 함수 구현
2. Prisma 스키마 업데이트
3. 클라이언트 사이드 UUID 생성 함수 업데이트
4. 테스트 코드 업데이트
5. 점진적 마이그레이션 실행

자세한 내용은 [UUID v7 마이그레이션 전략](./UUID_V7_MIGRATION_STRATEGY.md) 참조

---

## 3. 데이터베이스 스키마 개선

### 3.1 스키마 개선 결정사항

주요 개선 사항:
- 인덱스 최적화
- 테이블 구조 개선
- 쿼리 성능 향상

자세한 내용은:
- [스키마 개선 결정](./SCHEMA_IMPROVEMENT_DECISIONS.md)
- [스키마 쿼리 최적화](./SCHEMA_QUERY_OPTIMIZATION.md)
- [테이블 통합 분석](./TABLE_CONSOLIDATION_ANALYSIS.md)

---

## 4. 마이그레이션 체크리스트

### 사전 준비
- [ ] 백업 완료
- [ ] 마이그레이션 계획 수립
- [ ] 롤백 계획 수립
- [ ] 테스트 환경에서 검증

### 마이그레이션 실행
- [ ] 환경 변수 업데이트
- [ ] 데이터베이스 스키마 적용
- [ ] 데이터 마이그레이션 (필요 시)
- [ ] 애플리케이션 코드 업데이트

### 검증
- [ ] 데이터 무결성 확인
- [ ] 기능 테스트
- [ ] 성능 테스트
- [ ] 모니터링 설정

---

## 참고 문서

- [Supabase 마이그레이션 가이드](./SUPABASE_MIGRATION.md)
- [UUID v7 마이그레이션 전략](./UUID_V7_MIGRATION_STRATEGY.md)
- [스키마 개선 결정](./SCHEMA_IMPROVEMENT_DECISIONS.md)
- [스키마 쿼리 최적화](./SCHEMA_QUERY_OPTIMIZATION.md)
- [테이블 통합 분석](./TABLE_CONSOLIDATION_ANALYSIS.md)
- [베타 필수 테이블](./BETA_REQUIRED_TABLES.md)

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
