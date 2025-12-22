# 📊 베타 범위에 필요한 테이블 정리

> 베타 런칭에 실제로 사용되는 테이블만 정리
> 
> 작성일: 2025-11-30
> 목적: 불필요한 테이블 혼란 방지 및 구현 집중

---

## 📈 현재 스키마 테이블 현황

**총 테이블 수: 36개**

### user 스키마 (25개)
1. User
2. DiaryEntry
3. AnalysisResult
4. HuaEmotionAnalysis
5. AnalysisSystemMetadata
6. DiaryKeywords
7. Account
8. Session
9. VerificationToken
10. UserQuota
11. DataExportRequest
12. AccountDeletionRequest
13. UserConsent
14. LoginLog
15. UserStatusLog
16. ErrorLog
17. ApiLog
18. Notification
19. Announcement
20. Event
21. EventAttendance
22. Report
23. UserProfileMeta
24. UserSettings
25. (기타)

### admin 스키마 (11개)
1. ContentModerationLog
2. CrisisAlert
3. CrisisAlertLog
4. AbuseAlert
5. AiPolicyVersion
6. AiPolicyActive
7. AiOverride
8. PromptRegistry
9. DecryptionLog
10. BillingRecord
11. BackupRecord
12. AuditLog
13. PersonalDataProcessingLog

---

## 🎯 베타 범위에 실제로 필요한 테이블

### ✅ 필수 사용 테이블 (베타 범위)

#### 1. 레포트 페이지용 (1개)
- **Report** (user 스키마)
  - 리포트 데이터 저장
  - 리포트 조회

#### 2. 어드민 데이터 다운로드용 (8개)
- **User** (user 스키마)
  - 사용자 기본 정보
- **DiaryEntry** (user 스키마)
  - 일기 데이터 (복호화 필요)
- **AnalysisResult** (user 스키마)
  - 분석 결과 (복호화 필요)
- **HuaEmotionAnalysis** (user 스키마)
  - HUA 분석 데이터
- **Report** (user 스키마)
  - 리포트 데이터
- **UserProfileMeta** (user 스키마)
  - 프로필 메타데이터
- **UserSettings** (user 스키마)
  - 사용자 설정
- **DataExportRequest** (user 스키마)
  - 다운로드 요청 관리
- **DecryptionLog** (admin 스키마)
  - 법적 책임 추적

#### 3. 기존 관리자 기능용 (이미 구현되어 사용 중)
- **CrisisAlert** (admin 스키마) ✅ 이미 구현됨
  - 위기 감지 모니터링 (`/admin/monitoring/crisis`)
- **CrisisAlertLog** (admin 스키마) ✅ 이미 구현됨
  - 위기 알림 로그
- **AbuseAlert** (admin 스키마) ✅ 이미 구현됨
  - 악용 감지 모니터링 (`/admin/monitoring/abuse`)
- **ContentModerationLog** (admin 스키마) ✅ 이미 구현됨
  - 콘텐츠 검열 로그
- **ErrorLog** (user 스키마) ✅ 이미 구현됨
  - 에러 모니터링 (`/admin/monitoring/errors`)
- **ApiLog** (user 스키마) ✅ 이미 구현됨
  - API 로그
- **LoginLog** (user 스키마) ✅ 이미 구현됨
  - 로그인 로그
- **UserStatusLog** (user 스키마) ✅ 이미 구현됨
  - 사용자 상태 변경 로그
- **Notification** (user 스키마) ✅ 이미 구현됨
  - 알림 관리 (`/admin/notifications`)
- **Announcement** (user 스키마) ✅ 이미 구현됨
  - 공지사항 관리 (`/admin/announcements`)

**베타 범위 필수 테이블: 9개** (레포트 + 다운로드)  
**기존 관리자 기능 테이블: 10개** (이미 구현되어 사용 중)  
**총 베타에서 사용하는 테이블: 19개**

---

### ⚠️ 베타에서 사용하지 않지만 스키마에 존재하는 테이블 (17개)

#### 사용자 인증/세션 (베타에서 이미 사용 중)
- Account, Session, VerificationToken ✅ 이미 사용 중

#### GDPR 관련 (베타에서 사용 안 함)
- AccountDeletionRequest, UserConsent
- PersonalDataProcessingLog

#### 비용 관리 (베타에서 사용 안 함)
- UserQuota, BillingRecord

#### 이벤트 (베타에서 사용 안 함)
- Event, EventAttendance

#### AI 정책 관리 (베타에서 사용 안 함)
- AiPolicyVersion, AiPolicyActive, AiOverride, PromptRegistry

#### 백업/감사 (베타에서 사용 안 함)
- BackupRecord, AuditLog

#### 분석 메타데이터 (베타에서 사용 안 함)
- AnalysisSystemMetadata, DiaryKeywords

---

## 💡 핵심 정리

### 베타 범위에 새로 필요한 테이블: **9개**

1. **Report** - 리포트 저장/조회
2. **User** - 사용자 정보 다운로드
3. **DiaryEntry** - 일기 데이터 다운로드
4. **AnalysisResult** - 분석 결과 다운로드
5. **HuaEmotionAnalysis** - HUA 분석 다운로드
6. **UserProfileMeta** - 프로필 메타 다운로드
7. **UserSettings** - 설정 다운로드
8. **DataExportRequest** - 다운로드 요청 관리 (새로 추가)
9. **DecryptionLog** - 법적 책임 추적 (새로 추가)

### 이미 구현되어 사용 중인 관리자 기능 테이블: **10개**

1. **CrisisAlert** - 위기 감지 모니터링 ✅
2. **CrisisAlertLog** - 위기 알림 로그 ✅
3. **AbuseAlert** - 악용 감지 모니터링 ✅
4. **ContentModerationLog** - 콘텐츠 검열 ✅
5. **ErrorLog** - 에러 모니터링 ✅
6. **ApiLog** - API 로그 ✅
7. **LoginLog** - 로그인 로그 ✅
8. **UserStatusLog** - 사용자 상태 변경 로그 ✅
9. **Notification** - 알림 관리 ✅
10. **Announcement** - 공지사항 관리 ✅

### 나머지 17개 테이블은:
- ✅ **스키마에 존재하지만 베타에서 직접 사용 안 함**
- ✅ **나중에 필요할 때 사용**
- ✅ **베타 구현 시 신경 쓸 필요 없음**

---

## 🎯 구현 시 집중할 테이블

### 레포트 페이지
```typescript
// 필요한 테이블
- Report (저장/조회)
- DiaryEntry (리포트 생성 시 조회)
- AnalysisResult (리포트 생성 시 조회)
```

### 어드민 데이터 다운로드
```typescript
// 필요한 테이블
- User
- DiaryEntry
- AnalysisResult
- HuaEmotionAnalysis
- Report
- UserProfileMeta
- UserSettings
- DataExportRequest (요청 관리)
- DecryptionLog (로그 기록)
```

---

## 📝 결론

**베타 구현 시:**
- ✅ **새로 구현: 9개 테이블** (레포트 + 다운로드)
- ✅ **이미 구현되어 사용 중: 10개 테이블** (관리자 기능)
- ✅ **총 사용 테이블: 19개**
- ✅ 나머지 17개 테이블은 무시해도 됨

**36개 테이블 중:**
- **19개는 베타에서 사용** (이미 구현 10개 + 새로 구현 9개)
- **17개는 베타에서 사용 안 함** (나중에 필요할 때 사용)

**관리자 기능들은 이미 구현되어 있어서 베타에서도 계속 사용됩니다!** ✅
