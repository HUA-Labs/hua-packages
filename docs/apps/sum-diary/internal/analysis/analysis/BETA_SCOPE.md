# 🚀 베타 런칭 범위 및 구현 계획

> 베타 런칭을 위한 기능 범위 및 구현 우선순위
> 
> 작성일: 2025-11-30
> 목적: 베타 런칭에 필요한 최소 기능 집중

---

## 📋 베타 범위

### ✅ 포함 기능

1. **레포트 페이지 생성**
   - 사용자 일기 데이터 기반 리포트 생성
   - 주간/월간/연간 리포트
   - 리포트 조회 및 표시

2. **어드민 데이터 다운로드**
   - 관리자가 사용자 데이터 다운로드
   - 암호화된 데이터 복호화 후 다운로드
   - 법적 요청 대응용

---

## 📊 필요한 스키마 테이블

### ✅ 이미 준비된 테이블

#### 1. Report (user 스키마)
```prisma
model Report {
  @@schema("user")
  id           String       @id @default(uuid()) @db.Uuid
  user_id      String       @db.Uuid
  period_type  ReportPeriod
  period_start DateTime     @db.Timestamptz(6)
  period_end   DateTime     @db.Timestamptz(6)
  summary      Json?
  created_at   DateTime     @default(now()) @db.Timestamptz(6)
  user         User         @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([user_id, period_type, period_start])
  @@index([user_id, period_type, period_start])
  @@index([period_type, period_start])
}
```
- ✅ **상태**: 스키마에 이미 존재
- ✅ **용도**: 리포트 데이터 저장
- ✅ **구현**: `_future-features` 폴더에 API 코드 존재 (활성화 필요)

#### 2. DataExportRequest (user 스키마)
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
- ✅ **상태**: 스키마에 이미 추가됨 (베타 필수 항목)
- ✅ **용도**: 어드민 데이터 다운로드 요청 관리
- ⚠️ **구현**: 새로 구현 필요

#### 3. DecryptionLog (admin 스키마)
```prisma
model DecryptionLog {
  @@schema("admin")
  id          String   @id @default(uuid()) @db.Uuid
  admin_id    String   @db.Uuid // 복호화를 수행한 관리자 ID
  target_type String   // diary, user_profile, analysis_result
  target_id   String   @db.Uuid // 복호화 대상 ID
  reason      String   // CRISIS_REVIEW, ABUSE_REVIEW, LEGAL_REQUEST, USER_SUPPORT 등
  ip_address  String?  // 관리자 IP (보안 추적)
  user_agent  String?  // 관리자 User-Agent
  created_at  DateTime @default(now()) @db.Timestamptz(6)
  
  @@index([admin_id, created_at])
  @@index([target_type, target_id])
  @@index([reason])
  @@index([created_at])
}
```
- ✅ **상태**: 스키마에 이미 추가됨
- ✅ **용도**: 어드민 데이터 다운로드 시 법적 책임 추적
- ⚠️ **구현**: 새로 구현 필요

---

## 🎯 구현 우선순위

### Phase 1: 레포트 페이지 (Week 1)

#### 1.1 리포트 API 활성화
- [ ] `app/_future-features/api/reports/` → `app/api/reports/` 이동
- [ ] 리포트 생성 API 테스트
- [ ] 리포트 조회 API 테스트

#### 1.2 리포트 페이지 UI
- [ ] 리포트 목록 페이지 (`/reports`)
- [ ] 리포트 상세 페이지 (`/reports/[id]`)
- [ ] 리포트 생성 UI
  - 기간 선택 (주간/월간/연간)
  - 생성 진행 상태 표시
  - 생성 완료 알림

#### 1.3 리포트 데이터 표시
- [ ] 감정 트렌드 분석 표시
- [ ] 키워드 하이라이트
- [ ] 주요 테마 표시
- [ ] 성찰 질문 표시
- [ ] 격려 메시지 표시

**예상 작업량:** 1주 (1명 기준)

---

### Phase 2: 어드민 데이터 다운로드 (Week 2)

#### 2.1 데이터 다운로드 API
- [ ] `POST /api/admin/export` - 다운로드 요청 생성
- [ ] `GET /api/admin/export/[id]` - 다운로드 상태 조회
- [ ] `GET /api/admin/export/[id]/download` - 파일 다운로드
- [ ] **기존 스키마 데이터 수집** (새 구조 불필요)
  - `User` 테이블 데이터
  - `DiaryEntry` 테이블 데이터 (복호화)
  - `AnalysisResult` 테이블 데이터 (복호화)
  - `HuaEmotionAnalysis` 테이블 데이터
  - 관련 테이블들 (Report, UserProfileMeta, UserSettings 등)
- [ ] ZIP 파일 생성
- [ ] S3/Storage 업로드 (또는 직접 다운로드)
- [ ] 다운로드 링크 만료 처리 (7일)

#### 2.2 DecryptionLog 기록
- [ ] 다운로드 요청 시 로그 기록
- [ ] 관리자 IP, User-Agent 기록
- [ ] 다운로드 사유 기록 (LEGAL_REQUEST, USER_SUPPORT 등)
- [ ] 다운로드한 데이터 타입별 기록 (diary, user_profile, analysis_result)

#### 2.3 어드민 UI
- [ ] 사용자별 데이터 다운로드 버튼
- [ ] 다운로드 요청 목록
- [ ] 다운로드 상태 표시
- [ ] 다운로드 링크 제공 (7일 만료)

**예상 작업량:** 1주 (1명 기준)

**구현 복잡도:** 낮음 (기존 데이터 조회 + ZIP 생성)

---

## 📝 구현 상세

### 레포트 페이지

#### API 엔드포인트
```
POST /api/reports/generate
- period: WEEKLY | MONTHLY | YEARLY
- startDate: string (ISO date)
- endDate: string (ISO date)

GET /api/reports
- period: WEEKLY | MONTHLY | YEARLY
- startDate: string
- endDate: string

GET /api/reports/[id]
- 리포트 상세 조회
```

#### 리포트 데이터 구조
```typescript
interface ReportData {
  title: string;
  period: string;
  key_insights: string[];
  emotion_trends: {
    dominant: string;
    stability: 'stable' | 'unstable' | 'mixed';
    changes: Array<{ date: string; emotion: string }>;
  };
  keywords: {
    frequent: string[];
    new: string[];
    themes: string[];
  };
  reflection_questions: string[];
  encouragement: string;
  next_steps: string[];
}
```

---

### 어드민 데이터 다운로드

#### API 엔드포인트
```
POST /api/admin/export
- user_id: string
- reason: LEGAL_REQUEST | USER_SUPPORT | CRISIS_REVIEW | ABUSE_REVIEW

GET /api/admin/export/[id]
- 다운로드 요청 상태 조회

GET /api/admin/export/[id]/download
- 파일 다운로드 (7일 만료)
```

#### 다운로드 데이터 구조
```
export-[user_id]-[timestamp].zip
├── user.json                    // User 테이블 데이터
├── user_profile_meta.json       // UserProfileMeta 테이블 데이터
├── user_settings.json           // UserSettings 테이블 데이터
├── diaries/
│   ├── [diary_id].json          // DiaryEntry 데이터 (복호화된 content_enc)
│   └── ...
├── analysis_results/
│   ├── [analysis_id].json       // AnalysisResult 데이터 (복호화된 필드들)
│   └── ...
├── hua_emotion_analysis/
│   ├── [analysis_id].json      // HuaEmotionAnalysis 데이터
│   └── ...
├── reports/
│   ├── [report_id].json         // Report 데이터
│   └── ...
└── metadata.json                // 다운로드 메타데이터 (다운로드 시각, 사유 등)
```

**데이터 수집 방식:**
- 기존 Prisma 쿼리로 데이터 조회
- 암호화된 필드 복호화 (`decryptDiary`, `decryptAnalysisResult` 등)
- JSON 파일로 변환 후 ZIP 압축
- **새로운 데이터 구조나 필드 추가 불필요** (기존 스키마 그대로 사용)

#### 보안 고려사항
- ✅ 암호화된 데이터 복호화 (기존 복호화 함수 사용)
- ✅ ZIP 파일 저장 (S3 또는 로컬 스토리지)
- ✅ 다운로드 링크 7일 만료
- ✅ DecryptionLog 기록 (법적 책임 추적)
- ✅ 관리자 권한 확인
- ✅ 다운로드 요청 시 DataExportRequest 기록

---

## 🔒 보안 및 컴플라이언스

### 필수 구현
- [x] DecryptionLog 기록 (법적 책임 추적)
- [x] DataExportRequest 테이블 (스키마 준비 완료)
- [ ] 관리자 권한 확인
- [ ] 다운로드 링크 만료 처리
- [ ] 기존 데이터 조회 및 복호화
- [ ] ZIP 파일 생성 및 저장

### 권장 구현
- [ ] 다운로드 요청 승인 프로세스 (2단계 인증)
- [ ] 다운로드 이력 대시보드
- [ ] 자동 만료 파일 정리 (Cron Job)

---

## 📊 스키마 상태

### 📈 현재 스키마 현황
- **총 테이블 수: 36개** (user: 25개, admin: 11개)
- **베타에서 실제 사용: 19개** (이미 구현 10개 + 새로 구현 9개)

### ✅ 베타 범위에 필요한 테이블

#### 새로 구현할 테이블 (9개)
**레포트 페이지용:**
- [x] `Report` - 리포트 데이터 저장/조회

**어드민 데이터 다운로드용:**
- [x] `User` - 사용자 정보
- [x] `DiaryEntry` - 일기 데이터 (복호화)
- [x] `AnalysisResult` - 분석 결과 (복호화)
- [x] `HuaEmotionAnalysis` - HUA 분석 데이터
- [x] `UserProfileMeta` - 프로필 메타데이터
- [x] `UserSettings` - 사용자 설정
- [x] `DataExportRequest` - 다운로드 요청 관리
- [x] `DecryptionLog` - 법적 책임 추적

#### 이미 구현되어 사용 중인 테이블 (10개)
**관리자 기능:**
- [x] `CrisisAlert` - 위기 감지 모니터링 ✅
- [x] `CrisisAlertLog` - 위기 알림 로그 ✅
- [x] `AbuseAlert` - 악용 감지 모니터링 ✅
- [x] `ContentModerationLog` - 콘텐츠 검열 ✅
- [x] `ErrorLog` - 에러 모니터링 ✅
- [x] `ApiLog` - API 로그 ✅
- [x] `LoginLog` - 로그인 로그 ✅
- [x] `UserStatusLog` - 사용자 상태 변경 로그 ✅
- [x] `Notification` - 알림 관리 ✅
- [x] `Announcement` - 공지사항 관리 ✅

**총 베타에서 사용하는 테이블: 19개**

### ⚠️ 베타에서 사용하지 않는 테이블 (17개)
- 나머지 테이블들은 스키마에 존재하지만 **베타 구현 시 신경 쓸 필요 없음**
- 나중에 필요할 때 사용하면 됨
- 자세한 내용: `docs/BETA_REQUIRED_TABLES.md` 참고

### ⚠️ 구현 필요
- [ ] 리포트 API 활성화
- [ ] 리포트 페이지 UI
- [ ] 어드민 다운로드 API (9개 테이블 데이터 조회 + ZIP 생성)
- [ ] 어드민 다운로드 UI

### ✅ 스키마 변경 불필요
- 기존 테이블에서 데이터 조회만 하면 됨
- 필요 시 필드 추가 가능 (nullable 필드로 안전하게 추가)

---

## 🎯 베타 런칭 체크리스트

### 필수 기능
- [ ] 리포트 생성 기능
- [ ] 리포트 조회 기능
- [ ] 리포트 페이지 UI
- [ ] 어드민 데이터 다운로드 요청
- [ ] 어드민 데이터 다운로드 파일 생성
- [ ] DecryptionLog 기록

### 선택 기능 (베타 후)
- [ ] 리포트 공유 기능
- [ ] 리포트 PDF 내보내기
- [ ] 다운로드 요청 승인 프로세스
- [ ] 다운로드 이력 대시보드

---

## 📅 예상 일정

**Week 1: 레포트 페이지**
- 리포트 API 활성화 및 테스트
- 리포트 페이지 UI 구현
- 리포트 데이터 표시

**Week 2: 어드민 데이터 다운로드**
- 다운로드 API 구현
- DecryptionLog 기록
- 어드민 UI 구현

**총 예상 작업량:** 2주 (1명 기준)

---

## 🚀 다음 단계

1. **스키마 확인**: 모든 필요한 테이블이 준비되어 있음 ✅
2. **Prisma Client 재생성**: `pnpm db:generate:local`
3. **레포트 API 활성화**: `_future-features` → `api` 이동
4. **레포트 페이지 구현**: UI 개발
5. **어드민 다운로드 구현**: 
   - 기존 데이터 조회 (Prisma 쿼리)
   - 복호화 (기존 함수 사용)
   - ZIP 생성
   - 다운로드 제공

**스키마는 완벽하게 준비되어 있으며, 데이터 다운로드는 기존 스키마에서 데이터를 뽑아서 ZIP으로 묶어주는 간단한 작업입니다!** ✅
