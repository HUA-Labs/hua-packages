# 🚀 프로덕션 준비 체크리스트

> 베타 이후 정식 런칭을 위한 필수 개선 사항 및 의사결정 문서
> 
> 작성일: 2025-11-30
> 목적: 프로덕션 환경에서 필요한 기능, 보안, 컴플라이언스 요구사항 정리

---

## ⚠️ 베타 vs 프로덕션 구분

### 베타에서도 필요한 항목 (즉시 구현)

**법적 요구사항:**
- ✅ **UserQuota**: 비용 폭탄 방지 (악의적 사용자 대비) - **베타 필수**
- ✅ **비용 추적**: AI 비용 모니터링 - **베타 필수**
- ✅ **BackupRecord**: 데이터 손실 방지 - **베타 필수**
- ⚠️ **GDPR 컴플라이언스**: 유럽 사용자 접근 시 필수, 없으면 정식 런칭 전

**보안 & 운영:**
- ✅ **AuditLog**: 보안 추적 - **베타 권장**
- ✅ **SystemHealth**: 서비스 안정성 - **베타 권장**
- ✅ **AnalysisFailure**: AI 장애 대응 - **베타 권장**

### 정식 런칭 전에만 필요한 항목

- **GDPR 컴플라이언스** (유럽 사용자 없으면)
- **LegalHoldRequest** (법적 요청 대응)
- **2FA 일반 사용자** (관리자는 베타에서도 필요)
- **고급 보안 기능** (SuspiciousLoginAttempt 등)

---

## 🔒 스키마 추가 시 안전성 보장

### ✅ 안전한 추가 방법

**1. 새로운 테이블 추가 (100% 안전)**
```prisma
// 기존 테이블에 영향 없음
model DataExportRequest {
  @@schema("user")
  id String @id @default(uuid()) @db.Uuid
  // ...
}
```
- ✅ 기존 테이블/데이터에 **영향 없음**
- ✅ 마이그레이션 시 기존 데이터 보존
- ✅ 롤백 가능

**2. 기존 테이블에 nullable 필드 추가 (100% 안전)**
```prisma
model AnalysisResult {
  // 기존 필드들...
  
  // 새 필드 추가 (nullable)
  input_tokens  Int?  // ✅ nullable이면 기존 데이터에 영향 없음
  output_tokens Int?
  cost_usd      Decimal? @default(0) @db.Decimal(10, 6)
}
```
- ✅ 기존 레코드는 `NULL`로 자동 설정
- ✅ 기존 쿼리/애플리케이션 코드 영향 없음
- ✅ 점진적 마이그레이션 가능

**3. 새로운 인덱스 추가 (100% 안전)**
```prisma
model DiaryEntry {
  // 기존 인덱스들...
  
  @@index([new_field]) // ✅ 새 인덱스 추가는 안전
}
```
- ✅ 기존 데이터에 영향 없음
- ✅ 읽기 성능만 향상
- ⚠️ 대용량 테이블은 인덱스 생성 시간 소요 (비동기 가능)

**4. 새로운 FK 관계 추가 (조건부 안전)**
```prisma
model DataExportRequest {
  user_id String @db.Uuid
  user User @relation(fields: [user_id], references: [id])
  // ✅ 새 테이블에서 기존 테이블 참조는 안전
}
```
- ✅ 기존 `User` 테이블에 영향 없음
- ✅ 새 테이블만 생성

### ⚠️ 주의가 필요한 추가 방법

**1. 기존 필드에 NOT NULL 제약 추가 (위험)**
```prisma
// ❌ 위험: 기존 데이터에 NULL이 있으면 마이그레이션 실패
model User {
  new_required_field String // NOT NULL
}
```
- ❌ 기존 레코드에 NULL이 있으면 마이그레이션 실패
- ✅ 해결: 먼저 nullable로 추가 → 데이터 채우기 → NOT NULL로 변경

**2. 기존 필드 타입 변경 (위험)**
```prisma
// ❌ 위험: 타입 변환 실패 가능
model User {
  email String // 기존이 String?이었다면
}
```
- ❌ 데이터 변환 실패 가능
- ✅ 해결: 새 필드 추가 → 데이터 마이그레이션 → 기존 필드 제거

**3. 기존 인덱스 제거 (주의)**
```prisma
// ⚠️ 주의: 성능 영향 가능
// @@index([old_field]) // 제거 시 쿼리 성능 저하 가능
```
- ⚠️ 쿼리 성능 영향 가능
- ✅ 해결: 새 인덱스 추가 후 제거

---

## 📋 목차

1. [법적 컴플라이언스 (GDPR/개인정보보호법)](#1-법적-컴플라이언스-gdpr개인정보보호법)
2. [감사 추적 (Audit Trail)](#2-감사-추적-audit-trail)
3. [비용 관리 & Rate Limiting](#3-비용-관리--rate-limiting)
4. [보안 강화](#4-보안-강화)
5. [백업 & 재해복구](#5-백업--재해복구)
6. [성능 & 스케일링](#6-성능--스케일링)
7. [모니터링 & 알림](#7-모니터링--알림)
8. [법적 요청 대응](#8-법적-요청-대응)
9. [AI 프로바이더 장애 대응](#9-ai-프로바이더-장애-대응)
10. [우선순위 & 로드맵](#우선순위--로드맵)
11. [리스크 평가](#리스크-평가)
12. [비용 분석](#비용-분석)

---

## 1. 법적 컴플라이언스 (GDPR/개인정보보호법)

### 1.1 데이터 다운로드 (Data Portability)

**요구사항:**
- GDPR Article 20: 사용자가 자신의 데이터를 기계 판독 가능한 형태로 다운로드 가능해야 함
- 개인정보보호법 제38조: 정보주체의 권리 행사

**제안 스키마:**
```prisma
model DataExportRequest {
  @@schema("user")
  id         String   @id @default(uuid()) @db.Uuid
  user_id    String   @db.Uuid
  status     String   // PENDING, PROCESSING, COMPLETED, FAILED
  file_url   String?  // S3/Storage 링크 (암호화된 ZIP)
  expires_at DateTime @db.Timestamptz(6) // 다운로드 링크 만료 (7일)
  created_at DateTime @default(now()) @db.Timestamptz(6)
  completed_at DateTime? @db.Timestamptz(6)
  
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id, status])
  @@index([expires_at]) // 만료된 파일 정리용
  @@index([status, created_at])
}
```

**의견:**
- ⚠️ **베타 필요 여부**: 유럽 사용자 접근 시 필수, 없으면 정식 런칭 전
- ✅ **스키마 안전성**: 새 테이블 추가이므로 기존 스키마에 영향 없음
- 구현 복잡도: 중간 (암호화된 데이터 통합, ZIP 생성, S3 업로드)
- 우선순위: **P0 (Critical)** - 유럽 사용자 있으면, **P1 (High)** - 없으면

---

### 1.2 계정 삭제 요청 (Right to be Forgotten)

**요구사항:**
- GDPR Article 17: 사용자가 자신의 데이터 삭제를 요청할 수 있어야 함
- 개인정보보호법 제36조: 삭제 요청 처리

**제안 스키마:**
```prisma
model AccountDeletionRequest {
  @@schema("user")
  id           String    @id @default(uuid()) @db.Uuid
  user_id      String    @db.Uuid
  reason       String?   // 선택: 삭제 사유
  status       String    // PENDING, APPROVED, PROCESSING, COMPLETED, REJECTED
  scheduled_at DateTime? @db.Timestamptz(6) // 실제 삭제 예정일 (30일 유예)
  deleted_at   DateTime? @db.Timestamptz(6) // 실제 삭제 완료 시각
  created_at   DateTime  @default(now()) @db.Timestamptz(6)
  
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
  @@index([status, scheduled_at])
  @@index([scheduled_at]) // 스케줄링된 삭제 작업용
}
```

**의견:**
- ⚠️ **베타 필요 여부**: 유럽 사용자 접근 시 필수, 없으면 정식 런칭 전
- ✅ **스키마 안전성**: 새 테이블 추가이므로 기존 스키마에 영향 없음
- 구현 복잡도: 높음 (암호화된 데이터 완전 삭제, 백업에서도 제거, 법적 보관 의무 고려)
- 주의사항:
  - 법적 보관 의무가 있는 데이터는 삭제 불가 (예: 세금 관련, 법적 분쟁)
  - 30일 유예 기간은 사용자 실수 방지용
- 우선순위: **P0 (Critical)** - 유럽 사용자 있으면, **P1 (High)** - 없으면

---

### 1.3 동의 관리 (Consent Management)

**요구사항:**
- GDPR Article 7: 명시적 동의 필요, 동의 철회 가능
- 개인정보보호법 제15조: 동의 철회 권리

**제안 스키마:**
```prisma
model UserConsent {
  @@schema("user")
  id            String   @id @default(uuid()) @db.Uuid
  user_id       String   @db.Uuid
  consent_type  String   // TERMS_OF_SERVICE, PRIVACY_POLICY, MARKETING, DATA_ANALYSIS
  version       String   // 약관 버전 (v1.0.0)
  granted       Boolean  // 동의 여부
  granted_at    DateTime @db.Timestamptz(6)
  revoked_at    DateTime? @db.Timestamptz(6)
  ip_address    String?  // 법적 증거
  user_agent    String?
  
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id, consent_type])
  @@index([consent_type, granted])
  @@unique([user_id, consent_type, version]) // 버전별 고유
}
```

**의견:**
- ✅ **즉시 구현 필수** (법적 위반)
- 구현 복잡도: 낮음 (단순 CRUD)
- 주의사항:
  - 약관 변경 시 새 버전으로 동의 재요청 필요
  - 마케팅 동의는 별도 관리 (GDPR Article 6)
- 우선순위: **P0 (Critical)**

---

### 1.4 개인정보 처리 내역 (Processing Log)

**요구사항:**
- GDPR Article 30: 개인정보 처리 활동 기록 의무
- 개인정보보호법 제29조: 처리 현황 기록

**제안 스키마:**
```prisma
model PersonalDataProcessingLog {
  @@schema("admin")
  id             String   @id @default(uuid()) @db.Uuid
  user_id        String   @db.Uuid
  processing_type String  // READ, WRITE, UPDATE, DELETE, DECRYPT, EXPORT
  data_type      String   // DIARY_CONTENT, USER_PROFILE, ANALYSIS_RESULT
  target_id      String?  @db.Uuid
  purpose        String   // SERVICE_PROVISION, CRISIS_DETECTION, LEGAL_OBLIGATION
  admin_id       String?  @db.Uuid
  ip_address     String
  created_at     DateTime @default(now()) @db.Timestamptz(6)
  // Note: user, admin은 user 스키마에 있어 FK 관계 없음 (참조만 유지)
  
  @@index([user_id, created_at])
  @@index([processing_type, created_at])
  @@index([admin_id, created_at])
  @@index([data_type, created_at])
}
```

**의견:**
- ✅ **즉시 구현 필수** (법적 위반)
- 구현 복잡도: 중간 (모든 개인정보 접근 지점에 로깅 추가)
- 주의사항:
  - 로그 볼륨이 매우 클 수 있음 (파티셔닝 필수)
  - 민감 정보는 로그에 포함하지 않기
- 우선순위: **P0 (Critical)**

---

## 2. 감사 추적 (Audit Trail)

### 2.1 통합 감사 로그

**요구사항:**
- ISO 27001: 모든 민감 작업에 대한 감사 추적 필요
- SOC 2: 접근 제어 및 변경 관리 추적

**제안 스키마:**
```prisma
model AuditLog {
  @@schema("admin")
  id          String   @id @default(uuid()) @db.Uuid
  actor_id    String   @db.Uuid // 행위자 (관리자 또는 시스템)
  actor_type  String   // ADMIN, SYSTEM, USER
  action      String   // CREATE, READ, UPDATE, DELETE, DECRYPT, EXPORT
  resource    String   // User, DiaryEntry, CrisisAlert, etc.
  resource_id String   @db.Uuid
  changes     Json?    // 변경 전후 값 { before: {...}, after: {...} }
  reason      String?  // 행위 사유
  ip_address  String
  user_agent  String
  created_at  DateTime @default(now()) @db.Timestamptz(6)
  // Note: actor는 user 스키마에 있어 FK 관계 없음 (참조만 유지)
  
  @@index([actor_id, created_at])
  @@index([resource, resource_id])
  @@index([action, created_at])
  @@index([created_at]) // 시계열 조회
  @@index([actor_type, action]) // 행위자별 행동 분석
}
```

**의견:**
- ✅ **베타 필요 여부**: **베타에서도 권장** (보안 사고 대응)
- ✅ **스키마 안전성**: 새 테이블 추가이므로 기존 스키마에 영향 없음
- 구현 복잡도: 높음 (모든 민감 작업에 로깅 추가, 성능 영향 고려)
- 주의사항:
  - 로그 볼륨이 매우 큼 (월별 파티셔닝 필수)
  - 비동기 로깅 권장 (성능 영향 최소화)
  - 로그 보관 기간 정책 필요 (최소 1년, 법적 요구에 따라 7년)
- 우선순위: **P1 (High)** - 베타 권장

---

## 3. 비용 관리 & Rate Limiting

### 3.1 사용량 할당 (Quota Management)

**요구사항:**
- AI 분석 비용 폭탄 방지
- 공정한 리소스 사용 보장

**제안 스키마:**
```prisma
model UserQuota {
  @@schema("user")
  id              String   @id @default(uuid()) @db.Uuid
  user_id         String   @unique @db.Uuid
  
  // 일기 작성 할당
  daily_diary_limit   Int @default(10)  // 하루 10개
  monthly_diary_limit Int @default(300) // 월 300개
  
  // AI 분석 할당
  daily_analysis_limit   Int @default(10)
  monthly_analysis_limit Int @default(300)
  
  // 현재 사용량
  daily_diary_count   Int @default(0)
  monthly_diary_count Int @default(0)
  daily_analysis_count   Int @default(0)
  monthly_analysis_count Int @default(0)
  
  // 리셋 시각
  daily_reset_at   DateTime @db.Timestamptz(6)
  monthly_reset_at DateTime @db.Timestamptz(6)
  
  // 프리미엄 여부
  is_premium Boolean @default(false)
  
  updated_at DateTime @updatedAt @db.Timestamptz(6)
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
  @@index([daily_reset_at]) // 일일 리셋 작업용
  @@index([monthly_reset_at]) // 월간 리셋 작업용
}
```

**의견:**
- ✅ **베타 필요 여부**: **베타에서도 필수** (악의적 사용자로 인한 비용 폭탄 방지)
- ✅ **스키마 안전성**: 새 테이블 추가이므로 기존 스키마에 영향 없음
- 구현 복잡도: 중간 (Redis 캐싱 권장, DB 부하 최소화)
- 주의사항:
  - Redis로 실시간 체크, DB는 백업용
  - 프리미엄 사용자는 제한 완화 또는 무제한
  - 악의적 사용자 탐지 및 추가 제한 필요
- 우선순위: **P0 (Critical)** - 베타 필수

---

### 3.2 비용 추적 (정밀)

**요구사항:**
- 프로바이더별 비용 분석
- 사용자별 비용 추적 (프리미엄 요금제 대비)

**제안 스키마:**
```prisma
// AnalysisResult에 추가
model AnalysisResult {
  @@schema("user")
  // 기존 필드...
  
  // 비용 추적 (정밀) - ✅ 추가 필수
  input_tokens  Int?
  output_tokens Int?
  cost_usd      Decimal @default(0) @db.Decimal(10, 6) // 소수점 6자리 (마이크로 달러)
  
  @@index([created_at, cost_usd])
  @@index([provider, cost_usd])
}

model BillingRecord {
  @@schema("admin")
  id         String   @id @default(uuid()) @db.Uuid
  user_id    String   @db.Uuid
  period     String   // 2025-01 (YYYY-MM)
  
  // 집계
  total_diaries   Int @default(0)
  total_analyses  Int @default(0)
  total_tokens    Int @default(0)
  total_cost_usd  Decimal @db.Decimal(10, 2)
  
  // 프로바이더별
  openai_cost  Decimal @default(0) @db.Decimal(10, 2)
  gemini_cost  Decimal @default(0) @db.Decimal(10, 2)
  hua_cost     Decimal @default(0) @db.Decimal(10, 2)
  
  created_at DateTime @default(now()) @db.Timestamptz(6)
  // Note: user는 user 스키마에 있어 FK 관계 없음 (참조만 유지)
  
  @@unique([user_id, period])
  @@index([period])
  @@index([total_cost_usd]) // 고액 사용자 탐지
  @@index([user_id, period])
}
```

**의견:**
- ✅ **베타 필요 여부**: **베타에서도 필수** (비용 모니터링)
- ✅ **스키마 안전성**: nullable 필드 추가이므로 기존 데이터에 영향 없음
  ```prisma
  input_tokens  Int?  // ✅ nullable이면 기존 레코드는 NULL
  output_tokens Int?
  cost_usd      Decimal? @default(0) // ✅ 기본값 있으면 더 안전
  ```
- 구현 복잡도: 낮음 (기존 AnalysisResult에 필드 추가)
- 주의사항:
  - 프로바이더별 토큰 가격은 설정 파일로 관리
  - 실시간 비용 계산 vs 배치 집계 선택 (배치 권장)
  - 기존 레코드는 NULL로 시작, 새 분석부터 값 채움
- 우선순위: **P0 (Critical)** - 베타 필수

---

## 4. 보안 강화

### 4.1 다중 인증 (2FA/MFA)

**요구사항:**
- SOC 2: 관리자 계정은 MFA 필수
- 사용자 계정 보안 강화

**제안 스키마:**
```prisma
model TwoFactorAuth {
  @@schema("user")
  id         String    @id @default(uuid()) @db.Uuid
  user_id    String    @unique @db.Uuid
  secret     String    // TOTP 시크릿 (암호화 필수)
  enabled    Boolean   @default(false)
  backup_codes String[] // 백업 코드 (해시)
  created_at DateTime  @default(now()) @db.Timestamptz(6)
  updated_at DateTime  @updatedAt @db.Timestamptz(6)
  
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
}
```

**의견:**
- ⚠️ **베타 후 구현 권장** (관리자 계정은 즉시)
- 구현 복잡도: 중간 (TOTP 라이브러리 사용)
- 주의사항:
  - 관리자 계정은 즉시 MFA 필수
  - 일반 사용자는 선택 사항으로 시작 (점진적 도입)
  - 백업 코드는 해시 저장 (bcrypt)
- 우선순위: **P1 (High)** - 관리자 계정, **P2 (Medium)** - 일반 사용자

---

### 4.2 세션 관리 강화

**요구사항:**
- 비정상 세션 탐지
- 휴면 세션 정리

**제안 스키마:**
```prisma
model Session {
  @@schema("user")
  id           String   @id @default(uuid()) @db.Uuid
  sessionToken String   @unique
  userId       String   @db.Uuid
  
  // 추가 보안 필드
  ip_address   String?
  user_agent   String?
  device_id    String?  // 디바이스 식별자
  last_activity DateTime @default(now()) @db.Timestamptz(6)
  
  expires      DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, last_activity]) // 휴면 세션 정리
  @@index([device_id]) // 디바이스별 세션 관리
  @@index([expires]) // 만료된 세션 정리
}
```

**의견:**
- ✅ **즉시 구현 권장** (보안 강화)
- 구현 복잡도: 낮음 (기존 Session 모델 확장)
- 주의사항:
  - 기존 세션은 마이그레이션으로 필드 추가
  - 비정상 로그인 탐지와 연동
- 우선순위: **P1 (High)**

---

### 4.3 차단된 디바이스 관리

**제안 스키마:**
```prisma
model BlockedDevice {
  @@schema("admin")
  id         String   @id @default(uuid()) @db.Uuid
  user_id    String?  @db.Uuid
  device_id  String?
  ip_address String?
  reason     String   // SUSPICIOUS_ACTIVITY, USER_REPORT, ADMIN_BLOCK
  blocked_at DateTime @default(now()) @db.Timestamptz(6)
  expires_at DateTime? @db.Timestamptz(6) // 임시 차단인 경우
  
  @@index([device_id])
  @@index([ip_address])
  @@index([user_id])
  @@index([expires_at]) // 만료된 차단 해제용
}
```

**의견:**
- ⚠️ **베타 후 구현** (악의적 사용자 대응)
- 구현 복잡도: 낮음
- 우선순위: **P2 (Medium)**

---

### 4.4 비정상 로그인 탐지

**제안 스키마:**
```prisma
model SuspiciousLoginAttempt {
  @@schema("admin")
  id            String   @id @default(uuid()) @db.Uuid
  user_id       String?  @db.Uuid
  email_hash    String?  @db.VarChar(64)
  ip_address    String
  device        String?
  user_agent    String?
  reason        String[] // MULTIPLE_FAILED_ATTEMPTS, NEW_LOCATION, NEW_DEVICE, IMPOSSIBLE_TRAVEL
  risk_score    Int      // 0-100
  blocked       Boolean  @default(false)
  created_at    DateTime @default(now()) @db.Timestamptz(6)
  
  @@index([user_id, created_at])
  @@index([ip_address, created_at])
  @@index([risk_score])
  @@index([blocked, created_at])
}
```

**의견:**
- ⚠️ **베타 후 구현** (보안 강화)
- 구현 복잡도: 높음 (위치 기반 탐지, 이상 행동 패턴 분석)
- 주의사항:
  - IP 기반 위치 추정 (정확도 낮음)
  - VPN 사용자 오탐 가능
  - 점진적 도입 권장
- 우선순위: **P2 (Medium)**

---

## 5. 백업 & 재해복구

### 5.1 백업 이력

**요구사항:**
- 정기 백업 검증
- 복구 테스트

**제안 스키마:**
```prisma
model BackupRecord {
  @@schema("admin")
  id            String   @id @default(uuid()) @db.Uuid
  backup_type   String   // FULL, INCREMENTAL, SNAPSHOT
  status        String   // SUCCESS, FAILED, IN_PROGRESS
  file_size_mb  Float?
  storage_path  String?
  checksum      String?  // 파일 무결성 검증
  retention_until DateTime @db.Timestamptz(6)
  created_at    DateTime @default(now()) @db.Timestamptz(6)
  completed_at  DateTime? @db.Timestamptz(6)
  
  @@index([backup_type, created_at])
  @@index([status])
  @@index([retention_until]) // 만료된 백업 정리
}
```

**의견:**
- ✅ **베타 필요 여부**: **베타에서도 필수** (데이터 손실 방지)
- ✅ **스키마 안전성**: 새 테이블 추가이므로 기존 스키마에 영향 없음
- 구현 복잡도: 중간 (자동화 스크립트 + DB 로깅)
- 주의사항:
  - 일일 전체 백업 + 시간별 증분 백업
  - 백업 복구 테스트 정기 수행 (월 1회)
  - 암호화된 백업 저장
- 우선순위: **P0 (Critical)** - 베타 필수

---

## 6. 성능 & 스케일링

### 6.1 Read Replica 준비

**의견:**
- ⚠️ **베타 후 고려** (트래픽 증가 시)
- 구현 복잡도: 중간 (Prisma는 현재 Read Replica 직접 지원 안 함)
- 주의사항:
  - Prisma는 `directUrl`로 Read Replica 연결 가능하나, 애플리케이션 레벨에서 분기 필요
  - 또는 Connection Pooler (PgBouncer) 사용
- 우선순위: **P3 (Low)** - 트래픽 증가 시

---

### 6.2 파티셔닝 전략

**의견:**
- ⚠️ **베타 후 고려** (데이터 증가 시)
- 구현 복잡도: 높음 (PostgreSQL 파티셔닝 설정)
- 대상 테이블:
  - `DiaryEntry`: 월별 파티셔닝
  - `AnalysisResult`: 월별 파티셔닝
  - `LoginLog`: 월별 파티셔닝 (3개월 후 아카이브)
  - `AuditLog`: 분기별 파티셔닝 (1년 후 아카이브)
- 우선순위: **P3 (Low)** - 데이터 증가 시

---

### 6.3 캐싱 전략

**제안 스키마:**
```prisma
model CachedAnalysis {
  @@schema("user")
  id          String   @id @default(uuid()) @db.Uuid
  content_hash String  @unique @db.VarChar(64) // 일기 내용 해시
  result_id   String   @db.Uuid // AnalysisResult FK
  hit_count   Int      @default(0)
  expires_at  DateTime @db.Timestamptz(6)
  created_at  DateTime @default(now()) @db.Timestamptz(6)
  
  @@index([content_hash])
  @@index([expires_at])
}
```

**의견:**
- ⚠️ **베타 후 구현** (비용 절감)
- 구현 복잡도: 중간 (Redis + DB 하이브리드)
- 주의사항:
  - Redis에 캐시, DB는 영구 저장
  - 동일 내용 일기 중복 분석 방지 (30% 비용 절감 예상)
  - 프라이버시 고려: 해시 충돌 가능성 (SHA-256 사용)
- 우선순위: **P2 (Medium)**

---

## 7. 모니터링 & 알림

### 7.1 헬스체크

**제안 스키마:**
```prisma
model SystemHealth {
  @@schema("admin")
  id             String   @id @default(uuid()) @db.Uuid
  service        String   // API, DB, AI_PROVIDER, STORAGE
  status         String   // HEALTHY, DEGRADED, DOWN
  response_time  Int?     // ms
  error_rate     Float?   // 0-1
  last_check     DateTime @db.Timestamptz(6)
  metadata       Json?    // 추가 메트릭
  
  @@index([service, status])
  @@index([last_check])
  @@unique([service, last_check]) // 중복 방지
}
```

**의견:**
- ✅ **베타 런칭 전 구현 권장** (서비스 안정성)
- 구현 복잡도: 낮음 (주기적 헬스체크 + DB 저장)
- 주의사항:
  - 외부 모니터링 도구 (Datadog, New Relic)와 병행
  - DB는 보조용, 실시간 모니터링은 외부 도구
- 우선순위: **P1 (High)**

---

### 7.2 운영자 알림

**제안 스키마:**
```prisma
model AdminAlert {
  @@schema("admin")
  id          String   @id @default(uuid()) @db.Uuid
  severity    String   // CRITICAL, HIGH, MEDIUM, LOW
  type        String   // SYSTEM_DOWN, HIGH_ERROR_RATE, COST_SPIKE, SECURITY_BREACH
  title       String
  description String   @db.Text
  resolved    Boolean  @default(false)
  resolved_by String?  @db.Uuid
  resolved_at DateTime? @db.Timestamptz(6)
  created_at  DateTime @default(now()) @db.Timestamptz(6)
  
  @@index([severity, resolved])
  @@index([type, created_at])
  @@index([resolved, created_at])
}
```

**의견:**
- ✅ **베타 런칭 전 구현 권장** (운영 효율성)
- 구현 복잡도: 낮음
- 주의사항:
  - Slack/Discord 웹훅 연동
  - 중복 알림 방지 로직 필요
- 우선순위: **P1 (High)**

---

## 8. 법적 요청 대응

### 8.1 Legal Hold Request

**제안 스키마:**
```prisma
model LegalHoldRequest {
  @@schema("admin")
  id             String   @id @default(uuid()) @db.Uuid
  case_number    String   @unique // 사건 번호
  user_id        String?  @db.Uuid
  request_type   String   // COURT_ORDER, POLICE_INVESTIGATION, SUBPOENA
  status         String   // PENDING, APPROVED, REJECTED, COMPLETED
  requested_by   String   // 요청 기관
  requested_at   DateTime @db.Timestamptz(6)
  approved_by    String?  @db.Uuid // 승인한 관리자
  approved_at    DateTime? @db.Timestamptz(6)
  data_exported  Boolean  @default(false)
  export_path    String?  // 추출된 데이터 경로
  notes          String?  @db.Text
  
  @@index([case_number])
  @@index([user_id])
  @@index([status])
  @@index([requested_at])
}
```

**의견:**
- ⚠️ **정식 런칭 전 구현** (법적 대응)
- 구현 복잡도: 중간 (데이터 추출, 법적 검토 프로세스)
- 주의사항:
  - 법무팀 검토 필수
  - Legal Hold 기간 동안 데이터 삭제 금지
  - 승인 프로세스 명확화
- 우선순위: **P2 (Medium)** - 정식 런칭 전

---

## 9. AI 프로바이더 장애 대응

### 9.1 Analysis Failure & Fallback

**제안 스키마:**
```prisma
model AnalysisFailure {
  @@schema("admin")
  id              String   @id @default(uuid()) @db.Uuid
  diary_id        String   @db.Uuid
  provider        AnalysisProvider
  error_code      String?
  error_message   String?
  retry_count     Int      @default(0)
  last_retry_at   DateTime? @db.Timestamptz(6)
  fallback_used   Boolean  @default(false)
  fallback_provider AnalysisProvider?
  resolved        Boolean  @default(false)
  created_at      DateTime @default(now()) @db.Timestamptz(6)
  
  @@index([provider, created_at])
  @@index([resolved])
  @@index([diary_id])
}
```

**의견:**
- ✅ **베타 런칭 전 구현 권장** (서비스 안정성)
- 구현 복잡도: 중간 (재시도 로직, 폴백 전략)
- 주의사항:
  - 프로바이더별 재시도 정책 (Exponential Backoff)
  - 폴백 순서: OpenAI → Gemini → HUA Engine
  - 사용자에게 지연 알림
- 우선순위: **P1 (High)**

---

## 우선순위 & 로드맵

### 🔴 P0 (Critical) - 베타 런칭 전 필수

**Week 1-2 (베타 런칭 전):**
- [ ] **비용 관리 (베타 필수)**
  - [ ] `UserQuota` 구현 ✅ (스키마 안전: 새 테이블)
  - [ ] 비용 추적 정밀화 (`AnalysisResult` 필드 추가) ✅ (스키마 안전: nullable 필드)
  - [ ] `BillingRecord` 구현 ✅ (스키마 안전: 새 테이블)
- [ ] **데이터 보호 (베타 필수)**
  - [ ] `BackupRecord` 구현 ✅ (스키마 안전: 새 테이블)
- [ ] **GDPR 컴플라이언스 (유럽 사용자 있으면 필수)**
  - [ ] `DataExportRequest` ✅ (스키마 안전: 새 테이블)
  - [ ] `AccountDeletionRequest` ✅ (스키마 안전: 새 테이블)
  - [ ] `UserConsent` ✅ (스키마 안전: 새 테이블)
  - [ ] `PersonalDataProcessingLog` ✅ (스키마 안전: 새 테이블)
- [ ] **보안 추적 (베타 권장)**
  - [ ] `AuditLog` 구현 ✅ (스키마 안전: 새 테이블)

**예상 작업량:** 2주 (1명 기준)

**스키마 안전성:**
- ✅ 모든 항목이 새 테이블 추가 또는 nullable 필드 추가
- ✅ 기존 테이블/데이터에 영향 없음
- ✅ 마이그레이션 롤백 가능

---

### 🟡 P1 (High) - 베타 런칭 전 권장

**Week 3-4 (베타 런칭 전):**
- [ ] `SystemHealth` 모니터링
- [ ] `AdminAlert` 알림 시스템
- [ ] `AnalysisFailure` 폴백 전략
- [ ] `Session` 보안 강화
- [ ] 관리자 계정 2FA

**예상 작업량:** 2주 (1명 기준)

---

### 🟢 P2 (Medium) - 정식 런칭 전

**Month 2-3:**
- [ ] `CachedAnalysis` 캐싱
- [ ] `BlockedDevice` 관리
- [ ] `SuspiciousLoginAttempt` 탐지
- [ ] `LegalHoldRequest` 법적 대응
- [ ] 일반 사용자 2FA (선택)

**예상 작업량:** 4주 (1명 기준)

---

### 🔵 P3 (Low) - 트래픽/데이터 증가 시

**Month 4+:**
- [ ] Read Replica 설정
- [ ] 파티셔닝 전략
- [ ] CDN 도입

**예상 작업량:** 2주 (1명 기준)

---

## 리스크 평가

| 리스크 | 심각도 | 현재 상태 | 권장 조치 | 우선순위 |
|--------|--------|-----------|-----------|----------|
| **GDPR 위반** | 🔴 CRITICAL | ❌ 미구현 | 즉시 구현 필수 (벌금 위험) | P0 |
| **비용 폭탄** | 🔴 CRITICAL | ⚠️ 부분 구현 | UserQuota 즉시 추가 | P0 |
| **데이터 손실** | 🔴 CRITICAL | ⚠️ 백업 미자동화 | BackupRecord + 자동화 | P0 |
| **데이터 유출** | 🔴 CRITICAL | ✅ 암호화 완료 | AuditLog 추가 | P0 |
| **서비스 다운** | 🟡 HIGH | ⚠️ 모니터링 없음 | SystemHealth 추가 | P1 |
| **AI 장애** | 🟡 HIGH | ❌ 폴백 없음 | AnalysisFailure 추가 | P1 |
| **법적 요청** | 🟡 HIGH | ❌ 미구현 | LegalHoldRequest 추가 | P2 |
| **성능 저하** | 🟢 MEDIUM | ✅ 인덱스 최적화 | Read Replica 고려 | P3 |
| **보안 취약점** | 🟡 HIGH | ⚠️ 부분 구현 | 2FA, 세션 강화 | P1-P2 |

---

## 비용 분석

### 예상 사용량 (10,000명 기준)

```
일기 작성: 사용자당 월 20개 = 200,000개
AI 분석: 일기당 1회 = 200,000회
```

### AI 비용 (GPT-4 Turbo 기준)

```
Input: 1,000 tokens/일기 × 200,000 = 200M tokens → $2,000
Output: 500 tokens/분석 × 200,000 = 100M tokens → $6,000
월 총 AI 비용: $8,000
```

### 인프라 비용

```
DB: $500-1,000 (PostgreSQL Managed)
Storage: $100-300 (암호화된 일기 저장)
CDN: $50-100
Redis: $50-100 (캐싱)
모니터링: $100-200 (Datadog 등)
```

### 월 총 운영비

```
월 총 운영비: ~$10,000-12,000
사용자당 비용: $1.00-1.20
```

### 비용 절감 전략

1. **캐싱**: 중복 분석 방지 (-30%) → $5,600/월
2. **티어 요금제**: 
   - 무료: 일 3개 제한
   - 프리미엄: 무제한 ($9.99/월)
3. **배치 처리**: 비동기 분석로 전환 (-20%) → $4,480/월
4. **프로바이더 최적화**: GPT-4 → GPT-3.5 Turbo (-70%) → $1,344/월

**최적화 후 예상 비용:** $2,000-3,000/월 (사용자당 $0.20-0.30)

---

## 최종 권장사항

### 즉시 시작 (Week 1-2)

1. **GDPR 테이블 추가** (4개) - 법적 위반 방지
2. **UserQuota 구현** - 비용 폭탄 방지
3. **AuditLog 구현** - 보안 추적
4. **비용 추적 정밀화** - 모니터링
5. **BackupRecord** - 데이터 손실 방지

### 베타 런칭 전 (Week 3-4)

1. **SystemHealth 모니터링** - 서비스 안정성
2. **AdminAlert 알림** - 운영 효율성
3. **AnalysisFailure 폴백** - AI 장애 대응
4. **Session 보안 강화** - 보안 강화

### 정식 런칭 전 (Month 2-3)

1. **캐싱 전략** - 비용 절감
2. **법적 대응 체계** - LegalHoldRequest
3. **보안 강화** - 2FA, 비정상 탐지

### 트래픽 증가 시 (Month 4+)

1. **Read Replica** - 읽기 부하 분산
2. **파티셔닝** - 대용량 데이터 대비
3. **CDN** - 정적 리소스 최적화

---

## 결론

**베타 런칭 전 필수 (P0):**
- GDPR 컴플라이언스는 법적 위반 시 최대 매출의 4% 벌금 위험
- 비용 관리 없이는 AI 비용 폭탄 가능
- 감사 추적 없이는 보안 사고 대응 불가

**베타 런칭 전 권장 (P1):**
- 모니터링과 알림은 서비스 안정성 필수
- AI 폴백은 사용자 경험 보장

**정식 런칭 전 (P2):**
- 캐싱으로 비용 절감
- 법적 대응 체계 구축

**점진적 개선 (P3):**
- 트래픽 증가에 따라 스케일링

---

**예상 총 작업량:** 8-10주 (1명 기준, P0+P1+P2)

**베타 런칭 가능 시점:** 
- 최소: 비용 관리 (UserQuota, 비용 추적) + 백업 (BackupRecord) 완료 후
- 권장: P0 완료 후 (2주 후)

**정식 런칭 가능 시점:** P0+P1+P2 완료 후 (8-10주 후)

---

## 🔒 스키마 마이그레이션 안전 가이드

### 안전한 마이그레이션 절차

1. **백업 생성**
   ```bash
   # 마이그레이션 전 필수
   pg_dump -h localhost -U postgres sum_diary > backup_before_migration.sql
   ```

2. **스키마 변경 적용**
   ```bash
   # Prisma 마이그레이션 생성
   pnpm db:migrate:local --name add_production_tables --create-only
   
   # 마이그레이션 SQL 검토
   # apps/my-app/prisma/migrations/YYYYMMDDHHMMSS_add_production_tables/migration.sql
   
   # 적용
   pnpm db:migrate:local
   ```

3. **검증**
   ```bash
   # Prisma Client 재생성
   pnpm db:generate:local
   
   # 애플리케이션 테스트
   pnpm test
   ```

4. **롤백 (필요 시)**
   ```bash
   # 마이그레이션 되돌리기
   pnpm db:migrate:local --rollback
   
   # 또는 백업 복구
   psql -h localhost -U postgres sum_diary < backup_before_migration.sql
   ```

### 스키마 변경 타입별 안전성

| 변경 타입 | 안전성 | 기존 데이터 영향 | 롤백 가능 |
|-----------|--------|------------------|-----------|
| 새 테이블 추가 | ✅ 100% 안전 | 없음 | 가능 |
| nullable 필드 추가 | ✅ 100% 안전 | 없음 (NULL로 설정) | 가능 |
| 인덱스 추가 | ✅ 100% 안전 | 없음 (비동기 생성) | 가능 |
| 새 FK 관계 (새→기존) | ✅ 100% 안전 | 없음 | 가능 |
| NOT NULL 필드 추가 | ⚠️ 조건부 | 기존 NULL 데이터 있으면 실패 | 가능 |
| 필드 타입 변경 | ⚠️ 조건부 | 변환 실패 가능 | 가능 |
| 필드 제거 | ❌ 위험 | 데이터 손실 | 불가능 |
| 인덱스 제거 | ⚠️ 주의 | 성능 영향 | 가능 |

### 권장 마이그레이션 전략

**단계별 적용:**
1. Week 1: 비용 관리 (UserQuota, 비용 추적) - 베타 필수
2. Week 2: 데이터 보호 (BackupRecord) + GDPR (선택)
3. Week 3-4: 보안 & 모니터링 (AuditLog, SystemHealth)

**각 단계별로:**
- ✅ 마이그레이션 전 백업
- ✅ 개발 환경에서 먼저 테스트
- ✅ 스테이징 환경 검증
- ✅ 프로덕션 적용
