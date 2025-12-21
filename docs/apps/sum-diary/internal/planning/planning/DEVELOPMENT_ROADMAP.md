# 개발 로드맵

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16

## 개요

이 문서는 숨다이어리 서비스의 개발 계획 및 로드맵을 통합한 문서입니다. 완료된 계획은 제거하고, 진행 중이거나 예정된 계획만 포함합니다.

---

## 우선순위별 개발 계획

### 우선순위: 높음 (Critical)

#### 1. 데이터 내보내기 기능
**상태**: 계획 중  
**목표**: 사용자가 자신의 일기 데이터를 다양한 형식으로 내보낼 수 있는 기능 제공

**지원 형식:**
- HTML+CSS: 웹 브라우저에서 볼 수 있는 형식
- PDF: 인쇄 및 보관용 PDF 형식
- JSON: 원본 데이터 형식
- CSV: 스프레드시트 분석용 형식

**구현 계획:**
1. API 엔드포인트: `/api/export` - 데이터 내보내기 API
2. HTML 생성: 서버 사이드 HTML 생성
3. PDF 변환: Puppeteer 또는 jsPDF 사용
4. 다운로드: 파일 다운로드 기능

**개발 단계:**
- Phase 1: HTML+CSS 형식 (우선순위 높음)
- Phase 2: PDF 형식
- Phase 3: JSON/CSV 형식
- Phase 4: 고급 기능 (필터링, 날짜 범위 등)

**보안 고려사항:**
- 암호화 해제: 내보내기 시 데이터 복호화
- 개인정보 보호: 민감한 정보 필터링
- 접근 제어: 본인 데이터만 내보내기 가능

**참고 문서**: [데이터 내보내기 계획](./DATA_EXPORT_PLAN.md)

---

#### 2. SSE (Server-Sent Events) 스트리밍 구현
**상태**: 계획 중  
**목표**: AI 분석 결과를 실시간으로 스트리밍하여 사용자 경험 개선

**구현 계획:**

**OpenAI vs Gemini 스트리밍 API 차이점:**
- OpenAI: `stream: true` 옵션, `delta.content`로 증분 데이터
- Gemini: `generateContentStream()` 메서드, `chunk.text()`로 전체 텍스트

**Next.js SSE API Route 구조:**
- API Route: `/api/diary/analyze/stream/route.ts`
- SSE 헤더 설정
- ReadableStream으로 스트리밍 응답

**프론트엔드 구현:**
- EventSource API 사용
- 점진적 렌더링
- 에러 처리 및 재연결 로직

**참고 문서**: [SSE 구현 계획](./SSE_IMPLEMENTATION_PLAN.md)

---

#### 3. 관리자 페이지 개발
**상태**: 진행 중  
**목표**: 관리자가 시스템을 모니터링하고 관리할 수 있는 대시보드 구축

**주요 기능:**
- 사용자 관리: 사용자 목록, 상태 관리, 권한 설정
- 일기 관리: 전체 일기 조회, 삭제, 복구
- 위기 감지 모니터링: 위기 알림 목록, 상태 관리, Escalation 추적
- 시스템 모니터링: 성능 지표, 에러 로그, API 통계
- 콘텐츠 관리: 알림, 공지사항, 이벤트 관리
- 시스템 최적화: 인덱스 생성, 데이터 정리, 키 관리

**참고 문서**: [관리자 개발 계획](./ADMIN_DEVELOPMENT_PLAN.md)

---

### 우선순위: 중간 (Important)

#### 4. 코드베이스 정리
**상태**: 진행 중  
**목표**: 코드베이스의 유지보수성 향상을 위한 정리 작업

**주요 작업:**
- 미사용 코드 제거
- 중복 코드 통합
- 컴포넌트 재구성
- 테스트 코드 정리

**참고 문서**: 
- [코드베이스 정리 계획](./CODEBASE_CLEANUP_PLAN.md)
- [컴포넌트 재구성 계획](./COMPONENTS_REORGANIZATION_PLAN.md)
- [리팩토링 이력](../history/REFACTORING_HISTORY.md)

---

#### 5. Soft Delete 구현
**상태**: 계획 중  
**목표**: 데이터 복구 가능한 삭제 시스템 구현

**구현 계획:**
- `deleted_at`, `deleted_by`, `is_deleted` 필드 활용
- 삭제된 데이터 조회 API
- 복구 기능
- 영구 삭제 기능

**참고 문서**: [Soft Delete 구현 계획](./FUTURE_SOFT_DELETE_IMPLEMENTATION.md)

---

### 우선순위: 낮음 (Nice to Have)

#### 6. 추가 기능 개발
**상태**: 계획 중

**기능 목록:**
- 주간/월간 리포트 자동 생성
- 감정 트렌드 시각화
- 키워드 자동 추출 및 태깅
- 일기 검색 기능 고도화
- 모바일 앱 (PWA)
- 다국어 지원

---

## 데이터베이스 스키마 개요

### 핵심 모델

#### 1. User (사용자)
- 기본 정보: id, email_hash, nickname_hash, state, role
- 암호화 필드: name_enc, email_enc, nickname_enc
- 상태 관리: UserState (active, inactive, resigned, banned)
- 역할: UserRole (USER, ADMIN)

#### 2. DiaryEntry (일기)
- 기본 정보: id, user_id, title, content_enc (암호화된 내용)
- 시간 정보: diary_date, actual_written_at, is_delayed_entry
- 삭제 관리: deleted_at, deleted_by, is_deleted
- 분석 제외: exclude_from_analysis

#### 3. AnalysisResult (분석 결과)
- 프로바이더: AnalysisProvider (OPENAI, GEMINI, HUA_ENGINE, MOCK)
- 상태: AnalysisStatus (PENDING, PROCESSING, COMPLETED, FAILED)
- 암호화 필드: title_enc, summary_enc, emotion_flow_enc 등
- 메타데이터: mode, tone, affect_tier, momentum_tier, ethics, confidence

#### 4. CrisisAlert (위기 감지 알림)
- 위기 타입: CrisisType (SUICIDE, SELF_HARM, DRUG 등)
- 상태: CrisisAlertStatus (PENDING, CONFIRMED, FALSE_POSITIVE 등)
- 위험도: risk_level (0-4)
- 익명화 내용: diary_excerpt, diary_full_anonymized

#### 5. AbuseAlert (악용 감지 알림)
- 알림 타입: AlertType (CRISIS, ABUSE)
- 악용 패턴: AbusePattern (RAPID_REQUESTS, REPETITIVE_CONTENT 등)
- 제재 레벨: PenaltyLevel (WARNING, RATE_LIMIT, TEMPORARY_BAN 등)

---

## API 엔드포인트 정리

### 사용자 API
- `POST /api/diary/create` - 일기 생성
- `GET /api/diary` - 일기 목록 조회
- `GET /api/diary/[id]` - 일기 상세 조회
- `GET /api/diary/analyze/stream` - AI 분석 스트리밍
- `GET /api/quota` - 할당량 조회
- `GET /api/billing` - 비용 내역 조회
- `GET /api/export` - 데이터 내보내기 (계획 중)

### 관리자 API
- `GET /api/admin/users` - 사용자 목록
- `GET /api/admin/diaries` - 일기 목록
- `GET /api/admin/crisis-alerts` - 위기 알림 목록
- `GET /api/admin/stats` - 시스템 통계
- `POST /api/admin/optimize-database` - 데이터베이스 최적화

---

## 개발 우선순위

### 1단계 (즉시)
1. 데이터 내보내기 기능 (HTML+CSS 형식)
2. SSE 스트리밍 구현
3. 관리자 페이지 기본 기능

### 2단계 (이번 달)
1. 데이터 내보내기 (PDF 형식)
2. Soft Delete 구현
3. 코드베이스 정리 완료

### 3단계 (다음 분기)
1. 추가 기능 개발
2. 성능 최적화
3. 모니터링 시스템 고도화

---

## 참고 문서

### 활성 계획 문서
- [데이터 내보내기 계획](./DATA_EXPORT_PLAN.md) - 진행 중
- [SSE 구현 계획](./SSE_IMPLEMENTATION_PLAN.md) - 진행 중 (참고: 이미 구현 완료)
- [Soft Delete 구현 계획](./FUTURE_SOFT_DELETE_IMPLEMENTATION.md) - 향후 구현 예정

### 완료된 계획 문서
다음 문서들은 `planning/archive/` 폴더로 이동되었습니다:
- 개발 계획 상세 (archive)
- 관리자 개발 계획 (archive)
- 코드베이스 정리 계획 (archive)
- 컴포넌트 재구성 계획 (archive)
- 다음 단계 (archive)
- 작업 계획 (archive)

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
