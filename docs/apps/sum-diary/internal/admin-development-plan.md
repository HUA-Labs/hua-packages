# 어드민 페이지 개발 플랜

## 목차

1. [현재 상태 분석](#현재-상태-분석)
2. [즉시 개발 가능한 기능](#즉시-개발-가능한-기능)
3. [개선이 필요한 기능](#개선이-필요한-기능)
4. [차후 개발 필요 기능](#차후-개발-필요-기능)
5. [스키마 개선 사항](#스키마-개선-사항)
6. [개발 우선순위](#개발-우선순위)

---

## 현재 상태 분석

### 현재 Prisma 스키마에 존재하는 테이블

#### 서비스 테이블
- User (사용자)
- DiaryEntry (일기)
- AnalysisResult (분석 결과)
- HuaEmotionAnalysis (HUA 감정 분석)
- AnalysisSystemMetadata (시스템 메타데이터)
- DiaryKeywords (키워드)
- Report (리포트)
- Notification (알림)
- Announcement (공지사항)
- Event (이벤트)
- EventAttendance (이벤트 출석)
- UserProfileMeta (프로필 메타데이터)
- UserSettings (사용자 설정)

#### 로깅 및 모니터링 테이블
- LoginLog (로그인 로그)
- UserStatusLog (사용자 상태 로그)
- ErrorLog (에러 로그)
- ContentModerationLog (콘텐츠 검열 로그)
- ApiLog (API 로그)

#### 위기 및 악용 감지 테이블
- CrisisAlert (위기 알림)
- CrisisAlertLog (위기 알림 로그)
- AbuseAlert (악용 알림)

#### 인증 테이블
- Account (소셜 계정)
- Session (세션)
- VerificationToken (인증 토큰)

### 스키마 문서에 있으나 Prisma에 없는 테이블

#### 결제 및 구독 관련 (차후 개발)
- subscriptions (구독 정보)
- payments (결제 내역)
- plans (요금제 정의)
- user_points_ledger (포인트 원장)

#### 고객지원 관련 (차후 개발)
- support_faq (FAQ)
- support_inquiries (문의 접수)
- support_responses (문의 답변)

#### 운영 관리 관련 (차후 개발)
- admin_users (운영자 계정) - 현재는 User.role로 관리
- slip_conditions (슬립 실행 기록)

#### AI 정책 관리 관련 (차후 개발)
- ai_policy_versions (정책 스냅샷)
- ai_policy_active (활성 포인터)
- ai_overrides (오버라이드/실험)
- prompt_registry (프롬프트/모델 버전)

---

## 즉시 개발 가능한 기능

현재 Prisma 스키마에 존재하는 테이블을 기반으로 바로 개발할 수 있는 어드민 기능들입니다.

### 1. 관리자 대시보드 강화 (`/admin`)

**현재 상태**: 기본적인 통계만 표시

**개선 사항**:
- 실시간 통계 카드
  - 총 사용자 수 (활성/비활성/차단/탈퇴)
  - 총 일기 수 (전체/삭제됨/분석 제외)
  - 오늘 작성된 일기 수
  - 오늘 분석 요청 수
  - 오늘 위기 알림 수
  - 오늘 악용 알림 수
- 차트 및 그래프
  - 사용자 증가 추이 (일/주/월)
  - 일기 작성 추이
  - 분석 요청 추이
  - AI 프로바이더별 사용량
  - 위기 알림/악용 알림 추이
- 최근 활동 피드
  - 최근 가입 사용자
  - 최근 작성된 일기
  - 최근 위기 알림 (PENDING 상태 우선)
  - 최근 악용 알림 (PENDING 상태 우선)
  - 최근 에러 로그 (fatal/error 우선)

**필요한 API**:
- `GET /api/admin/dashboard` - 대시보드 통계 (개선 필요)
- `GET /api/admin/dashboard/realtime` - 실시간 통계
- `GET /api/admin/dashboard/charts` - 차트 데이터

**사용 테이블**: User, DiaryEntry, AnalysisResult, CrisisAlert, AbuseAlert, ErrorLog

**우선순위**: 높음

### 2. 일기 관리 개선 (`/admin/diaries`)

**현재 상태**: 기본적인 일기 목록 및 상세 보기

**개선 사항**:
- 고급 필터링 및 검색
  - 사용자별 필터 (user_id 또는 email_hash/nickname_hash 검색)
  - 날짜 범위 필터 (created_at, diary_date, actual_written_at)
  - 삭제 여부 필터 (is_deleted)
  - 분석 제외 여부 필터 (exclude_from_analysis)
  - 지연 작성 여부 필터 (is_delayed_entry)
  - 키워드 검색 (DiaryKeywords 테이블 활용)
  - 감정 태그 필터 (DiaryKeywords.emotion_tags)
- 일기 상세 관리
  - 일기 내용 복호화 표시 (권한 필요, 암호화 키 필요)
  - 분석 결과 확인 (AnalysisResult, HuaEmotionAnalysis)
  - 키워드 확인 (DiaryKeywords)
  - 위기 알림 연관 확인 (CrisisAlert)
  - 악용 알림 연관 확인 (AbuseAlert)
  - 일기 삭제/복원
  - 분석 제외 설정 (exclude_from_analysis)
- 일기 통계
  - 사용자별 일기 수
  - 날짜별 작성 통계
  - 감정 분포 통계 (DiaryKeywords 활용)
  - 지연 작성 비율
- 일괄 작업
  - 선택된 일기 삭제
  - 선택된 일기 분석 제외 설정
  - 선택된 일기 분석 재실행

**필요한 API**:
- `GET /api/admin/diaries` - 일기 목록 (필터링 개선 필요)
- `GET /api/admin/diaries/[id]` - 일기 상세 (복호화 기능 추가 필요)
- `DELETE /api/admin/diaries/[id]` - 일기 삭제
- `POST /api/admin/diaries/[id]/restore` - 일기 복원
- `PATCH /api/admin/diaries/[id]/exclude` - 분석 제외 설정
- `POST /api/admin/diaries/batch` - 일괄 작업

**사용 테이블**: DiaryEntry, User, AnalysisResult, HuaEmotionAnalysis, DiaryKeywords, CrisisAlert, AbuseAlert

**우선순위**: 높음

### 3. 사용자 관리 개선 (`/admin/users`)

**현재 상태**: 기본적인 사용자 목록 및 상세 보기

**개선 사항**:
- 고급 필터링 및 검색
  - 상태별 필터 (active, inactive, resigned, banned)
  - 역할별 필터 (USER, ADMIN)
  - 가입일 범위 필터 (created_at)
  - 이메일/닉네임 해시 검색 (email_hash, nickname_hash)
  - 일기 수 범위 필터
- 사용자 상세 관리
  - 사용자 정보 복호화 표시 (권한 필요)
  - 프로필 메타데이터 확인 (UserProfileMeta)
  - 사용자 설정 확인 (UserSettings)
  - 일기 목록 확인 (DiaryEntry)
  - 분석 결과 통계 (AnalysisResult)
  - 로그인 기록 확인 (LoginLog)
  - 상태 변경 이력 확인 (UserStatusLog)
  - 위기 알림 이력 확인 (CrisisAlert)
  - 악용 알림 이력 확인 (AbuseAlert)
  - API 로그 확인 (ApiLog)
- 사용자 상태 관리
  - 상태 변경 (active, inactive, resigned, banned)
  - 역할 변경 (USER, ADMIN)
  - 상태 변경 사유 입력 (UserStatusLog에 기록)
  - 상태 변경 이력 기록 (UserStatusLog)
- 사용자 통계
  - 총 일기 수
  - 평균 감정 점수 (AnalysisResult, HuaEmotionAnalysis)
  - 주요 감정 태그 (DiaryKeywords)
  - 마지막 활동일 (LoginLog, ApiLog)
  - 가입 후 경과일
- 일괄 작업
  - 선택된 사용자 상태 변경
  - 선택된 사용자 역할 변경

**필요한 API**:
- `GET /api/admin/users` - 사용자 목록 (필터링 개선 필요)
- `GET /api/admin/users/[id]` - 사용자 상세 (복호화 기능 추가 필요)
- `PATCH /api/admin/users/[id]/state` - 사용자 상태 변경
- `PATCH /api/admin/users/[id]/role` - 사용자 역할 변경
- `GET /api/admin/users/[id]/logs` - 사용자 로그 조회
- `GET /api/admin/users/[id]/stats` - 사용자 통계
- `POST /api/admin/users/batch` - 일괄 작업

**사용 테이블**: User, UserProfileMeta, UserSettings, DiaryEntry, AnalysisResult, LoginLog, UserStatusLog, CrisisAlert, AbuseAlert, ApiLog

**우선순위**: 높음

### 4. 위기 감지 모니터링 강화 (`/admin/monitoring/crisis`)

**현재 상태**: 기본적인 위기 알림 목록 및 상세

**개선 사항**:
- 고급 필터링 및 검색
  - 상태별 필터 (PENDING, CONFIRMED, FALSE_POSITIVE, HANDLED, DISMISSED)
  - 위기 타입별 필터 (SUICIDE, SELF_HARM, DRUG, CHILD_ABUSE, SERIOUS_MEDICAL, TERRORISM)
  - 위험도별 필터 (0-4)
  - 날짜 범위 필터 (created_at)
  - 검토자별 필터 (reviewed_by)
  - AI 감지/키워드 감지 필터 (ai_detected, keyword_detected)
  - 재식별 위험 필터 (reidentification_risk)
- 위기 알림 상세 관리
  - 익명화된 일기 내용 표시 (diary_excerpt, diary_full_anonymized)
  - 재식별 위험 평가 확인 (reidentification_risk, reidentification_reason)
  - AI 감지 결과 확인 (ai_detected, ai_ethics_tags, ai_confidence)
  - 키워드 감지 결과 확인 (keyword_detected, detected_patterns)
  - 히스토리 컨텍스트 확인 (historical_context JSON)
  - 관련 일기 확인 (DiaryEntry)
  - 관련 분석 결과 확인 (AnalysisResult)
  - 위기 알림 로그 확인 (CrisisAlertLog)
- 위기 알림 처리
  - 상태 변경 (CONFIRMED, FALSE_POSITIVE, HANDLED, DISMISSED)
  - 검토자 지정 (reviewed_by)
  - 관리자 메모 작성 (admin_notes)
  - 조치 내용 기록 (action_taken)
  - 일기 복호화 요청 (고위험도만, 권한 필요)
  - 위기 알림 로그 기록 (CrisisAlertLog)
- 위기 알림 통계
  - 상태별 통계
  - 위기 타입별 통계
  - 위험도별 통계
  - 일별/주별/월별 추이
  - 처리 시간 통계 (created_at ~ reviewed_at)
- 위기 알림 로그
  - 처리 이력 확인 (CrisisAlertLog)
  - 관리자 행동 추적 (CrisisAlertLog.admin_id, action_type)
  - IP 주소 및 User-Agent 기록 (CrisisAlertLog)

**필요한 API**:
- `GET /api/admin/crisis-alerts` - 위기 알림 목록 (필터링 개선 필요)
- `GET /api/admin/crisis-alerts/[id]` - 위기 알림 상세 (이미 존재)
- `PATCH /api/admin/crisis-alerts/[id]` - 위기 알림 상태 변경 (이미 존재)
- `POST /api/admin/crisis-alerts/[id]/decrypt` - 일기 복호화 요청 (고위험도)
- `GET /api/admin/crisis-alerts/[id]/logs` - 위기 알림 로그
- `GET /api/admin/crisis-alerts/stats` - 위기 알림 통계

**사용 테이블**: CrisisAlert, CrisisAlertLog, User, DiaryEntry, AnalysisResult

**우선순위**: 매우 높음

### 5. 악용 감지 모니터링 (`/admin/monitoring/abuse`)

**현재 상태**: 미구현

**개발 필요 사항**:
- 악용 알림 목록 페이지
  - 알림 타입별 필터 (CRISIS, ABUSE)
  - 악용 패턴별 필터 (RAPID_REQUESTS, REPETITIVE_CONTENT, SUSPICIOUS_PROMPTS, TOKEN_ABUSE, MULTI_ACCOUNT, API_SCRAPING)
  - 제재 레벨별 필터 (WARNING, RATE_LIMIT, TEMPORARY_BAN, PERMANENT_BAN)
  - 상태별 필터 (PENDING, REVIEWED, FALSE_POSITIVE, ACTION_TAKEN, DISMISSED)
  - 날짜 범위 필터 (created_at)
  - 검토자별 필터 (reviewed_by)
- 악용 알림 상세 페이지
  - 익명화된 일기 내용 표시 (diary_excerpt)
  - 악용 패턴 상세 확인 (abuse_patterns, detected_patterns)
  - 콘텐츠 플래그 확인 (content_flags)
  - 관련 일기 확인 (DiaryEntry)
  - 관련 분석 결과 확인 (AnalysisResult)
- 악용 알림 처리
  - 상태 변경 (REVIEWED, FALSE_POSITIVE, ACTION_TAKEN, DISMISSED)
  - 검토자 지정 (reviewed_by)
  - 관리자 메모 작성 (admin_notes)
  - 조치 내용 기록 (action_taken)
  - 사용자 제재 적용 (User.state 변경, UserStatusLog 기록)
  - 분석 제외 설정 (DiaryEntry.exclude_from_analysis)
- 악용 알림 통계
  - 알림 타입별 통계
  - 악용 패턴별 통계
  - 제재 레벨별 통계
  - 일별/주별/월별 추이
  - 처리 시간 통계
- 사용자 제재 관리
  - 경고 발송 (Notification)
  - Rate limiting 적용 (시스템 레벨)
  - 임시 차단 (User.state = banned, 일정 기간 후 자동 해제)
  - 영구 차단 (User.state = banned)
  - 제재 해제

**필요한 API**:
- `GET /api/admin/abuse-alerts` - 악용 알림 목록
- `GET /api/admin/abuse-alerts/[id]` - 악용 알림 상세
- `PATCH /api/admin/abuse-alerts/[id]` - 악용 알림 상태 변경
- `POST /api/admin/abuse-alerts/[id]/penalty` - 사용자 제재 적용
- `GET /api/admin/abuse-alerts/stats` - 악용 알림 통계

**사용 테이블**: AbuseAlert, User, DiaryEntry, AnalysisResult, UserStatusLog, Notification

**우선순위**: 매우 높음

### 6. 분석 결과 관리 (`/admin/analysis`)

**현재 상태**: 미구현

**개발 필요 사항**:
- 분석 결과 목록 페이지
  - 프로바이더별 필터 (OPENAI, GEMINI, HUA_ENGINE, MOCK)
  - 상태별 필터 (PENDING, PROCESSING, COMPLETED, FAILED)
  - 날짜 범위 필터 (created_at, completed_at)
  - 일기별 필터 (diary_id)
  - 사용자별 필터 (user_id)
- 분석 결과 상세 페이지
  - 분석 결과 복호화 표시 (권한 필요)
  - HUA 감정 엔진 분석 결과 확인 (HuaEmotionAnalysis)
  - AI 분석 결과 확인 (AnalysisResult)
  - 시스템 메타데이터 확인 (AnalysisSystemMetadata)
  - 원본 AI 응답 확인 (raw_ai_response JSON)
  - 분석 재실행
- 분석 통계
  - 프로바이더별 사용량
  - 상태별 통계
  - 평균 처리 시간 (latency)
  - 평균 토큰 사용량 (tokens)
  - 비용 통계 (AnalysisSystemMetadata.total_cost)
- 분석 품질 관리
  - 품질 점수 확인 (AnalysisSystemMetadata.quality_score)
  - 위험 요소 확인 (AnalysisSystemMetadata.risk_factors)
  - 콘텐츠 플래그 확인 (AnalysisSystemMetadata.content_flags)
  - 분석 재실행 요청

**필요한 API**:
- `GET /api/admin/analysis` - 분석 결과 목록
- `GET /api/admin/analysis/[id]` - 분석 결과 상세
- `POST /api/admin/analysis/[id]/rerun` - 분석 재실행
- `GET /api/admin/analysis/stats` - 분석 통계

**사용 테이블**: AnalysisResult, HuaEmotionAnalysis, AnalysisSystemMetadata, DiaryEntry, User

**우선순위**: 중간

### 7. 로그 관리 (`/admin/logs`)

**현재 상태**: 기본적인 에러 로그만 존재

**개발 필요 사항**:
- 로그인 로그 (`/admin/logs/login`)
  - 사용자별 필터
  - 날짜 범위 필터
  - 성공/실패 필터 (success)
  - IP 주소 검색
  - 게스트/회원 필터 (is_guest)
  - 액션 필터 (action: diary_write, diary_analyze, login, logout)
- API 로그 (`/admin/logs/api`)
  - 사용자별 필터
  - 엔드포인트별 필터 (endpoint)
  - HTTP 메서드 필터 (method)
  - 상태 코드 필터 (status_code)
  - 응답 시간 필터 (latency_ms)
  - 날짜 범위 필터
- 에러 로그 (`/admin/logs/errors`)
  - 심각도별 필터 (info, warn, error, fatal)
  - 서비스별 필터 (service)
  - 날짜 범위 필터
  - 에러 메시지 검색 (message)
  - 참조 테이블/ID 필터 (ref_table, ref_id)
- 콘텐츠 검열 로그 (`/admin/logs/moderation`)
  - 일기별 필터 (diary_id)
  - 액션별 필터 (delete, block, restore, flag)
  - 관리자별 필터 (admin_id)
  - 날짜 범위 필터
- 사용자 상태 로그 (`/admin/logs/user-status`)
  - 사용자별 필터
  - 상태 변경 필터 (old_state, new_state)
  - 변경 사유 필터 (reason_code)
  - 날짜 범위 필터
- 로그 상세 보기
  - 로그 상세 정보
  - 관련 데이터 확인 (ref_table, ref_id 활용)
  - 로그 다운로드 (CSV/JSON)
- 로그 통계
  - 로그 타입별 통계
  - 시간대별 통계
  - 에러율 통계
  - 평균 응답 시간

**필요한 API**:
- `GET /api/admin/logs/login` - 로그인 로그
- `GET /api/admin/logs/api` - API 로그
- `GET /api/admin/logs/errors` - 에러 로그 (이미 존재, 개선 필요)
- `GET /api/admin/logs/moderation` - 검열 로그
- `GET /api/admin/logs/user-status` - 사용자 상태 로그
- `GET /api/admin/logs/stats` - 로그 통계

**사용 테이블**: LoginLog, ApiLog, ErrorLog, ContentModerationLog, UserStatusLog

**우선순위**: 중간

### 8. 성능 모니터링 개선 (`/admin/monitoring/performance`)

**현재 상태**: 기본적인 성능 지표 표시

**개선 사항**:
- 실시간 성능 모니터링
  - API 응답 시간 그래프 (ApiLog.latency_ms)
  - 에러율 그래프 (ErrorLog, ApiLog.status_code)
  - 요청량 그래프 (ApiLog)
  - 데이터베이스 쿼리 시간 (별도 모니터링 필요)
  - 캐시 히트율 (별도 모니터링 필요)
- 성능 알림
  - 임계값 설정
  - 성능 저하 알림
  - 에러율 증가 알림
- 성능 분석
  - 느린 쿼리 분석 (ApiLog.latency_ms 기준)
  - 병목 지점 식별 (endpoint별 평균 latency)
  - 최적화 제안

**필요한 API**:
- `GET /api/admin/monitoring/performance` - 성능 지표 (이미 존재, 개선 필요)
- `GET /api/admin/monitoring/performance/realtime` - 실시간 성능 지표
- `GET /api/admin/monitoring/performance/slow-queries` - 느린 쿼리 분석

**사용 테이블**: ApiLog, ErrorLog

**우선순위**: 중간

### 9. 공지사항 관리 개선 (`/admin/announcements`)

**현재 상태**: 기본적인 공지사항 목록 및 생성

**개선 사항**:
- 공지사항 상세 관리
  - 공지사항 편집
  - 공지사항 삭제 (soft delete: deleted_at)
  - 공지사항 발행/중지 (published_at)
  - 발행 일정 설정 (published_at)
  - 만료 일정 설정 (expires_at)
- 공지사항 통계
  - 조회 수 (별도 추적 필요)
  - 읽음 수 (Notification.read)
  - 사용자별 읽음 상태
- 공지사항 템플릿
  - 템플릿 저장
  - 템플릿 재사용

**필요한 API**:
- `GET /api/admin/announcements` - 공지사항 목록 (이미 존재)
- `GET /api/admin/announcements/[id]` - 공지사항 상세
- `PATCH /api/admin/announcements/[id]` - 공지사항 수정
- `DELETE /api/admin/announcements/[id]` - 공지사항 삭제
- `GET /api/admin/announcements/[id]/stats` - 공지사항 통계

**사용 테이블**: Announcement, Notification

**우선순위**: 낮음

### 10. 알림 관리 개선 (`/admin/notifications`)

**현재 상태**: 기본적인 알림 목록 및 생성

**개선 사항**:
- 알림 상세 관리
  - 알림 편집
  - 알림 삭제
  - 알림 발송 일정 설정 (visible_from)
  - 알림 표시 기간 설정 (visible_to)
- 알림 발송
  - 개별 사용자 발송
  - 그룹 발송 (조건별)
  - 조건부 발송
- 알림 통계
  - 발송 수
  - 읽음 수 (read)
  - 읽음률
  - 사용자별 읽음 상태

**필요한 API**:
- `GET /api/admin/notifications` - 알림 목록 (이미 존재)
- `GET /api/admin/notifications/[id]` - 알림 상세
- `PATCH /api/admin/notifications/[id]` - 알림 수정
- `DELETE /api/admin/notifications/[id]` - 알림 삭제
- `POST /api/admin/notifications/send` - 알림 발송
- `GET /api/admin/notifications/[id]/stats` - 알림 통계

**사용 테이블**: Notification, User, Announcement, Event

**우선순위**: 낮음

### 11. 리포트 관리 (`/admin/reports`)

**현재 상태**: 미구현

**개발 필요 사항**:
- 리포트 목록 페이지
  - 사용자별 필터
  - 기간 타입별 필터 (daily, weekly, monthly, yearly)
  - 날짜 범위 필터 (period_start, period_end)
- 리포트 상세 페이지
  - 리포트 내용 확인 (summary JSON)
  - 리포트 통계
- 리포트 생성
  - 사용자별 리포트 생성
  - 일괄 리포트 생성
- 리포트 통계
  - 생성된 리포트 수
  - 기간 타입별 통계

**필요한 API**:
- `GET /api/admin/reports` - 리포트 목록
- `GET /api/admin/reports/[id]` - 리포트 상세
- `POST /api/admin/reports/generate` - 리포트 생성
- `GET /api/admin/reports/stats` - 리포트 통계

**사용 테이블**: Report, User

**우선순위**: 낮음

### 12. 이벤트 관리 (`/admin/events`)

**현재 상태**: 미구현

**개발 필요 사항**:
- 이벤트 목록 페이지
  - 이벤트 목록 조회
  - 이벤트 생성/수정/삭제
- 이벤트 상세 페이지
  - 이벤트 정보 확인
  - 참가자 목록 확인 (EventAttendance)
  - 참가 통계
- 이벤트 통계
  - 참가자 수
  - 연속 참가 일수 통계 (streak)
  - 보상 지급 통계 (reward_code)

**필요한 API**:
- `GET /api/admin/events` - 이벤트 목록
- `GET /api/admin/events/[id]` - 이벤트 상세
- `POST /api/admin/events` - 이벤트 생성
- `PATCH /api/admin/events/[id]` - 이벤트 수정
- `DELETE /api/admin/events/[id]` - 이벤트 삭제
- `GET /api/admin/events/[id]/stats` - 이벤트 통계

**사용 테이블**: Event, EventAttendance, User

**우선순위**: 낮음

---

## 개선이 필요한 기능

현재 구현되어 있으나 스키마 문서와 비교하여 개선이 필요한 부분들입니다.

### 1. UserStatusLog 개선

**현재 상태**: `changed_by`가 String? 타입으로 되어 있음

**개선 사항**:
- `changed_by`를 User 테이블과 연결 (관리자 ID)
- 현재는 User.role로 관리자를 구분하므로, `changed_by`를 User.id와 연결
- 관리자 정보 표시 시 User 테이블에서 role 확인

**스키마 변경 필요**: 없음 (현재 구조로도 동작 가능)

**우선순위**: 중간

### 2. ContentModerationLog 개선

**현재 상태**: `admin_id`가 String? 타입으로 되어 있음

**개선 사항**:
- `admin_id`를 User 테이블과 연결 (관리자 ID)
- 관리자 정보 표시 시 User 테이블에서 role 확인
- 관리자별 조치 통계 기능 추가

**스키마 변경 필요**: 없음 (현재 구조로도 동작 가능)

**우선순위**: 중간

### 3. CrisisAlertLog 개선

**현재 상태**: `admin_id`가 User 테이블과 연결되어 있음

**개선 사항**:
- 현재 구조는 적절함
- 관리자 정보 표시 시 User 테이블에서 role 확인
- 관리자별 처리 통계 기능 추가

**스키마 변경 필요**: 없음

**우선순위**: 낮음

---

## 차후 개발 필요 기능

스키마 문서에 있으나 현재 Prisma 스키마에 없는 테이블들을 기반으로 한 기능들입니다.

### 1. 구독 및 결제 관리 (`/admin/subscriptions`, `/admin/payments`)

**필요한 테이블**: subscriptions, payments, plans

**개발 필요 사항**:
- 구독 관리
  - 구독 목록 조회
  - 구독 상태 관리
  - 구독 갱신/해지 처리
  - 요금제 변경
- 결제 관리
  - 결제 내역 조회
  - 결제 실패 처리
  - 환불 처리
- 요금제 관리
  - 요금제 목록 조회
  - 요금제 생성/수정/삭제
  - 요금제별 통계

**우선순위**: 낮음 (현재 서비스에 구독 기능 없음)

### 2. 포인트 관리 (`/admin/points`)

**필요한 테이블**: user_points_ledger

**개발 필요 사항**:
- 포인트 원장 조회
- 포인트 적립/차감 내역 확인
- 포인트 통계
- 포인트 수동 조정

**우선순위**: 낮음 (현재 서비스에 포인트 기능 없음)

### 3. 고객지원 관리 (`/admin/support`)

**필요한 테이블**: support_faq, support_inquiries, support_responses

**개발 필요 사항**:
- FAQ 관리
  - FAQ 목록 조회
  - FAQ 생성/수정/삭제
  - FAQ 카테고리 관리
- 문의 관리
  - 문의 목록 조회
  - 문의 상세 확인
  - 문의 답변 작성
  - 문의 상태 관리
- 문의 통계
  - 문의 유형별 통계
  - 응답 시간 통계
  - 운영자별 처리 통계

**우선순위**: 중간

### 4. 슬립 조건 관리 (`/admin/slip-conditions`)

**필요한 테이블**: slip_conditions

**개발 필요 사항**:
- 슬립 조건 목록 조회
- 슬립 조건 상세 확인
- 슬립 해제 처리
- 슬립 통계
- 슬립 오버라이드 이력 확인

**우선순위**: 중간

### 5. AI 정책 관리 (`/admin/ai-policies`)

**필요한 테이블**: ai_policy_versions, ai_policy_active, ai_overrides, prompt_registry

**개발 필요 사항**:
- 정책 버전 관리
  - 정책 버전 목록 조회
  - 정책 버전 생성/수정
  - 정책 버전 활성화
- 오버라이드 관리
  - 오버라이드 목록 조회
  - 오버라이드 생성/수정/삭제
- 프롬프트 관리
  - 프롬프트 목록 조회
  - 프롬프트 생성/수정/삭제
  - 프롬프트 버전 관리

**우선순위**: 낮음 (고급 기능)

### 6. 운영자 계정 관리 (`/admin/admins`)

**필요한 테이블**: admin_users (또는 User.role 활용)

**개발 필요 사항**:
- 운영자 목록 조회
- 운영자 생성/수정/삭제
- 운영자 권한 관리
- 운영자 활동 로그

**현재 상태**: User.role로 관리 중이므로 별도 테이블 불필요할 수 있음

**우선순위**: 낮음

---

## 스키마 개선 사항

### 즉시 개선 가능한 사항

1. **UserStatusLog.changed_by 관계 명확화**
   - 현재: String? (User.id를 문자열로 저장)
   - 개선: User 테이블과 명시적 관계 추가 (선택사항)
   - 영향: 없음 (현재 구조로도 동작 가능)

2. **ContentModerationLog.admin_id 관계 명확화**
   - 현재: String? (User.id를 문자열로 저장)
   - 개선: User 테이블과 명시적 관계 추가 (선택사항)
   - 영향: 없음 (현재 구조로도 동작 가능)

### 차후 추가 필요 사항

1. **구독 및 결제 테이블 추가**
   - subscriptions
   - payments
   - plans

2. **포인트 테이블 추가**
   - user_points_ledger

3. **고객지원 테이블 추가**
   - support_faq
   - support_inquiries
   - support_responses

4. **슬립 조건 테이블 추가**
   - slip_conditions

5. **AI 정책 관리 테이블 추가**
   - ai_policy_versions
   - ai_policy_active
   - ai_overrides
   - prompt_registry

6. **운영자 계정 테이블 추가 (선택사항)**
   - admin_users (또는 User.role로 계속 관리)

---

## 개발 우선순위

### Phase 1: 핵심 기능 강화 (1-2주)

1. **관리자 대시보드 강화** - 실시간 통계 및 차트
2. **위기 감지 모니터링 강화** - 상세 관리 기능
3. **악용 감지 모니터링** - 신규 개발
4. **일기 관리 개선** - 고급 필터링 및 일괄 작업
5. **사용자 관리 개선** - 상세 관리 기능

### Phase 2: 로그 및 모니터링 (1-2주)

1. **로그 관리** - 종합 로그 시스템
2. **성능 모니터링 개선** - 실시간 모니터링
3. **분석 결과 관리** - 분석 품질 관리

### Phase 3: 부가 기능 (1주)

1. **공지사항 관리 개선**
2. **알림 관리 개선**
3. **리포트 관리**
4. **이벤트 관리**

### Phase 4: 차후 개발 (별도 계획)

1. **구독 및 결제 관리** (구독 기능 도입 시)
2. **포인트 관리** (포인트 기능 도입 시)
3. **고객지원 관리** (CS 시스템 구축 시)
4. **슬립 조건 관리** (슬립 기능 고도화 시)
5. **AI 정책 관리** (고급 기능 필요 시)
6. **운영자 계정 관리** (운영자 시스템 분리 필요 시)

---

## 기술적 고려사항

### 보안

1. **암호화 데이터 복호화**
   - 일기 내용, 분석 결과 복호화는 고위험 작업
   - 복호화 권한 확인 필수
   - 복호화 이력 기록 (CrisisAlertLog 등)

2. **관리자 권한 확인**
   - 모든 어드민 API에서 User.role = ADMIN 확인
   - 세션 기반 인증 확인

3. **개인정보 보호**
   - 익명화된 데이터만 기본 표시
   - 복호화는 최소 권한 원칙 적용

### 성능

1. **대량 데이터 처리**
   - 페이지네이션 필수
   - 인덱스 최적화 확인
   - 쿼리 최적화

2. **실시간 통계**
   - 캐싱 활용 (Redis)
   - 배치 처리 고려

3. **로그 데이터**
   - 오래된 로그 아카이빙
   - 로그 조회 성능 최적화

### 사용자 경험

1. **필터링 및 검색**
   - 직관적인 필터 UI
   - 빠른 검색 기능
   - 필터 상태 저장

2. **상세 정보 표시**
   - 관련 데이터 연계 표시
   - 히스토리 추적
   - 액션 로그 표시

3. **일괄 작업**
   - 선택 기능
   - 진행 상태 표시
   - 결과 피드백

---

이 문서는 현재 Prisma 스키마를 기반으로 작성되었으며, 스키마 변경 시 업데이트가 필요합니다.

