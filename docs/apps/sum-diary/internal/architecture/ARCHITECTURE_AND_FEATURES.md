# 숨다이어리 아키텍처 및 기능 문서

> 이 문서는 실제 코드를 기반으로 작성되었습니다. 최종 업데이트: 2025-12-16

## 목차

1. [시스템 개요](#시스템-개요)
2. [주요 기능](#주요-기능)
3. [라이브러리 구조](#라이브러리-구조)
4. [보안 및 프라이버시](#보안-및-프라이버시)
5. [AI 분석 시스템](#ai-분석-시스템)
6. [데이터 흐름](#데이터-흐름)
7. [주요 API 엔드포인트](#주요-api-엔드포인트)

---

## 시스템 개요

### 기술 스택
- **프레임워크**: Next.js 16.0.10 (App Router)
- **인증**: NextAuth.js (Credentials, Kakao, Google)
- **데이터베이스**: PostgreSQL (Prisma ORM, Supabase 지원)
- **암호화**: AES-256-GCM
- **AI 프로바이더**: OpenAI GPT-5-mini, Google Gemini 2.5 Flash
- **스트리밍**: Server-Sent Events (SSE)를 통한 실시간 분석 결과 전송
- **캐싱**: Redis (선택적, 메모리 캐시 폴백)

### 아키텍처 패턴
- **Monolithic with Microservices-like Structure**: 단일 애플리케이션 내에서 서비스별로 모듈화
- **Privacy-First Design**: 모든 개인정보는 암호화되어 저장
- **Offline-First Support**: IndexedDB를 통한 오프라인 지원

---

## 주요 기능

### 1. 일기 작성 및 관리

#### 일기 작성 (`/diary/write`)
- **실시간 임시저장**: 5초마다 자동 저장 (온라인: DB, 오프라인: IndexedDB)
- **날짜 선택**: 오늘 일기, 나중 일기(과거), 미래 일기 지원
  - **오늘 일기**: `diary_date === today`, `is_delayed_entry = false`, 분석 가능
  - **나중 일기**: `diary_date < today`이고 `actual_written_at - diary_date > 24시간`, `is_delayed_entry = true`, 분석 가능, **수정 불가**
  - **미래 일기**: `diary_date > today`, `is_delayed_entry = false`, **분석 없음** (저장만), **수정 가능**
- **오프라인 지원**: 네트워크 없이도 작성 가능, 복구 시 자동 동기화
- **특별 메시지**: "보고싶어요" 입력 시 자동 응답 기능
- **수정 모드**: 미래일기만 수정 가능 (`/diary/write?edit={id}`), PUT API 사용

#### 일기 목록 (`/diary`)
- **뷰 모드 전환**: 캘린더 뷰 / 리스트 뷰 (Zustand 스토어로 상태 관리)
- **일기 조회**: 사용자별 일기 목록 (게스트 일기도 포함)
- **일기 삭제**: 확인 모달 후 삭제 (모든 일기 삭제 가능)
- **일기 수정**: **미래일기만 수정 가능** (메뉴에서 수정 버튼 표시)
  - `isFutureDiary(diary)` 체크: `diary_date > today`
  - 수정 버튼 클릭 시 `/diary/write?edit={id}&date={diaryDate}`로 이동
- **일기 타입 표시**: 미래일기/나중일기 뱃지 표시
- **필터링**: 전체/나중일기/일반일기 필터 지원
- **분석 결과 미리보기**: 각 일기의 분석 결과 요약 표시
- **정렬**: 최신순 정렬 (created_at 기준)

#### 일기 상세 (`/diary/[id]`)
- **암호화된 일기 내용 복호화**: 서버에서 복호화 후 전달
- **AI 분석 결과 표시**: 
  - 오늘의 장면 (summary)
  - 감정의 파형 (emotion_flow)
  - 자기성찰 질문 (reflection_question)
  - 감응 해석 (interpretation)
- **일기 타입 표시**: 나중일기 뱃지 표시 (`isDelayedEntry`)
- **일기 삭제**: 삭제 가능 (모든 일기)
- **일기 수정**: **미래일기만 수정 가능** (일반 일기/나중일기는 수정 불가)
- **게스트 로그인 유도**: 비로그인 사용자에게 로그인 안내

#### 대시보드 (`/` - 로그인 시)
- **통계 카드**: 총 일기 수, 연속 작성일, 이번 달 일기 수
- **최근 일기**: 최근 3개 일기 미리보기
- **빠른 액션**: 일기 작성, 일기 목록 이동
- **게스트 일기 마이그레이션**: 로그인 직후 자동으로 게스트 일기 연결

### 2. 검색 기능 (`/search`)

#### 검색 기능
- **검색 범위**: 일기 제목, 내용, 감정 분석 결과에서 검색
- **검색어 하이라이트**: 검색어가 포함된 부분 강조 표시
- **정렬 옵션**: 최신순, 오래된순, 제목순
- **검색 결과 미리보기**: 일기 내용과 분석 결과에서 검색어 주변 컨텍스트 표시
- **로그인 필수**: 검색 기능은 로그인한 사용자만 사용 가능
- **게스트 일기 포함**: 게스트로 작성한 일기도 검색 결과에 포함

**검색 API** (`/api/search`):
- 제목, 내용, 분석 결과에서 복호화 후 검색
- 대소문자 구분 없음 (case-insensitive)
- 임시저장(draft) 제외

### 3. 프로필 및 설정

#### 프로필 페이지 (`/profile`)
- **프로필 정보 표시**: 이름, 이메일, 프로필 이미지
- **프로필 편집**: 이름 수정 가능 (이메일은 변경 불가)
- **계정 통계**:
  - 작성한 일기 수 (전체/이번 달)
  - 연속 작성일
  - 감정 분석 완료된 일기 수 및 비율
- **마지막 일기 작성일**: 일기 날짜 기준 표시

**프로필 API** (`/api/user/profile`):
- `GET`: 프로필 정보 조회 (복호화된 개인정보)
- `PUT`: 프로필 수정 (이름, 닉네임, 프로필 이미지)
- 닉네임 중복 검사 (해시 기반)

#### 설정 페이지 (`/settings`)
- **AI 설정**: AI 프로바이더 선택
  - OpenAI (GPT-5-mini)
  - Google Gemini (Gemini 2.5 Flash)
  - 자동 선택
- **일반 설정**: 다크 모드, 알림 설정 (UI만, 기능 개발 중)
- **개인정보 설정**: 데이터 암호화 상태 표시, 데이터 삭제 요청
- **앱 정보**: 버전, 개발팀, 문의 정보
- **반응형 디자인**: 모바일/데스크톱 최적화

### 4. 알림 및 공지사항

#### 알림 시스템 (`/notifications`)
- **알림 목록**: 사용자별 알림 조회
- **읽음 처리**: 개별/전체 읽음 처리
- **상태**: 개발 중 (구조만 구현)

**알림 API** (`/api/notifications`):
- `GET`: 알림 목록 조회
- `PATCH`: 알림 읽음 처리

#### 공지사항 (`/announcements`)
- **공지사항 목록**: 전체 공지사항 조회
- **공지사항 상세**: 개별 공지사항 상세 보기
- **관리자 작성**: 관리자는 새 공지 작성 가능
- **상태**: 개발 중 (UI만 구현)

**공지사항 API** (`/api/announcements`):
- `GET`: 공지사항 목록 조회
- `POST`: 공지사항 작성 (관리자만)

### 5. 연락처 및 고객지원

#### 문의하기 (`/contact`)
- **문의 폼**: 이름, 이메일, 제목, 내용 입력
- **연락처 정보**: 이메일, 전화, 주소 표시
- **문의 유형 안내**: 서비스 이용, 기술 문제, 개인정보, 제휴 등
- **이메일 전송**: AWS SES를 통한 문의 이메일 전송

**문의 API** (`/api/contact`):
- `POST`: 문의 내용 전송 (이름, 이메일, 제목, 내용)
- 입력 검증 및 이메일 전송

### 6. 관리자 기능 (`/admin`)

#### 관리자 대시보드 (`/admin`)
- **전체 통계**: 총 사용자 수, 총 일기 수, 분석 건수
- **비용 통계**: 토큰 사용량, 총 비용 (USD/KRW)
- **최근 일기**: 최근 작성된 일기 목록 (복호화된 미리보기)
- **빠른 액션**: 일기 관리, 사용자 관리, 위기 감지 모니터링

#### 일기 관리 (`/admin/diaries`)
- 전체 일기 조회 및 관리
- 일기 상세 정보 확인

#### 사용자 관리 (`/admin/users`)
- 사용자 목록 조회
- 사용자 상세 정보 및 상태 관리
- 사용자 제재/관리 기능

#### 위기 감지 모니터링 (`/admin/monitoring/crisis`)
- 위기 알림 목록 조회
- 위기 알림 상태 관리 (검토, 해결, 오탐지 처리)
- 위험도별 필터링

#### 성능 모니터링 (`/admin/monitoring/performance`)
- 시스템 성능 지표 모니터링
- API 응답 시간, 에러율 등

#### 에러 모니터링 (`/admin/monitoring/errors`)
- 시스템 에러 로그 조회
- 에러 분석 및 대응

#### 데이터베이스 최적화 (`/admin/optimization`)
- 데이터베이스 통계 및 최적화 도구

**관리자 API** (`/api/admin/*`):
- `/api/admin/dashboard`: 대시보드 통계
- `/api/admin/diaries`: 일기 관리
- `/api/admin/users`: 사용자 관리
- `/api/admin/crisis-alerts`: 위기 알림 관리
- `/api/admin/monitoring`: 모니터링 데이터
- `/api/admin/optimize-database`: DB 최적화
- `/api/admin/rotate-keys`: 암호화 키 로테이션

---

## AI 감정 분석 시스템

### 1차 분석 (사용자 화면용)
- **프로바이더**: OpenAI GPT-5-mini 또는 Google Gemini 2.5 Flash
- **사용자 선택 가능**: 설정에서 AI 프로바이더 선택
- **분석 결과**:
  - 제목 (title)
  - 요약 (summary)
  - 감정 흐름 (emotion_flow)
  - 성찰 질문 (reflection_question)
  - 해석 (interpretation)
  - 메타데이터 (mode, tone, tier_a, tier_m, ethics, confidence)

#### 2차 분석 (HUA 감정 엔진)
- **비동기 실행**: 사용자 응답 속도에 영향 없음
- **정량 지표**: valence, arousal, entropy, density, transitions
- **Privacy-First**: 익명화된 텍스트만 사용

### 3. 게스트 모드

#### 제한 사항
- **일기 작성**: IP당 24시간당 3회
- **Rate Limiting**: 분당 5회 요청
- **User-Agent 필터링**: 봇/크롤러 차단

#### 게스트 사용자 관리
- **IP 기반 일관된 게스트 ID 생성**: SHA-256 해시로 UUID 형식 변환
- **게스트 일기 마이그레이션** (`guest-migration.ts`):
  - `migrateGuestDiaries()`: 게스트 일기를 사용자 계정으로 이동
  - `migrateGuestDiariesFromRequest()`: 요청에서 IP 추출 후 마이그레이션
  - 로그인 직후 자동 실행 (대시보드에서 체크)

### 4. 오프라인 지원

#### IndexedDB 기반 저장 (`offline-storage.ts`)
- **오프라인 일기**: 네트워크 없이 작성 가능
  - `saveDiaryOffline()`: 오프라인 일기 저장
  - `getOfflineDiaries()`: 오프라인 일기 목록 조회
  - `deleteOfflineDiary()`: 동기화 성공 후 삭제
- **오프라인 임시저장**: 자동 저장 기능
  - `saveDraft()`: 임시저장 저장 (최대 10개, 오래된 것 자동 삭제)
  - `getDrafts()`: 임시저장 목록 조회 (최신순)
  - `deleteDraft()`: 임시저장 삭제
- **스냅샷 저장**: 10초 주기 자동 스냅샷 (최대 3개 버전)
  - `saveSnapshot()`: 스냅샷 저장
  - `getLatestSnapshot()`: 최신 스냅샷 조회
- **자동 동기화**: 온라인 복구 시 백그라운드 동기화
  - `triggerBackgroundSync()`: Service Worker 백그라운드 동기화 등록

#### Service Worker
- 백그라운드 동기화 처리
- 오프라인 일기 개수 추적
- 동기화 완료 알림 (Service Worker 메시지)

#### 네트워크 상태 감지 (`NetworkStatus`)
- **싱글톤 패턴**: 전역 네트워크 상태 관리
- **실시간 감지**: `online`/`offline` 이벤트 리스너
- **연결 검증**: HEAD 요청으로 실제 네트워크 연결 확인
- **리스너 등록**: 상태 변경 시 콜백 실행

### 5. 위기 감지 시스템

#### 3단계 안전망
1. **AI 감지**: GPT-5-mini/Gemini가 위험 신호 감지
2. **키워드 Fail-Safe**: AI 감지 실패 시 보완하는 추가 안전장치 (자살, 자해, 약물 등)
3. **운영자 최종 판단**: 관리자 대시보드에서 검토

#### 위기 타입
- `SUICIDE`: 자살 위험
- `SELF_HARM`: 자해 위험
- `DRUG`: 약물 남용
- `CHILD_ABUSE`: 아동 학대
- `SERIOUS_MEDICAL`: 심각한 의료 정보
- `TERRORISM`: 테러/폭력 위험

#### Escalation 시스템
- 히스토리 기반 위험도 상승
- 최근 7일 3건 이상 → +1
- 연속 3일 이상 → +1
- 평균 위험도 높고 반복 발생 → +1

자세한 내용은 [CRISIS_DETECTION.md](./CRISIS_DETECTION.md) 참조

### 6. 악용 탐지 시스템

#### 탐지 패턴
- `RAPID_REQUESTS`: 초고속 요청
- `REPETITIVE_CONTENT`: 반복적인 내용
- `SUSPICIOUS_PROMPTS`: 탈옥 시도 (jailbreak)
- `TOKEN_ABUSE`: 과도한 길이
- `MULTI_ACCOUNT`: 다중 계정 사용
- `API_SCRAPING`: API 스크래핑

#### 제재 레벨
- `WARNING`: 경고 (분석 포함)
- `RATE_LIMIT`: Rate limiting
- `TEMPORARY_BAN`: 임시 차단 (1시간)
- `PERMANENT_BAN`: 영구 차단

#### 분석 제외 처리
- 진짜 불순물(의미 없는 입력)만 분석에서 제외
- 감정 분석 가능한 "장난"은 경고만 하고 분석 포함

---

## 라이브러리 구조

### Core Libraries (`app/lib/`)

#### 1. `auth.ts` - 인증 시스템
- **NextAuth 설정**: Credentials, Kakao, Google Provider
- **해시 기반 검색**: 이메일/닉네임을 SHA-256 해시로 저장하여 검색
- **암호화된 개인정보**: 이메일, 닉네임은 암호화되어 저장
- **게스트 마이그레이션**: 소셜 로그인 시 게스트 일기 자동 마이그레이션

**주요 함수**:
- `authOptions`: NextAuth 설정 객체
- `signIn` callback: 소셜 로그인 시 사용자 생성/조회
- `jwt` callback: JWT 토큰에 사용자 정보 포함
- `session` callback: 세션에 사용자 정보 포함

#### 2. `encryption.ts` - 암호화 시스템
- **알고리즘**: AES-256-GCM (군사급 암호화)
- **키 파생**: PBKDF2 (100,000회 반복, SHA-256)
- **Salt**: 64바이트 랜덤 Salt
- **IV**: 16바이트 랜덤 IV
- **인증 태그**: 16바이트 GCM 인증 태그

**주요 함수**:
- `encryptDiary(plainText, encryptionKey)`: 일기 내용 암호화
- `decryptDiary(encryptedBuffer, encryptionKey)`: 일기 내용 복호화
- `encryptUserData(userData, encryptionKey)`: 사용자 개인정보 암호화
- `decryptUserData(encryptedBuffer, encryptionKey)`: 사용자 개인정보 복호화
- `encryptAnalysisResult(data, encryptionKey)`: 분석 결과 암호화
- `decryptAnalysisResult(encryptedBuffer, encryptionKey)`: 분석 결과 복호화
- `hashUserData(data)`: 검색용 SHA-256 해시 생성

**데이터 형식**:
```
[salt(64)] + [iv(16)] + [authTag(16)] + [encryptedData]
```

#### 3. `diary-analysis-service.ts` - 1차 AI 분석
- **프로바이더 지원**: OpenAI, Gemini, Auto (자동 선택)
- **모델**: GPT-5-mini, Gemini 2.5 Flash
- **재시도 로직**: Gemini API 500 오류 시 최대 3회 재시도
- **토큰 비용 계산**: 프로바이더별 가격 적용

**주요 함수**:
- `analyzeDiary(diaryContent, userId)`: 일기 분석 수행
- `testOpenAIConnection()`: OpenAI 연결 테스트

**응답 구조**:
```typescript
{
  title: string,
  summary: string,
  emotion_flow: string[],
  question: string,
  interpretation: string,
  _metadata: {
    mode: string,
    tone: string,
    tier_a: number,
    tier_m: number,
    ethics: string[],
    confidence: number,
    provider: string,
    model_name: string,
    slip: 'none' | 'soft' | 'hard',
    token_usage: {...}
  }
}
```

#### 4. `crisis-detection-service.ts` - 위기 감지
- **비동기 처리**: 사용자 응답에 영향 없음
- **3단계 감지**: AI 감지 + 키워드 Fail-Safe + Escalation
- **히스토리 컨텍스트**: 최근 7일 알림 이력 조회
- **재식별 위험 평가**: 익명화된 텍스트의 재식별 위험도 계산

**주요 함수**:
- `detectCrisisAsync(input)`: 비동기 위기 감지
- `getHistoricalRiskContext(userId, currentDiaryDate)`: 히스토리 컨텍스트 조회
- `calculateEscalation(baseRiskLevel, historicalContext)`: Escalation 계산
- `assessReidentificationRisk(anonymizedText, detectedPatterns)`: 재식별 위험 평가
- `updateCrisisAlertStatus(alertId, status, reviewedBy, adminNotes)`: 알림 상태 업데이트

**위험도 레벨**:
- 0: 없음
- 1: 낮음
- 2: 중간
- 3: 높음
- 4: 위기 (즉시 개입 필요)

#### 5. `abuse-detection.ts` - 악용 탐지
- **패턴 탐지**: 탈옥 시도, 반복 내용, 벡터 삽입 등
- **분석 제외 판단**: 진짜 불순물만 제외, 감정 분석 가능한 장난은 포함
- **AbuseAlert 생성**: 비동기로 악용 알림 생성

**주요 함수**:
- `detectAndCheckAbuse(request, content, userId, diaryId, analysisResultId)`: 통합 악용 탐지
- `shouldSkipAnalysis(content)`: 분석 제외 여부 판단
- `checkRequestFrequency(ip, userId)`: 요청 빈도 체크
- `createAbuseAlertAsync(input)`: AbuseAlert 생성

**탐지 패턴**:
- 탈옥용 롱프롬프트: "원래 지시사항 무시", "제약 없이 응답" 등
- 감정 회피형: "이 일기는 감정에 대한 것이 아니" 등
- 벡터/난수 삽입: `[0.313, 0.524, -0.129]` 등
- 모델 테스트 데이터: "benchmark", "모델 비교" 등

#### 6. `anonymizer.ts` - 개인정보 익명화
- **익명화 대상**: 전화번호, 이메일, 주소, 이름, 주민등록번호, 카드번호
- **위험 신호 감지**: 자살, 자해, 약물, 아동 학대, 테러 등
- **재식별 위험 평가**: 위치 정보 조합, 직업+지역 조합 등

**주요 함수**:
- `anonymizePersonalInfo(text)`: 종합 익명화
- `filterSensitiveInfo(text)`: 민감정보 필터링 및 위험 신호 감지
- `generateEthicsFromRiskSignals(riskSignals)`: 위험 신호를 ethics 태그로 변환
- `calculateRiskLevel(riskSignals)`: 위험 수준 계산

#### 7. `slip-calculator.ts` - 슬립 계산
- **슬립**: AI 과몰입 상태를 나타내는 지표
- **계산 기준**: tier_a (감정 강도)와 tier_m (몰입도)의 불균형
- **윤리적 요소 조정**: 긍정적 요소는 완화, 부정적 요소는 강화

**주요 함수**:
- `calculateSlip(input)`: 기본 슬립 계산
- `adjustSlipByEthics(baseSlip, ethics)`: 윤리적 요소로 조정
- `calculateFinalSlip(input)`: 최종 슬립 계산

**슬립 레벨**:
- `none`: 정상
- `soft`: 경미한 과몰입 (m≥4.0, a≤2.5)
- `hard`: 심각한 과몰입 (m≥4.5, a≤2.0)

#### 8. `guest-limiter.ts` - 게스트 제한
- **IP 기반 제한**: 24시간당 일기 작성 횟수 제한
- **Rate Limiting**: 분당 요청 수 제한
- **User-Agent 필터링**: 봇/크롤러 차단

**주요 함수**:
- `checkGuestLimits(request, endpoint)`: 게스트 제한 체크
- `checkGuestUsageLimit(ip, action)`: 게스트 사용 횟수 체크
- `checkRateLimit(ip, endpoint)`: Rate Limiting 체크
- `logGuestUsage(ip, userAgent, action)`: 게스트 사용 로그 기록
- `getClientIP(request)`: 클라이언트 IP 추출

#### 9. `cache.ts` - 캐싱 시스템
- **Redis 지원**: 선택적 Redis 사용
- **메모리 캐시 폴백**: Redis 없을 경우 메모리 캐시 사용
- **TTL 설정**: 타입별 TTL (User Profile: 5분, Diary List: 1분 등)

**주요 함수**:
- `getCache<T>(key)`: 캐시 조회
- `setCache(key, value, ttlSeconds)`: 캐시 저장
- `deleteCache(key)`: 캐시 삭제
- `withCache<T>(key, fetchFunction, ttlSeconds)`: 캐시 래퍼 함수

#### 10. `user-settings.ts` - 사용자 설정 (클라이언트)
- **AI 프로바이더 설정**: OpenAI, Gemini, Auto
- **모델 매핑**: 프로바이더별 모델 설정
- **API 키 관리**: 환경변수 기반 API 키 조회

**주요 함수**:
- `getUserAiProvider(userId)`: AI 프로바이더 조회
- `setUserAiProvider(userId, provider)`: AI 프로바이더 설정
- `getModelForProvider(provider)`: 프로바이더별 모델 반환
- `getApiKeyForProvider(provider)`: 프로바이더별 API 키 반환

#### 11. `key-management.ts` - 키 관리
- **키 타입**: encryption, jwt, api
- **키 로테이션**: 안전한 키 생성 및 로테이션
- **키 강도 검사**: 엔트로피 기반 검증

**주요 함수**:
- `getEncryptionKey()`: 암호화 키 가져오기
- `getJWTSecret()`: JWT 시크릿 가져오기
- `getApiKey()`: API 키 가져오기
- `validateAllKeys()`: 모든 키 강도 검사

#### 12. `offline-storage.ts` - 오프라인 저장
- **IndexedDB 기반**: 브라우저 IndexedDB 사용
- **오프라인 일기 저장**: 네트워크 없이 일기 작성 가능
- **자동 동기화**: 온라인 복구 시 백그라운드 동기화

#### 13. `client-encryption.ts` - 클라이언트 암호화
- **클라이언트 사이드 암호화**: 브라우저에서 암호화 수행
- **사용자별 키**: 사용자 ID 기반 키 파생

#### 14. `hua-ai-service.ts` - HUA 감정 엔진
- **2차 분석**: 1차 AI 분석 결과를 기반으로 정량 지표 생성
- **JSON Schema**: Gemini의 responseSchema 사용
- **응답 정규화**: 문자열 숫자를 실제 숫자로 변환
- **재시도 로직**: Gemini API 실패 시 최대 3회 재시도

**응답 구조**:
```typescript
{
  coordinates: { valence: number, arousal: number },
  entropy: number,
  density: number,
  transitions: number,
  dominant_emotion: string,
  sentiment_score: number,
  reasoning: string
}
```

#### 15. `prompt-templates.ts` - 프롬프트 템플릿
- **템플릿 관리**: 여러 버전의 프롬프트 템플릿 지원
- **동적 감정 플로우**: 일기 길이에 따라 4-6개 감정 흐름 생성
- **토큰 예상**: 모델별 토큰 사용량 예상

**주요 함수**:
- `createAnalysisPrompt()`: 분석 프롬프트 생성
- `getEmotionFlowCountByLength()`: 일기 길이에 따른 감정 플로우 개수 결정
- `estimateTokenUsage()`: 토큰 사용량 예상

#### 16. `user-settings-server.ts` - 사용자 설정 (서버)
- **Prisma 기반**: 데이터베이스에서 사용자 설정 조회/저장
- **메모리 캐시**: 서버 사이드 캐싱으로 성능 최적화
- **Enum 변환**: DB enum과 클라이언트 형식 간 변환

**주요 함수**:
- `getUserAiProvider()`: AI 프로바이더 조회 (캐시 우선)
- `setUserAiProvider()`: AI 프로바이더 설정 저장
- `clearUserSettingsCache()`: 캐시 초기화

#### 17. `guest-migration.ts` - 게스트 일기 마이그레이션
- **IP 기반 게스트 ID**: SHA-256 해시로 일관된 ID 생성
- **트랜잭션 처리**: 일기 및 관련 데이터 원자적 마이그레이션
- **자동 실행**: 로그인 직후 대시보드에서 자동 체크

**주요 함수**:
- `generateGuestId()`: IP 기반 게스트 ID 생성
- `migrateGuestDiaries()`: 게스트 일기를 사용자 계정으로 이동
- `migrateGuestDiariesFromRequest()`: 요청에서 IP 추출 후 마이그레이션

---

## 보안 및 프라이버시

### 암호화 전략

#### 1. 일기 내용 암호화
- **알고리즘**: AES-256-GCM
- **저장 형식**: `content_enc` (Buffer)
- **복호화**: 사용자 요청 시에만 복호화

#### 2. 사용자 개인정보 암호화
- **암호화 필드**: `email_enc`, `nickname_enc`, `name_enc`
- **해시 필드**: `email_hash`, `nickname_hash` (검색용)
- **검색 방식**: 해시 기반 검색 (평문 저장 안 함)

#### 3. 분석 결과 암호화
- **암호화 필드**: `title_enc`, `summary_enc`, `emotion_flow_enc`, `reflection_question_enc`, `interpretation_enc`
- **메타데이터**: 평문 저장 (통계 분석용)

### 접근 제어

#### 1. 인증
- **NextAuth**: JWT 기반 세션 관리
- **세션 만료**: 2시간 (JWT maxAge)
- **토큰 갱신**: 1시간마다 자동 갱신

#### 2. 권한 관리
- **일기 접근**: 사용자별로만 접근 가능
- **관리자 권한**: 별도 관리자 대시보드

### 익명화 전략

#### 1. 분석용 익명화
- **1차 분석**: 원문 사용 (개인화된 응답을 위해)
- **2차 분석 (HUA)**: 익명화된 텍스트 사용 (Privacy-First)
- **위기 감지**: 익명화된 텍스트 사용

#### 2. 재식별 위험 평가
- **위험 요소**: 위치 정보 조합, 직업+지역 조합 등
- **위험도**: LOW, MEDIUM, HIGH, CRITICAL
- **대응**: 위험이 높으면 발췌만 저장

---

## AI 분석 시스템

### 분석 파이프라인

#### 1. 일기 작성 시
```
사용자 입력
  ↓
악용 탐지 (detectAndCheckAbuse)
  ↓
일기 암호화 및 저장
  ↓
분석 페이지로 리다이렉트 (/diary/analysis?diaryId=xxx)
  ↓
SSE 스트리밍 분석 (GET /api/diary/analyze/stream) - 원문 사용
  - OpenAI/Gemini 스트리밍 API
  - 섹션별 실시간 파싱 및 전송
  ↓
분석 결과 암호화 및 저장
  ↓
[비동기] 2차 HUA 분석 (analyzeWithHUAAI) - 익명화된 텍스트
  ↓
[비동기] 위기 감지 (detectCrisisAsync) - 익명화된 텍스트
```

#### 2. 분석 결과 구조

**1차 분석 (사용자 화면용)**:
- 제목, 요약, 감정 흐름, 성찰 질문, 해석
- 메타데이터: mode, tone, tier_a, tier_m, ethics, confidence

**2차 분석 (HUA 감정 엔진)**:
- 정량 지표: valence, arousal, entropy, density, transitions
- 주요 감정: dominant_emotion
- 종합 점수: sentiment_score (1-100)

### 프롬프트 시스템

#### 1. 1차 분석 프롬프트
- **템플릿**: `prompt-templates.ts`의 `createAnalysisPrompt`
- **최적화**: 토큰 사용량 최소화
- **개인화**: 원문 사용으로 자연스러운 분석

#### 2. 2차 분석 프롬프트
- **템플릿**: `hua-ai-prompt.ts`의 `HUA_AI_PROMPT`
- **JSON Schema**: Gemini의 responseSchema 사용
- **Privacy-First**: 익명화된 텍스트만 사용

---

## 데이터 흐름

### 일기 작성 플로우

```
1. 사용자 입력 (/diary/write)
   - 날짜 선택: 오늘/과거/미래
   ↓
2. 실시간 임시저장 (5초마다)
   - 온라인: DB 저장 (/api/diary/draft)
   - 오프라인: IndexedDB 저장 (offlineStorage.saveDraft)
   ↓
3. 스냅샷 저장 (10초마다, 최대 3개 버전)
   - IndexedDB에 저장 (offlineStorage.saveSnapshot)
   ↓
4. 저장 버튼 클릭
   ↓
5. 날짜 타입 판단
   - 미래일기: diary_date > today → 분석 건너뛰고 저장만
   - 나중일기: diary_date < today && (actual_written_at - diary_date) > 24시간
   - 오늘일기: diary_date === today
   ↓
6. 오프라인 모드 체크
   - 오프라인: IndexedDB에 저장 후 즉시 반환
   - 온라인: 계속 진행
   ↓
7. 악용 탐지 (detectAndCheckAbuse)
   - 패턴 탐지 (탈옥 시도, 반복 내용 등)
   - 분석 제외 여부 결정
   ↓
8. 게스트 제한 체크 (게스트인 경우)
   - IP 기반 제한 (24시간당 10회)
   - Rate Limiting (분당 5회)
   ↓
9. 일기 암호화 및 저장
   - encryptDiary()로 암호화
   - DB에 저장 (DiaryEntry)
   - is_delayed_entry 설정 (나중일기만 true)
   ↓
10. [미래일기 분기] 미래일기인 경우
    - 분석 없이 저장만 수행
    - 제목: "미래일기 - {날짜}"
    - 즉시 응답 반환 (isFutureDiary: true)
    ↓
11. [일반/나중일기] 분석 페이지로 리다이렉트
    - /diary/analysis?diaryId={diaryId}로 이동
    - sessionStorage에 일기 정보 저장
    ↓
12. 분석 페이지 로드 (/diary/analysis)
    - DB에서 완료된 분석 결과 확인
    - 없으면 SSE 연결 시작
    ↓
13. SSE 스트리밍 분석 (GET /api/diary/analyze/stream)
    - OpenAI/Gemini 스트리밍 API 호출
    - 원문 사용 (개인화된 응답을 위해)
    - 사용자 설정에 따라 프로바이더 선택
    - 섹션별 실시간 파싱 및 전송
    ↓
14. 분석 결과 실시간 표시
    - 각 섹션이 완성되는 대로 UI 업데이트
    - title → summary → emotion_flow → question → interpretation 순서
    ↓
15. 분석 결과 암호화 및 저장
    - 모든 섹션 완료 후 encryptAnalysisResult()로 각 필드 암호화
    - AnalysisResult에 저장
    - 일기 제목 업데이트
    ↓
14. [비동기] 2차 HUA 분석
    - 익명화된 텍스트 사용 (Privacy-First)
    - 정량 지표 생성 (valence, arousal, entropy 등)
    - /api/diary/[id]/analyze-emotion 호출
    ↓
15. [비동기] 위기 감지
    - 익명화된 텍스트 사용
    - 위험 신호 감지 (AI + 키워드)
    - Escalation 계산 (히스토리 기반)
    - CrisisAlert 생성 (위험 시)
    ↓
16. [비동기] AbuseAlert 생성 (악용 패턴 감지 시)
    - 악용 패턴 로깅
    - 관리자 대시보드에 알림
```

### 일기 수정 플로우 (미래일기만 가능)

```
1. 일기 목록에서 미래일기 선택
   - isFutureDiary(diary) 체크: diary_date > today
   ↓
2. 수정 버튼 클릭
   - /diary/write?edit={id}&date={diaryDate}로 이동
   ↓
3. 수정 모드 진입
   - loadDiaryForEdit(diaryId) 실행
   - /api/diary/[id] (GET)로 일기 내용 로드
   - 에디터에 기존 내용 표시
   ↓
4. 사용자 수정
   - 실시간 임시저장 (5초마다)
   ↓
5. 저장 버튼 클릭
   ↓
6. PUT /api/diary/[id] 호출
   - content, diaryDate 전송
   ↓
7. 서버에서 일기 업데이트
   - 암호화 후 content_enc 업데이트
   - diary_date, actual_written_at 업데이트
   - 분석 결과는 변경 없음 (미래일기는 분석 없음)
   ↓
8. 수정 완료
   - /diary 페이지로 리다이렉트
   - 토스트 알림 표시
```

### 오프라인 동기화 플로우

```
1. 오프라인 일기 작성
   - IndexedDB에 저장 (offlineStorage.saveDiaryOffline)
   - 오프라인 일기 개수 증가
   ↓
2. 온라인 복구 감지
   - NetworkStatus 리스너가 상태 변경 감지
   - navigator.onLine 이벤트 또는 실제 네트워크 연결 확인
   ↓
3. 백그라운드 동기화 시작
   - Service Worker에 'diary-sync' 태그 등록
   - triggerBackgroundSync() 호출
   ↓
4. Service Worker에서 동기화 처리
   - IndexedDB에서 오프라인 일기 조회
   - 각 일기를 /api/diary/create로 전송
   - 성공 시 IndexedDB에서 삭제
   ↓
5. 동기화 완료 알림
   - Service Worker가 'DIARY_SYNC_COMPLETE' 메시지 전송
   - 성공/실패 개수 포함
   - 토스트 표시 (완성된 일기, 임시저장 구분)
   ↓
6. 임시저장 자동 로드 (동기화된 임시저장이 있는 경우)
   - 에디터가 비어있으면 자동 로드
   - 에디터에 내용이 있으면 모달 표시 (사용자 선택)
```

### 게스트 일기 마이그레이션 플로우

```
1. 게스트로 일기 작성
   - IP 기반 게스트 ID로 저장
   ↓
2. 로그인/회원가입
   - NextAuth 세션 생성
   ↓
3. 대시보드 접근 (/)
   - checkAndMigrateGuestDiaries() 실행
   ↓
4. 게스트 일기 존재 여부 확인
   - /api/user/migrate-guest-diaries (GET)
   - IP 기반 게스트 ID로 일기 조회
   ↓
5. 마이그레이션 실행 (게스트 일기가 있는 경우)
   - /api/user/migrate-guest-diaries (POST)
   - 트랜잭션으로 user_id 업데이트
   ↓
6. 마이그레이션 완료 알림
   - 토스트 표시 (마이그레이션된 일기 개수)
   - 대시보드 데이터 다시 불러오기
   - sessionStorage에 체크 완료 표시 (중복 실행 방지)
```

---

## 주요 API 엔드포인트

### 일기 관련
- `GET /api/diary`: 일기 목록 조회
  - 사용자별 일기 목록 (게스트 일기도 포함)
  - 복호화된 제목 및 미리보기 반환
- `POST /api/diary/create`: 일기 생성 및 저장
  - 미래일기: 분석 없이 저장만 수행
  - 일반/나중일기: 저장 후 분석 페이지로 리다이렉트
- `GET /api/diary/analyze/stream?diaryId=xxx`: 일기 분석 SSE 스트리밍 API
  - Server-Sent Events (SSE)를 통한 실시간 분석 결과 전송
  - OpenAI/Gemini 스트리밍 API 사용
  - 섹션별 순차 전송: title, summary, emotion_flow, question, interpretation, metadata
  - 프로바이더별 최적화된 파싱 및 버퍼 관리
- `GET /api/diary/[id]`: 일기 조회 (복호화된 내용 반환)
- `PUT /api/diary/[id]`: 일기 수정 (**미래일기만 가능**)
  - content, diaryDate만 수정 가능
  - 분석 결과는 변경 없음
- `DELETE /api/diary/[id]`: 일기 삭제 (소프트 삭제, 모든 일기 가능)
- `POST /api/diary/[id]/share-image`: 일기 분석 결과 공유 이미지 생성
- `GET /api/diary/[id]/crisis-alert`: 일기 위기 알림 조회

### 임시저장 관련
- `GET /api/diary/draft/latest`: 최근 임시저장 조회
  - 쿼리 파라미터: `latest=true` (최근 임시저장) 또는 `date=YYYY-MM-DD` (날짜별)
  - 해당 날짜에 없으면 최근 임시저장 반환
- `GET /api/diary/draft/list`: 임시저장 목록 조회 (최신순)
- `POST /api/diary/draft`: 임시저장 저장
  - 최대 10개 제한 (초과 시 오래된 것 자동 삭제)
  - 같은 날짜의 30초 이내 임시저장은 업데이트
- `DELETE /api/diary/draft`: 임시저장 삭제 (쿼리 파라미터: `id` 또는 `draftId`)

### 검색 관련
- `GET /api/search`: 일기 검색
  - 쿼리 파라미터: `q` (검색어), `sortBy` (정렬 방식)
  - 검색 범위: 제목, 내용, 감정 분석 결과
  - 복호화 후 검색 수행

### 사용자 관련
- `GET /api/user/profile`: 프로필 정보 조회 (복호화된 개인정보)
- `PUT /api/user/profile`: 프로필 수정 (이름, 닉네임, 프로필 이미지)
  - 닉네임 중복 검사 (해시 기반)
- `POST /api/user/upload`: 파일 업로드 (프로필 이미지 등)
- `GET /api/user/settings`: 사용자 설정 조회 (AI 프로바이더)
- `POST /api/user/settings`: 사용자 설정 저장 (AI 프로바이더)
- `GET /api/user/settings/emotion-flow`: 감정 플로우 개수 조회
- `POST /api/user/settings/emotion-flow`: 감정 플로우 개수 설정 (4-6개)
- `GET /api/user/migrate-guest-diaries`: 게스트 일기 존재 여부 확인
- `POST /api/user/migrate-guest-diaries`: 게스트 일기 마이그레이션 실행
- `GET /api/user/admin-check`: 관리자 권한 확인

### 게스트 관련
- `GET /api/guest/usage`: 게스트 사용량 확인
  - 응답: `allowed`, `remaining`, `resetTime`, `reason`

### 알림 및 공지사항
- `GET /api/notifications`: 알림 목록 조회
  - 쿼리 파라미터: `page`, `limit`, `type`, `read` (필터링)
  - 페이지네이션 지원
- `GET /api/notifications/unread-count`: 읽지 않은 알림 개수 조회
  - 현재 표시 가능하고 읽지 않은 알림 개수 반환
- `POST /api/notifications`: 알림 생성 (관리자만)
  - `user_id=null`이면 전체 사용자에게 전송
  - `visible_from`, `visible_to`로 표시 기간 설정
- `PATCH /api/notifications/[id]`: 알림 읽음 처리
  - Body: `{ read: boolean }`
- `POST /api/notifications/mark-all-read`: 전체 알림 읽음 처리
- `DELETE /api/notifications/delete-read`: 읽은 알림 삭제
- `DELETE /api/notifications/delete-multiple`: 여러 알림 삭제
  - Body: `{ notificationIds: string[] }`
- `GET /api/announcements`: 공지사항 목록 조회
  - 쿼리 파라미터: `page`, `limit`, `published` (필터링)
  - 삭제되지 않은 공지사항만 조회
- `POST /api/announcements`: 공지사항 작성 (관리자만)
  - `published_at`, `expires_at`로 발행/만료 시간 설정

### 분석 관련
- `POST /api/hua-emotion-analysis`: HUA 감정 분석 실행 (2차 분석)
  - 원본 일기와 1차 AI 분석 결과를 받아서 HUA AI 분석 수행
  - 데이터분석가용 고급 메트릭 생성 (valence, arousal, entropy 등)
  - 게스트 사용자도 접근 가능
  - 이미 분석이 있으면 기존 결과 반환

### 설정 관련
- `GET /api/settings/ai-provider`: AI 프로바이더 설정 조회
- `POST /api/settings/ai-provider`: AI 프로바이더 설정 저장

### 할당량 및 비용 관련
- `GET /api/quota`: 사용자의 현재 Quota 상태 조회
  - 일일/월간 할당량 및 사용량 반환
  - 사용자 역할에 따른 제한 수치 반환
- `GET /api/billing`: 사용자의 비용 내역 조회
  - 쿼리 파라미터: `period` (YYYY-MM 형식, 기본값: 현재 월)
  - 월별 비용 집계 및 총 비용 반환

### 크론잡 관련
- `POST /api/cron/future-diary-analysis`: 미래일기 분석 알림 스케줄러
  - Authorization: `Bearer ${CRON_SECRET}` 필요
  - 매일 실행되어 오늘 날짜가 된 미래일기에 대해 알림 생성
  - 저녁 8시(한국 시간)에 알림 표시

### 관리자 관련
- `GET /api/admin/dashboard`: 관리자 대시보드 데이터
  - 총 사용자 수, 총 일기 수, 분석 건수
  - 토큰 사용량 및 비용 통계 (USD/KRW)
  - 최근 일기 목록 (복호화된 미리보기)
- `GET /api/admin/dashboard/charts`: 대시보드 차트 데이터
- `GET /api/admin/crisis-alerts`: 위기 알림 목록
- `GET /api/admin/crisis-alerts/stats`: 위기 알림 통계
- `GET /api/admin/crisis-alerts/[id]`: 위기 알림 상세 정보
- `PUT /api/admin/crisis-alerts/[id]`: 위기 알림 상태 업데이트
- `GET /api/admin/abuse-alerts`: 악용 알림 목록
- `GET /api/admin/abuse-alerts/stats`: 악용 알림 통계
- `GET /api/admin/abuse-alerts/[id]`: 악용 알림 상세 정보
- `POST /api/admin/abuse-alerts/[id]/penalty`: 악용 알림 제재 처리
- `GET /api/admin/diaries`: 일기 관리 (전체 일기 조회)
- `GET /api/admin/diaries/[id]`: 일기 상세 정보
- `GET /api/admin/diary/deleted`: 삭제된 일기 목록
- `POST /api/admin/diary/[id]/delete`: 일기 강제 삭제
- `POST /api/admin/diary/[id]/restore`: 일기 복구
- `GET /api/admin/diary/status`: 일기 상태 통계
- `GET /api/admin/users`: 사용자 관리 (사용자 목록)
- `GET /api/admin/users/stats`: 사용자 통계
- `GET /api/admin/monitoring/performance`: 성능 모니터링 데이터
- `GET /api/admin/monitoring/errors`: 에러 모니터링 데이터
- `GET /api/admin/database-stats`: 데이터베이스 통계
- `GET /api/admin/cache-stats`: 캐시 통계
- `POST /api/admin/optimize-database`: DB 최적화 실행
- `POST /api/admin/rotate-keys`: 암호화 키 로테이션
- `POST /api/admin/setup`: 시스템 초기 설정
- `POST /api/admin/notifications/test-data`: 알림 테스트 데이터 생성

---

## 데이터베이스 스키마

주요 테이블과 Enum 타입은 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) 참조

---

## 환경 변수

### 필수
- `ENCRYPTION_KEY`: 암호화 키 (최소 32자)
- `NEXTAUTH_SECRET`: JWT 시크릿
- `DATABASE_URL`: PostgreSQL 연결 문자열 (Supabase Connection Pooling 지원)
- `DIRECT_URL`: PostgreSQL 직접 연결 문자열 (마이그레이션 및 Prisma Studio용)
- `OPENAI_API_KEY`: OpenAI API 키
- `GEMINI_API_KEY`: Google Gemini API 키

### 선택적
- `REDIS_URL`: Redis 연결 문자열 (없으면 메모리 캐시 사용)
- `KAKAO_CLIENT_ID`: Kakao OAuth 클라이언트 ID
- `KAKAO_CLIENT_SECRET`: Kakao OAuth 클라이언트 시크릿
- `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿
- `NEXT_PUBLIC_APP_URL`: 앱 URL (비동기 작업용)

---

## 성능 최적화

### 1. 비동기 처리
- **HUA 감정 분석**: 사용자 응답 후 백그라운드 실행
- **위기 감지**: 비동기 실행으로 응답 속도에 영향 없음
- **AbuseAlert 생성**: 비동기 실행

### 2. 캐싱
- **Redis**: 선택적 사용 (없으면 메모리 캐시)
- **TTL**: 타입별 TTL 설정
- **캐시 키**: 사용자별, 전역별 구분

### 3. 데이터베이스 최적화
- **인덱스**: user_id, diary_date, created_at 등
- **트랜잭션**: 일기 저장 시 원자적 처리
- **연결 풀링**: Prisma 연결 풀 사용

---

## 보안 고려사항

### 1. 암호화
- **강력한 키**: 최소 32자, 엔트로피 검증
- **키 로테이션**: 주기적 키 변경 지원
- **Salt 사용**: PBKDF2로 키 파생

### 2. 익명화
- **재식별 위험 평가**: 조합 정보로 재식별 가능성 평가
- **발췌 저장**: 위험이 높으면 전문 대신 발췌만 저장

### 3. 악용 방지
- **Rate Limiting**: IP 기반 요청 제한
- **패턴 탐지**: 탈옥 시도, 반복 내용 등 감지
- **분석 제외**: 의미 없는 입력만 분석에서 제외

### 4. 위기 대응
- **3단계 안전망**: AI + 키워드 + 운영자
- **Escalation**: 히스토리 기반 위험도 상승
- **비동기 처리**: 사용자 응답 속도에 영향 없음

---

## 향후 개선 사항

### 1. 성능
- [ ] Redis 필수화 (메모리 캐시 제거)
- [ ] 데이터베이스 쿼리 최적화
- [ ] CDN 도입 (정적 자산)

### 2. 기능
- [ ] 일기 검색 기능 강화
- [ ] 감정 통계 대시보드
- [ ] 분석용 데이터 내보내기 (CSV, JSON)

### 3. 보안
- [ ] 2FA (Two-Factor Authentication)
- [ ] 키 로테이션 자동화
- [ ] 감사 로그 강화

---

## 참고 자료

- [Prisma Schema](../prisma/schema.prisma)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)

---

**최종 업데이트**: 2025-12-16
