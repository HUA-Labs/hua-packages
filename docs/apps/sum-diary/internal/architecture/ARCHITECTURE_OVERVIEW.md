# 시스템 아키텍처 개요

> 작성일: 2025-12-16
> 최종 업데이트: 2025-01-25
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **Privacy-First Design**을 핵심 원칙으로 하는 AI 기반 감정 분석 일기 서비스입니다. 이 문서는 전체 시스템의 아키텍처 개요를 제공하며, 각 시스템의 상세 문서로 연결됩니다.

---

## 0. Claude 세션 퀵 스타트

### 핵심 철학
- **Privacy-First**: 모든 데이터 AES-256 암호화, 어드민도 원문 접근 불가
- **캐릭터 "숨다"**: 따뜻하고 친근한 말투로 감정을 읽어주는 친구
- **데이터 미활용**: 일기/분석 결과를 AI 학습에 절대 사용하지 않음

### 최근 변경사항 (2025-01-25)
- **헬스체크 엔드포인트**: `/api/health` - DB/메모리 상태 확인
- **비용 알림 시스템**: `lib/cost-alert.ts` - 일일 비용 임계값 ($5/$10/$20)
- **AI 면책 조항**: 이용약관 제10조에 명시 (KO/EN/JA)

### 현재 상태
- **베타 런칭 준비 중**
- **상세**: `docs/planning/BETA_LAUNCH_CHECKLIST.md`

---

## 1. 기술 스택

### 1.1 프론트엔드
- **Next.js 16.0.10**: React 프레임워크 (App Router)
- **React 19**: UI 라이브러리
- **TypeScript 5.9**: 타입 안전성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Zustand**: 상태 관리
- **IndexedDB**: 오프라인 저장

### 1.2 백엔드
- **Next.js API Routes**: 서버리스 API 엔드포인트
- **Prisma ORM**: 데이터베이스 접근 계층
- **PostgreSQL**: 관계형 데이터베이스
- **NextAuth.js**: 인증 시스템

### 1.3 인프라
- **Vercel**: 호스팅 및 배포
- **Supabase**: PostgreSQL 호스팅
- **Redis**: 캐싱 (선택적)

### 1.4 AI 및 보안
- **OpenAI GPT-5-mini**: 메인 AI 분석
- **Google Gemini 2.5 Flash**: 대체 AI 분석
- **AES-256-GCM**: 데이터 암호화
- **Server-Sent Events (SSE)**: 실시간 스트리밍

---

## 2. 아키텍처 패턴

### 2.1 레이어드 아키텍처

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│   (Next.js Pages, React Components) │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│      API Layer                      │
│   (Next.js API Routes, NextAuth)    │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│   Business Logic Layer              │
│   (Services, Encryption, Analysis)  │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│      Data Layer                     │
│   (Prisma ORM, PostgreSQL)          │
└─────────────────────────────────────┘
```

### 2.2 서비스 레이어 패턴

**주요 서비스:**
- `diary-analysis-service.ts`: AI 분석 오케스트레이션
- `encryption.ts`: 암호화/복호화 로직
- `crisis-detection-service.ts`: 위기 감지 비즈니스 로직
- `abuse-detection.ts`: 시스템 악용 감지
- `quota.ts`: 할당량 관리
- `rate-limit.ts`: Rate Limiting
- `guest-utils.ts`: 게스트 모드 관리

### 2.3 Repository 패턴

**Prisma ORM:**
- 데이터베이스 접근 추상화
- 트랜잭션 관리
- 쿼리 최적화

### 2.4 Factory 패턴

**AI 프로바이더:**
- `getModelForProvider()`: 프로바이더별 모델 선택
- `getApiKeyForProvider()`: API 키 조회
- `createAnalysisPrompt()`: 동적 프롬프트 생성

### 2.5 Strategy 패턴

**AI 프로바이더 전략:**
- OpenAI 전략
- Gemini 전략
- 자동 선택 전략 (폴백)

---

## 3. 데이터 흐름

### 3.1 일기 작성 플로우

```
사용자 입력
    ↓
프론트엔드 검증
    ↓
API 요청 (/api/diary/create)
    ↓
인증/권한 확인
    ↓
Rate Limit 체크
    ↓
동시 실행 제한 체크
    ↓
Quota 체크
    ↓
입력 검증 및 Sanitization
    ↓
데이터 암호화
    ↓
일기 저장 (트랜잭션)
    ↓
AnalysisResult PENDING 생성
    ↓
응답 반환
    ↓
비동기 작업 시작
    ├─ 1차 AI 분석
    ├─ 2차 HUA 분석
    ├─ 위기 감지
    └─ 악용 감지
```

### 3.2 AI 분석 플로우

```
일기 저장 완료
    ↓
1차 AI 분석 시작
    ├─ 사용자 프로바이더 설정 조회
    ├─ 프롬프트 생성 (원문 사용)
    ├─ AI API 호출
    ├─ 응답 파싱
    ├─ 슬립 계산
    └─ 결과 저장 (암호화)
    ↓
2차 HUA 분석 시작 (비동기)
    ├─ 익명화된 텍스트 준비
    ├─ HUA 프롬프트 생성
    ├─ AI API 호출
    ├─ 메트릭 계산
    └─ 결과 저장
    ↓
위기 감지 시작 (비동기)
    ├─ 익명화된 텍스트 준비
    ├─ AI 감지
    ├─ 키워드 Fail-Safe
    └─ 알림 생성 (필요 시)
```

---

## 4. 보안 아키텍처

### 4.1 암호화 계층

**암호화되는 데이터:**
- 일기 내용 (`content_enc`)
- 분석 결과 (`title_enc`, `summary_enc` 등)
- 사용자 개인정보 (`name_enc`, `email_enc` 등)

**암호화 방식:**
- 알고리즘: AES-256-GCM
- 키 파생: PBKDF2 (100,000회 반복)
- Salt: 64바이트 랜덤
- IV: 16바이트 랜덤

### 4.2 인증 및 권한

**인증:**
- NextAuth.js 기반
- 소셜 로그인 (Kakao, Google)
- 게스트 모드 지원

**권한:**
- 역할 기반 접근 제어 (RBAC)
- USER: 일반 사용자
- ADMIN: 관리자

### 4.3 위기 감지 시스템

**3단계 안전망:**
1. AI 기반 감지
2. 키워드 Fail-Safe
3. 운영자 최종 판단

**익명화:**
- 위기 감지 시 자동 익명화
- 관리자는 원문 확인 불가

### 4.4 악용 탐지 시스템

**탐지 패턴:**
- Jailbreak (프롬프트 인젝션)
- 반복 요청
- Rate Limit 초과
- 동시 실행 초과

**제재 레벨:**
- WARNING: 경고
- RATE_LIMIT: Rate Limiting
- TEMPORARY_BAN: 임시 차단
- PERMANENT_BAN: 영구 차단

---

## 5. 성능 최적화

### 5.1 캐싱 전략

**계층:**
1. 메모리 캐시 (서버리스 환경)
2. Redis 캐시 (선택적)
3. 데이터베이스

**캐싱 대상:**
- 사용자 설정
- 분석 결과
- 할당량 정보

### 5.2 데이터베이스 최적화

**인덱스 전략:**
- 복합 인덱스: 자주 조회되는 컬럼 조합
- GIN 인덱스: 배열 필드 검색
- 단일 컬럼 인덱스: 고유성 및 필터링

**쿼리 최적화:**
- Select 최적화: 필요한 필드만 선택
- 조건 최적화: 인덱스 활용 가능한 조건 우선
- Pagination: take/skip 사용

### 5.3 비동기 처리

**비동기 작업:**
- 2차 HUA 분석
- 위기 감지
- 악용 감지
- 알림 생성

**이점:**
- 사용자 응답 속도 향상
- 시스템 부하 분산

---

## 6. 확장성

### 6.1 수평 확장

**서버리스 아키텍처:**
- Vercel Functions
- 자동 스케일링
- 함수별 독립 실행

### 6.2 데이터베이스 확장

**연결 풀:**
- 서버리스: 작은 풀 (2개)
- 일반 서버: 큰 풀 (10개)

**읽기 복제:**
- 향후 지원 예정
- 읽기 전용 쿼리 분산

---

## 7. 모니터링 및 로깅

### 7.1 로깅 시스템

**로깅 대상:**
- API 호출 로그
- 에러 로그
- 성능 메트릭
- 사용자 행동

**로깅 위치:**
- `ApiLog` 테이블
- `ErrorLog` 테이블
- Vercel 로그

### 7.2 모니터링

**추적 항목:**
- API 응답 시간
- 데이터베이스 쿼리 성능
- AI 분석 성능
- 비용 추적

---

## 8. 핵심 시스템 상세

### 8.1 데이터 레이어

**구현:** Prisma ORM + PostgreSQL

**주요 특징:**
- 스키마 분리: `user` 스키마와 `admin` 스키마
- Lazy Initialization: PrismaClient 싱글톤 패턴
- 연결 풀 최적화: 서버리스 환경 2개, 일반 서버 10개
- 트랜잭션 보장: 데이터 일관성 유지

**핵심 모델:**
- `User`: 사용자 정보 (암호화된 개인정보)
- `DiaryEntry`: 일기 데이터 (암호화된 내용)
- `AnalysisResult`: AI 분석 결과 (암호화된 분석 내용)
- `HuaEmotionAnalysis`: HUA 감정 엔진 분석 결과
- `UserQuota`: 할당량 관리
- `BillingRecord`: 비용 집계

**상세 문서:** [데이터 레이어 아키텍처](./DATA_LAYER.md)

### 8.2 암호화 시스템

**구현:** AES-256-GCM

**주요 특징:**
- 알고리즘: AES-256-GCM (군사급 암호화)
- 키 파생: PBKDF2 (100,000회 반복, SHA-256)
- 데이터 구조: `[Salt(64)] + [IV(16)] + [AuthTag(16)] + [EncryptedData]`
- 사용자별 독립적인 키 파생
- 키 로테이션 지원

**암호화 대상:**
- 일기 내용 (`content_enc`)
- 분석 결과 (`title_enc`, `summary_enc` 등)
- 사용자 개인정보 (`name_enc`, `email_enc` 등)

**상세 문서:** [암호화 시스템 아키텍처](./ENCRYPTION_SYSTEM.md)

### 8.3 AI 분석 시스템

**구현:** 이중 분석 시스템

**1차 분석 (사용자 화면용):**
- 프로바이더: OpenAI GPT-5-mini 또는 Google Gemini 2.5 Flash
- 원문 사용: 개인화된 감응 해석
- 결과: 제목, 요약, 감정 흐름, 자기성찰 질문, 해석
- 스트리밍: Server-Sent Events (SSE)로 실시간 전송

**2차 분석 (HUA 감정 엔진):**
- 프로바이더: Google Gemini 2.5 Flash
- 익명화된 텍스트 사용: Privacy-First
- 결과: 정량적 메트릭 (valence, arousal, entropy, density)
- 비동기 실행: 사용자 응답 속도에 영향 없음

**상세 문서:** [AI 분석 시스템 아키텍처](./AI_ANALYSIS_SYSTEM.md)

### 8.4 위기 감지 시스템

**구현:** 3단계 안전망

**1단계: AI 기반 감지**
- 1차 AI 분석 결과의 ethics 태그 확인
- crisis_ 태그 감지
- 위험 신호 감지

**2단계: 키워드 Fail-Safe**
- 자살, 자해, 약물, 아동 학대, 테러/폭력 관련 키워드
- AI 감지 실패 시 보완하는 추가 안전장치

**3단계: 운영자 최종 판단**
- CrisisAlert 생성
- 관리자 대시보드 표시
- 운영자 검토 및 조치

**익명화:**
- 위기 감지 시 자동 익명화
- 관리자는 원문 확인 불가
- 익명화된 발췌만 확인 가능

**상세 문서:** [위기 감지 시스템 아키텍처](./CRISIS_DETECTION_SYSTEM.md)

### 8.5 악용 탐지 시스템

**구현:** 다층 방어 시스템

**탐지 패턴:**
- Jailbreak (프롬프트 인젝션)
- 반복 요청
- Rate Limit 초과
- 동시 실행 초과
- Token Abuse

**제재 레벨:**
- WARNING: 경고 (분석 포함)
- RATE_LIMIT: Rate Limiting
- TEMPORARY_BAN: 임시 차단 (1시간)
- PERMANENT_BAN: 영구 차단

**분석 제외 판단:**
- 진짜 불순물(의미 없는 입력)만 분석에서 제외
- 감정 분석 가능한 "장난"은 경고만 하고 분석 포함

**상세 문서:** [악용 탐지 시스템 아키텍처](./ABUSE_DETECTION_SYSTEM.md)

### 8.6 인증 및 권한 관리

**구현:** NextAuth.js + RBAC

**인증 방식:**
- Credentials (이메일/비밀번호)
- Kakao (소셜 로그인)
- Google (소셜 로그인)
- 게스트 모드 (로그인 없이 체험)

**권한 관리:**
- USER: 일반 사용자
- ADMIN: 관리자

**게스트 일기 마이그레이션:**
- 로그인/회원가입 시 자동 마이그레이션
- IP 기반 + LocalStorage 기반 게스트 ID 통합

**상세 문서:** [인증 및 권한 관리 아키텍처](./AUTH_AND_AUTHORIZATION.md)

### 8.7 할당량 및 비용 관리

**구현:** 전송 단일 Quota 시스템

**Quota 개념:**
- 전송 1회 = 일기 1개 + 분석 1회
- 분석 완료 시 Quota 증가

**사용자별 제한:**
- 어드민: 일일 999,999회, 월간 999,999회
- 게스트: 일일 3회
- 무료 사용자: 일일 3회, 월간 50회
- 프리미엄 사용자: 일일 20회, 월간 500회

**비용 관리:**
- 실시간 비용 집계 (BillingRecord)
- 프로바이더별 비용 추적 (OpenAI, Gemini, HUA)
- 환경변수 기반 동적 가격 설정

**상세 문서:** [할당량 및 비용 관리 아키텍처](./QUOTA_AND_BILLING_SYSTEM.md)

### 8.8 게스트 모드 시스템

**구현:** IP 기반 + LocalStorage 기반 게스트 ID

**게스트 ID 생성:**
- 서버: IP 기반 SHA-256 해시 → UUID 형식
- 클라이언트: LocalStorage 기반 UUID v4

**제한 사항:**
- 일기 작성: IP당 24시간당 3회
- Rate Limiting: 분당 5회
- User-Agent 필터링: 봇/크롤러 차단

**자동 마이그레이션:**
- 로그인/회원가입 시 자동 실행
- 다중 게스트 ID 통합 (IP + LocalStorage + 최근 IP 패턴)

**상세 문서:** [게스트 모드 시스템 아키텍처](./GUEST_MODE_SYSTEM.md)

### 8.9 오프라인 및 동기화 시스템

**구현:** IndexedDB + Service Worker

**오프라인 저장:**
- IndexedDB 기반 로컬 저장
- 자동 임시저장 (5초마다)
- 스냅샷 저장 (10초 주기, 최대 3개)

**자동 동기화:**
- 온라인 복구 시 백그라운드 동기화
- Service Worker 기반 백그라운드 동기화
- 충돌 해결: 최신 데이터 우선

**PWA 지원:**
- Service Worker 등록
- 백그라운드 동기화
- 오프라인 캐싱

**상세 문서:** [오프라인 및 동기화 시스템 아키텍처](./OFFLINE_SYNC_SYSTEM.md)

### 8.10 API 레이어

**구현:** Next.js API Routes

**주요 엔드포인트:**
- 일기: `/api/diary/*` (생성, 조회, 수정, 삭제, 분석)
- 사용자: `/api/user/*` (프로필, 설정, 마이그레이션)
- 관리자: `/api/admin/*` (사용자, 일기, 위기/악용 알림, 모니터링)
- 검색: `/api/search`
- 알림: `/api/notifications/*`

**공통 미들웨어:**
- 인증/권한 확인
- User-Agent 검증
- 입력 검증 및 Sanitization
- Rate Limiting 및 Quota 체크

**에러 처리:**
- 통합 에러 처리 (ApiError, AuthRequiredError 등)
- 구조화된 에러 응답

**상세 문서:** [API 레이어 아키텍처](./API_LAYER.md)

### 8.11 프론트엔드 아키텍처

**구현:** Next.js 16.0.10 + React 19.2.1

**구조:**
- 컴포넌트 기반 설계 (`app/components/`)
- 커스텀 훅 패턴 (`app/hooks/`)
- Zustand 상태 관리 (`app/store/`)
- Server/Client 컴포넌트 분리

**주요 기능:**
- 일기 작성/조회/수정
- 감정 분석 결과 표시
- 오프라인 지원
- PWA 기능

**상세 문서:** [프론트엔드 아키텍처](./FRONTEND_ARCHITECTURE.md)

### 8.12 서비스 레이어

**구현:** `app/lib/` 디렉토리

**서비스 분류:**
- AI 분석: `diary-analysis-service.ts`, `hua-ai-service.ts`
- 보안: `encryption.ts`, `crisis-detection-service.ts`, `abuse-detection.ts`
- 할당량/비용: `quota.ts`, `billing.ts`, `rate-limit.ts`
- 게스트/사용자: `guest-utils.ts`, `user-settings.ts`
- 데이터/유틸리티: `prisma.ts`, `date-utils.ts`, `cache.ts`

**설계 원칙:**
- 단일 책임 원칙
- 의존성 주입
- 함수 기반 서비스

**상세 문서:** [서비스 레이어 아키텍처](./SERVICE_LAYER.md)

### 8.13 캐싱 및 성능 최적화

**구현:** 다층 캐싱 전략

**캐싱 계층:**
1. 메모리 캐시 (서버리스 환경)
2. Redis 캐시 (선택적)
3. 데이터베이스

**최적화 기법:**
- 인덱스 전략 (복합 인덱스, GIN 인덱스)
- 쿼리 최적화 (Select 최적화, Pagination)
- 비동기 처리 (2차 HUA 분석, 위기 감지)

**상세 문서:** [캐싱 및 성능 최적화 아키텍처](./CACHING_AND_PERFORMANCE.md)

### 8.14 모니터링 및 로깅

**구현:** 다층 로깅 시스템

**로그 타입:**
- `LoginLog`: 로그인/게스트 사용 추적
- `ApiLog`: API 요청/응답, 성능 메트릭
- `ErrorLog`: 에러 로그, 심각도 추적
- `AuditLog`: 관리자 활동 (현재 ApiLog 활용)

**모니터링:**
- API 응답 시간
- 데이터베이스 쿼리 성능
- AI 분석 성능
- 비용 추적

**상세 문서:** [모니터링 및 로깅 아키텍처](./MONITORING_AND_LOGGING.md)

---

## 9. 문서 구조

### 9.1 아키텍처 문서 목록

**핵심 시스템:**
1. [시스템 아키텍처 개요](./ARCHITECTURE_OVERVIEW.md) (이 문서) - 전체 시스템 개요 및 각 시스템 핵심 요약
2. [데이터 레이어 아키텍처](./DATA_LAYER.md) - Prisma ORM, 데이터베이스 스키마, 트랜잭션 관리
3. [암호화 시스템 아키텍처](./ENCRYPTION_SYSTEM.md) - AES-256-GCM 암호화, 키 관리, 키 로테이션
4. [AI 분석 시스템 아키텍처](./AI_ANALYSIS_SYSTEM.md) - 1차/2차 AI 분석, 프롬프트 엔지니어링, 스트리밍

**보안 시스템:**
5. [위기 감지 시스템 아키텍처](./CRISIS_DETECTION_SYSTEM.md) - 3단계 안전망, 히스토리 기반 Escalation
6. [악용 탐지 시스템 아키텍처](./ABUSE_DETECTION_SYSTEM.md) - 다층 방어, 패턴 탐지, 점진적 제재
7. [인증 및 권한 관리 아키텍처](./AUTH_AND_AUTHORIZATION.md) - NextAuth.js, 소셜 로그인, RBAC

**비즈니스 로직:**
8. [할당량 및 비용 관리 아키텍처](./QUOTA_AND_BILLING_SYSTEM.md) - 전송 단일 Quota, 실시간 비용 집계
9. [게스트 모드 시스템 아키텍처](./GUEST_MODE_SYSTEM.md) - IP 기반 게스트 ID, 자동 마이그레이션
10. [오프라인 및 동기화 시스템 아키텍처](./OFFLINE_SYNC_SYSTEM.md) - IndexedDB, 자동 동기화, PWA 지원

**인프라 및 프론트엔드:**
11. [API 레이어 아키텍처](./API_LAYER.md) - Next.js API Routes, 에러 처리, SSE 스트리밍
12. [프론트엔드 아키텍처](./FRONTEND_ARCHITECTURE.md) - 컴포넌트 구조, 커스텀 훅, 상태 관리
13. [서비스 레이어 아키텍처](./SERVICE_LAYER.md) - 서비스 모듈 구조, 의존성 주입
14. [캐싱 및 성능 최적화 아키텍처](./CACHING_AND_PERFORMANCE.md) - Redis 캐싱, 메모리 캐시 폴백, 쿼리 최적화
15. [모니터링 및 로깅 아키텍처](./MONITORING_AND_LOGGING.md) - 다층 로깅, 성능 추적, 에러 추적

---

## 10. 주요 특징

### 10.1 Privacy-First Design

- 모든 개인정보 암호화 (AES-256-GCM)
- 위기 감지 시 자동 익명화
- 관리자도 원문 확인 불가 (익명화된 발췌만 확인 가능)

### 10.2 Offline-First Support

- IndexedDB 기반 오프라인 저장
- 자동 동기화 (온라인 복구 시)
- PWA 지원 (Service Worker)

### 10.3 게스트 모드

- 로그인 없이 체험 가능 (IP당 24시간당 3회)
- 자동 마이그레이션 (로그인 시)
- 제한적 기능 제공

### 10.4 이중 분석 시스템

- 1차: 개인화된 감응 해석 (원문 사용)
- 2차: 정량적 메트릭 분석 (익명화된 텍스트 사용)

### 10.5 전송 단일 Quota 시스템

- 전송 1회 = 일기 1개 + 분석 1회
- 사용자별 제한 (어드민, 프리미엄, 무료, 게스트)
- 실시간 비용 집계

### 10.6 다층 방어 시스템

- 위기 감지: 3단계 안전망 (AI + 키워드 + 운영자)
- 악용 탐지: 다층 방어 (Rate Limit + 패턴 탐지 + 동시 실행 제한)
- 점진적 제재: 경고 → Rate Limit → 임시 차단 → 영구 차단

---

## 11. 참고 자료

### 관련 문서
- [프로젝트 소개](../PROJECT_INTRODUCTION.md) - 프로젝트 목적, 방향성, 로드맵
- [아키텍처 및 기능](../ARCHITECTURE_AND_FEATURES.md) - 기능 상세 및 API 엔드포인트 참조 문서
- [데이터베이스 스키마](../DATABASE_SCHEMA.md) - PostgreSQL 스키마, Enum 타입, 테이블 구조
- [개발 현황](../DEVELOPMENT_STATUS.md) - 현재 완료된 기능 및 개발 상태

### 문서 역할 구분

**이 문서 (ARCHITECTURE_OVERVIEW.md):**
- 전체 시스템 아키텍처 개요
- 각 시스템의 핵심 요약
- 상세 문서 없이도 전체 이해 가능
- 팀원/외부 공유용 메인 문서

**ARCHITECTURE_AND_FEATURES.md:**
- 기능 상세 설명
- API 엔드포인트 상세 참조
- 라이브러리 구조 설명
- 개발자 참조 문서

**상세 아키텍처 문서들:**
- 각 시스템의 구현 상세
- 코드 레벨 설명
- 개발자 심화 학습용

---

---

## 12. 운영 시스템

### 12.1 헬스체크 시스템

**엔드포인트**: `GET /api/health`

**체크 항목:**
- 데이터베이스 연결 상태 및 지연시간
- 메모리 사용량 (힙 메모리)

**응답 상태:**
- `healthy`: 모든 체크 정상
- `degraded`: 일부 경고 (예: 메모리 90% 이상)
- `unhealthy`: 서비스 불가 (예: DB 연결 실패)

**사용처:**
- 배포 검증
- 로드밸런서 헬스체크
- 모니터링 대시보드

### 12.2 비용 알림 시스템

**구현**: `app/lib/cost-alert.ts`

**임계값 설정:**
| 레벨 | 금액 | 대응 |
|------|------|------|
| WARNING | $5 | 모니터링 강화 |
| CRITICAL | $10 | Rate Limiting 검토 |
| EMERGENCY | $20 | 서비스 일시 중단 검토 |

**주요 함수:**
- `checkCostAlert()`: 현재 비용 알림 상태 확인
- `getTodayCost()`: 오늘 비용 요약
- `getCostSummaryByDays(n)`: 최근 n일 비용 요약

**어드민 대시보드 연동:**
```json
{
  "costAlert": {
    "level": "warning",
    "message": "일일 비용이 $5를 초과했습니다",
    "recommendedAction": "비용 추이를 모니터링하세요"
  },
  "todayCost": {
    "amount": "5.1234",
    "tokens": 125000,
    "analysisCount": 42
  }
}
```

---

**작성일**: 2025-12-16
**최종 업데이트**: 2025-01-25
