# SaaS Kit — lib/ Separation Manifest

> **기준 경로:** `apps/my-app/app/lib/`
> **분류 기준:** Generic SaaS 인프라 vs my-app 도메인 특화 코드
> **상태 표기:**
>
> - `[x]` KEEP — 변경 없이 이식 가능
> - `[~]` KEEP (수정 필요) — 도메인 의존성 제거 후 이식
> - `[ ]` REMOVE — my-app 전용 도메인 코드

---

## KEEP — Generic SaaS Infrastructure

### auth/

| 상태  | 파일                      | 설명                                                                                                                         |
| ----- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `[x]` | `auth-v5.ts`              | NextAuth v5 설정 — Kakao/Google/Line/Discord OAuth, Prisma Adapter, JWT 콜백                                                 |
| `[~]` | `diary-auth.ts`           | API 라우트용 인증 미들웨어 — `getUserId()` 헬퍼, Bearer + 세션 + 게스트 순서 처리. 파일명을 `auth-middleware.ts`로 변경 권장 |
| `[x]` | `login-logger.ts`         | 로그인 이벤트 기록 (fire-and-forget 패턴) — LoginLog 테이블 활용                                                             |
| `[x]` | `mobile-auth.ts`          | 모바일 앱 전용 Stateless JWT Bearer 토큰 발급/검증 (jose, 30일 만료)                                                         |
| `[x]` | `mobile-cors.ts`          | Bearer 토큰 존재 시 CORS 헤더 추가 — 허용 Origin 환경변수 제어                                                               |
| `[x]` | `oauth-user-service.ts`   | OAuth 사용자 find/create/link 서비스 — 크로스 프로바이더 이메일 연동 정책 포함                                               |
| `[x]` | `session-utils.ts`        | 세션에서 타입 안전하게 userId/provider 추출하는 클라이언트 헬퍼                                                              |
| `[x]` | `session-utils-server.ts` | 서버 전용 세션 유틸 — `getSessionUserId()`                                                                                   |
| `[x]` | `user-state.ts`           | 사용자 상태 검증 — banned/inactive/resigned 체크, `UserBlockedError` 클래스                                                  |

### payment/

| 상태  | 파일              | 설명                                                                                                                                            |
| ----- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `[x]` | `interface.ts`    | Provider-agnostic 결제 인터페이스 — `CheckoutParams`, `WebhookEvent` 등 공통 타입 정의                                                          |
| `[x]` | `factory.ts`      | 환경변수 기반 결제 프로바이더 선택 팩토리 (lemonsqueezy/stripe/toss)                                                                            |
| `[x]` | `index.ts`        | payment 모듈 re-export                                                                                                                          |
| `[x]` | `lemonsqueezy.ts` | LemonSqueezy 결제 프로바이더 구현                                                                                                               |
| `[x]` | `stripe.ts`       | Stripe 결제 프로바이더 구현 (현재 Stub — US entity 설정 후 구현 예정)                                                                           |
| `[x]` | `toss.ts`         | TossPayments 결제 프로바이더 구현 (빌링키 기반 정기결제)                                                                                        |
| `[~]` | `sync-quota.ts`   | 구독 라이프사이클 이벤트 → UserQuota 동기화 — `daily_diary_limit` 등 my-app 도메인 상수 포함, 스타터 킷에서는 앱별 Quota 필드 맞게 수정 필요 |

### quota/

| 상태  | 파일                      | 설명                                                                                                                       |
| ----- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `[~]` | `quota.ts`                | Quota 체크 및 관리 헬퍼 — `checkQuotaOrThrow()`, `QuotaExceededError`. 일기/분석 도메인 상수 제거 필요                     |
| `[~]` | `check.ts`                | 통합 제한 체크 (Rate Limit + 동시 실행 + Quota 한 번에) — `checkAdminPermission` import가 admin 모듈에 의존, 디커플링 권장 |
| `[x]` | `store/interface.ts`      | `QuotaStore` 인터페이스 — `QuotaData` 타입 정의                                                                            |
| `[x]` | `store/db-quota-store.ts` | DB 기반 QuotaStore 구현 — Redis 전환 가능하도록 추상화                                                                     |

### infra/

| 상태  | 파일                       | 설명                                                                                                                                       |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `[x]` | `prisma.ts`                | Prisma Client 싱글톤 (Lazy Init, Dev HMR 방지, 연결 풀 최적화)                                                                             |
| `[x]` | `redis.ts`                 | Redis 클라이언트 싱글톤 — 미사용 시 graceful 폴백                                                                                          |
| `[x]` | `cache.ts`                 | Redis + 메모리 캐시 이중화 — TTL별 키 관리, `get/set/del` 추상화                                                                           |
| `[x]` | `logger.ts`                | 앱 전용 로거 인스턴스 생성 (`@hua-labs/hua/utils` createLogger 래핑)                                                                       |
| `[x]` | `email-service.ts`         | AWS SES 이메일 전송 서비스 (싱글톤, 일일 5만통)                                                                                            |
| `[~]` | `discord-webhook.ts`       | Discord Webhook 알림 — `crisis`/`system` 채널. my-app 특화 알림 함수 포함(`notifyCrisisAlert`, `notifyAbuseAlert`), 채널 이름 변경 필요 |
| `[x]` | `database-optimization.ts` | DB 인덱스 생성 유틸 — `CREATE INDEX CONCURRENTLY` 헬퍼                                                                                     |

### errors/

| 상태  | 파일              | 설명                                                                                                                        |
| ----- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `[~]` | `error-codes.ts`  | 통합 에러 코드 시스템 — AUTH/VALIDATION/PAYMENT 등 공통 코드는 유지, DIARY*\*/ANALYSIS*_/CRISIS\__ 등 도메인 코드 제거 필요 |
| `[x]` | `create-error.ts` | `apiError()` 헬퍼 + 단축함수(`unauthorized`, `forbidden`, `notFound`, `validationError`, `internalError`)                   |
| `[x]` | `index.ts`        | errors 모듈 re-export                                                                                                       |

### security/

| 상태  | 파일                   | 설명                                                                                                                             |
| ----- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `[x]` | `encryption.ts`        | PBKDF2 해시, KMS Envelope Encryption re-export (`@hua-labs/security` 사용)                                                       |
| `[x]` | `key-management.ts`    | 환경변수 기반 키 관리 및 로테이션 — KMS 활성화 시 ENCRYPTION_KEY 선택적                                                          |
| `[x]` | `client-encryption.ts` | 브라우저 Web Crypto API 기반 AES-256-GCM 암호화 (클라이언트 전용)                                                                |
| `[x]` | `user-encryption.ts`   | 사용자 암호화 필드 복호화 유틸 — `EncryptedUserInput` 타입                                                                       |
| `[~]` | `anonymizer.ts`        | 개인정보 익명화 — 한글 이름 패턴 탐지, 전화번호/이메일 마스킹 등. my-app 특화 감정 분석 함수(`filterSensitiveInfo`) 분리 필요 |
| `[~]` | `decryption-log.ts`    | 관리자 복호화 감사 로그 — `DecryptionReason` 중 `CRISIS_REVIEW`는 my-app 전용, 스타터에선 앱 도메인에 맞게 교체 필요          |

### admin/

| 상태  | 파일                 | 설명                                                                                                                                                                                                                                                                                      |
| ----- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[x]` | `admin.ts`           | 관리자 권한 체크 — `checkAdminPermission()`, `requireAdmin()`, `withAdmin()` HOF                                                                                                                                                                                                          |
| `[x]` | `audit-log.ts`       | 관리자 활동 감사 로그 — CRUD/DECRYPT/EXPORT 등 액션 타입, AuditLog 테이블                                                                                                                                                                                                                 |
| `[x]` | `utils.ts`           | 관리자 유틸 — `maskDiaryTitle()` (개인정보 보호 마스킹)                                                                                                                                                                                                                                   |
| `[~]` | `abuse-detection.ts` | API 악용 탐지 — IP 빈도, 콘텐츠 패턴, 탈옥 시도 탐지. **주의:** `shouldSkipAnalysis()`는 일기 AI 분석 컨텍스트 전용 (한국어 일기 키워드 패턴 하드코딩). 스타터 킷에서는 `checkRequestFrequency()`, `logAbuse()`, `createAbuseAlertAsync()`, `detectAndCheckAbuse()` 일반 함수만 추출 권장 |

### rate-limit/

| 상태  | 파일                  | 설명                                                                    |
| ----- | --------------------- | ----------------------------------------------------------------------- |
| `[x]` | `rate-limit.ts`       | Redis/In-Memory 이중화 Rate Limit — 사용자별/IP별, 페널티 키 지원       |
| `[x]` | `middleware.ts`       | Next.js API 라우트용 Rate Limit 미들웨어 — `checkRateLimitMiddleware()` |
| `[x]` | `with-rate-limit.ts`  | `withRateLimit()` HOF — `withAdmin()`과 동일 패턴, 일반 API 적용        |
| `[x]` | `concurrent-limit.ts` | 유저당 동시 실행 작업 수 제한 (DB 기반 카운팅)                          |
| `[x]` | `advisory-lock.ts`    | Advisory Lock 키 생성 — contact/signup/password-reset 스코프            |

### i18n/

| 상태  | 파일                          | 설명                                                                                                                                                |
| ----- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[x]` | `language-cookie.ts`          | 언어 쿠키 유틸 — `LANGUAGE_COOKIE`, `SUPPORTED_LANGUAGES`, `isSupportedLanguage()`                                                                  |
| `[~]` | `server-i18n.ts`              | SSR 언어 감지 헬퍼 — 하드코딩된 번역 문자열이 my-app 도메인 용어 포함 (futureDiaryTitle 등), 스타터에서 내용 교체 필요                           |
| `[~]` | `translation.ts`              | OpenAI 기반 콘텐츠 번역 서비스 (blog/announcement/notification) — AI 클라이언트에 의존. 스타터 킷에서는 AI 의존성 제거 또는 별도 옵션으로 분리 권장 |
| `[x]` | `useNamespacedTranslation.ts` | 네임스페이스 스코프 타입 안전 번역 훅 (`@hua-labs/hua/i18n` 기반)                                                                                   |
| `[~]` | `translations/index.ts`       | 번역 파일 로더 — 모든 네임스페이스 정적 import. 스타터 킷에서는 필요한 네임스페이스만 남기고 diary/analysis/guest 등 제거                           |
| `[~]` | `translations/ko              | en                                                                                                                                                  | ja/\*.json` | 번역 JSON 파일 — `common`, `auth`, `settings`, `navigation`, `footer`, `profile`, `notifications`, `admin`, `terms`, `privacy`, `security`, `email-policy` 네임스페이스는 KEEP. `diary`, `analysis`, `guest`, `search`, `announcements`, `blog`, `landing`, `about`, `contact`, `dashboard` 네임스페이스는 도메인 특화 |

### env/

| 상태  | 파일               | 설명                                                                                                                                                            |
| ----- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[~]` | `env.ts`           | 환경변수 안전 접근 유틸 — `getServerEnv()`, `getClientEnv()`                                                                                                    |
| `[~]` | `schema.ts`        | 통합 환경변수 Zod 스키마 (하위 호환용) — OPENAI/GEMINI 등 AI 키는 선택적으로 변경 필요                                                                          |
| `[~]` | `server-schema.ts` | 서버 전용 환경변수 스키마 — DATABASE_URL, AUTH_SECRET, 결제 키 등 공통 항목 유지. AI 관련 키(`OPENAI_API_KEY`, `GEMINI_API_KEY`) 및 my-app 특화 키 분리 필요 |
| `[~]` | `client-schema.ts` | 클라이언트 전용 환경변수 스키마 — `NEXT_PUBLIC_*` 변수. my-app 특화 변수 제거 필요                                                                           |

### user/

| 상태  | 파일                    | 설명                                                                                                                                                                          |
| ----- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[x]` | `billing.ts`            | BillingRecord 집계 관리 — `updateBillingRecord()`, 프로바이더별 분리 저장                                                                                                     |
| `[x]` | `nickname-generator.ts` | 랜덤 닉네임 생성기 — 음식 이름 기반 (한국어/영어), 카테고리별 분류                                                                                                            |
| `[~]` | `settings.ts`           | 사용자 설정 클라이언트 유틸 — `getUserEmotionFlowCount()` 등 감정 분석 특화 설정 포함. 스타터에서는 일반 설정(`emailNotifications`, `language` 등)만 남기고 AI 분석 설정 제거 |
| `[~]` | `settings-server.ts`    | 사용자 설정 서버 유틸 — `emotionFlowCount`, `analysisDepth` 등 AI 분석 관련 캐시 필드 포함. 범용 설정 구조로 리팩토링 필요                                                    |

### api/

| 상태  | 파일          | 설명                                                                                                                                                                                                                                                          |
| ----- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[x]` | `errors.ts`   | 클라이언트 사이드 API 에러 클래스 — `ApiError`, `responseToApiError()`, `unknownToApiError()`, `AuthRequiredError`                                                                                                                                            |
| `[x]` | `response.ts` | API 응답 생성 유틸 — `createErrorResponse()`, `createSuccessResponse()`, `createValidationErrorResponse()`                                                                                                                                                    |
| `[~]` | `schemas.ts`  | API 요청/응답 Zod 스키마 — Profile/Notification/Announcement/Blog/ErrorLog 스키마는 KEEP. **`DiaryEntitySchema`, `CreateDiaryRequestSchema`, `UpdateDiaryRequestSchema`, `CreateDiaryResponseSchema`, `DiaryListResponseSchema`는 my-app 전용으로 REMOVE** |

### route/

| 상태  | 파일              | 설명                                                                                                                |
| ----- | ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| `[~]` | `shell-routes.ts` | Clean-shell 라우트 감지 — `CLEAN_SHELL_PREFIXES`에 `/admin`만 있으므로 구조는 유지, 각 앱의 라우트에 맞게 수정 필요 |

---

## REMOVE — my-app Domain Code

### ai/

> 일기 감정 분석 AI 시스템 전체. 스타터 킷과 무관.

| 파일                    | 설명                                                       |
| ----------------------- | ---------------------------------------------------------- |
| `config.ts`             | HUA Analyzer 설정 — 감정 분석 윤리 임계값, 언어 프로필     |
| `cost-calculator.ts`    | AI API 비용 계산기 (USD/KRW 변환)                          |
| `jailbreak-messages.ts` | 탈옥 시도 사용자에게 표시할 응답 메시지                    |
| `openai-client.ts`      | OpenAI API 클라이언트 싱글톤                               |
| `pricing.ts`            | OpenAI/Gemini 모델별 토큰당 가격 테이블                    |
| `prompt.ts`             | 감정 분석 프롬프트 레거시 (prompts/ 서브디렉토리로 이전됨) |
| `prompts/core.ts`       | HUA 3-Layer 감정 분석 프롬프트 아키텍처                    |
| `prompts/en.ts`         | 영어 전용 감정 분석 프롬프트                               |
| `prompts/ja.ts`         | 일본어 전용 감정 분석 프롬프트                             |
| `prompts/ko.ts`         | 한국어 전용 감정 분석 프롬프트                             |
| `prompts/index.ts`      | 언어별 프롬프트 선택 + 토큰 사용량 추정                    |
| `response-types.ts`     | AI 응답 파싱 타입 정의                                     |
| `service.ts`            | HUA AI 감정 분석 서비스 (OpenAI/Gemini 호출)               |
| `types.ts`              | HuaAnalyzerConfig, EthicsThreshold 등 분석 타입            |

### analysis/

> my-app 핵심 기능 — SLIP 계산, 위기 감지, 감정 분석.

| 파일                      | 설명                                                      |
| ------------------------- | --------------------------------------------------------- |
| `crisis-detection.ts`     | 위기 감지 서비스 — AI 3단계 안전망 (GPT, 키워드, 운영자)  |
| `diary-service.ts`        | 일기 1차 AI 분석 서비스 — 감정 흐름, 해석, 반성 질문 생성 |
| `sentiment-utils.ts`      | 감정 점수(1-100) 색상/레벨 변환 유틸                      |
| `slip-calculator.ts`      | SLIP 상태 계산 (서버 전용) — tier_a, tier_m 기반          |
| `slip-calculator-pure.ts` | SLIP 계산 클라이언트 전용 버전                            |
| `test-data-parser.ts`     | 분석 테스트 데이터 파서                                   |

### analyze/

> 일기 분석 파이프라인 진입점.

| 파일           | 설명                                                 |
| -------------- | ---------------------------------------------------- |
| `constants.ts` | 분석 관련 상수 (분석 상태, 모델 이름 등)             |
| `index.ts`     | 분석 파이프라인 진입점 — 1차/2차 분석 오케스트레이션 |
| `parsers.ts`   | AI 응답 파싱 유틸 — JSON 추출, 감정 흐름 파싱        |

### diary/

> 일기 엔티티 관련 유틸. my-app 도메인 전용.

| 파일                 | 설명                                                       |
| -------------------- | ---------------------------------------------------------- |
| `date-utils.ts`      | 일기 날짜 유틸 — 로컬 타임존 기준 날짜 추출, KST 변환      |
| `diary-utils.ts`     | 일기 목록 렌더링 유틸 — `diaryDate`/`actualWrittenAt` 처리 |
| `draft-constants.ts` | 임시저장 관련 상수                                         |
| `search-utils.ts`    | 일기 검색 유틸                                             |
| `text-config.ts`     | 일기 텍스트 설정 (최대 글자수 등)                          |

### cost/

> AI API 비용 추적/알림 시스템. my-app AI 기능 전용.

| 파일               | 설명                                                           |
| ------------------ | -------------------------------------------------------------- |
| `alert.ts`         | AI 비용 임계값 알림 — WARNING($5)/CRITICAL($10)/EMERGENCY($20) |
| `exchange-rate.ts` | DB에서 USD→KRW 환율 조회 (크론잡 갱신)                         |
| `token-tracker.ts` | blog/announcement/notification 번역 시 토큰 사용량 추적        |

### hackathon/

> Gemini 3 Seoul Hackathon 전용 임시 코드. 이식 불필요.

| 파일        | 설명                                          |
| ----------- | --------------------------------------------- |
| `auth.ts`   | X-Hackathon-Key 헤더 API Key 검증             |
| `cors.ts`   | 해커톤 전용 CORS 설정                         |
| `prompt.ts` | 해커톤 Stage 2 음성 텍스트 심층 분석 프롬프트 |

### guest/

> 비로그인 게스트 체험 기능. 스타터 킷에서 선택적 구현.

| 파일                    | 설명                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| `limiter.ts`            | IP 기반 게스트 사용 제한 — 24시간당 3회 일기, `getClientIP()` 포함 |
| `migration.ts`          | 게스트 → 가입 시 일기 계정 연동 마이그레이션                       |
| `migration-improved.ts` | 마이그레이션 개선 버전 (쿠키 기반 게스트 ID)                       |
| `utils.ts`              | 게스트 사용자 쿠키 관리 — HMAC 서명, UUID 생성                     |

---

## ROOT FILES

| 상태  | 파일                 | 설명                                                                                                                                  |
| ----- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `[x]` | `utils.ts`           | `cn()` 유틸 — clsx + tailwind-merge CSS 클래스 병합 (완전 범용)                                                                       |
| `[~]` | `dot-config.ts`      | `@hua-labs/hua/dot` CSS Variable Bridge 설정 — my-app Tailwind v4 테마 변수 매핑. 스타터 킷의 테마 변수에 맞게 교체 필요           |
| `[~]` | `offline-storage.ts` | PWA IndexedDB 오프라인 저장 — 일기/스냅샷/임시저장 특화. 구조는 범용적이나 스토어 이름이 my-app 전용. 앱에 맞는 스토어로 교체 필요 |
| `[ ]` | `dev-profiler.tsx`   | 개발 전용 React Profiler 래퍼 — 16ms 초과 렌더 경고. 필요 시 복사 가능하나 매니페스트 대상 외                                         |
| `[ ]` | `wdyr.ts`            | Why Did You Render 개발 전용 디버거 — 개발 도구이므로 이식 불필요                                                                     |

---

## 번역 파일 (translations/) 상세 분류

### KEEP 네임스페이스 (ko/en/ja 공통)

| 네임스페이스    | 설명                                               |
| --------------- | -------------------------------------------------- |
| `common`        | 공통 UI 문자열 — 버튼, 상태, 공통 메시지           |
| `auth`          | 로그인/회원가입/OAuth 관련                         |
| `navigation`    | 상단/하단 네비게이션 메뉴                          |
| `footer`        | 푸터 링크 및 텍스트                                |
| `profile`       | 사용자 프로필 설정                                 |
| `settings`      | 앱 설정 페이지                                     |
| `notifications` | 알림 시스템                                        |
| `security`      | 보안 설정 (암호화, 비밀번호 등)                    |
| `terms`         | 이용약관                                           |
| `privacy`       | 개인정보처리방침                                   |
| `email-policy`  | 이메일 수신 정책                                   |
| `admin`         | 관리자 패널 UI (수정 필요 — 도메인 특화 항목 제거) |

### REMOVE 네임스페이스

| 네임스페이스    | 이유                        |
| --------------- | --------------------------- |
| `diary`         | 일기 작성/조회/편집 전용    |
| `analysis`      | AI 감정 분석 결과 표시 전용 |
| `guest`         | 게스트 체험 모드 전용       |
| `search`        | 일기 검색 전용              |
| `dashboard`     | my-app 대시보드 전용     |
| `landing`       | my-app 랜딩 페이지 전용  |
| `about`         | my-app 소개 페이지 전용  |
| `contact`       | my-app 문의 페이지 전용  |
| `blog`          | my-app 블로그 전용       |
| `announcements` | my-app 공지사항 전용     |

---

## 요약 통계

| 분류             | 디렉토리/파일 수                                                                     |
| ---------------- | ------------------------------------------------------------------------------------ |
| KEEP (변경 없음) | ~60개 파일                                                                           |
| KEEP (수정 필요) | ~25개 파일                                                                           |
| REMOVE           | ~35개 파일 (ai/, analysis/, analyze/, diary/, cost/, hackathon/, guest/ 전체 + 일부) |

## 핵심 주의사항

1. **`admin/abuse-detection.ts`** — `shouldSkipAnalysis()`는 한국어 일기 분석 전용 로직. 범용 `detectAndCheckAbuse()`, `checkRequestFrequency()`, `logAbuse()` 함수만 별도 파일로 추출 권장.

2. **`api/schemas.ts`** — Diary 관련 스키마 5개 제거 후 나머지(Profile/Notification/Announcement/Blog/ErrorLog + 공통 응답)만 유지.

3. **`i18n/translation.ts`** — OpenAI API 의존성. 스타터 킷에서는 AI 번역 기능을 선택적 애드온으로 분리 권장.

4. **`security/anonymizer.ts`** — 한국어 이름/전화번호 패턴 탐지는 범용적이나, `filterSensitiveInfo()`는 감정 분석 파이프라인 전용. 분리 필요.

5. **`payment/sync-quota.ts`** — `daily_diary_limit`, `monthly_analysis_limit` 등 상수가 my-app 도메인 특화. 스타터 킷에서는 앱별 Quota 스키마에 맞게 교체.
