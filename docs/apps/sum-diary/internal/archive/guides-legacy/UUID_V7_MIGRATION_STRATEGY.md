# UUID v7 마이그레이션 전략

> **작성일**: 2025-12-11  
> **상태**: 계획 단계 (배포 우선으로 현재는 v4 유지)  
> **목적**: UUID v4에서 v7로의 마이그레이션 전략 수립

---

## 📋 목차

1. [현재 상황](#현재-상황)
2. [UUID v4 vs v7 비교](#uuid-v4-vs-v7-비교)
3. [마이그레이션 목표](#마이그레이션-목표)
4. [마이그레이션 전략](#마이그레이션-전략)
5. [단계별 실행 계획](#단계별-실행-계획)
6. [리스크 및 대응 방안](#리스크-및-대응-방안)
7. [참고 자료](#참고-자료)

---

## 🔍 현재 상황

### 현재 사용 중인 UUID 버전

- **버전**: UUID v4 (랜덤 기반)
- **생성 방식**:
  - **Prisma 스키마**: `@default(uuid())` → PostgreSQL `uuid-ossp` 확장의 `uuid_generate_v4()`
  - **클라이언트 사이드**: 커스텀 `generateUUID()` 함수 (v4 형식)
  - **테스트 코드**: Node.js `crypto.randomUUID()` (v4)

### 사용 위치

- 모든 테이블의 `id` 필드
- 외래키 필드 (`user_id`, `diary_id`, `analysis_result_id` 등)
- 게스트 사용자 ID 생성

---

## 📊 UUID v4 vs v7 비교

| 특징 | UUID v4 | UUID v7 |
|------|---------|---------|
| **생성 방식** | 완전 랜덤 | 시간 기반 + 랜덤 |
| **정렬 가능** | ❌ (랜덤) | ✅ (시간순 정렬 가능) |
| **성능** | 빠름 | 빠름 |
| **표준** | RFC 4122 (2005) | 최신 표준 (2022) |
| **인덱스 효율** | 낮음 (랜덤) | 높음 (시간 기반) |
| **데이터베이스 성능** | B-tree 인덱스 비효율적 | B-tree 인덱스 효율적 |
| **생성 시간 추출** | 불가능 | 가능 (타임스탬프 포함) |

### UUID v7의 장점

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

4. **최신 표준**
   - 2022년 최신 UUID 표준
   - 향후 호환성 보장

### UUID v7의 단점

1. **마이그레이션 필요**
   - 기존 v4 UUID와 호환되지 않음
   - 데이터 마이그레이션 필요

2. **라이브러리 지원**
   - PostgreSQL 기본 확장에 없음
   - 커스텀 함수 또는 외부 라이브러리 필요

3. **보안 고려사항**
   - 시간 정보가 포함되어 추측 가능성 증가
   - 하지만 랜덤 부분으로 충분히 안전

---

## 🎯 마이그레이션 목표

### 주요 목표

1. **성능 최적화**
   - 인덱스 성능 향상
   - 쿼리 성능 개선

2. **기능 개선**
   - 시간순 정렬 기능
   - 생성 시간 추출 기능

3. **표준 준수**
   - 최신 UUID 표준 사용
   - 향후 호환성 보장

### 우선순위

- **낮음**: 현재 v4로도 충분히 작동 중
- **배포 우선**: 안정적인 배포가 우선이므로 현재는 v4 유지
- **향후 개선**: 성능 최적화가 필요할 때 마이그레이션 검토

---

## 🚀 마이그레이션 전략

### 전략 선택: 점진적 마이그레이션

**이유**:
- 기존 데이터와의 호환성 유지
- 서비스 중단 최소화
- 단계별 검증 가능

### 마이그레이션 방식

#### 옵션 1: 하이브리드 방식 (권장)

**개념**: 
- 기존 데이터는 v4 유지
- 새로운 데이터만 v7 생성
- 점진적으로 v7로 전환

**장점**:
- 서비스 중단 없음
- 기존 데이터 호환성 유지
- 단계별 검증 가능

**단점**:
- 일시적으로 두 버전 혼재
- 쿼리 시 버전 구분 필요

#### 옵션 2: 전체 마이그레이션

**개념**:
- 모든 기존 v4 UUID를 v7로 변환
- 한 번에 전환

**장점**:
- 일관된 UUID 버전
- 쿼리 단순화

**단점**:
- 서비스 중단 필요
- 외래키 관계 복잡
- 롤백 어려움

---

## 📝 단계별 실행 계획

### Phase 1: 준비 단계

#### 1.1 PostgreSQL UUID v7 함수 구현

```sql
-- UUID v7 생성 함수 (PostgreSQL)
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS UUID AS $$
DECLARE
    unix_ts_ms BIGINT;
    uuid_bytes BYTEA;
BEGIN
    -- Unix timestamp (milliseconds)
    unix_ts_ms := EXTRACT(EPOCH FROM NOW()) * 1000;
    
    -- UUID v7 형식 생성
    -- 구현 세부사항은 UUID v7 표준 참조
    -- ...
    
    RETURN uuid_bytes::UUID;
END;
$$ LANGUAGE plpgsql;
```

**또는**:
- `pg_uuidv7` 확장 사용 (커뮤니티 확장)
- Node.js에서 생성 후 DB에 저장

#### 1.2 Prisma 스키마 수정

```prisma
// 현재
id String @id @default(uuid()) @db.Uuid

// v7로 변경 (점진적)
id String @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
```

**주의사항**:
- Prisma는 커스텀 함수를 직접 지원하지 않음
- 마이그레이션 SQL에서 직접 함수 호출 필요

#### 1.3 클라이언트 사이드 UUID 생성 함수 수정

```typescript
// apps/my-app/app/lib/client-guest-id.ts
import { uuidv7 } from 'uuidv7'; // 또는 커스텀 구현

function generateUUID(): string {
  return uuidv7(); // v7 생성
}
```

#### 1.4 테스트 코드 수정

```typescript
// 테스트 코드
import { uuidv7 } from 'uuidv7';

const userId = uuidv7(); // v4 대신 v7 사용
```

### Phase 2: 점진적 마이그레이션 (하이브리드)

#### 2.1 새 테이블부터 v7 적용

**대상**:
- 새로 생성되는 테이블
- 기존 테이블의 새 레코드

**방법**:
- Prisma 마이그레이션으로 새 테이블은 v7 사용
- 기존 테이블은 v4 유지

#### 2.2 선택적 테이블 마이그레이션

**우선순위 높은 테이블**:
- `DiaryEntry` (생성 시간 기준 정렬 빈번)
- `AnalysisResult` (최신 분석 결과 조회)
- `Notification` (최신 알림 조회)

**마이그레이션 SQL 예시**:
```sql
-- 기존 v4 UUID를 v7로 변환 (주의: 실제 변환은 불가능)
-- 대신 새 레코드만 v7 생성
ALTER TABLE "user"."DiaryEntry" 
  ALTER COLUMN id SET DEFAULT uuid_generate_v7();
```

### Phase 3: 검증 및 모니터링

#### 3.1 성능 모니터링

- 인덱스 성능 측정
- 쿼리 성능 비교
- 페이지 분할 감소 확인

#### 3.2 호환성 검증

- 기존 API 동작 확인
- 외래키 관계 검증
- 클라이언트 호환성 확인

### Phase 4: 전체 전환 (선택적)

#### 4.1 전체 테이블 v7 전환

- 모든 테이블의 기본값을 v7로 변경
- 기존 v4 UUID는 그대로 유지 (호환성)

#### 4.2 레거시 코드 정리

- v4 생성 함수 제거
- 문서 업데이트

---

## ⚠️ 리스크 및 대응 방안

### 리스크 1: 기존 데이터 호환성

**문제**: 
- 기존 v4 UUID와 새 v7 UUID 혼재
- 외래키 관계 복잡

**대응**:
- UUID 타입은 동일하므로 외래키 관계 유지 가능
- 쿼리 시 버전 구분 불필요 (형식만 다름)

### 리스크 2: PostgreSQL 확장 지원

**문제**:
- PostgreSQL 기본 확장에 v7 없음
- 커뮤니티 확장 또는 커스텀 함수 필요

**대응**:
- `pg_uuidv7` 확장 사용
- 또는 Node.js에서 생성 후 저장

### 리스크 3: 성능 개선 미미

**문제**:
- 실제 성능 개선이 예상보다 작을 수 있음

**대응**:
- Phase 3에서 성능 측정 후 결정
- 개선이 미미하면 롤백 가능

### 리스크 4: 마이그레이션 복잡도

**문제**:
- 점진적 마이그레이션으로 인한 복잡도 증가

**대응**:
- 철저한 테스트
- 단계별 검증
- 롤백 계획 수립

---

## 📚 참고 자료

### UUID v7 표준

- [UUID v7 Draft Specification](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis)
- [UUID v7 구현 가이드](https://github.com/uuidjs/uuid#uuidv7options-buffer-offset)

### PostgreSQL UUID v7

- [pg_uuidv7 확장](https://github.com/fboulnois/pg_uuidv7)
- [PostgreSQL UUID 함수](https://www.postgresql.org/docs/current/uuid-ossp.html)

### Prisma 마이그레이션

- [Prisma Custom Functions](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Raw SQL](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)

---

## ✅ 체크리스트

### 준비 단계
- [ ] UUID v7 생성 함수 구현 (PostgreSQL 또는 Node.js)
- [ ] Prisma 스키마 수정 계획 수립
- [ ] 클라이언트 사이드 UUID 생성 함수 수정
- [ ] 테스트 코드 수정

### 마이그레이션 단계
- [ ] 새 테이블 v7 적용
- [ ] 선택적 테이블 마이그레이션
- [ ] 성능 모니터링 설정
- [ ] 호환성 검증

### 검증 단계
- [ ] 성능 개선 확인
- [ ] 호환성 검증 완료
- [ ] 문서 업데이트

### 전환 단계 (선택적)
- [ ] 전체 테이블 v7 전환
- [ ] 레거시 코드 정리
- [ ] 최종 검증

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-11  
**상태**: 계획 단계 (배포 우선으로 현재는 v4 유지)

