# HUA Platform Database Schema

> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 스키마 문서

## 개요

HUA Platform의 데이터베이스 스키마 문서입니다. PostgreSQL을 사용하며, Prisma ORM으로 관리됩니다.

**스키마 분리:**
- `user` 스키마: 사용자 데이터, 일기, 분석 결과
- `admin` 스키마: 관리자 전용 데이터 (위기/악용 알림, 비용 관리 등)

## 데이터베이스 설정

```prisma
generator client {
  provider        = "prisma-client"
  previewFeatures = ["driverAdapters"]
  output          = "../../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  schemas  = ["user", "admin"]
}
```

---

## Enum 정의

### UserState
```prisma
enum UserState {
  active
  inactive
  resigned
  banned
}
```

### UserRole
```prisma
enum UserRole {
  USER
  ADMIN
}
```

### EmotionTag
```prisma
enum EmotionTag {
  joy
  sadness
  anger
  fear
  surprise
  disgust
  hope
  anxiety
  peace
  excitement
  calm
  frustration
  contentment
  love
}
```

### SlipLevel
```prisma
enum SlipLevel {
  none
  soft
  hard
}
```

### NotificationType
```prisma
enum NotificationType {
  notice
  system
  event
  announcement
}
```

### AnalysisProvider
```prisma
enum AnalysisProvider {
  OPENAI
  GEMINI
  HUA_ENGINE
  MOCK
}
```

### AnalysisStatus
```prisma
enum AnalysisStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

### CrisisType
```prisma
enum CrisisType {
  SUICIDE
  SELF_HARM
  DRUG
  CHILD_ABUSE
  SERIOUS_MEDICAL
  TERRORISM
}
```

### CrisisAlertStatus
```prisma
enum CrisisAlertStatus {
  PENDING
  CONFIRMED
  FALSE_POSITIVE
  HANDLED
  DISMISSED
}
```

### AbusePattern
```prisma
enum AbusePattern {
  RAPID_REQUESTS
  REPETITIVE_CONTENT
  SUSPICIOUS_PROMPTS
  TOKEN_ABUSE
  MULTI_ACCOUNT
  API_SCRAPING
}
```

### PenaltyLevel
```prisma
enum PenaltyLevel {
  WARNING
  RATE_LIMIT
  TEMPORARY_BAN
  PERMANENT_BAN
}
```

### AbuseAlertStatus
```prisma
enum AbuseAlertStatus {
  PENDING
  REVIEWED
  FALSE_POSITIVE
  ACTION_TAKEN
  DISMISSED
}
```

### ErrorSeverity
```prisma
enum ErrorSeverity {
  info
  warn
  error
  fatal
}
```

### ContactInquiryStatus
```prisma
enum ContactInquiryStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  CLOSED
}
```

---

## 핵심 모델 (user 스키마)

### User (사용자)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `email_hash`: SHA-256 해시 (검색용, unique)
- `nickname_hash`: SHA-256 해시 (검색용, unique)
- `state`: UserState (active, inactive, resigned, banned)
- `role`: UserRole (USER, ADMIN)
- `name_enc`, `email_enc`, `nickname_enc`: 암호화된 개인정보 (Bytes)
- `password_hash`: 비밀번호 해시 (Credentials 인증용)
- `profile_image`: 프로필 이미지 URL

**인덱스:**
- `email_hash`: 이메일 검색
- `nickname_hash`: 닉네임 검색
- `state`: 상태별 조회
- `role`: 역할별 조회
- `created_at`: 생성일 기준 조회

**관계:**
- `accounts`: 소셜 로그인 계정
- `sessions`: 세션
- `diaries`: 일기 목록
- `quota`: 할당량 정보
- `settings`: 사용자 설정
- `notifications`: 알림 목록
- `login_logs`: 로그인 로그
- `api_logs`: API 로그
- `abuse_alerts`: 악용 알림

### DiaryEntry (일기)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (외래 키)
- `title`: 일기 제목 (평문, nullable)
- `content_enc`: 암호화된 일기 내용 (Bytes)
- `diary_date`: 사용자가 선택한 일기 날짜
- `actual_written_at`: 실제 작성 시간
- `is_delayed_entry`: 지연된 일기 작성 여부
- `exclude_from_analysis`: 데이터 분석 제외 플래그 (악용 탐지용)
- `deleted_at`: 소프트 삭제 시각
- `deleted_by`: 삭제한 사용자 ID

**인덱스:**
- `[user_id, created_at]`: 사용자별 일기 조회
- `[user_id, diary_date]`: 일기 날짜 조회
- `[deleted_at]`: 소프트 삭제 필터링 (NULL 체크 최적화)
- `[user_id, deleted_at]`: 사용자별 삭제된 일기 조회
- `[exclude_from_analysis]`: 분석 제외 필터링
- `[title]`: 제목 검색 (임시저장 조회, startsWith 쿼리 최적화) ✅
- `[user_id, title]`: 사용자별 title 조회 최적화 ✅
- `[user_id, is_delayed_entry]`: 지연 작성 필터링
- `[diary_date, is_delayed_entry]`: 날짜 + 지연 조합

**관계:**
- `user`: 작성자
- `analysis_results`: AI 분석 결과
- `keywords`: 키워드 정보
- `abuse_alerts`: 악용 알림

### AnalysisResult (AI 분석 결과)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `diary_id`: 일기 ID (외래 키)
- `provider`: AnalysisProvider (OPENAI, GEMINI, HUA_ENGINE)
- `status`: AnalysisStatus (PENDING, PROCESSING, COMPLETED, FAILED)

**암호화된 분석 결과:**
- `title_enc`: 암호화된 제목
- `summary_enc`: 암호화된 요약
- `emotion_flow_enc`: 암호화된 감정 흐름
- `reflection_question_enc`: 암호화된 자기성찰 질문
- `interpretation_enc`: 암호화된 해석
- `raw_ai_response_enc`: 암호화된 원본 AI 응답

**메타데이터 (평문):**
- `mode`: 모드 (empathy, analysis, suggestion, praise, playful)
- `tone`: 톤 (gentle, warm, cheerful, quirky, delicate)
- `affect_tier`: 감정 강도 (Float, 1.0-5.0)
- `momentum_tier`: 몰입도 (Float, 1.0-5.0)
- `ethics`: 윤리 태그 (String[])
- `confidence`: 신뢰도 (Float)
- `primary_emotions`: 주요 감정 태그 (EmotionTag[])
- `slip`: 슬립 레벨 (SlipLevel)

**검색용 메타데이터 (평문, 검색 최적화):** ✅
- `emotion_keywords`: 감정 키워드 배열 (String[], GIN 인덱스) - 검색용 감정 키워드 (감정 태그 기반)
- `summary_topics`: 토픽 태그 배열 (String[], GIN 인덱스) - 검색용 토픽 태그 (주요 주제만)

**비용 추적:**
- `input_tokens`: 입력 토큰 수
- `output_tokens`: 출력 토큰 수
- `cost_usd`: 비용 (USD, Decimal)

**기술 메타데이터:**
- `model_name`: 모델 이름
- `model_version`: 모델 버전
- `prompt_version`: 프롬프트 버전
- `tokens`: 전체 토큰 수 (하위 호환성)
- `latency`: 응답 지연 시간 (ms)

**인덱스:**
- `[diary_id, created_at]`: 일기별 분석 결과 조회
- `[provider, status]`: 프로바이더별 상태 조회
- `[provider, status, created_at]`: 프로바이더별 상태 조회 (성능 개선) ✅
- `[model_name, model_version]`: 모델 버전별 조회 ✅
- `[tokens]`: 비용 분석용 ✅
- `[latency]`: 성능 모니터링용 ✅
- `[emotion_keywords]`: 감정 키워드 검색 (GIN) ✅
- `[summary_topics]`: 토픽 검색 (GIN) ✅
- `[created_at, cost_usd]`: 일별 비용 분석 ✅
- `[provider, cost_usd]`: 프로바이더별 비용 분석 ✅

**관계:**
- `diary`: 일기
- `hua_analysis`: HUA 감정 엔진 분석 결과
- `system_metadata`: 시스템 메타데이터
- `abuse_alerts`: 악용 알림

### HuaEmotionAnalysis (HUA 감정 엔진 분석)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `analysis_result_id`: 분석 결과 ID (외래 키, unique)

**규칙 기반 메트릭:**
- `coordinates`: 감정 좌표 (Json, {valence, arousal})
- `entropy`: 엔트로피 (Float)
- `dominant_emotion`: 주요 감정 (String)
- `emotion_density`: 감정 밀도 (Float)
- `tense_changes`: 시제 변화 횟수 (Int)
- `first_person_freq`: 1인칭 사용 빈도 (Float)
- `transitions`: 감정 전환 데이터 (Json)

**AI 기반 메트릭:**
- `ai_entropy`: LLM 추론 엔트로피
- `ai_density`: LLM 추론 밀도
- `ai_transitions`: LLM 추론 전환 횟수
- `ai_diversity`: LLM 추론 다양성
- `ai_dominant_ratio`: LLM 추론 주요 감정 비율
- `ai_dominant_emotion`: LLM 추론 주요 감정

**데이터분석가용 고급 필드:**
- `emotion_timeline`: 시간순 감정 변화 데이터 (Json)
- `sentiment_score`: 전체 감정 점수 (Float, -1 ~ 1)
- `complexity_metrics`: 복잡성 분석 메트릭 (Json)
- `visualization_data`: 시각화용 데이터 (Json)

**인덱스:**
- `[analysis_result_id]`: 분석 결과별 조회
- `[entropy, emotion_density]`: 메트릭 분석

### AnalysisSystemMetadata (시스템 메타데이터)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `analysis_result_id`: 분석 결과 ID (외래 키, unique)
- `risk_factors`: 위험 요소 (String[])
- `content_flags`: 콘텐츠 플래그 (String[], analysisTags)
- `moderation_score`: 검열 점수 (Float)
- `quality_score`: 품질 점수 (Float)
- `api_calls_count`: API 호출 횟수
- `total_cost`: 총 비용 (Float)
- `retry_count`: 재시도 횟수
- `last_error`: 마지막 에러 (String)
- `error_count`: 에러 횟수

**인덱스:**
- `[analysis_result_id]`: 분석 결과별 조회
- `[risk_factors]`: 위험 요소 검색
- `[quality_score]`: 품질 점수 분석

### DiaryKeywords (키워드)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `diary_id`: 일기 ID (외래 키, unique)
- `keywords`: 키워드 배열 (String[])
- `topics`: 주제 배열 (String[])
- `sentiment`: 감정 (String, default: "neutral")
- `emotion_tags`: 감정 태그 (EmotionTag[])
- `activities`: 활동 배열 (String[])
- `extracted_at`: 추출 시각

**인덱스:**
- `[diary_id]`: 일기별 키워드 조회
- `[extracted_at]`: 추출일 기준 조회
- `[sentiment]`: 감정별 필터링

### UserQuota (할당량)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (외래 키, unique)

**할당량 제한:**
- `daily_diary_limit`: 일일 일기 제한 (Int, default: 10)
- `monthly_diary_limit`: 월간 일기 제한 (Int, default: 300)
- `daily_analysis_limit`: 일일 분석 제한 (Int, default: 10)
- `monthly_analysis_limit`: 월간 분석 제한 (Int, default: 300)

**현재 사용량:**
- `daily_diary_count`: 일일 일기 사용량
- `monthly_diary_count`: 월간 일기 사용량
- `daily_analysis_count`: 일일 분석 사용량
- `monthly_analysis_count`: 월간 분석 사용량

**리셋 시각:**
- `daily_reset_at`: 일일 리셋 시각
- `monthly_reset_at`: 월간 리셋 시각

**기타:**
- `is_premium`: 프리미엄 여부 (Boolean)

**인덱스:**
- `[user_id]`: 사용자별 할당량 조회
- `[daily_reset_at]`: 일일 리셋 작업용
- `[monthly_reset_at]`: 월간 리셋 작업용

### UserSettings (사용자 설정)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (외래 키, unique)
- `ai_provider`: AI 프로바이더 (AnalysisProvider, default: OPENAI)
- `analysis_depth`: 분석 깊이 (String, default: "standard")
- `email_notifications`: 이메일 알림 (Boolean)
- `push_notifications`: 푸시 알림 (Boolean)
- `preferred_tone`: 선호하는 분석 톤 (String)
- `language`: 언어 설정 (String, default: "ko")
- `output_language`: 출력 언어 (OutputLanguage, default: KO)

**인덱스:**
- `[user_id]`: 사용자별 설정 조회
- `[ai_provider]`: 프로바이더별 사용자 조회

### Account (소셜 로그인 계정)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `userId`: 사용자 ID (외래 키)
- `type`: 계정 타입 (String)
- `provider`: 프로바이더 (String, "kakao", "google" 등)
- `providerAccountId`: 프로바이더 계정 ID (String)
- `refresh_token`, `access_token`: OAuth 토큰
- `expires_at`: 토큰 만료 시각

**인덱스:**
- `[provider, providerAccountId]`: 프로바이더별 계정 조회 (unique)

### Session (세션)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `sessionToken`: 세션 토큰 (unique)
- `userId`: 사용자 ID (외래 키)
- `expires`: 만료 시각
- `ip_address`: 세션 IP 주소
- `user_agent`: User-Agent
- `device_id`: 디바이스 식별자
- `last_activity`: 마지막 활동 시각

**인덱스:**
- `[userId, last_activity]`: 휴면 세션 정리
- `[device_id]`: 디바이스별 세션 관리
- `[expires]`: 만료된 세션 정리

### Notification (알림)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (외래 키, nullable)
- `type`: 알림 타입 (NotificationType)
- `title`: 제목
- `message`: 메시지
- `read`: 읽음 여부 (Boolean)
- `visible_from`: 표시 시작 시각
- `visible_to`: 표시 종료 시각
- `announcement_id`: 공지사항 ID (외래 키, nullable)
- `event_id`: 이벤트 ID (외래 키, nullable, 향후 사용 예정)
- `title_snapshot`, `body_snapshot`: 삭제된 공지사항 스냅샷

**인덱스:**
- `[user_id, created_at]`: 사용자별 알림 조회
- `[user_id, read, created_at]`: 읽지 않은 알림 조회
- `[read]`: 읽음 여부 필터링
- `[type]`: 타입별 필터링

### Announcement (공지사항)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `title`: 제목
- `body`: 내용
- `tags`: 태그 배열 (String[])
- `published_at`: 발행 시각
- `expires_at`: 만료 시각
- `deleted_at`: 삭제 시각 (소프트 삭제)

**인덱스:**
- `[published_at, expires_at]`: 발행/만료 기간 조회
- `[tags]`: 태그 검색

### LoginLog (로그인 로그)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (외래 키, nullable)
- `is_guest`: 게스트 여부 (Boolean)
- `ip`: IP 주소
- `device`: 디바이스 정보
- `ua`: User-Agent
- `action`: 액션 (String, "diary_write", "diary_analyze", "login", "logout" 등)
- `success`: 성공 여부 (Boolean)

**인덱스:**
- `[user_id, created_at]`: 사용자별 로그 조회
- `[is_guest, created_at]`: 게스트 로그 조회
- `[ip, created_at]`: IP별 로그 조회
- `[ip, action, created_at]`: 이상 행위 탐지

### UserStatusLog (사용자 상태 변경 로그)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (외래 키)
- `old_state`: 이전 상태 (UserState)
- `new_state`: 새 상태 (UserState)
- `changed_by`: 변경한 관리자 ID (String? @db.Uuid, nullable) ✅
- `reason_type`: 사유 타입 (String, "MANUAL", "AUTO_BAN", "CRISIS_DETECTED", "ABUSE_DETECTED", "AUTO_INACTIVITY" 등) ✅
- `reason_code`: 상세 사유 코드 (String) ✅
- `crisis_alert_id`: 위기 알림 ID (String? @db.Uuid, 참조, FK 없음) ✅
- `abuse_alert_id`: 악용 알림 ID (String? @db.Uuid, 참조, FK 없음) ✅

**인덱스:**
- `[user_id, changed_at]`: 사용자별 상태 변경 이력
- `[old_state, new_state]`: 상태 변경 패턴 분석
- `[reason_type, changed_at]`: 사유별 분석 ✅
- `[reason_code, changed_at]`: 상세 사유별 분석 ✅
- `[crisis_alert_id]`: 위기 알림별 추적 ✅
- `[abuse_alert_id]`: 악용 알림별 추적 ✅

### ApiLog (API 로그)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (외래 키, nullable)
- `method`: HTTP 메서드 (String)
- `endpoint`: 엔드포인트 (String)
- `status_code`: 상태 코드 (Int)
- `latency_ms`: 응답 지연 시간 (ms)

**인덱스:**
- `[user_id, created_at]`: 사용자별 API 로그
- `[method, endpoint, created_at]`: 엔드포인트별 로그
- `[endpoint, created_at]`: 엔드포인트별 로그 (추가)
- `[status_code]`: 상태 코드별 필터링
- `[status_code, created_at]`: 에러율 분석 ✅
- `[latency_ms]`: 성능 분석 ✅

### ErrorLog (에러 로그)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `severity`: 심각도 (ErrorSeverity)
- `message`: 에러 메시지 (String)
- `stack`: 스택 트레이스 (String)
- `service`: 서비스 이름 (String)
- `ref_table`: 참조 테이블 (String)
- `ref_id`: 참조 ID (String)
- `extra`: 추가 정보 (Json)

**인덱스:**
- `[service, created_at]`: 서비스별 에러 추적
- `[severity, created_at]`: 심각도별 분석
- `[extra]`: 추가 정보 검색 (GIN)

---

## 관리자 모델 (admin 스키마)

### CrisisAlert (위기 알림)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (참조, FK 없음)
- `diary_id`: 일기 ID (참조, FK 없음)
- `analysis_result_id`: 분석 결과 ID (참조, FK 없음)
- `crisis_types`: 위기 타입 배열 (CrisisType[])
- `risk_level`: 위험도 (Int, 0-4)
- `status`: 상태 (CrisisAlertStatus)
- `ai_detected`: AI 감지 여부 (Boolean)
- `ai_ethics_tags`: AI 생성 ethics 태그 (String[])
- `ai_confidence`: AI 감지 신뢰도 (Float)
- `keyword_detected`: 키워드 감지 여부 (Boolean)
- `detected_patterns`: 감지된 패턴 (String[])
- `diary_excerpt`: 익명화된 일기 발췌 (Text)
- `diary_full_anonymized`: 익명화된 전체 일기 (Text)
- `reidentification_risk`: 재식별 위험도 (String)
- `reidentification_reason`: 재식별 위험 평가 근거 (Text)
- `historical_context`: 히스토리 컨텍스트 (Json)
- `reviewed_by`: 검토한 관리자 ID (참조, FK 없음)
- `reviewed_at`: 검토 시각
- `admin_notes`: 관리자 메모 (Text)
- `action_taken`: 취한 조치 (String)

**인덱스:**
- `[user_id]`: 사용자별 위기 알림
- `[status, created_at]`: 상태별 시간순 조회 ✅
- `[risk_level]`: 위험도별 필터링
- `[user_id, risk_level, created_at]`: 사용자별 위험도 추이 ✅
- `[crisis_types]`: 위기 타입별 필터링
- `[ai_confidence]`: 신뢰도 분석용 ✅
- `[ai_detected, keyword_detected]`: 감지 방식별 분석 ✅
- `[reidentification_risk]`: 재식별 위험도 분석 ✅

### CrisisAlertLog (위기 알림 로그)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `crisis_alert_id`: 위기 알림 ID (외래 키)
- `admin_id`: 관리자 ID (참조, FK 없음)
- `action_type`: 액션 타입 (String, "VIEW", "STATUS_CHANGE", "NOTE_ADDED" 등)
- `action_details`: 액션 상세 정보 (Json)
- `ip_address`: 관리자 IP
- `user_agent`: 관리자 User-Agent

**인덱스:**
- `[crisis_alert_id]`: 알림별 로그 조회
- `[admin_id]`: 관리자별 활동 추적
- `[action_type]`: 액션 타입별 분석

### AbuseAlert (악용 알림)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (외래 키, user 스키마)
- `diary_id`: 일기 ID (외래 키, user 스키마, nullable)
- `analysis_result_id`: 분석 결과 ID (외래 키, user 스키마, nullable)
- `alert_type`: 알림 타입 (AlertType, default: ABUSE)
- `abuse_patterns`: 악용 패턴 배열 (AbusePattern[])
- `penalty_level`: 제재 레벨 (PenaltyLevel, default: WARNING)
- `status`: 상태 (AbuseAlertStatus, default: PENDING)
- `content_flags`: 콘텐츠 플래그 (String[], analysisTags)
- `detected_patterns`: 감지된 패턴 (String[])
- `exclude_from_analysis`: 분석 제외 여부 (Boolean)
- `diary_excerpt`: 익명화된 일기 발췌 (Text)
- `reviewed_by`: 검토한 관리자 ID (참조, FK 없음)
- `reviewed_at`: 검토 시각
- `admin_notes`: 관리자 메모 (Text)
- `action_taken`: 취한 조치 (String)

**인덱스:**
- `[user_id]`: 사용자별 악용 알림
- `[status, created_at]`: 상태별 시간순 조회 ✅
- `[penalty_level]`: 제재 레벨별 필터링
- `[user_id, penalty_level, created_at]`: 사용자별 제재 레벨 추이 ✅
- `[alert_type, status]`: 타입별 상태 조회 ✅
- `[abuse_patterns]`: 악용 패턴별 필터링

### BillingRecord (비용 집계)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (참조, FK 없음)
- `period`: 기간 (String, "YYYY-MM" 형식)

**집계:**
- `total_diaries`: 총 일기 수 (Int)
- `total_analyses`: 총 분석 수 (Int)
- `total_tokens`: 총 토큰 수 (Int)
- `total_cost_usd`: 총 비용 USD (Decimal)

**프로바이더별 비용:**
- `openai_cost`: OpenAI 비용 (Decimal)
- `gemini_cost`: Gemini 비용 (Decimal)
- `hua_cost`: HUA 비용 (Decimal)

**인덱스:**
- `[user_id, period]`: 사용자별 기간별 조회 (unique)
- `[period]`: 기간별 집계
- `[total_cost_usd]`: 고액 사용자 탐지

### ContactInquiry (문의하기)

**상태:** 사용 중

**주요 필드:**
- `id`: UUID (기본 키)
- `user_id`: 사용자 ID (참조, FK 없음, nullable)
- `name`: 이름 (String)
- `email`: 이메일 (String)
- `subject`: 제목 (String)
- `message`: 문의 내용 (Text)
- `status`: 상태 (ContactInquiryStatus, default: PENDING)
- `ip_address`: IP 주소 (String)
- `user_agent`: User-Agent (String)
- `admin_note`: 관리자 메모 (Text)
- `resolved_at`: 해결 시각

**인덱스:**
- `[status, created_at]`: 상태별 시간순 조회
- `[email, created_at]`: 이메일별 조회
- `[ip_address, created_at]`: IP별 Rate Limiting 최적화

---

## 향후 사용 예정 모델

다음 모델들은 스키마에 정의되어 있으나 현재 코드베이스에서 사용되지 않습니다. 향후 기능 확장 시 사용 예정입니다.

### Report (리포트)

**상태:** 향후 사용 예정 (`_future-features` 폴더에만 구현)

**용도:** 주간/월간/연간 리포트 생성

**주요 필드:**
- `user_id`: 사용자 ID
- `period_type`: 리포트 기간 (ReportPeriod)
- `period_start`, `period_end`: 기간 시작/종료
- `summary`: 리포트 요약 (Json)

### Event, EventAttendance (이벤트 및 참석)

**상태:** 향후 사용 예정

**용도:** 이벤트 관리 및 참석 추적

**주요 필드:**
- `Event`: 이벤트 정보 (제목, 설명, 시작/종료 날짜)
- `EventAttendance`: 사용자별 이벤트 참석 정보 (연속 작성일, 보상 코드 등)

### UserProfileMeta (사용자 프로필 메타데이터)

**상태:** 향후 사용 예정

**용도:** 사용자 프로필 확장 정보 (MBTI, 작성 스타일, 선호 감정 등)

**주요 필드:**
- `mbti`: MBTI 타입
- `writing_style`: 작성 스타일
- `preferred_emotions`: 선호 감정 태그
- `personality_traits`: 성격 특성
- `interests`: 관심사
- `goals`: 목표
- `challenges`: 도전 과제

### GDPR 준비 모델

**상태:** 향후 사용 예정 (유럽 사용자 있으면 필수)

**모델:**
- `DataExportRequest`: 데이터 내보내기 요청
- `AccountDeletionRequest`: 계정 삭제 요청
- `UserConsent`: 사용자 동의 관리

### 백업 및 감사 모델

**상태:** 향후 사용 예정

**모델:**
- `BackupRecord`: 백업 기록
- `AuditLog`: 감사 로그 (현재 ApiLog 활용)
- `PersonalDataProcessingLog`: 개인정보 처리 내역 (GDPR Article 30)

### AI 정책 관리 모델

**상태:** 향후 사용 예정

**모델:**
- `AiPolicyVersion`: AI 정책 버전 관리
- `AiPolicyActive`: 활성 AI 정책
- `AiOverride`: AI 정책 오버라이드
- `PromptRegistry`: 프롬프트 레지스트리

### 기타 모델

**상태:** 향후 사용 예정

**모델:**
- `DecryptionLog`: 복호화 로그 (법적 책임 추적)
- `ContentModerationLog`: 콘텐츠 검열 로그 (현재 사용 안 함)

---

## 주요 특징

### 보안

- **암호화 우선**: 모든 개인정보는 AES-256-GCM으로 암호화 (`*_enc` 필드)
- **해시 기반 검색**: 이메일/닉네임은 해시로 저장하여 검색 (`*_hash` 필드)
- **스키마 분리**: `user` 스키마와 `admin` 스키마로 데이터 격리
- **Cross-Schema 참조**: FK 없이 참조만 유지 (Prisma 제약 회피, 애플리케이션 레벨 무결성 관리)

### 성능 최적화

- **전략적 인덱싱**: 복합 인덱스, GIN 인덱스 (배열 필드)
  - `DiaryEntry.title`: 임시저장 조회 최적화 (`startsWith` 쿼리)
  - `ContactInquiry.ip_address`: Rate Limiting 최적화
  - `AnalysisResult.emotion_keywords`, `summary_topics`: GIN 인덱스로 배열 검색
- **소프트 삭제**: `deleted_at` 필드로 물리적 삭제 방지 (NULL 체크로 삭제 여부 판별)
- **연결 풀 최적화**: 서버리스 환경 2개, 일반 서버 10개
- **Write Hotspot 방지**: `UserQuota`를 `User`와 분리하여 동시성 문제 방지

### 데이터 일관성

- **트랜잭션 보장**: Prisma 트랜잭션으로 원자적 처리
- **외래 키 제약**: CASCADE, SET NULL 등 적절한 삭제 정책
- **타임스탬프**: `created_at`, `updated_at` 자동 관리
- **스키마 간 참조**: FK 없이 참조만 유지 (애플리케이션 레벨 무결성 관리)

---

## 마이그레이션

스키마 변경 시 다음 명령어를 사용하세요:

```bash
# 마이그레이션 생성
pnpm run db:migrate

# 마이그레이션 적용 (프로덕션)
pnpm run db:push

# Prisma Client 재생성
pnpm run db:generate
```

## Prisma Studio

데이터베이스를 시각적으로 관리하려면:

```bash
pnpm run db:studio
# 브라우저에서 http://localhost:5555 접속
```

---

## 스키마 개선 이력

### 적용된 개선 사항 (2025-11-30 ~ 2025-12-16)

#### 1. 인덱스 최적화 ✅
- **DiaryEntry.title 인덱스 추가**: 임시저장 조회 성능 개선 (50-80% 향상 예상)
  - `@@index([title])`: title startsWith 쿼리 최적화
  - `@@index([user_id, title])`: 사용자별 title 조회 최적화
- **ContactInquiry.ip_address 인덱스 추가**: Rate Limiting 성능 개선 (90% 이상 향상 예상)
  - `@@index([ip_address, created_at])`: IP별 최근 문의 조회 최적화
- **AnalysisResult 쿼리 최적화**: 프로바이더별, 모델별, 비용 분석 인덱스 추가
  - `@@index([provider, status, created_at])`: 프로바이더별 상태 조회
  - `@@index([model_name, model_version])`: 모델 버전별 조회
  - `@@index([tokens])`, `@@index([latency])`: 비용/성능 분석
  - `@@index([created_at, cost_usd])`: 일별 비용 분석
- **CrisisAlert/AbuseAlert 인덱스 추가**: 상태별, 위험도별 조회 최적화
  - `@@index([status, created_at])`: 상태별 시간순 조회
  - `@@index([user_id, risk_level, created_at])`: 사용자별 위험도 추이
  - `@@index([ai_confidence])`: 신뢰도 분석

#### 2. 소프트 삭제 개선 ✅
- **`is_deleted` 필드 제거**: `deleted_at`만 사용하여 일관성 향상
- **인덱스 최적화**: `[deleted_at]`, `[user_id, deleted_at]` 인덱스 추가
- **NULL 체크 최적화**: `deleted_at IS NOT NULL`로 삭제 여부 판별

#### 3. AnalysisResult 검색 기능 개선 ✅
- **검색용 메타데이터 추가**: 암호화된 필드와 별도로 검색 가능한 필드 추가
  - `emotion_keywords`: 감정 키워드 배열 (GIN 인덱스)
  - `summary_topics`: 토픽 태그 배열 (GIN 인덱스)
- **GIN 인덱스 적용**: 배열 필드 검색 성능 최적화

#### 4. UserStatusLog 개선 ✅
- **명확한 참조 필드 추가**: `crisis_alert_id`, `abuse_alert_id` 추가
- **reason_type 명확화**: MANUAL, AUTO_BAN, CRISIS_DETECTED, ABUSE_DETECTED 등
- **인덱스 추가**: `[reason_type, changed_at]`, `[crisis_alert_id]`, `[abuse_alert_id]`

#### 5. JSON 필드 구조 명시 ✅
- **historical_context 주석 추가**: JSON 구조를 주석으로 명시
- **향후 확장성 고려**: 필요 시 별도 테이블로 분리 가능

### 향후 개선 계획

#### 단기 (1-2주)
- [ ] 성능 모니터링: 추가된 인덱스의 실제 성능 개선 효과 측정
- [ ] 쿼리 패턴 분석: 실제 사용 패턴 기반 추가 인덱스 검토

#### 중기 (1-3개월)
- [ ] Alert 통합 검토: CrisisAlert와 AbuseAlert 통합 가능성 재검토
- [ ] Enum 통일: UserState를 대문자로 통일 검토 (마이그레이션 비용 고려)
- [ ] ApiLog 개선: `endpoint_normalized`, `error_message`, `error_code` 필드 추가 검토

#### 장기 (3개월 이상)
- [ ] 파티셔닝 전략: AuditLog, PersonalDataProcessingLog 파티셔닝 구현
- [ ] 읽기 복제: 읽기 전용 쿼리 분산
- [ ] 아카이빙 전략: 오래된 로그 데이터 아카이빙

## 쿼리 최적화 가이드

### 자주 사용되는 쿼리 패턴

#### 1. 임시저장 조회
```prisma
// 최적화됨: title 인덱스 활용
diary.findMany({
  where: {
    user_id: userId,
    title: { startsWith: '임시저장' }
  }
})
```

#### 2. 사용자별 일기 조회
```prisma
// 최적화됨: [user_id, created_at] 복합 인덱스 활용
diary.findMany({
  where: { user_id: userId },
  orderBy: { created_at: 'desc' }
})
```

#### 3. 분석 결과 검색
```prisma
// 최적화됨: GIN 인덱스 활용
analysisResult.findMany({
  where: {
    emotion_keywords: { has: 'joy' },
    summary_topics: { has: 'work' }
  }
})
```

#### 4. 위기 알림 조회
```prisma
// 최적화됨: [status, created_at] 인덱스 활용
crisisAlert.findMany({
  where: {
    status: 'PENDING',
    risk_level: { gte: 3 }
  },
  orderBy: { created_at: 'desc' }
})
```

### 성능 모니터링

#### 인덱스 사용 확인
```sql
-- PostgreSQL에서 인덱스 사용률 확인
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname IN ('user', 'admin')
ORDER BY idx_scan DESC;
```

#### 느린 쿼리 분석
```sql
-- EXPLAIN ANALYZE로 쿼리 계획 확인
EXPLAIN ANALYZE
SELECT * FROM "user"."DiaryEntry"
WHERE user_id = '...' AND title LIKE '임시저장%';
```

## 테이블 구조 설계 원칙

### 현재 구조 평가

**✅ 완벽한 구조 (통합할 테이블 0개)**

현재 스키마 구조는 다음 원칙을 완벽히 준수합니다:

1. **단일 책임 원칙**: 각 테이블이 명확한 목적
2. **쿼리 패턴 최적화**: 자주 함께 조회되는 데이터는 같은 테이블
3. **Write Hotspot 방지**: 빈번한 업데이트가 있는 테이블은 분리 (UserQuota)
4. **확장성**: 각 테이블이 독립적으로 확장 가능 (유료화/엔터프라이즈 대비)
5. **법적 컴플라이언스**: GDPR 요구사항 충족, 로그 보관 정책 독립적 운영
6. **동시성**: 트랜잭션 락 경합 최소화
7. **캐싱 전략**: 각 테이블별 최적화된 캐싱 가능

### 통합 검토 결과

**UserQuota를 User에 통합?** ❌ 비권장
- Write Hotspot 위험 (User 테이블 병목)
- 동시성 문제 (트랜잭션 락 경합)
- 캐싱 전략 복잡화
- 확장성 제한 (유료화/엔터프라이즈)

**로그 테이블 통합?** ❌ 절대 금지
- 데이터 볼륨 차이 극심
- 파티셔닝 전략 충돌
- 법적/컴플라이언스 위험 (GDPR)
- 보관 기간 다름

**요청 테이블 통합?** ❌ 비권장
- 타입 안정성 저하
- NULL 필드 폭발 (정규화 위반)
- 제약조건 복잡

**결론**: 현재 구조 유지 권장 ✅

---

**최종 업데이트:** 2025-12-16  
**버전:** 2.2  
**데이터베이스:** PostgreSQL  
**ORM:** Prisma 7.1.0

## 실제 데이터베이스 확인

### Supabase 데이터베이스 덤프

실제 Supabase 데이터베이스의 스키마와 정책을 확인하려면:

```bash
# 데이터베이스 덤프 실행
pnpm db:dump

# 또는 로컬 환경 변수 사용
pnpm db:dump:local
```

**덤프 파일 위치:** `docs/database-dumps/`

**생성되는 파일:**
- `schema-*.sql`: 전체 스키마 (DDL)
- `rls-policies-*.md`: RLS 정책 목록
- `indexes-*.md`: 인덱스 정보
- `constraints-*.md`: 제약조건 정보
- `tables-*.txt`: 테이블 목록 요약

자세한 내용은 [데이터베이스 덤프 가이드](./guides/DATABASE_DUMP_GUIDE.md)를 참조하세요.

## 향후 개선 계획

### 결제 시스템 도입 (토스페이먼트)

토스페이먼트 등 결제 시스템 연동을 위한 테이블 구조가 제안되었습니다:

- **Plan**: 플랜 정보 (BASIC, PREMIUM, PRO 등)
- **Subscription**: 구독 정보 (토스페이먼트 빌링 키 포함)
- **Payment**: 결제 내역 (토스페이먼트 결제 키 포함)
- **PaymentMethod**: 결제 수단 (선택사항)

자세한 내용은 [결제 시스템 스키마 제안](./guides/PAYMENT_SCHEMA_PROPOSAL.md)을 참조하세요.

### 스키마 정리

사용하지 않는 필드 정리 제안:

- `AnalysisResult.raw_ai_response` (Json): 하위 호환성 유지 중, 점진적 제거 예정
- `User.image`: NextAuth 호환성 유지, `profile_image` 우선 사용

자세한 내용은 [스키마 정리 제안](./guides/SCHEMA_CLEANUP_PROPOSAL.md)을 참조하세요.

## 참고 문서

- [데이터베이스 덤프 가이드](./guides/DATABASE_DUMP_GUIDE.md) - Supabase 스키마 및 RLS 정책 덤프 방법
- [결제 시스템 스키마 제안](./guides/PAYMENT_SCHEMA_PROPOSAL.md) - 토스페이먼트 연동을 위한 결제/구독 테이블 구조
- [스키마 정리 제안](./guides/SCHEMA_CLEANUP_PROPOSAL.md) - 사용하지 않는 필드 제거 제안
- [스키마 개선 의사결정](./guides/archive/SCHEMA_IMPROVEMENT_DECISIONS.md) - 개선 사항 검토 및 의사결정 기록
- [스키마 쿼리 최적화](./guides/archive/SCHEMA_QUERY_OPTIMIZATION.md) - 쿼리 패턴 분석 및 최적화 제안
- [테이블 통합 분석](./guides/archive/TABLE_CONSOLIDATION_ANALYSIS.md) - 테이블 통합 가능성 분석 및 베스트 프랙티스
