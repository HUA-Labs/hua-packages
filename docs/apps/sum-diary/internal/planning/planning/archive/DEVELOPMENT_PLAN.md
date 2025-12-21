# 슴다이어리 개발 플랜 문서

## 목차

1. [데이터베이스 스키마 분석](#데이터베이스-스키마-분석)
2. [사용자 페이지 개발 플랜](#사용자-페이지-개발-플랜)
3. [어드민 페이지 개발 플랜](#어드민-페이지-개발-플랜)
4. [API 엔드포인트 정리](#api-엔드포인트-정리)
5. [개발 우선순위](#개발-우선순위)

---

## 데이터베이스 스키마 분석

### 핵심 모델 구조

#### 1. User (사용자)
- 기본 정보: id, email_hash, nickname_hash, state, role
- 암호화 필드: name_enc, email_enc, nickname_enc
- 상태 관리: UserState (active, inactive, resigned, banned)
- 역할: UserRole (USER, ADMIN)
- 관계: 일기, 알림, 리포트, 로그인 기록, 프로필 메타데이터, 설정, 위기 알림, 악용 알림

#### 2. DiaryEntry (일기)
- 기본 정보: id, user_id, title, content_enc (암호화된 내용)
- 시간 정보: diary_date (사용자 선택 날짜), actual_written_at (실제 작성 시간), is_delayed_entry
- 삭제 관리: deleted_at, deleted_by, is_deleted
- 분석 제외: exclude_from_analysis (악용 탐지, 테스트용)
- 관계: 분석 결과, 키워드, 위기 알림, 악용 알림

#### 3. AnalysisResult (분석 결과)
- 프로바이더: AnalysisProvider (OPENAI, GEMINI, HUA_ENGINE, MOCK)
- 상태: AnalysisStatus (PENDING, PROCESSING, COMPLETED, FAILED)
- 암호화 필드: title_enc, summary_enc, emotion_flow_enc, reflection_question_enc, interpretation_enc
- 메타데이터: mode, tone, affect_tier, momentum_tier, ethics, confidence
- 감정 정보: primary_emotions, slip
- 기술 정보: model_name, model_version, prompt_version, tokens, latency
- 원본 데이터: raw_ai_response (JSON)

#### 4. HuaEmotionAnalysis (HUA 감정 엔진 분석)
- 좌표 및 메트릭: coordinates, entropy, dominant_emotion, emotion_density
- 텍스트 분석: tense_changes, first_person_freq, transitions
- AI 메트릭: ai_entropy, ai_density, ai_transitions, ai_diversity
- 고급 분석: emotion_timeline, sentiment_score, complexity_metrics, visualization_data

#### 5. CrisisAlert (위기 감지 알림)
- 위기 타입: CrisisType (SUICIDE, SELF_HARM, DRUG, CHILD_ABUSE, SERIOUS_MEDICAL, TERRORISM)
- 상태: CrisisAlertStatus (PENDING, CONFIRMED, FALSE_POSITIVE, HANDLED, DISMISSED)
- 위험도: risk_level (0-4)
- 감지 정보: ai_detected, keyword_detected, detected_patterns
- 익명화 내용: diary_excerpt, diary_full_anonymized
- 재식별 위험: reidentification_risk, reidentification_reason
- 운영자 검토: reviewed_by, reviewed_at, admin_notes, action_taken

#### 6. AbuseAlert (악용 감지 알림)
- 알림 타입: AlertType (CRISIS, ABUSE)
- 악용 패턴: AbusePattern (RAPID_REQUESTS, REPETITIVE_CONTENT, SUSPICIOUS_PROMPTS, TOKEN_ABUSE, MULTI_ACCOUNT, API_SCRAPING)
- 제재 레벨: PenaltyLevel (WARNING, RATE_LIMIT, TEMPORARY_BAN, PERMANENT_BAN)
- 상태: AbuseAlertStatus (PENDING, REVIEWED, FALSE_POSITIVE, ACTION_TAKEN, DISMISSED)
- 감지 정보: content_flags, detected_patterns, exclude_from_analysis
- 운영자 검토: reviewed_by, reviewed_at, admin_notes, action_taken

#### 7. Notification (알림)
- 타입: NotificationType (notice, system, event, announcement)
- 표시 기간: visible_from, visible_to
- 읽음 상태: read
- 관계: Announcement, Event

#### 8. Report (리포트)
- 기간 타입: ReportPeriod (daily, weekly, monthly, yearly)
- 기간: period_start, period_end
- 요약: summary (JSON)

#### 9. UserProfileMeta (사용자 프로필 메타데이터)
- 성격 정보: mbti, writing_style, personality_traits
- 선호 감정: preferred_emotions
- 관심사 및 목표: interests, goals, challenges

#### 10. UserSettings (사용자 설정)
- AI 프로바이더: ai_provider (AnalysisProvider)
- 분석 깊이: analysis_depth (basic, standard, deep)
- 알림 설정: email_notifications, push_notifications
- 개인화: preferred_tone, language, output_language

#### 11. 로깅 및 모니터링 모델
- LoginLog: 로그인 기록, IP, 디바이스, User-Agent
- UserStatusLog: 사용자 상태 변경 이력
- ErrorLog: 시스템 에러 로그 (severity, service, ref_table, ref_id)
- ContentModerationLog: 콘텐츠 검열 로그
- ApiLog: API 호출 로그 (method, endpoint, status_code, latency_ms)
- CrisisAlertLog: 위기 알림 처리 이력 (관리자 행동 추적)

---

## 사용자 페이지 개발 플랜

### 현재 구현 상태

#### 완료된 페이지

1. **홈 페이지** (`/`)
   - 로그인 전: 랜딩 페이지 (서비스 소개, CTA 버튼, 소셜 로그인)
   - 로그인 후: 대시보드 (일기 목록, 캘린더 뷰)

2. **일기 작성** (`/diary/write`)
   - 일기 작성 에디터
   - 자동 저장 (임시저장)
   - 오프라인 지원
   - 게스트 모드 지원
   - 날짜 선택 기능
   - AI 분석 요청

3. **일기 상세** (`/diary/[id]`)
   - 일기 내용 표시
   - 수정 및 삭제 기능

4. **일기 분석** (`/diary/analysis`)
   - AI 분석 결과 표시
   - 감정 흐름 시각화
   - HUA 감정 엔진 분석 결과

5. **일기 목록** (`/diary`)
   - 일기 목록 조회
   - 필터링 및 검색

6. **프로필** (`/profile`)
   - 사용자 프로필 정보
   - 프로필 이미지 업로드

7. **설정** (`/settings`)
   - AI 프로바이더 선택
   - 분석 깊이 설정
   - 알림 설정
   - 언어 설정

8. **알림** (`/notifications`)
   - 알림 목록
   - 읽음 처리
   - 알림 상세

9. **공지사항** (`/announcements`)
   - 공지사항 목록
   - 공지사항 상세

10. **검색** (`/search`)
    - 일기 검색 기능

11. **인증** (`/auth/login`, `/auth/register`)
    - 로그인 페이지
    - 회원가입 페이지
    - 소셜 로그인 (카카오, 구글)

### 개선 및 추가 개발 필요 사항

#### 1. 대시보드 개선 (`/`)

**현재 상태**: 기본적인 일기 목록 및 캘린더 뷰

**개선 사항**:
- 통계 대시보드 추가
  - 총 일기 수
  - 연속 작성 일수 (streak)
  - 이번 달 작성 일기 수
  - 감정 분포 차트
  - 최근 감정 트렌드
- 빠른 액션 버튼
  - 오늘 일기 작성
  - 최근 일기 보기
  - 분석 리포트 보기
- 위젯 시스템
  - 최근 분석 결과 요약
  - 감정 키워드 클라우드
  - 월간 감정 통계

**API 필요**:
- `GET /api/user/stats` - 사용자 통계 정보
- `GET /api/diary/stats` - 일기 통계 정보
- `GET /api/analysis/trends` - 감정 트렌드 데이터

**우선순위**: 높음

#### 2. 일기 분석 페이지 강화 (`/diary/analysis`)

**현재 상태**: 기본적인 분석 결과 표시

**개선 사항**:
- 상세 분석 결과 표시
  - HUA 감정 엔진 메트릭 시각화
    - 감정 좌표 그래프
    - 엔트로피 및 밀도 차트
    - 감정 타임라인
    - 감정 전환 그래프
  - AI 분석 결과 상세
    - 감정 흐름 상세 분석
    - 주요 감정 태그
    - 성찰 질문 및 해석
    - 감정 슬립 레벨 표시
- 비교 분석 기능
  - 이전 일기와 비교
  - 기간별 감정 변화 추이
- 인사이트 카드
  - 주요 발견 사항
  - 패턴 인식
  - 개선 제안

**API 필요**:
- `GET /api/diary/[id]/analysis` - 분석 결과 조회 (이미 존재)
- `GET /api/diary/[id]/analysis/comparison` - 비교 분석
- `GET /api/analysis/insights` - 인사이트 생성

**우선순위**: 높음

#### 3. 리포트 기능 (`/reports`)

**현재 상태**: 미구현 (API는 `_future-features`에 존재)

**개발 필요 사항**:
- 리포트 목록 페이지
  - 주간/월간/연간 리포트 목록
  - 리포트 생성 버튼
- 리포트 상세 페이지
  - 리포트 내용 표시
    - 감정 트렌드 분석
    - 키워드 하이라이트
    - 주요 테마
    - 성찰 질문
    - 격려 메시지
  - 리포트 공유 기능
- 리포트 생성 UI
  - 기간 선택
  - 리포트 생성 진행 상태
  - 생성 완료 알림

**API 필요**:
- `POST /api/reports/generate` - 리포트 생성 (이미 존재, 활성화 필요)
- `GET /api/reports` - 리포트 목록 조회
- `GET /api/reports/[id]` - 리포트 상세 조회

**우선순위**: 중간

#### 4. 프로필 페이지 개선 (`/profile`)

**현재 상태**: 기본적인 프로필 정보 표시

**개선 사항**:
- 프로필 메타데이터 편집
  - MBTI 설정
  - 작성 스타일 설정
  - 선호 감정 태그 선택
  - 성격 특성 입력
  - 관심사 및 목표 설정
  - 도전 과제 입력
- 프로필 통계
  - 총 일기 수
  - 작성 기간
  - 평균 감정 점수
  - 주요 감정 태그
- 프로필 공개 설정
  - 프로필 공개 여부
  - 통계 공개 범위

**API 필요**:
- `GET /api/user/profile` - 프로필 정보 조회 (이미 존재)
- `PATCH /api/user/profile` - 프로필 정보 수정
- `PATCH /api/user/profile/meta` - 프로필 메타데이터 수정

**우선순위**: 중간

#### 5. 설정 페이지 확장 (`/settings`)

**현재 상태**: 기본적인 설정 항목

**개선 사항**:
- AI 설정 상세
  - 프로바이더별 설정
  - 모델 선택
  - 프롬프트 커스터마이징
- 분석 설정
  - 분석 깊이 상세 옵션
  - 감정 태그 필터
  - 분석 결과 표시 옵션
- 개인화 설정
  - 선호 톤 상세 설정
  - 출력 언어 설정
  - 날짜 형식 설정
- 프라이버시 설정
  - 데이터 분석 참여 여부
  - 익명화 옵션
  - 데이터 삭제 요청
- 알림 설정 상세
  - 알림 타입별 설정
  - 알림 시간 설정
  - 알림 채널 선택

**API 필요**:
- `GET /api/user/settings` - 설정 조회 (이미 존재)
- `PATCH /api/user/settings` - 설정 수정 (이미 존재)
- `DELETE /api/user/data` - 데이터 삭제 요청

**우선순위**: 중간

#### 6. 검색 기능 개선 (`/search`)

**현재 상태**: 기본적인 검색 기능

**개선 사항**:
- 고급 검색 필터
  - 날짜 범위 필터
  - 감정 태그 필터
  - 키워드 필터
  - 슬립 레벨 필터
- 검색 결과 정렬
  - 날짜순
  - 관련도순
  - 감정 점수순
- 검색 히스토리
  - 최근 검색어
  - 인기 검색어
- 검색 결과 하이라이트
  - 검색어 하이라이트
  - 요약 미리보기

**API 필요**:
- `GET /api/search` - 검색 (이미 존재, 개선 필요)
- `GET /api/search/history` - 검색 히스토리
- `GET /api/search/suggestions` - 검색 제안

**우선순위**: 낮음

#### 7. 캘린더 뷰 개선

**현재 상태**: 기본적인 캘린더 표시

**개선 사항**:
- 월간/주간/일간 뷰 전환
- 감정 색상 코딩
  - 일기 작성일 색상 표시
  - 주요 감정 색상 표시
- 캘린더 통계
  - 월별 작성 일수
  - 감정 분포
- 빠른 액션
  - 날짜 클릭 시 일기 작성/보기
  - 드래그 앤 드롭으로 날짜 변경

**API 필요**:
- `GET /api/diary/calendar` - 캘린더 데이터 (날짜별 일기 존재 여부, 감정 정보)

**우선순위**: 중간

#### 8. 모바일 최적화

**현재 상태**: 반응형 디자인 기본 적용

**개선 사항**:
- 모바일 전용 UI 컴포넌트
  - 스와이프 제스처
  - 하단 네비게이션 바
  - 모바일 최적화된 에디터
- 오프라인 기능 강화
  - 오프라인 일기 작성
  - 오프라인 데이터 동기화
  - 오프라인 알림
- 푸시 알림
  - 일기 작성 알림
  - 분석 완료 알림
  - 공지사항 알림

**우선순위**: 높음

---

## 어드민 페이지 개발 플랜

### 현재 구현 상태

#### 완료된 페이지

1. **관리자 대시보드** (`/admin`)
   - 기본 통계 표시
   - 빠른 액션 링크

2. **일기 관리** (`/admin/diaries`)
   - 일기 목록 조회
   - 일기 상세 보기

3. **사용자 관리** (`/admin/users`)
   - 사용자 목록 조회
   - 사용자 상세 보기

4. **위기 감지 모니터링** (`/admin/monitoring/crisis`)
   - 위기 알림 목록
   - 위기 알림 상세

5. **성능 모니터링** (`/admin/monitoring/performance`)
   - 시스템 성능 지표

6. **에러 모니터링** (`/admin/monitoring/errors`)
   - 에러 로그 조회

7. **공지사항 관리** (`/admin/announcements`)
   - 공지사항 목록
   - 공지사항 생성/수정

8. **알림 관리** (`/admin/notifications`)
   - 알림 목록
   - 알림 생성

9. **데이터베이스 최적화** (`/admin/optimization`)
   - 데이터베이스 통계
   - 최적화 도구

10. **설정** (`/admin/setup`)
    - 초기 설정

### 개선 및 추가 개발 필요 사항

#### 1. 관리자 대시보드 강화 (`/admin`)

**현재 상태**: 기본적인 통계 표시

**개선 사항**:
- 실시간 통계 대시보드
  - 총 사용자 수 (활성/비활성/차단)
  - 총 일기 수 (전체/삭제됨)
  - 오늘 작성된 일기 수
  - 오늘 분석 요청 수
  - 시스템 상태 (온라인/오프라인/저하)
- 차트 및 그래프
  - 사용자 증가 추이 (일/주/월)
  - 일기 작성 추이
  - 분석 요청 추이
  - AI 프로바이더별 사용량
  - 비용 통계 (토큰 사용량, 총 비용)
- 최근 활동 피드
  - 최근 가입 사용자
  - 최근 작성된 일기
  - 최근 위기 알림
  - 최근 에러 로그
- 빠른 액션 패널
  - 위기 알림 확인
  - 악용 알림 확인
  - 공지사항 작성
  - 사용자 검색

**API 필요**:
- `GET /api/admin/dashboard` - 대시보드 통계 (이미 존재, 개선 필요)
- `GET /api/admin/dashboard/realtime` - 실시간 통계
- `GET /api/admin/dashboard/charts` - 차트 데이터

**우선순위**: 높음

#### 2. 일기 관리 개선 (`/admin/diaries`)

**현재 상태**: 기본적인 일기 목록 및 상세 보기

**개선 사항**:
- 고급 필터링 및 검색
  - 사용자별 필터
  - 날짜 범위 필터
  - 삭제 여부 필터
  - 분석 제외 여부 필터
  - 키워드 검색
  - 감정 태그 필터
- 일기 상세 관리
  - 일기 내용 복호화 표시 (권한 필요)
  - 분석 결과 확인
  - 위기 알림 연관 확인
  - 악용 알림 연관 확인
  - 일기 삭제/복원
  - 분석 제외 설정
- 일기 통계
  - 사용자별 일기 수
  - 날짜별 작성 통계
  - 감정 분포 통계
- 일괄 작업
  - 선택된 일기 삭제
  - 선택된 일기 분석 제외 설정
  - 선택된 일기 분석 재실행

**API 필요**:
- `GET /api/admin/diaries` - 일기 목록 (이미 존재, 필터링 개선 필요)
- `GET /api/admin/diaries/[id]` - 일기 상세 (이미 존재, 복호화 기능 추가 필요)
- `DELETE /api/admin/diaries/[id]` - 일기 삭제
- `POST /api/admin/diaries/[id]/restore` - 일기 복원
- `PATCH /api/admin/diaries/[id]/exclude` - 분석 제외 설정
- `POST /api/admin/diaries/batch` - 일괄 작업

**우선순위**: 높음

#### 3. 사용자 관리 개선 (`/admin/users`)

**현재 상태**: 기본적인 사용자 목록 및 상세 보기

**개선 사항**:
- 고급 필터링 및 검색
  - 상태별 필터 (active, inactive, resigned, banned)
  - 역할별 필터 (USER, ADMIN)
  - 가입일 범위 필터
  - 이메일/닉네임 해시 검색
  - 일기 수 범위 필터
- 사용자 상세 관리
  - 사용자 정보 복호화 표시 (권한 필요)
  - 프로필 메타데이터 확인
  - 사용자 설정 확인
  - 일기 목록 확인
  - 분석 결과 통계
  - 로그인 기록 확인
  - 상태 변경 이력 확인
  - 위기 알림 이력 확인
  - 악용 알림 이력 확인
- 사용자 상태 관리
  - 상태 변경 (active, inactive, resigned, banned)
  - 역할 변경 (USER, ADMIN)
  - 상태 변경 사유 입력
  - 상태 변경 이력 기록
- 사용자 통계
  - 총 일기 수
  - 평균 감정 점수
  - 주요 감정 태그
  - 마지막 활동일
  - 가입 후 경과일
- 일괄 작업
  - 선택된 사용자 상태 변경
  - 선택된 사용자 역할 변경
  - 선택된 사용자 이메일 발송

**API 필요**:
- `GET /api/admin/users` - 사용자 목록 (이미 존재, 필터링 개선 필요)
- `GET /api/admin/users/[id]` - 사용자 상세 (이미 존재, 복호화 기능 추가 필요)
- `PATCH /api/admin/users/[id]/state` - 사용자 상태 변경
- `PATCH /api/admin/users/[id]/role` - 사용자 역할 변경
- `GET /api/admin/users/[id]/logs` - 사용자 로그 조회
- `GET /api/admin/users/[id]/stats` - 사용자 통계
- `POST /api/admin/users/batch` - 일괄 작업

**우선순위**: 높음

#### 4. 위기 감지 모니터링 강화 (`/admin/monitoring/crisis`)

**현재 상태**: 기본적인 위기 알림 목록 및 상세

**개선 사항**:
- 고급 필터링 및 검색
  - 상태별 필터 (PENDING, CONFIRMED, FALSE_POSITIVE, HANDLED, DISMISSED)
  - 위기 타입별 필터
  - 위험도별 필터 (0-4)
  - 날짜 범위 필터
  - 검토자별 필터
  - AI 감지/키워드 감지 필터
- 위기 알림 상세 관리
  - 익명화된 일기 내용 표시
  - 재식별 위험 평가 확인
  - AI 감지 결과 확인
  - 키워드 감지 결과 확인
  - 히스토리 컨텍스트 확인
  - 관련 일기 확인
  - 관련 분석 결과 확인
- 위기 알림 처리
  - 상태 변경 (CONFIRMED, FALSE_POSITIVE, HANDLED, DISMISSED)
  - 검토자 지정
  - 관리자 메모 작성
  - 조치 내용 기록
  - 일기 복호화 요청 (고위험도만)
  - 외부 기관 연계 (필요시)
- 위기 알림 통계
  - 상태별 통계
  - 위기 타입별 통계
  - 위험도별 통계
  - 일별/주별/월별 추이
  - 처리 시간 통계
- 위기 알림 로그
  - 처리 이력 확인
  - 관리자 행동 추적
  - IP 주소 및 User-Agent 기록

**API 필요**:
- `GET /api/admin/crisis-alerts` - 위기 알림 목록 (이미 존재, 필터링 개선 필요)
- `GET /api/admin/crisis-alerts/[id]` - 위기 알림 상세 (이미 존재)
- `PATCH /api/admin/crisis-alerts/[id]` - 위기 알림 상태 변경 (이미 존재)
- `POST /api/admin/crisis-alerts/[id]/decrypt` - 일기 복호화 요청 (고위험도)
- `GET /api/admin/crisis-alerts/[id]/logs` - 위기 알림 로그
- `GET /api/admin/crisis-alerts/stats` - 위기 알림 통계

**우선순위**: 매우 높음

#### 5. 악용 감지 모니터링 (`/admin/monitoring/abuse`)

**현재 상태**: 미구현

**개발 필요 사항**:
- 악용 알림 목록 페이지
  - 알림 타입별 필터 (CRISIS, ABUSE)
  - 악용 패턴별 필터
  - 제재 레벨별 필터
  - 상태별 필터
  - 날짜 범위 필터
- 악용 알림 상세 페이지
  - 익명화된 일기 내용 표시
  - 악용 패턴 상세 확인
  - 콘텐츠 플래그 확인
  - 감지된 패턴 설명
  - 관련 일기 확인
  - 관련 분석 결과 확인
- 악용 알림 처리
  - 상태 변경 (REVIEWED, FALSE_POSITIVE, ACTION_TAKEN, DISMISSED)
  - 검토자 지정
  - 관리자 메모 작성
  - 조치 내용 기록
  - 사용자 제재 적용
  - 분석 제외 설정
- 악용 알림 통계
  - 알림 타입별 통계
  - 악용 패턴별 통계
  - 제재 레벨별 통계
  - 일별/주별/월별 추이
  - 처리 시간 통계
- 사용자 제재 관리
  - 경고 발송
  - Rate limiting 적용
  - 임시 차단
  - 영구 차단
  - 제재 해제

**API 필요**:
- `GET /api/admin/abuse-alerts` - 악용 알림 목록
- `GET /api/admin/abuse-alerts/[id]` - 악용 알림 상세
- `PATCH /api/admin/abuse-alerts/[id]` - 악용 알림 상태 변경
- `POST /api/admin/abuse-alerts/[id]/penalty` - 사용자 제재 적용
- `GET /api/admin/abuse-alerts/stats` - 악용 알림 통계

**우선순위**: 매우 높음

#### 6. 분석 결과 관리 (`/admin/analysis`)

**현재 상태**: 미구현

**개발 필요 사항**:
- 분석 결과 목록 페이지
  - 프로바이더별 필터
  - 상태별 필터
  - 날짜 범위 필터
  - 일기별 필터
- 분석 결과 상세 페이지
  - 분석 결과 복호화 표시 (권한 필요)
  - HUA 감정 엔진 분석 결과 확인
  - AI 분석 결과 확인
  - 시스템 메타데이터 확인
  - 원본 AI 응답 확인
  - 분석 재실행
- 분석 통계
  - 프로바이더별 사용량
  - 상태별 통계
  - 평균 처리 시간
  - 평균 토큰 사용량
  - 비용 통계
- 분석 품질 관리
  - 품질 점수 확인
  - 위험 요소 확인
  - 콘텐츠 플래그 확인
  - 분석 재실행 요청

**API 필요**:
- `GET /api/admin/analysis` - 분석 결과 목록
- `GET /api/admin/analysis/[id]` - 분석 결과 상세
- `POST /api/admin/analysis/[id]/rerun` - 분석 재실행
- `GET /api/admin/analysis/stats` - 분석 통계

**우선순위**: 중간

#### 7. 로그 관리 (`/admin/logs`)

**현재 상태**: 기본적인 에러 로그만 존재

**개발 필요 사항**:
- 로그 타입별 페이지
  - 로그인 로그 (`/admin/logs/login`)
    - 사용자별 필터
    - 날짜 범위 필터
    - 성공/실패 필터
    - IP 주소 검색
    - 게스트/회원 필터
  - API 로그 (`/admin/logs/api`)
    - 사용자별 필터
    - 엔드포인트별 필터
    - 상태 코드 필터
    - 응답 시간 필터
    - 날짜 범위 필터
  - 에러 로그 (`/admin/logs/errors`)
    - 심각도별 필터
    - 서비스별 필터
    - 날짜 범위 필터
    - 에러 메시지 검색
  - 콘텐츠 검열 로그 (`/admin/logs/moderation`)
    - 일기별 필터
    - 액션별 필터
    - 관리자별 필터
    - 날짜 범위 필터
  - 사용자 상태 로그 (`/admin/logs/user-status`)
    - 사용자별 필터
    - 상태 변경 필터
    - 날짜 범위 필터
- 로그 상세 보기
  - 로그 상세 정보
  - 관련 데이터 확인
  - 로그 다운로드
- 로그 통계
  - 로그 타입별 통계
  - 시간대별 통계
  - 에러율 통계
  - 평균 응답 시간

**API 필요**:
- `GET /api/admin/logs/login` - 로그인 로그
- `GET /api/admin/logs/api` - API 로그
- `GET /api/admin/logs/errors` - 에러 로그 (이미 존재, 개선 필요)
- `GET /api/admin/logs/moderation` - 검열 로그
- `GET /api/admin/logs/user-status` - 사용자 상태 로그
- `GET /api/admin/logs/stats` - 로그 통계

**우선순위**: 중간

#### 8. 성능 모니터링 개선 (`/admin/monitoring/performance`)

**현재 상태**: 기본적인 성능 지표 표시

**개선 사항**:
- 실시간 성능 모니터링
  - API 응답 시간 그래프
  - 에러율 그래프
  - 요청량 그래프
  - 데이터베이스 쿼리 시간
  - 캐시 히트율
- 성능 알림
  - 임계값 설정
  - 성능 저하 알림
  - 에러율 증가 알림
- 성능 분석
  - 느린 쿼리 분석
  - 병목 지점 식별
  - 최적화 제안

**API 필요**:
- `GET /api/admin/monitoring/performance` - 성능 지표 (이미 존재, 개선 필요)
- `GET /api/admin/monitoring/performance/realtime` - 실시간 성능 지표
- `GET /api/admin/monitoring/performance/slow-queries` - 느린 쿼리 분석

**우선순위**: 중간

#### 9. 데이터베이스 관리 (`/admin/database`)

**현재 상태**: 기본적인 최적화 도구만 존재

**개선 사항**:
- 데이터베이스 통계
  - 테이블별 레코드 수
  - 테이블별 크기
  - 인덱스 사용률
  - 쿼리 성능 통계
- 데이터베이스 최적화
  - 인덱스 최적화
  - 테이블 정리
  - 통계 업데이트
  - VACUUM 실행
- 데이터베이스 백업
  - 백업 스케줄 설정
  - 백업 이력 확인
  - 백업 복원
- 데이터베이스 쿼리 실행
  - 쿼리 실행 도구
  - 쿼리 결과 확인
  - 쿼리 성능 분석

**API 필요**:
- `GET /api/admin/database/stats` - 데이터베이스 통계 (이미 존재, 개선 필요)
- `POST /api/admin/database/optimize` - 데이터베이스 최적화 (이미 존재)
- `GET /api/admin/database/backups` - 백업 이력
- `POST /api/admin/database/backup` - 백업 생성
- `POST /api/admin/database/query` - 쿼리 실행 (제한적)

**우선순위**: 낮음

#### 10. 시스템 설정 (`/admin/settings`)

**현재 상태**: 미구현

**개발 필요 사항**:
- 시스템 설정 관리
  - 암호화 키 관리
    - 키 로테이션
    - 키 상태 확인
  - AI 프로바이더 설정
    - 프로바이더별 API 키 설정
    - 프로바이더별 사용량 제한
    - 프로바이더별 비용 설정
  - 위기 감지 설정
    - 위험도 임계값 설정
    - 알림 설정
    - 자동 조치 설정
  - 악용 감지 설정
    - 패턴 감지 임계값 설정
    - 제재 정책 설정
  - 알림 설정
    - 알림 템플릿 관리
    - 알림 채널 설정
  - 시스템 유지보수
    - 유지보수 모드 설정
    - 유지보수 메시지 설정

**API 필요**:
- `GET /api/admin/settings` - 시스템 설정 조회
- `PATCH /api/admin/settings` - 시스템 설정 수정
- `POST /api/admin/rotate-keys` - 키 로테이션 (이미 존재)
- `GET /api/admin/settings/keys` - 키 상태 확인

**우선순위**: 높음

#### 11. 공지사항 관리 개선 (`/admin/announcements`)

**현재 상태**: 기본적인 공지사항 목록 및 생성

**개선 사항**:
- 공지사항 상세 관리
  - 공지사항 편집
  - 공지사항 삭제
  - 공지사항 발행/중지
  - 발행 일정 설정
  - 만료 일정 설정
- 공지사항 통계
  - 조회 수
  - 읽음 수
  - 사용자별 읽음 상태
- 공지사항 템플릿
  - 템플릿 저장
  - 템플릿 재사용

**API 필요**:
- `GET /api/admin/announcements` - 공지사항 목록 (이미 존재)
- `GET /api/admin/announcements/[id]` - 공지사항 상세
- `PATCH /api/admin/announcements/[id]` - 공지사항 수정
- `DELETE /api/admin/announcements/[id]` - 공지사항 삭제
- `GET /api/admin/announcements/[id]/stats` - 공지사항 통계

**우선순위**: 낮음

#### 12. 알림 관리 개선 (`/admin/notifications`)

**현재 상태**: 기본적인 알림 목록 및 생성

**개선 사항**:
- 알림 상세 관리
  - 알림 편집
  - 알림 삭제
  - 알림 발송 일정 설정
  - 알림 표시 기간 설정
- 알림 발송
  - 개별 사용자 발송
  - 그룹 발송
  - 조건부 발송
- 알림 통계
  - 발송 수
  - 읽음 수
  - 읽음률
  - 사용자별 읽음 상태

**API 필요**:
- `GET /api/admin/notifications` - 알림 목록 (이미 존재)
- `GET /api/admin/notifications/[id]` - 알림 상세
- `PATCH /api/admin/notifications/[id]` - 알림 수정
- `DELETE /api/admin/notifications/[id]` - 알림 삭제
- `POST /api/admin/notifications/send` - 알림 발송
- `GET /api/admin/notifications/[id]/stats` - 알림 통계

**우선순위**: 낮음

#### 13. 리포트 관리 (`/admin/reports`)

**현재 상태**: 미구현

**개발 필요 사항**:
- 리포트 목록 페이지
  - 사용자별 필터
  - 기간 타입별 필터
  - 날짜 범위 필터
- 리포트 상세 페이지
  - 리포트 내용 확인
  - 리포트 통계
- 리포트 생성
  - 사용자별 리포트 생성
  - 일괄 리포트 생성
- 리포트 통계
  - 생성된 리포트 수
  - 기간 타입별 통계

**API 필요**:
- `GET /api/admin/reports` - 리포트 목록
- `GET /api/admin/reports/[id]` - 리포트 상세
- `POST /api/admin/reports/generate` - 리포트 생성
- `GET /api/admin/reports/stats` - 리포트 통계

**우선순위**: 낮음

#### 14. 이벤트 관리 (`/admin/events`)

**현재 상태**: 미구현

**개발 필요 사항**:
- 이벤트 목록 페이지
  - 이벤트 목록 조회
  - 이벤트 생성/수정/삭제
- 이벤트 상세 페이지
  - 이벤트 정보 확인
  - 참가자 목록 확인
  - 참가 통계
- 이벤트 통계
  - 참가자 수
  - 연속 참가 일수 통계
  - 보상 지급 통계

**API 필요**:
- `GET /api/admin/events` - 이벤트 목록
- `GET /api/admin/events/[id]` - 이벤트 상세
- `POST /api/admin/events` - 이벤트 생성
- `PATCH /api/admin/events/[id]` - 이벤트 수정
- `DELETE /api/admin/events/[id]` - 이벤트 삭제
- `GET /api/admin/events/[id]/stats` - 이벤트 통계

**우선순위**: 낮음

---

## API 엔드포인트 정리

### 사용자 API

#### 인증
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/[...nextauth]` - NextAuth 인증

#### 일기
- `GET /api/diary` - 일기 목록 조회
- `POST /api/diary/create` - 일기 생성
- `GET /api/diary/[id]` - 일기 상세 조회
- `PATCH /api/diary/[id]` - 일기 수정
- `DELETE /api/diary/[id]` - 일기 삭제
- `GET /api/diary/draft` - 임시저장 조회
- `POST /api/diary/draft` - 임시저장 저장
- `DELETE /api/diary/draft` - 임시저장 삭제

#### 분석
- `POST /api/diary/[id]/analyze` - 일기 분석 요청
- `GET /api/diary/[id]/analysis` - 분석 결과 조회
- `POST /api/hua-emotion-analysis` - HUA 감정 분석

#### 사용자
- `GET /api/user/profile` - 프로필 조회
- `PATCH /api/user/profile` - 프로필 수정
- `GET /api/user/settings` - 설정 조회
- `PATCH /api/user/settings` - 설정 수정
- `POST /api/user/upload` - 프로필 이미지 업로드
- `GET /api/user/admin-check` - 관리자 권한 확인
- `POST /api/user/migrate-guest-diaries` - 게스트 일기 마이그레이션

#### 알림
- `GET /api/notifications` - 알림 목록
- `GET /api/notifications/[id]` - 알림 상세
- `PATCH /api/notifications/[id]` - 알림 읽음 처리
- `POST /api/notifications/mark-all-read` - 전체 읽음 처리
- `DELETE /api/notifications/delete-read` - 읽은 알림 삭제
- `DELETE /api/notifications/delete-multiple` - 여러 알림 삭제
- `GET /api/notifications/unread-count` - 읽지 않은 알림 수

#### 공지사항
- `GET /api/announcements` - 공지사항 목록
- `GET /api/announcements/[id]` - 공지사항 상세

#### 검색
- `GET /api/search` - 일기 검색

#### 게스트
- `GET /api/guest/usage` - 게스트 사용량 확인

### 관리자 API

#### 대시보드
- `GET /api/admin/dashboard` - 대시보드 통계

#### 일기 관리
- `GET /api/admin/diaries` - 일기 목록
- `GET /api/admin/diaries/[id]` - 일기 상세
- `DELETE /api/admin/diary/[id]/delete` - 일기 삭제
- `POST /api/admin/diary/[id]/restore` - 일기 복원
- `GET /api/admin/diary/status` - 일기 상태 조회
- `GET /api/admin/diary/deleted` - 삭제된 일기 목록

#### 사용자 관리
- `GET /api/admin/users` - 사용자 목록

#### 위기 감지
- `GET /api/admin/crisis-alerts` - 위기 알림 목록
- `GET /api/admin/crisis-alerts/[id]` - 위기 알림 상세
- `PATCH /api/admin/crisis-alerts/[id]` - 위기 알림 상태 변경

#### 모니터링
- `GET /api/admin/monitoring/errors` - 에러 로그
- `GET /api/admin/monitoring/performance` - 성능 지표

#### 데이터베이스
- `GET /api/admin/database-stats` - 데이터베이스 통계
- `POST /api/admin/optimize-database` - 데이터베이스 최적화

#### 캐시
- `GET /api/admin/cache-stats` - 캐시 통계

#### 키 관리
- `POST /api/admin/rotate-keys` - 키 로테이션

#### 설정
- `POST /api/admin/setup` - 초기 설정

#### 알림
- `GET /api/admin/notifications/test-data` - 테스트 데이터 생성

---

## 개발 우선순위

### Phase 1: 핵심 기능 강화 (1-2개월)

#### 사용자 페이지
1. 대시보드 개선 - 통계 및 차트 추가
2. 일기 분석 페이지 강화 - HUA 감정 엔진 시각화
3. 모바일 최적화 - 반응형 UI 개선

#### 어드민 페이지
1. 관리자 대시보드 강화 - 실시간 통계 및 차트
2. 위기 감지 모니터링 강화 - 상세 관리 기능
3. 악용 감지 모니터링 - 신규 개발

### Phase 2: 고급 기능 개발 (2-3개월)

#### 사용자 페이지
1. 리포트 기능 - 주간/월간/연간 리포트
2. 프로필 페이지 개선 - 메타데이터 편집
3. 설정 페이지 확장 - 상세 설정 옵션
4. 캘린더 뷰 개선 - 감정 색상 코딩

#### 어드민 페이지
1. 일기 관리 개선 - 고급 필터링 및 일괄 작업
2. 사용자 관리 개선 - 상세 관리 기능
3. 분석 결과 관리 - 분석 품질 관리
4. 로그 관리 - 종합 로그 시스템

### Phase 3: 최적화 및 확장 (3-4개월)

#### 사용자 페이지
1. 검색 기능 개선 - 고급 검색 필터
2. 오프라인 기능 강화 - 동기화 개선
3. 푸시 알림 - 실시간 알림

#### 어드민 페이지
1. 성능 모니터링 개선 - 실시간 모니터링
2. 데이터베이스 관리 - 최적화 도구
3. 시스템 설정 - 종합 설정 관리
4. 리포트 관리 - 리포트 생성 및 통계
5. 이벤트 관리 - 이벤트 시스템

### Phase 4: 유지보수 및 개선 (지속적)

1. 버그 수정 및 성능 최적화
2. 사용자 피드백 반영
3. 보안 강화
4. 문서화 개선

---

## 기술 스택

### 프론트엔드
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (상태 관리)
- @hua-labs/ui (UI 컴포넌트)
- @hua-labs/motion (애니메이션)

### 백엔드
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js (인증)
- Redis (캐싱)

### AI/분석
- OpenAI API
- Google Gemini API
- HUA 감정 엔진

### 보안
- 클라이언트 사이드 암호화
- 서버 사이드 암호화
- 키 로테이션
- 익명화 처리

---

## 보안 고려사항

### 데이터 암호화
- 사용자 개인정보 (이름, 이메일, 닉네임)는 암호화되어 저장
- 일기 내용은 암호화되어 저장
- 분석 결과는 암호화되어 저장
- 관리자도 복호화 권한이 있어야만 내용 확인 가능

### 권한 관리
- 관리자 권한 확인은 모든 어드민 API에서 필수
- 위기 알림 처리 시 로그 기록 필수
- 일기 복호화는 고위험도 위기 알림에서만 허용

### 익명화
- 위기 알림 및 악용 알림에서 일기 내용은 익명화되어 표시
- 재식별 위험 평가 필요

---

## 성능 최적화

### 캐싱 전략
- Redis를 활용한 API 응답 캐싱
- 정적 데이터 캐싱
- 사용자별 캐싱

### 데이터베이스 최적화
- 인덱스 최적화
- 쿼리 최적화
- 연결 풀 관리

### 프론트엔드 최적화
- 코드 스플리팅
- 이미지 최적화
- 레이지 로딩

---

## 문서화

### API 문서
- 각 API 엔드포인트의 요청/응답 형식 문서화
- 에러 코드 및 메시지 문서화

### 사용자 가이드
- 기능 사용 방법 가이드
- FAQ 작성

### 개발자 가이드
- 개발 환경 설정
- 코드 스타일 가이드
- 배포 가이드

---

## 테스트

### 단위 테스트
- 유틸리티 함수 테스트
- API 엔드포인트 테스트

### 통합 테스트
- 사용자 플로우 테스트
- 관리자 플로우 테스트

### E2E 테스트
- 주요 기능 E2E 테스트

---

## 배포

### 환경
- 개발 환경
- 스테이징 환경
- 프로덕션 환경

### CI/CD
- 자동 테스트
- 자동 배포
- 롤백 전략

---

## 모니터링

### 에러 추적
- 에러 로그 수집
- 에러 알림

### 성능 모니터링
- API 응답 시간 모니터링
- 데이터베이스 쿼리 시간 모니터링

### 사용자 모니터링
- 사용자 활동 추적
- 기능 사용률 추적

---

이 문서는 프로젝트의 현재 상태를 기반으로 작성되었으며, 스키마 변경이나 요구사항 변경 시 업데이트가 필요합니다.

