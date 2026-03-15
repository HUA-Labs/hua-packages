# SaaS Kit - API Routes Separation Manifest

> Generated: 2026-03-15
> Source: `apps/my-app/app/api/`
> Total routes analyzed: 102

---

## KEEP (Generic SaaS)

### Authentication

- [x] `/api/auth/[...nextauth]/route.ts` — NextAuth handler (3-liner, just re-exports `handlers`)
- [x] `/api/auth/mobile/route.ts` — Mobile OAuth token exchange (Kakao, Google verifier) — **수정 필요**: `findOrCreateOAuthUser`, `EMAIL_LINK_ALLOWED_PROVIDERS` 등 auth lib 동반 이식
- [x] `/api/auth/mobile/me/route.ts` — Mobile session restore via Bearer token — **수정 필요**: `decryptUserData`, `nickname_enc` 필드가 암호화 스키마 의존
- [x] `/api/auth/mobile/refresh/route.ts` — Mobile JWT refresh (7-day window rolling) — 완전 generic
- [x] `/api/auth/mobile-token/verify/route.ts` — Mobile token verify + CORS — 완전 generic

### User Management

- [x] `/api/user/profile/route.ts` — GET/PUT user profile — **수정 필요**: `empathyMode` 등 my-app 특화 설정 필드 제거, `UserQuota.is_premium` 참조 유지
- [x] `/api/user/settings/route.ts` — GET/POST/PATCH user settings — **수정 필요**: `empathyMode`, `themeStyle` 등 앱 특화 enum 값은 제거/추상화 필요
- [x] `/api/user/settings/emotion-flow/route.ts` — 감정 흐름 카운트 설정 — **수정 필요**: my-app 특화 설정. 스타터에서는 app-specific settings 예시로 구조만 유지하거나 제거
- [x] `/api/user/admin-check/route.ts` — Admin role check — 완전 generic
- [x] `/api/user/upload/route.ts` — Profile image upload (Vercel Blob) — **수정 필요**: `NextResponse.json({ error: '...' })` 패턴 사용 (apiError 패턴으로 통일 필요)
- [x] `/api/user/export/route.ts` — Data export request (email link) — **수정 필요**: `generateHTML` 내부에 '숨다이어리' 브랜딩 하드코딩, DiaryEntry 스키마 의존
- [x] `/api/user/export/download/route.ts` — Download exported data file — **수정 필요**: `DiaryEntry` + `AnalysisResult` Prisma 스키마에 직접 의존, 내보내기 HTML 포맷이 일기 도메인 특화. 스타터에서는 스키마 의존 부분 교체 필요
- [ ] `/api/user/migrate-guest-diaries/route.ts` → **REMOVE**: guest diary 마이그레이션은 my-app 도메인

### Payments

- [x] `/api/payments/checkout/route.ts` — Create checkout session (LemonSqueezy / Toss) — 완전 generic
- [x] `/api/payments/toss/billing-key/route.ts` — Toss 빌링키 발급 + 첫 결제 + 구독 생성 — **수정 필요**: 한국 특화 (TossPayments). 글로벌 스타터에는 Stripe로 대체하거나 conditional include로 처리

### Subscriptions

- [x] `/api/subscriptions/route.ts` — GET current user subscription — 완전 generic
- [x] `/api/subscriptions/cancel/route.ts` — Cancel subscription (LemonSqueezy / Toss) — 완전 generic, provider-agnostic wrapper 패턴 사용

### Plans

- [x] `/api/plans/route.ts` — GET active public plans — 완전 generic (DB-driven)

### Billing

- [x] `/api/billing/route.ts` — GET billing records by period — **수정 필요**: `openai_cost`, `gemini_cost`, `hua_cost` 등 AI 비용 필드는 my-app 특화. 스타터에서는 generic `amount` 필드로 단순화

### Quota

- [x] `/api/quota/route.ts` — GET user quota (daily/monthly limits) — **수정 필요**: `daily_diary_limit`, `monthly_diary_limit` 등 quota 필드명이 diary 도메인 명칭. 스타터에서는 `daily_usage_limit` 등으로 추상화

### Notifications

- [x] `/api/notifications/route.ts` — GET/POST/PATCH notifications (personal + broadcast) — 완전 generic
- [x] `/api/notifications/[id]/route.ts` — GET/PATCH/DELETE single notification — 완전 generic
- [x] `/api/notifications/unread-count/route.ts` — GET unread count — 완전 generic
- [x] `/api/notifications/mark-all-read/route.ts` — PATCH mark all read — 완전 generic
- [x] `/api/notifications/delete-multiple/route.ts` — DELETE multiple notifications — 완전 generic
- [x] `/api/notifications/delete-read/route.ts` — DELETE all read notifications — 완전 generic

### Announcements

- [x] `/api/announcements/route.ts` — GET/POST announcements — 완전 generic
- [x] `/api/announcements/[id]/route.ts` — GET/PUT/DELETE single announcement — 완전 generic

### Invite Codes

- [x] `/api/invite-codes/verify/route.ts` — POST verify invite code — 완전 generic
- [x] `/api/invite-codes/apply/route.ts` — POST apply invite code at signup — 완전 generic

### Webhooks

- [x] `/api/webhooks/lemonsqueezy/route.ts` — LemonSqueezy webhook handler (HMAC-verified) — 완전 generic
- [x] `/api/webhooks/stripe/route.ts` — Stripe webhook stub (501) — 완전 generic (미구현 stub)

### Cron Jobs

- [x] `/api/cron/billing/route.ts` — Toss recurring billing + trial expiry — **수정 필요**: Toss 특화 (`executeBilling`, `TOSS` provider). 글로벌 스타터에서는 provider-agnostic 처리 필요
- [x] `/api/cron/cleanup-logs/route.ts` — Log rotation (ApiLog 3mo, LoginLog 6mo + archive) — 완전 generic
- [x] `/api/cron/exchange-rate/route.ts` — USD→KRW exchange rate refresh — **수정 필요**: KRW 특화. 스타터에서는 다중 통화 지원으로 추상화하거나 optional feature로 분리

### Health Checks

- [x] `/api/health/route.ts` — DB + memory health check (HTTP 503 on fail) — 완전 generic
- [x] `/api/ping/route.ts` — Lightweight server liveness check (no DB) — 완전 generic
- [x] `/api/ready/route.ts` — DB + Redis readiness check — 완전 generic

### Admin — Users

- [x] `/api/admin/users/route.ts` — GET users list (paginated, search by hash) — 완전 generic
- [x] `/api/admin/users/[id]/route.ts` — GET/PATCH/DELETE single user — 완전 generic
- [x] `/api/admin/users/[id]/role/route.ts` — PATCH user role — 완전 generic
- [x] `/api/admin/users/stats/route.ts` — GET user stats — 완전 generic

### Admin — Payments

- [x] `/api/admin/payments/stats/route.ts` — GET payment stats (revenue, subscriptions) — 완전 generic, multi-currency 지원
- [x] `/api/admin/payments/history/route.ts` — GET payment history — 완전 generic
- [x] `/api/admin/payments/subscriptions/route.ts` — GET subscription list — 완전 generic

### Admin — Settings

- [x] `/api/admin/settings/route.ts` — GET plans + payment provider status — **수정 필요**: `TOSS_CLIENT_KEY`, `LEMONSQUEEZY_API_KEY` 등 특정 provider env key 체크. provider 목록을 config 기반으로 추상화 필요

### Admin — Audit & Security

- [x] `/api/admin/audit-logs/route.ts` — GET admin audit logs — 완전 generic
- [x] `/api/admin/rotate-keys/route.ts` — GET key status / POST rotate encryption key — 완전 generic

### Admin — Abuse Detection

- [x] `/api/admin/abuse-alerts/route.ts` — GET abuse alerts (paginated, filtered) — 완전 generic
- [x] `/api/admin/abuse-alerts/[id]/route.ts` — GET/PATCH single abuse alert — 완전 generic
- [x] `/api/admin/abuse-alerts/[id]/penalty/route.ts` — POST apply penalty — 완전 generic
- [x] `/api/admin/abuse-alerts/stats/route.ts` — GET abuse stats — 완전 generic

### Admin — Monitoring

- [x] `/api/admin/monitoring/errors/route.ts` — GET/POST error logs — 완전 generic
- [x] `/api/admin/monitoring/errors/stats/route.ts` — GET error log stats — 완전 generic
- [x] `/api/admin/monitoring/performance/route.ts` — GET performance metrics — 완전 generic
- [x] `/api/admin/monitoring/tokens/route.ts` — GET AI token usage stats — **수정 필요**: `getTokenStats()`가 AI 분석 비용 추적에 의존. 스타터에서는 optional AI feature로 분리

### Admin — Dashboard

- [x] `/api/admin/dashboard/route.ts` — GET admin dashboard overview — **수정 필요**: `DiaryEntry`, `AnalysisResult` 집계 의존. 스타터에서는 앱 specific 모델을 generic `contentItem`/`usageEvent` 추상으로 교체
- [x] `/api/admin/dashboard/login-stats/route.ts` — GET DAU/MAU, login trends — 완전 generic
- [x] `/api/admin/dashboard/charts/route.ts` — GET chart data — **수정 필요**: `diaryEntry`, `analysisResult` 집계 포함 여부 확인 필요

### Admin — Infrastructure

- [x] `/api/admin/cache-stats/route.ts` — GET Redis cache stats — 완전 generic
- [x] `/api/admin/database-stats/route.ts` — GET DB table stats — 완전 generic
- [x] `/api/admin/optimize-database/route.ts` — GET performance / POST optimize DB — 완전 generic
- [x] `/api/admin/upload/route.ts` — POST file upload (Vercel Blob, admin) — 완전 generic
- [x] `/api/admin/notifications/[id]/route.ts` — PATCH/DELETE admin notification — 완전 generic
- [x] `/api/admin/notifications/test-data/route.ts` — POST create test notifications (dev) — 완전 generic
- [x] `/api/admin/invite-codes/route.ts` — GET/POST invite codes (admin) — 완전 generic
- [x] `/api/admin/invite-codes/[id]/route.ts` — PATCH/DELETE invite code — 완전 generic

### Contact

- [x] `/api/contact/route.ts` — POST contact form (advisory lock rate limit) — 완전 generic

### Translations

- [x] `/api/translations/[language]/[namespace]/route.ts` — GET i18n namespace file — 완전 generic

### Dashboard (User-facing)

- [x] `/api/dashboard/stats/route.ts` — GET user dashboard stats (streak, heatmap) — **수정 필요**: `DiaryEntry` 모델 의존, "일기" 도메인 개념(streak 계산 등). 스타터에서는 generic `contentItem` 으로 교체하거나 앱별 구현으로 분리

---

## REMOVE (my-app Domain)

### Diary — CRUD

- [ ] `/api/diary/route.ts` — GET diary list
- [ ] `/api/diary/create/route.ts` — POST create diary entry
- [ ] `/api/diary/[id]/route.ts` — GET/PUT/DELETE single diary entry
- [ ] `/api/diary/dates/route.ts` — GET diary written dates (calendar)
- [ ] `/api/diary/draft/route.ts` — POST/GET draft diary
- [ ] `/api/diary/draft/latest/route.ts` — GET latest draft
- [ ] `/api/diary/draft/list/route.ts` — GET draft list

### Diary — Analysis

- [ ] `/api/diary/analyze/stream/route.ts` — POST diary analysis SSE stream
- [ ] `/api/diary/[id]/crisis-alert/route.ts` — POST crisis detection trigger
- [ ] `/api/diary/[id]/share-image/route.ts` — GET share card image generation

### HUA Emotion Analysis

- [ ] `/api/hua-emotion-analysis/route.ts` — POST HUA proprietary emotion analysis

### Search

- [ ] `/api/search/route.ts` — GET diary search (encrypted content)

### Cron — Diary Domain

- [ ] `/api/cron/future-diary-analysis/route.ts` — POST trigger future diary notifications (diary concept 의존)

### Guest — Diary Migration

- [ ] `/api/guest/usage/route.ts` — GET guest usage limits (diary 개수 기반)
- [ ] `/api/user/migrate-guest-diaries/route.ts` — POST migrate guest diaries to account

### Admin — Diary Management

- [ ] `/api/admin/diaries/route.ts` — GET diaries list (admin)
- [ ] `/api/admin/diaries/[id]/route.ts` — GET/DELETE single diary (admin)
- [ ] `/api/admin/diary/[id]/delete/route.ts` — POST soft delete diary (admin)
- [ ] `/api/admin/diary/[id]/restore/route.ts` — POST restore deleted diary (admin)
- [ ] `/api/admin/diary/deleted/route.ts` — GET deleted diaries list
- [ ] `/api/admin/diary/status/route.ts` — GET diary status overview

### Admin — Analysis & ML

- [ ] `/api/admin/backfill-sentiment/route.ts` — POST backfill sentiment scores
- [ ] `/api/admin/slip-analytics/route.ts` — GET SLIP distribution + tier correlation
- [ ] `/api/admin/translate/route.ts` — POST AI translation (my-app content 특화)
- [ ] `/api/admin/maintenance/backfill-content-length/route.ts` — POST backfill diary content_length
- [ ] `/api/admin/maintenance/backfill-hua-analysis/route.ts` — POST backfill HUA 2nd-pass analysis
- [ ] `/api/admin/mark-test-entries/route.ts` — POST mark diary entries as test data

### Admin — Export (Diary Data)

- [ ] `/api/admin/export/analysis/route.ts` — GET export analysis results (CSV/JSON)
- [ ] `/api/admin/export/test-analysis/route.ts` — GET export test analysis data

### Admin — Crisis Management

- [ ] `/api/admin/crisis-alerts/route.ts` — GET crisis alerts list
- [ ] `/api/admin/crisis-alerts/[id]/route.ts` — GET/PATCH single crisis alert
- [ ] `/api/admin/crisis-alerts/[id]/logs/route.ts` — GET crisis alert action logs
- [ ] `/api/admin/crisis-alerts/stats/route.ts` — GET crisis stats

### Admin — Test Tools (Diary)

- [ ] `/api/admin/test-diary/create/route.ts` — POST create test diary
- [ ] `/api/admin/test-diary/analyze/stream/route.ts` — POST test diary analysis stream
- [ ] `/api/admin/test-diary/hua-analyze/route.ts` — POST test HUA analysis
- [ ] `/api/admin/test-diary/anonymize/route.ts` — POST anonymize test diary

---

## NEEDS DECISION

### Blog (`/api/blog/*`)

- [?] `/api/blog/route.ts` — GET post list / POST create post
  - **판단**: CMS 기능으로 generic SaaS에 포함 가능. 다국어(ko/en/ja) 필드와 AI 자동 번역 파이프라인(`runAIPipeline`)은 my-app 특화이나 구조 자체는 generic.
  - **권장**: KEEP, 단 `blog/sync`의 AI 파이프라인(`runAIPipeline`, `trackTokenUsage`)은 optional feature로 분리
- [?] `/api/blog/[slug]/route.ts` — GET/PUT/DELETE blog post by slug — KEEP (pure CMS CRUD)
- [?] `/api/blog/sync/route.ts` — GitHub webhook → DB sync with AI translation
  - **판단**: GitHub-based CMS workflow는 my-app 특화 인프라. 스타터에서는 별도 optional plugin으로 분리 권장
  - **권장**: CONDITIONAL KEEP (optional GitHub CMS feature)

### Acquisition (`/api/acquisition`)

- [?] `/api/acquisition/route.ts` — POST UTM tracking on login
  - **판단**: UTM/referrer 추적은 SaaS 마케팅 분석에서 범용적으로 사용됨. 완전 generic.
  - **권장**: KEEP (rename to `/api/analytics/acquisition` for clarity)
- [?] `/api/admin/acquisition/stats/route.ts` — GET UTM stats (admin)
  - **권장**: KEEP (admin analytics)

### Admin — Export Logs (`/api/admin/export/logs`)

- [?] `/api/admin/export/logs/route.ts` — GET login/API log export (CSV/JSON, hashed PII)
  - **판단**: 로그 내보내기는 compliance용으로 generic SaaS에 필요. 개인정보 해시 처리 패턴도 범용적.
  - **권장**: KEEP

### Manifest (`/api/manifest`)

- [?] `/api/manifest/route.ts` — GET PWA web manifest (i18n-aware)
  - **판단**: PWA 지원은 generic이나, manifest 내용(name="숨다이어리", shortcuts가 "/diary/write"로 하드코딩)은 my-app 특화.
  - **권장**: KEEP, 단 앱명·shortcuts URL은 환경변수/config로 추상화 필요

### Hackathon (`/api/hackathon/*`)

- [?] `/api/hackathon/analyze/route.ts` — POST voice transcription + HUA prompt analysis
  - **판단**: 일회성 이벤트용 엔드포인트. 범용 AI 텍스트 분석 패턴(CORS, API key auth, Gemini 호출)은 참고용.
  - **권장**: REMOVE (일회성 이벤트 코드)

---

## 수정 필요 요약 (KEEP 라우트 중)

| Route                                      | 수정 이유                                                               | 난이도 |
| ------------------------------------------ | ----------------------------------------------------------------------- | ------ |
| `/api/auth/mobile/route.ts`                | `oauth-user-service`, `EMAIL_LINK_ALLOWED_PROVIDERS` auth lib 동반 이식 | 중     |
| `/api/auth/mobile/me/route.ts`             | `nickname_enc` 암호화 스키마 의존                                       | 하     |
| `/api/user/profile/route.ts`               | `empathyMode` my-app 설정 필드 제거                                  | 하     |
| `/api/user/settings/route.ts`              | `empathyMode`, `themeStyle` enum 값 추상화                              | 하     |
| `/api/user/settings/emotion-flow/route.ts` | my-app 특화 설정 — 제거 또는 app-specific example로 표시             | 하     |
| `/api/user/upload/route.ts`                | raw `NextResponse.json({ error })` 패턴 → `apiError()` 통일             | 하     |
| `/api/user/export/route.ts`                | '숨다이어리' 브랜딩, DiaryEntry 스키마 의존                             | 중     |
| `/api/user/export/download/route.ts`       | DiaryEntry + AnalysisResult 스키마, HTML 포맷 일기 특화                 | 상     |
| `/api/billing/route.ts`                    | `openai_cost`, `gemini_cost`, `hua_cost` AI 비용 필드                   | 하     |
| `/api/quota/route.ts`                      | `daily_diary_limit` → 추상화된 필드명으로 교체                          | 하     |
| `/api/payments/toss/billing-key/route.ts`  | Toss 한국 특화 — optional/regional provider로 분리                      | 중     |
| `/api/cron/billing/route.ts`               | Toss `executeBilling` 의존 — provider-agnostic 처리                     | 중     |
| `/api/cron/exchange-rate/route.ts`         | KRW 특화 — multi-currency 또는 optional feature로 분리                  | 하     |
| `/api/admin/dashboard/route.ts`            | DiaryEntry, AnalysisResult 집계 — generic model로 추상화                | 상     |
| `/api/admin/settings/route.ts`             | Toss/LemonSqueezy env key 하드코딩 — provider config 추상화             | 하     |
| `/api/admin/monitoring/tokens/route.ts`    | AI token stats — optional AI feature로 분리                             | 하     |
| `/api/dashboard/stats/route.ts`            | DiaryEntry 모델 의존, streak 로직 diary 특화                            | 상     |
| `/api/manifest/route.ts`                   | 앱명·shortcuts URL 하드코딩                                             | 하     |

---

## 통계

| 분류             | 개수                                                              |
| ---------------- | ----------------------------------------------------------------- |
| KEEP (수정 없음) | 52                                                                |
| KEEP (수정 필요) | 18                                                                |
| REMOVE           | 28                                                                |
| NEEDS DECISION   | 8 (blog 3, acquisition 2, export/logs 1, manifest 1, hackathon 1) |
| **합계**         | **102** (일부 중복 집계 포함, 실제 파일 수 기준)                  |
