# 🗄️ 스키마 개선 의사결정 문서

> 베타 런칭 전 스키마 개선 사항 검토 및 의사결정 기록
> 
> 작성일: 2025-11-30
> 목적: 피드백 기반 스키마 개선 사항 논의 및 결정

---

## 📋 목차

1. [치명적 문제 (즉시 수정 필요)](#1-치명적-문제-즉시-수정-필요)
2. [중요한 개선 사항 (단기 개선)](#2-중요한-개선-사항-단기-개선)
3. [마이너한 개선 사항 (중장기 개선)](#3-마이너한-개선-사항-중장기-개선)
4. [의사결정 요약](#의사결정-요약)

---

## 1. 치명적 문제 (즉시 수정 필요)

### 1.1 🔴 스키마 간 FK 관계 끊김 (Cross-Schema Relations)

**문제점:**
- `admin` 스키마의 `CrisisAlert`, `AbuseAlert`가 `user` 스키마의 `User`를 참조
- Prisma가 스키마 간 FK 제약조건을 마이그레이션에서 올바르게 처리하지 못할 수 있음
- `onDelete: Cascade` 작동 불가능
- 트랜잭션 무결성 보장 어려움

**현재 상태:**
```prisma
model CrisisAlert {
  @@schema("admin")
  user_id String @db.Uuid
  user    User   @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model User {
  @@schema("user")
  crisis_alerts CrisisAlert[]
}
```

**해결 방안:**

#### 옵션 A: 모든 테이블을 같은 스키마에 배치 (권장)
- ✅ Prisma 완전 호환
- ✅ FK 제약조건 정상 작동
- ✅ 트랜잭션 무결성 보장
- ❌ 스키마 분리 이점 상실
- ❌ RLS로 접근 제어 필요

#### 옵션 B: FK 없이 참조만 유지
- ✅ 스키마 분리 유지
- ✅ 논리적 분리 명확
- ❌ 애플리케이션 레벨에서 무결성 관리 필요
- ❌ `onDelete` 동작 수동 처리

#### 옵션 C: User를 공통 스키마로 이동
- ✅ admin 스키마 테이블들이 참조 가능
- ✅ user 스키마의 다른 테이블들도 참조 가능
- ❌ 스키마 구조 복잡도 증가

**의사결정:**
- [ ] 옵션 A 선택
- [ ] 옵션 B 선택
- [ ] 옵션 C 선택
- [ ] 기타: ___________

**논의 사항:**
- 스키마 분리의 목적이 무엇인가? (보안, 성능, 관리 편의성?)
- RLS(Row Level Security) 사용 계획이 있는가?
- 애플리케이션 레벨에서 무결성 관리 가능한가?

---

### 1.2 🔴 인덱스 누락 (성능 병목)

**문제점:**
- `DiaryEntry`에서 자주 사용될 쿼리 패턴에 대한 인덱스 누락
- `AnalysisResult` 성능 최적화 인덱스 부족

**현재 상태:**
```prisma
model DiaryEntry {
  @@index([user_id, created_at])
  @@index([is_deleted, created_at])
  // ❌ 누락: diary_date, is_delayed_entry, exclude_from_analysis
}
```

**추가 필요 인덱스:**

#### DiaryEntry
```prisma
@@index([user_id, diary_date])           // 일기 날짜 조회
@@index([user_id, is_delayed_entry])     // 지연 작성 필터링
@@index([diary_date, is_delayed_entry]) // 날짜 + 지연 조합
@@index([exclude_from_analysis])         // 분석 제외 필터링
```

#### AnalysisResult
```prisma
@@index([provider, status, created_at])  // 프로바이더별 상태 조회
@@index([model_name, model_version])     // 모델 버전별 조회
@@index([tokens])                        // 비용 분석용
@@index([latency])                       // 성능 모니터링용
```

**의사결정:**
- [x] 핵심 인덱스 추가 ✅ (2025-11-30 적용)
- [ ] 모든 인덱스 추가
- [ ] 일부만 추가 (선택: __________)
- [ ] 성능 테스트 후 결정

**적용 내용:**
- DiaryEntry: `[user_id, diary_date]`, `[user_id, is_delayed_entry]`, `[diary_date, is_delayed_entry]`
- AnalysisResult: `[provider, status, created_at]`, `[model_name, model_version]`, `[tokens]`, `[latency]`
- CrisisAlert: `[status, created_at]`, `[user_id, risk_level, created_at]`, `[ai_confidence]`
- AbuseAlert: `[status, created_at]`, `[user_id, penalty_level, created_at]`, `[alert_type, status]`
- LoginLog: `[ip, action, created_at]`

**논의 사항:**
- 실제 쿼리 패턴 확인 필요
- 인덱스 추가 시 쓰기 성능 영향 고려
- 대용량 데이터 예상 규모는?

---

### 1.3 🔴 AnalysisResult 암호화 필드 구조 문제

**문제점:**
- 암호화된 필드로는 검색/필터링/정렬 불가능
- 사용자 검색 기능 제한
- 감정 패턴 분석 어려움

**현재 상태:**
```prisma
model AnalysisResult {
  title_enc               Bytes? // 암호화된 제목
  summary_enc             Bytes? // 암호화된 요약
  emotion_flow_enc        Bytes? // 암호화된 감정 흐름
  // ❌ 검색 불가능
}
```

**해결 방안:**

#### 옵션 A: 검색용 해시 추가
```prisma
model AnalysisResult {
  title_enc Bytes?
  title_hash String? @db.VarChar(64) // 검색용 해시
  summary_enc Bytes?
  summary_hash String? @db.VarChar(64)
}
```
- ✅ 완전한 프라이버시 보호
- ❌ 해시로는 부분 검색 불가능

#### 옵션 B: 구조화된 메타데이터 추가
```prisma
model AnalysisResult {
  title_enc Bytes?
  summary_enc Bytes?
  
  // 검색용 키워드만 평문
  emotion_keywords String[] // 검색용 키워드
  summary_topics String[]   // 토픽 태그
  
  @@index([emotion_keywords], type: Gin)
  @@index([summary_topics], type: Gin)
}
```
- ✅ 검색 가능
- ⚠️ 키워드 추출 시 프라이버시 고려 필요

#### 옵션 C: 하이브리드 접근
- 암호화된 원본 + 검색용 메타데이터(키워드/토픽) + 해시

**의사결정:**
- [ ] 옵션 A 선택
- [ ] 옵션 B 선택
- [ ] 옵션 C 선택
- [ ] 기타: ___________

**논의 사항:**
- 사용자 검색 기능이 필요한가?
- 감정 패턴 분석이 필요한가?
- 키워드 추출 시 프라이버시 위험 수용 가능한가?

---

## 2. 중요한 개선 사항 (단기 개선)

### 2.1 🟡 CrisisAlert와 AbuseAlert 중복 구조

**문제점:**
- 두 모델이 거의 동일한 필드 보유
- 중복 코드 및 유지보수 어려움

**현재 상태:**
```prisma
model CrisisAlert {
  user_id, diary_id, analysis_result_id
  status, reviewed_by, reviewed_at
  admin_notes, action_taken
  diary_excerpt
}

model AbuseAlert {
  // 동일한 구조...
}
```

**해결 방안:**

#### 옵션 A: 통합 모델 (Alert)
```prisma
model Alert {
  @@schema("admin")
  id String @id @default(uuid()) @db.Uuid
  
  alert_category AlertCategory // CRISIS, ABUSE
  
  // Crisis 전용
  crisis_types CrisisType[]?
  risk_level Int?
  
  // Abuse 전용
  abuse_patterns AbusePattern[]?
  penalty_level PenaltyLevel?
  
  // 공통 필드
  user_id String @db.Uuid
  status String
  // ...
}
```
- ✅ DRY 원칙 준수
- ✅ 통합 조회 가능
- ⚠️ 마이그레이션 필요

#### 옵션 B: 현재 구조 유지
- ✅ 타입 안정성
- ✅ 명확한 분리
- ❌ 중복 코드

**의사결정:**
- [ ] 옵션 A 선택 (통합)
- [ ] 옵션 B 선택 (유지)
- [ ] 베타 후 재검토

**논의 사항:**
- 두 알림 타입의 차이가 앞으로도 유지될 것인가?
- 통합 시 쿼리 복잡도 증가 수용 가능한가?

---

### 2.2 🟡 historical_context JSON 구조 명시

**문제점:**
- JSON 필드 구조 불명확
- 타입 안정성 부족

**현재 상태:**
```prisma
model CrisisAlert {
  historical_context Json? // ❌ 구조 불명확
}
```

**해결 방안:**

#### 옵션 A: 별도 테이블로 분리
```prisma
model CrisisAlertContext {
  crisis_alert_id String @db.Uuid
  cumulative_risk_score Float?
  average_confidence Float?
  previous_alerts_count Int @default(0)
  escalation_level Int @default(0)
  trend_direction String?
  risk_history Json?
}
```
- ✅ 타입 안정성
- ✅ 인덱스 가능
- ⚠️ 테이블 추가

#### 옵션 B: 주석으로 구조 명시
```prisma
// JSON 구조:
// {
//   cumulative_risk: number,
//   average_confidence: number,
//   previous_alerts: number,
//   escalation_info: { level: number, trend: string }
// }
historical_context Json?
```
- ✅ 간단함
- ❌ 타입 안정성 없음

**의사결정:**
- [x] 옵션 B 선택 (주석) ✅ (2025-11-30 적용)
- [ ] 옵션 A 선택 (별도 테이블)
- [ ] 베타 후 재검토

**적용 내용:**
- JSON 구조를 주석으로 명시
- 베타 단계에서는 구조가 변할 수 있어 주석으로 충분
- 프로덕션에서 필요 시 별도 테이블로 분리 가능

---

### 2.3 🟡 UserStatusLog 개선

**문제점:**
- `reason_code`, `reason_ref` 불명확
- 참조 관계 불명확

**개선 방안:**
```prisma
model UserStatusLog {
  reason_type String? // MANUAL, AUTO_BAN, CRISIS_DETECTED, ABUSE_DETECTED
  reason_code String? // ENUM으로 관리
  
  // 명확한 참조
  crisis_alert_id String? @db.Uuid
  abuse_alert_id String? @db.Uuid
  
  crisis_alert CrisisAlert? @relation(...)
  abuse_alert AbuseAlert? @relation(...)
}
```

**의사결정:**
- [x] 개선 적용 ✅ (2025-11-30 적용)
- [ ] 현재 구조 유지
- [ ] 베타 후 재검토

**적용 내용:**
- `reason_type String?` 추가 (MANUAL, AUTO_BAN, CRISIS_DETECTED, ABUSE_DETECTED, AUTO_INACTIVITY)
- `crisis_alert_id String? @db.Uuid` 추가
- `abuse_alert_id String? @db.Uuid` 추가
- `changed_by` 타입을 `String? @db.Uuid`로 명확화
- 인덱스 추가: `[reason_type, changed_at]`, `[crisis_alert_id]`, `[abuse_alert_id]`

---

### 2.4 🟡 HuaEmotionAnalysis 메트릭 중복

**문제점:**
- `entropy` vs `ai_entropy` 차이 불명확
- 필드명 일관성 부족

**개선 방안:**
```prisma
// 옵션 A: 명확한 접두사
rule_entropy Float?
ai_entropy Float?

// 옵션 B: JSON으로 분리
rule_metrics Json?
ai_metrics Json?
```

**의사결정:**
- [x] 주석 추가로 개선 ✅ (2025-11-30 적용)
- [ ] 옵션 A 선택
- [ ] 옵션 B 선택
- [ ] 현재 구조 유지

**적용 내용:**
- 규칙 기반 메트릭에 "HUA 규칙 기반" 주석 추가
- AI 기반 메트릭에 "LLM이 추론한" 주석 추가
- 필드명은 현재 구조 유지 (마이그레이션 비용 고려)

---

### 2.5 🟡 Notification 스냅샷 문제

**문제점:**
- `announcement_id`와 `title_snapshot` 중복 가능성
- 스냅샷 필요성 불명확

**개선 방안:**
- `announcement`가 삭제된 경우에만 스냅샷 사용
- 또는 스냅샷 제거하고 `announcement` 조인 사용

**의사결정:**
- [x] 스냅샷 유지 (삭제 대비) ✅ (2025-11-30 적용)
- [ ] 스냅샷 제거
- [ ] 베타 후 재검토

**적용 내용:**
- 스냅샷 사용 목적을 주석으로 명시
- announcement가 삭제된 경우에만 사용
- 데이터 손실 방지

---

### 2.6 🟡 Soft Delete 일관성

**문제점:**
- `deleted_at`과 `is_deleted` 중복

**개선 방안:**
```prisma
// deleted_at만 사용
deleted_at DateTime?
// is_deleted 제거, deleted_at IS NOT NULL로 판별
```

**의사결정:**
- [x] `deleted_at`만 사용 ✅ (2025-11-30 적용)
- [ ] 현재 구조 유지 (성능 고려)

**적용 내용:**
- `is_deleted Boolean` 필드 제거
- `deleted_at`만 사용, `deleted_at IS NOT NULL`로 삭제 여부 판별
- 인덱스 수정: `[deleted_at]`, `[user_id, deleted_at]` 추가
- 기존 `[is_deleted, created_at]`, `[user_id, is_deleted, created_at]`, `[user_id, is_deleted]` 인덱스 제거

---

## 3. 마이너한 개선 사항 (중장기 개선)

### 3.1 🟢 추가 인덱스 권장

**대상:**
- `CrisisAlert`: `[user_id, risk_level, created_at]`, `[status, created_at]`
- `AbuseAlert`: `[user_id, penalty_level, created_at]`
- `LoginLog`: `[ip, action, created_at]`

**의사결정:**
- [ ] 성능 테스트 후 추가
- [ ] 베타 후 모니터링 기반으로 결정

---

### 3.2 🟢 Enum 값 일관성

**문제점:**
- `UserState`: 소문자 (active, inactive)
- `UserRole`: 대문자 (USER, ADMIN)

**개선 방안:**
- 모두 대문자로 통일 권장

**의사결정:**
- [ ] 대문자로 통일
- [ ] 현재 구조 유지 (마이그레이션 비용 고려)

---

### 3.3 🟢 ApiLog 개선

**개선 방안:**
```prisma
model ApiLog {
  endpoint_normalized String? // /api/diary/:id → /api/diary/{id}
  error_message String?
  error_code String?
}
```

**의사결정:**
- [ ] 베타 후 개선
- [ ] 현재 구조 유지

---

### 3.4 🟢 비용 추적 개선

**개선 방안:**
```prisma
model AnalysisResult {
  input_tokens Int?
  output_tokens Int?
  cost_usd Decimal? @db.Decimal(10, 6)
}
```

**의사결정:**
- [ ] 베타 후 개선
- [ ] 현재 구조 유지

---

### 3.5 🟢 DecryptionLog 추가

**목적:**
- 암호화된 데이터 복호화 로그
- 법적 책임 추적

**의사결정:**
- [x] 베타 런칭 전 추가 ✅ (2025-11-30 적용)
- [ ] 베타 후 추가
- [ ] 제외

**적용 내용:**
- `DecryptionLog` 모델 추가 (admin 스키마)
- 필드: `admin_id`, `target_type`, `target_id`, `reason`, `ip_address`, `user_agent`
- 인덱스: `[admin_id, created_at]`, `[target_type, target_id]`, `[reason]`, `[created_at]`
- 법적 책임 추적을 위해 베타 전에 추가

---

## 의사결정 요약

### 즉시 수정 (베타 런칭 전)
- [x] 1.1 스키마 간 FK 관계: 옵션 B (FK 제거, 참조만 유지) ✅
- [x] 1.2 인덱스 추가: 핵심 인덱스 추가 ✅
- [x] 1.3 AnalysisResult 암호화: 옵션 B (검색용 메타데이터 추가) ✅

### 단기 개선 (1-2주)
- [ ] 2.1 Alert 통합: 베타 후 재검토
- [x] 2.2 historical_context: 옵션 B (주석으로 구조 명시) ✅
- [x] 2.3 UserStatusLog: 개선 적용 ✅
- [x] 2.4 HuaEmotionAnalysis: 주석 추가로 개선 ✅
- [x] 2.5 Notification: 스냅샷 유지 (주석 명시) ✅
- [x] 2.6 Soft Delete: `deleted_at`만 사용 ✅

### 중장기 개선 (베타 후)
- [ ] 3.1 추가 인덱스 (일부는 이미 적용됨)
- [ ] 3.2 Enum 통일 (마이그레이션 비용 고려)
- [ ] 3.3 ApiLog 개선 (주석으로 향후 개선 방향 명시)
- [ ] 3.4 비용 추적 (주석으로 향후 개선 방향 명시)
- [x] 3.5 DecryptionLog: 베타 런칭 전 추가 ✅

---

## 다음 단계

1. **팀 논의**: 각 항목별 옵션 검토 및 결정
2. **우선순위 결정**: 베타 런칭 전 필수 vs 선택 사항
3. **마이그레이션 계획**: 결정된 사항에 대한 마이그레이션 전략 수립
4. **테스트 계획**: 변경 사항에 대한 테스트 시나리오 작성

---

## 참고 자료

- 원본 피드백: (피드백 제공자)
- 현재 스키마: `apps/my-app/prisma/schema.prisma`
- 초기 기획: `apps/my-app/docs/숨다_db_스키마_v_0.3 — 22 테이블까지 필드 설명.md`
