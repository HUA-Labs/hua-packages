# 📊 테이블 통합 분석 및 베스트 프랙티스

> 현재 스키마의 테이블 통합 가능성 분석 및 권장사항
> 
> 작성일: 2025-11-30  
> 최종 업데이트: 2025-11-30 (프로덕션 기준 보강)
> 
> 목적: 테이블 구조 최적화 및 유지보수성 향상
> 
> **핵심 결론: 통합할 테이블 0개 - 현재 구조 완벽** ✅

---

## 📋 목차

1. [현재 테이블 구조 분석](#현재-테이블-구조-분석)
2. [통합 가능성 평가](#통합-가능성-평가)
3. [베스트 프랙티스 권장사항](#베스트-프랙티스-권장사항)
4. [구체적인 통합 제안](#구체적인-통합-제안)
5. [결론 및 권장사항](#결론-및-권장사항)

---

## 현재 테이블 구조 분석

### 1. 사용자 관련 테이블 (user 스키마)

#### UserQuota
- **관계**: User와 1:1 (unique constraint)
- **용도**: 사용자별 할당량 관리
- **쿼리 패턴**: 
  - 사용자별 조회 (매우 빈번)
  - 일일/월간 리셋 작업 (배치)
- **데이터 볼륨**: 사용자 수와 동일 (낮음)
- **업데이트 빈도**: 높음 (매 요청마다 카운터 증가)

#### DataExportRequest
- **관계**: User와 1:N
- **용도**: GDPR 데이터 다운로드 요청
- **쿼리 패턴**:
  - 사용자별 조회 (드물게)
  - 만료된 요청 정리 (배치)
- **데이터 볼륨**: 낮음 (사용자당 1-2개)
- **업데이트 빈도**: 낮음 (생성 후 상태 변경만)

#### AccountDeletionRequest
- **관계**: User와 1:N (실제로는 1:1에 가까움)
- **용도**: 계정 삭제 요청
- **쿼리 패턴**:
  - 사용자별 조회 (드물게)
  - 스케줄링된 삭제 작업 (배치)
- **데이터 볼륨**: 매우 낮음 (사용자당 0-1개)
- **업데이트 빈도**: 매우 낮음

#### UserConsent
- **관계**: User와 1:N (약관 버전별)
- **용도**: 동의 관리
- **쿼리 패턴**:
  - 사용자별 + 약관 타입별 조회 (빈번)
  - 약관 버전별 통계 (드물게)
- **데이터 볼륨**: 중간 (사용자당 약관 수 × 버전 수)
- **업데이트 빈도**: 중간 (약관 변경 시)

---

### 2. 관리자 관련 테이블 (admin 스키마)

#### BillingRecord
- **관계**: User와 1:N (월별 집계)
- **용도**: 월별 비용 집계
- **쿼리 패턴**:
  - 사용자별 + 기간별 조회 (빈번)
  - 기간별 통계 (드물게)
- **데이터 볼륨**: 중간 (사용자 수 × 월 수)
- **업데이트 빈도**: 낮음 (월별 배치 집계)

#### BackupRecord
- **관계**: User와 무관 (시스템 레벨)
- **용도**: 백업 이력 관리
- **쿼리 패턴**:
  - 백업 타입별 조회 (드물게)
  - 만료된 백업 정리 (배치)
- **데이터 볼륨**: 낮음 (일일 백업 × 보관 기간)
- **업데이트 빈도**: 낮음 (백업 완료 시)

#### AuditLog
- **관계**: User와 간접적 (actor_id로 참조)
- **용도**: 모든 민감 작업 감사 추적
- **쿼리 패턴**:
  - 행위자별 조회 (빈번)
  - 리소스별 조회 (빈번)
  - 시계열 조회 (빈번)
- **데이터 볼륨**: **매우 높음** (모든 작업 로그)
- **업데이트 빈도**: **매우 높음** (매 작업마다)

#### PersonalDataProcessingLog
- **관계**: User와 1:N
- **용도**: GDPR Article 30 요구사항 (개인정보 처리 내역)
- **쿼리 패턴**:
  - 사용자별 조회 (빈번)
  - 처리 타입별 조회 (드물게)
- **데이터 볼륨**: **높음** (모든 개인정보 접근 로그)
- **업데이트 빈도**: **높음** (매 접근마다)

---

## 통합 가능성 평가

### ✅ 통합 가능한 그룹

#### 그룹 1: 사용자 요청 테이블 (통합 권장)

**대상:**
- `DataExportRequest`
- `AccountDeletionRequest`

**통합 제안:**
```prisma
model UserRequest {
  @@schema("user")
  id           String   @id @default(uuid()) @db.Uuid
  user_id      String   @db.Uuid
  request_type String   // DATA_EXPORT, ACCOUNT_DELETION
  status       String   // PENDING, PROCESSING, COMPLETED, FAILED, REJECTED
  
  // DataExport 전용 필드
  file_url     String?
  expires_at   DateTime?
  
  // AccountDeletion 전용 필드
  reason       String?
  scheduled_at DateTime?
  deleted_at   DateTime?
  
  created_at   DateTime @default(now()) @db.Timestamptz(6)
  completed_at DateTime? @db.Timestamptz(6)
  
  user User @relation(...)
  
  @@index([user_id, request_type])
  @@index([status, request_type])
  @@unique([user_id, request_type]) // 타입별로 1개만 활성화
}
```

**장점:**
- ✅ 두 테이블이 거의 동일한 구조
- ✅ 쿼리 패턴 유사 (사용자별 조회)
- ✅ 데이터 볼륨 낮음
- ✅ 코드 중복 제거

**단점:**
- ⚠️ 필드가 NULL로 많이 채워짐 (정규화 위반)
- ⚠️ 타입별 제약조건 복잡

**결론:** ⚠️ **통합 가능하나 권장하지 않음** (타입 안정성, 명확성 저하)

---

#### 그룹 2: 로그 테이블 (통합 절대 금지)

**대상:**
- `AuditLog`
- `PersonalDataProcessingLog`

**통합 제안:**
```prisma
model SystemLog {
  @@schema("admin")
  id          String   @id @default(uuid()) @db.Uuid
  log_type    String   // AUDIT, PERSONAL_DATA_PROCESSING
  // ... 공통 필드
  // ... 타입별 필드
}
```

**장점:**
- ✅ 공통 필드 많음 (user_id, created_at, ip_address 등)

**단점:**
- ❌ **데이터 볼륨 차이 극심** (AuditLog는 매우 높음, PersonalDataProcessingLog는 높음)
- ❌ **파티셔닝 전략 다름** (AuditLog는 분기별, PersonalDataProcessingLog는 월별)
- ❌ **인덱스 전략 다름**
- ❌ **보관 기간 다름** (AuditLog: 1-7년, PersonalDataProcessingLog: 법적 요구에 따라)
- ❌ **쿼리 패턴 다름** (AuditLog는 행위자 중심, PersonalDataProcessingLog는 사용자 중심)
- ❌ **법적/컴플라이언스 위험**: GDPR Article 30 로그(PersonalDataProcessingLog)는 AuditLog와 묶이면 법적 문제 발생 가능
- ❌ **로그 종류별 보관기간 다름**: 통합 시 보관 정책 충돌
- ❌ **운영자 도구 복잡화**: 로그 타입별로 다른 도구/대시보드 필요
- ❌ **I/O 혼합으로 성능 저하**: 서로 다른 쿼리 패턴이 같은 테이블에서 경합

**프로덕션 시나리오:**
```
시나리오: 로그량 폭증
- AuditLog: 초당 1000건 (모든 작업 로그)
- PersonalDataProcessingLog: 초당 500건 (개인정보 접근만)
→ 통합 시 초당 1500건 write
→ 파티셔닝 전략 충돌 (분기별 vs 월별)
→ 인덱스 경합
→ 쿼리 성능 저하
```

**결론:** ❌ **절대 금지** (법적 위험 + 성능 저하 + 확장성 저하)

---

### ❌ 통합 불가능한 테이블

#### UserQuota
- **이유**: 1:1 관계, 매우 빈번한 업데이트, 다른 테이블과 목적 완전히 다름
- **권장**: **별도 테이블 유지**

#### BillingRecord
- **이유**: 월별 집계 데이터, unique constraint (user_id, period), 다른 테이블과 목적 다름
- **권장**: **별도 테이블 유지**

#### BackupRecord
- **이유**: User와 무관, 시스템 레벨, 다른 테이블과 목적 완전히 다름
- **권장**: **별도 테이블 유지**

---

## 베스트 프랙티스 권장사항

### 1. 단일 책임 원칙 (Single Responsibility Principle)

**원칙:**
- 각 테이블은 하나의 명확한 목적을 가져야 함
- 테이블 이름만 봐도 용도를 알 수 있어야 함

**현재 구조 평가:**
- ✅ **대부분 준수**: 각 테이블이 명확한 목적
- ⚠️ **예외**: DataExportRequest와 AccountDeletionRequest는 통합 가능하나 권장하지 않음

---

### 2. 쿼리 패턴 기반 설계

**원칙:**
- 자주 함께 조회되는 데이터는 같은 테이블에
- 자주 함께 업데이트되는 데이터는 같은 테이블에
- 쿼리 패턴이 다르면 별도 테이블

**현재 구조 평가:**
- ✅ **UserQuota**: 사용자 조회 시 항상 함께 필요 → User에 포함 고려 가능
- ✅ **BillingRecord**: 사용자와 별도 조회 → 별도 테이블 유지
- ✅ **로그 테이블들**: 쿼리 패턴 다름 → 별도 테이블 유지

---

### 3. 데이터 볼륨 및 성능 고려

**원칙:**
- 데이터 볼륨이 크게 다르면 별도 테이블
- 파티셔닝 전략이 다르면 별도 테이블
- 인덱스 전략이 다르면 별도 테이블
- **Write Hotspot 위험**: 빈번한 업데이트가 있는 테이블은 분리

**현재 구조 평가:**
- ✅ **AuditLog**: 매우 높은 볼륨 → 별도 테이블 + 파티셔닝 필수
- ✅ **PersonalDataProcessingLog**: 높은 볼륨 → 별도 테이블 + 파티셔닝 고려
- ✅ **UserQuota**: 낮은 볼륨이지만 **Write Hotspot 위험** → 별도 테이블 유지 권장
  - User는 이미 로그인/업데이트/세션 등으로 빈번한 write 발생
  - Quota가 초당 증가하면 User 테이블이 병목될 수 있음

---

### 4. 확장성 고려

**원칙:**
- 미래에 필드가 추가될 가능성이 높으면 별도 테이블
- 타입별로 다른 필드가 필요하면 별도 테이블
- **구독 모델/유료화 확장**: 프리미엄/엔터프라이즈 기능 추가 시 독립적 확장 가능해야 함

**현재 구조 평가:**
- ✅ **DataExportRequest vs AccountDeletionRequest**: 필드가 다르고 확장 가능성 → 별도 테이블 유지
- ✅ **로그 테이블들**: 각각 다른 필드 필요 → 별도 테이블 유지
- ✅ **UserQuota**: 유료화/엔터프라이즈 확장 시 독립적 확장 필요 → 별도 테이블 유지

---

### 5. 법적/컴플라이언스 요구사항

**원칙:**
- 법적 요구사항이 다른 로그는 절대 통합 금지
- 보관 기간이 다른 데이터는 별도 테이블
- 규제 대응을 위해 명확한 분리 필요

**현재 구조 평가:**
- ✅ **PersonalDataProcessingLog**: GDPR Article 30 요구사항 → AuditLog와 절대 통합 금지
- ✅ **AuditLog**: 일반 감사 추적 (1-7년 보관) → PersonalDataProcessingLog와 보관 기간 다름
- ✅ **각 로그 테이블**: 법적 요구사항에 따라 독립적 보관 정책 필요

---

### 6. 동시성 및 Write Hotspot 고려

**원칙:**
- 빈번한 업데이트가 있는 테이블은 분리
- Write Hotspot 위험 회피
- 트랜잭션 락 경합 최소화

**현재 구조 평가:**
- ✅ **UserQuota**: 초당 카운터 증가 → User와 분리하여 Write Hotspot 방지
- ✅ **User**: 로그인/프로필 업데이트/세션 갱신 등 빈번한 write → Quota와 분리 필요
- ✅ **각 테이블**: 독립적 업데이트로 락 경합 최소화

**프로덕션 시나리오:**
```
시나리오: 사용자가 일기 작성 중
1. User 테이블 업데이트 (프로필, 세션 등)
2. Quota 카운터 증가 (동시 발생)
→ User row 락 경합 발생 가능
→ 트랜잭션 지연 증가
→ 통합 시 병목 발생
```

---

## 구체적인 통합 제안

### 옵션 A: 현재 구조 유지 (권장) ✅

**장점:**
- ✅ 명확한 책임 분리
- ✅ 타입 안정성 (TypeScript)
- ✅ 쿼리 최적화 용이
- ✅ 인덱스 전략 최적화
- ✅ 파티셔닝 전략 최적화
- ✅ 유지보수 용이

**단점:**
- ❌ 테이블 수가 많음 (하지만 문제 없음)
- ❌ JOIN이 필요한 경우 (하지만 드뭄)

**결론:** ✅ **현재 구조 유지 권장**

---

### 옵션 B: UserQuota를 User에 통합 (비권장)

**제안:**
```prisma
model User {
  // 기존 필드들...
  
  // Quota 필드 추가
  daily_diary_limit   Int @default(10)
  monthly_diary_limit Int @default(300)
  daily_analysis_limit   Int @default(10)
  monthly_analysis_limit Int @default(300)
  
  daily_diary_count   Int @default(0)
  monthly_diary_count Int @default(0)
  daily_analysis_count   Int @default(0)
  monthly_analysis_count Int @default(0)
  
  daily_reset_at   DateTime @db.Timestamptz(6)
  monthly_reset_at DateTime @db.Timestamptz(6)
  
  is_premium Boolean @default(false)
}
```

**장점:**
- ✅ JOIN 불필요 (항상 함께 조회)
- ✅ 쿼리 성능 향상 (단, 캐싱으로 해결 가능)
- ✅ 테이블 수 감소

**단점:**
- ❌ **Write Hotspot 위험**: User는 이미 로그인/업데이트/세션 등으로 빈번한 write 발생. Quota가 초당 증가하면 User 테이블이 병목될 수 있음
- ❌ **동시성 문제**: User row에 락이 많이 잡힘 (로그인, 프로필 업데이트, 세션 갱신 등과 충돌)
- ❌ **캐싱 전략 복잡화**: User 캐시가 오염됨 (Quota만 업데이트해도 User 전체 캐시 무효화)
- ❌ **확장성 제한**: Quota 시스템이 나중에 크게 확장되어도 User와 결합됨
- ❌ **롤백 어려움**: 통합 후 분리하려면 마이그레이션 복잡
- ❌ **구독 모델 확장**: 프리미엄/엔터프라이즈 기능 추가 시 User 테이블이 더 복잡해짐

**프로덕션 시나리오:**
```
시나리오: 사용자가 일기 작성 중
1. User 테이블 업데이트 (프로필, 세션 등)
2. Quota 카운터 증가 (동시 발생)
→ User row 락 경합 발생 가능
→ 트랜잭션 지연 증가
```

**결론:** ❌ **비권장** (현재 구조 유지 권장)
- 미래 확장성 (유료화/엔터프라이즈) 고려 시 분리 유지가 안전
- Write Hotspot 위험 회피
- 동시성 문제 방지
- 캐싱 전략 최적화 가능

---

### 옵션 C: 요청 테이블 통합 (비권장)

**제안:**
```prisma
model UserRequest {
  request_type String // DATA_EXPORT, ACCOUNT_DELETION
  // ... 공통 필드
  // ... 타입별 필드 (NULL 가능)
}
```

**장점:**
- ✅ 테이블 수 감소

**단점:**
- ❌ 타입 안정성 저하
- ❌ 필드 NULL 많음 (정규화 위반)
- ❌ 제약조건 복잡
- ❌ 코드 복잡도 증가

**결론:** ❌ **비권장** (명확성, 유지보수성 저하)

---

## 결론 및 권장사항

### 🎉 최종 결론: 통합할 테이블 0개 ✅

**현재 스키마 구조는 "멘탈헬스 SaaS + AI 분석 + GDPR + 비용제어"라는 제품 목적에 완벽히 부합합니다.**

**이유:**
1. **명확성**: 각 테이블의 목적이 명확
2. **성능**: 쿼리 패턴에 최적화된 인덱스, Write Hotspot 방지
3. **확장성**: 각 테이블이 독립적으로 확장 가능 (유료화/엔터프라이즈 대비)
4. **유지보수성**: 코드가 단순하고 이해하기 쉬움
5. **타입 안정성**: TypeScript에서 타입 추론 정확
6. **법적 컴플라이언스**: GDPR 요구사항 충족, 로그 보관 정책 독립적 운영
7. **동시성**: 트랜잭션 락 경합 최소화
8. **캐싱 전략**: 각 테이블별 최적화된 캐싱 가능

**통합 시 발생하는 문제:**
- ❌ 타입 안정성 깨짐
- ❌ NULL 필드 폭발 (정규화 위반)
- ❌ 규제 대응 위험 (GDPR 등)
- ❌ future-proof 손상 (확장성 제한)
- ❌ 테이블 크기 및 I/O 혼합으로 성능 저하
- ❌ 파티셔닝 불가 (전략 충돌)
- ❌ 보관 전략 충돌
- ❌ 운영자 도구 복잡화
- ❌ 트랜잭션 락 증가
- ❌ 캐싱 전략 꼬임

**테이블 수가 많다고 해서 문제가 되지 않습니다:**
- PostgreSQL은 수백 개의 테이블도 문제없이 처리
- 각 테이블이 명확한 목적을 가지는 것이 더 중요
- JOIN 비용보다 명확성과 유지보수성이 더 가치 있음

---

### 선택적 최적화 (비권장)

#### 1. UserQuota를 User에 통합

**조건:**
- Quota 조회가 항상 User와 함께 이루어질 때
- JOIN 비용이 성능 병목일 때

**하지만:**
- ❌ Write Hotspot 위험 (User 테이블 병목)
- ❌ 동시성 문제 (트랜잭션 락 경합)
- ❌ 캐싱 전략 복잡화
- ❌ 확장성 제한 (유료화/엔터프라이즈)
- ✅ JOIN 비용은 캐싱으로 해결 가능

**현재 상태:** ✅ **별도 테이블 유지 권장** (명확성 + 성능 + 확장성)

---

#### 2. 로그 테이블 파티셔닝

**필수:**
- `AuditLog`: 분기별 파티셔닝 (1년 후 아카이브)
- `PersonalDataProcessingLog`: 월별 파티셔닝 (법적 요구에 따라)

**현재 상태:** ✅ 별도 테이블 유지 (파티셔닝 전략 다름)

---

### 베스트 프랙티스 체크리스트

- [x] 각 테이블이 명확한 단일 목적을 가짐
- [x] 쿼리 패턴에 최적화된 인덱스
- [x] 데이터 볼륨을 고려한 설계
- [x] 확장 가능한 구조 (유료화/엔터프라이즈 대비)
- [x] 타입 안정성 보장
- [x] 유지보수 용이
- [x] Write Hotspot 위험 회피
- [x] 동시성 문제 방지
- [x] 법적/컴플라이언스 요구사항 충족
- [x] 파티셔닝 전략 최적화
- [x] 캐싱 전략 최적화

**현재 구조는 베스트 프랙티스를 완벽히 따르고 있습니다!** ✅

---

## 다음 단계 의사결정

### 현재 상황

✅ **스키마 구조는 완벽합니다**
- 통합할 테이블: **0개**
- 추가 최적화: **불필요**

### 다음 질문

👉 **"다음 단계가 스키마 리팩터링인가, 아니면 베타 구현 범위 축소인가?"**

**옵션 A: 스키마 리팩터링 (비권장)**
- 현재 구조가 이미 최적
- 리팩터링으로 얻을 이점 없음
- 시간 낭비

**옵션 B: 베타 구현 범위 확정 (권장)**
- 스키마는 완벽하므로 구현에 집중
- 필수 기능 우선순위 결정
- 점진적 롤아웃 계획

---

## 참고 자료

- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/ddl-best-practices.html)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
